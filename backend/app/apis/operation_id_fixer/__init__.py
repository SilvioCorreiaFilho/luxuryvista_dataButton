"""
FastAPI Operation ID Conflict Scanner and Fixer

This script scans a FastAPI application for duplicate operation IDs and provides
a report on conflicts found. It can also generate fix suggestions to ensure uniqueness.

Example usage:
    python operation_id_fixer.py --scan app/apis
    python operation_id_fixer.py --fix app/apis
"""

import argparse
import ast
import os
import re
import sys
from collections import defaultdict
from typing import Dict, List, Tuple, Set, Optional
from fastapi import APIRouter
from pydantic import BaseModel

# Create router for this module (required by FastAPI framework)
router = APIRouter(prefix="/operation-id-fixer", tags=["utilities"])

# API Models
class ScanRequest(BaseModel):
    """Request model for scanning directories for duplicate operation IDs"""
    directory: str = "src/app/apis"

class ConflictLocation(BaseModel):
    """Information about a single operation ID conflict location"""
    filepath: str
    function_name: str
    line_number: int

class ScanResponse(BaseModel):
    """Response model for operation ID scan results"""
    duplicate_count: int
    conflicts: Dict[str, List[ConflictLocation]]

@router.post("/scan", operation_id="operation_id_fixer_scan")
def scan_for_conflicts(request: ScanRequest) -> ScanResponse:
    """Scan specified directory for duplicate operation IDs"""
    # Perform scan
    duplicates = scan_and_report(request.directory)
    
    # Format response
    conflicts = {}
    for op_id, instances in duplicates.items():
        conflicts[op_id] = [
            ConflictLocation(
                filepath=instance.filepath,
                function_name=instance.function_name,
                line_number=instance.line_no + 1
            ) for instance in instances
        ]
    
    return ScanResponse(
        duplicate_count=len(duplicates),
        conflicts=conflicts
    )

# ANSI color codes for terminal output
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"

class OperationId:
    def __init__(self, value: str, filepath: str, function_name: str, line_no: int):
        self.value = value
        self.filepath = filepath
        self.function_name = function_name
        self.line_no = line_no
    
    def __repr__(self):
        return f"OperationId(value={self.value}, file={os.path.basename(self.filepath)}, function={self.function_name}, line={self.line_no})"

class RouterDecorator:
    def __init__(self, method: str, path: str, operation_id: Optional[str], 
                 function_name: str, line_no: int, line_text: str):
        self.method = method
        self.path = path
        self.operation_id = operation_id
        self.function_name = function_name
        self.line_no = line_no
        self.line_text = line_text
    
    def __repr__(self):
        return f"RouterDecorator({self.method} {self.path}, op_id={self.operation_id}, func={self.function_name}, line={self.line_no})"

def find_all_router_definitions(directory: str) -> List[Tuple[str, str]]:
    """Find all FastAPI router definitions in Python files.
    
    Returns:
        List of tuples containing (filepath, module_name)
    """
    router_files = []
    
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                # Extract module name from directory path
                module_path = os.path.dirname(filepath)
                module_name = os.path.basename(module_path)
                
                with open(filepath, 'r') as f:
                    content = f.read()
                    
                    # Check if file contains a router
                    if re.search(r'router\s*=\s*APIRouter', content):
                        router_files.append((filepath, module_name))
    
    return router_files

def extract_router_decorators(filepath: str) -> List[RouterDecorator]:
    """Extract router decorators from a Python file."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Parse the Python file
    try:
        tree = ast.parse(content)
    except SyntaxError:
        print(f"{RED}Syntax error in {filepath}{RESET}")
        return []
    
    decorators = []
    
    # Find all function definitions
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            function_name = node.name
            
            # Check for router decorators
            for decorator in node.decorator_list:
                if (isinstance(decorator, ast.Call) and 
                    isinstance(decorator.func, ast.Attribute) and
                    decorator.func.attr in ['get', 'post', 'put', 'delete', 'patch']):
                    
                    # Extract decorator details
                    method = decorator.func.attr
                    
                    # Extract path
                    path = ""
                    if decorator.args:
                        path_node = decorator.args[0]
                        if isinstance(path_node, ast.Str):
                            path = path_node.s
                    
                    # Extract operation_id if present
                    operation_id = None
                    for keyword in decorator.keywords:
                        if keyword.arg == 'operation_id' and isinstance(keyword.value, ast.Str):
                            operation_id = keyword.value.s
                    
                    # Get line number and text
                    line_no = node.lineno - 1  # Get decorator line
                    line_text = content.splitlines()[line_no]
                    
                    decorators.append(RouterDecorator(
                        method=method,
                        path=path,
                        operation_id=operation_id,
                        function_name=function_name,
                        line_no=line_no,
                        line_text=line_text
                    ))
    
    return decorators

def find_duplicate_operation_ids(router_files: List[Tuple[str, str]]) -> Dict[str, List[OperationId]]:
    """Find duplicate operation IDs across router files."""
    operation_ids = defaultdict(list)
    
    for filepath, module_name in router_files:
        decorators = extract_router_decorators(filepath)
        
        for decorator in decorators:
            # If operation_id is explicitly set, use it
            if decorator.operation_id:
                op_id = decorator.operation_id
            else:
                # Otherwise, FastAPI uses the function name as the operation_id
                op_id = decorator.function_name
            
            operation_ids[op_id].append(OperationId(
                value=op_id,
                filepath=filepath,
                function_name=decorator.function_name,
                line_no=decorator.line_no
            ))
    
    # Filter to only include duplicates
    return {k: v for k, v in operation_ids.items() if len(v) > 1}

def generate_unique_operation_id(module_name: str, function_name: str, 
                               used_operation_ids: Set[str]) -> str:
    """Generate a unique operation ID based on module and function name."""
    base_id = f"{module_name}_{function_name}"
    
    if base_id not in used_operation_ids:
        return base_id
    
    # Add a suffix if the base ID is already used
    counter = 1
    while f"{base_id}_{counter}" in used_operation_ids:
        counter += 1
    
    return f"{base_id}_{counter}"

def print_report(duplicates: Dict[str, List[OperationId]]):
    """Print a report of duplicate operation IDs."""
    if not duplicates:
        print(f"{GREEN}No duplicate operation IDs found!{RESET}")
        return
    
    print(f"{YELLOW}Found {len(duplicates)} duplicate operation IDs:{RESET}")
    print()
    
    for op_id, instances in duplicates.items():
        print(f"{BLUE}Operation ID: {op_id}{RESET}")
        for instance in instances:
            print(f"  - {os.path.basename(instance.filepath)} :: {instance.function_name} (line {instance.line_no + 1})")
        print()
    
    print(f"{YELLOW}Recommendation: Add explicit operation_ids to router decorators.{RESET}")
    print("Example: @router.get('/path', operation_id='unique_operation_id')")

def suggest_fixes(duplicates: Dict[str, List[OperationId]]) -> Dict[str, List[Tuple[str, str]]]:
    """Suggest fixes for duplicate operation IDs.
    
    Returns:
        Dictionary mapping filepaths to lists of (original_line, fixed_line) tuples
    """
    fixes = defaultdict(list)
    used_operation_ids = set()
    
    # First pass: collect all existing operation IDs
    for instances in duplicates.values():
        for instance in instances:
            used_operation_ids.add(instance.value)
    
    # Second pass: generate unique IDs and create fixes
    for op_id, instances in duplicates.items():
        for instance in instances:
            # Get module name from the filepath
            module_name = os.path.basename(os.path.dirname(instance.filepath))
            
            # Read the file content
            with open(instance.filepath, 'r') as f:
                lines = f.readlines()
            
            # Get the line with the decorator
            original_line = lines[instance.line_no]
            
            # Generate a unique operation ID
            unique_id = generate_unique_operation_id(
                module_name, instance.function_name, used_operation_ids)
            used_operation_ids.add(unique_id)
            
            # Update the line with the new operation ID
            if 'operation_id=' in original_line:
                # Replace existing operation_id
                fixed_line = re.sub(
                    r'operation_id\s*=\s*["\'][^"\']+'"'",
                    f'operation_id="{unique_id}"',
                    original_line
                )
            else:
                # Add operation_id parameter
                fixed_line = original_line.replace(')', f', operation_id="{unique_id}")')
            
            # Add to fixes
            fixes[instance.filepath].append((original_line, fixed_line))
    
    return fixes

def apply_fixes(fixes: Dict[str, List[Tuple[str, str]]]):
    """Apply suggested fixes to the files."""
    for filepath, file_fixes in fixes.items():
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Apply all fixes for this file
        for original_line, fixed_line in file_fixes:
            content = content.replace(original_line, fixed_line)
        
        # Write the updated content back to the file
        with open(filepath, 'w') as f:
            f.write(content)
        
        print(f"{GREEN}Applied {len(file_fixes)} fixes to {os.path.basename(filepath)}{RESET}")

def print_fix_suggestions(fixes: Dict[str, List[Tuple[str, str]]]):
    """Print suggested fixes without applying them."""
    for filepath, file_fixes in fixes.items():
        print(f"{BLUE}Fixes for {os.path.basename(filepath)}:{RESET}")
        
        for original_line, fixed_line in file_fixes:
            print(f"  {RED}- {original_line.strip()}{RESET}")
            print(f"  {GREEN}+ {fixed_line.strip()}{RESET}")
            print()

def scan_and_report(directory):
    """Scan a directory for duplicate operation IDs and print a report."""
    print(f"Scanning {directory} for duplicate operation IDs...")
    router_files = find_all_router_definitions(directory)
    
    if not router_files:
        print(f"No router files found in {directory}")
        return {}
    
    print(f"Found {len(router_files)} router files.")
    duplicates = find_duplicate_operation_ids(router_files)
    
    if not duplicates:
        print("No duplicate operation IDs found!")
    else:
        print(f"Found {len(duplicates)} duplicate operation IDs:")
        for op_id, instances in duplicates.items():
            print(f"Operation ID: {op_id}")
            for instance in instances:
                print(f"  - {os.path.basename(instance.filepath)} :: {instance.function_name} (line {instance.line_no + 1})")
            print()
    
    return duplicates

def fix_duplicate_ids(directory, apply=True):
    """Fix duplicate operation IDs in a directory."""
    print(f"Scanning {directory} for duplicate operation IDs...")
    router_files = find_all_router_definitions(directory)
    
    if not router_files:
        print(f"No router files found in {directory}")
        return
    
    print(f"Found {len(router_files)} router files.")
    duplicates = find_duplicate_operation_ids(router_files)
    
    if not duplicates:
        print("No duplicate operation IDs found!")
        return
    
    fixes = suggest_fixes(duplicates)
    
    if not apply:
        print("Dry run mode. Showing suggested fixes:")
        print_fix_suggestions(fixes)
    else:
        print(f"Applying fixes to {len(fixes)} files:")
        apply_fixes(fixes)
        print("All fixes applied!")

def main():
    """Main function when script is run directly."""
    parser = argparse.ArgumentParser(description='FastAPI Operation ID Conflict Scanner and Fixer')
    parser.add_argument('--scan', metavar='DIR', help='Scan directory for duplicate operation IDs')
    parser.add_argument('--fix', metavar='DIR', help='Suggest and apply fixes for duplicate operation IDs')
    parser.add_argument('--dry-run', action='store_true', help='Show suggested fixes without applying them')
    
    args = parser.parse_args()
    
    if args.scan:
        scan_and_report(args.scan)
    elif args.fix:
        fix_duplicate_ids(args.fix, not args.dry_run)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
