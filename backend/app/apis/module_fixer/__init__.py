from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re
import os
import ast
from pathlib import Path
import importlib
import traceback
import json

router = APIRouter(prefix="/module-fixer", tags=["utils"])

class ModuleFixRequest(BaseModel):
    module_path: str = ""
    check_type: str = "all"  # all, syntax, imports, style, router, operation_id

class ModuleFixResponse(BaseModel):
    success: bool
    message: str
    issues: list = []
    fixed: list = []

def check_syntax(file_path):
    """Check if the file has any syntax errors."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            code = f.read()
            
        try:
            ast.parse(code)
            return True, []
        except SyntaxError as e:
            return False, [f"Syntax error at line {e.lineno}, column {e.offset}: {e.msg}"]
        except Exception as e:
            return False, [f"Error checking syntax: {str(e)}"]
    except Exception as e:
        return False, [f"Error reading file: {str(e)}"]

def check_unterminated_strings(file_path):
    """Check for unterminated string literals."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        lines = content.split('\n')
        for i, line in enumerate(lines):
            # Skip comments
            if line.strip().startswith('#'):
                continue
                
            # Check for unterminated strings
            if line.count('"') % 2 == 1:
                issues.append(f"Line {i+1}: Unterminated double quote")
                
            if line.count("'") % 2 == 1:
                issues.append(f"Line {i+1}: Unterminated single quote")
        
        return len(issues) == 0, issues
    except Exception as e:
        return False, [f"Error checking string literals: {str(e)}"]

def check_router_definition(file_path):
    """Check if the file has a router definition."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        # Check if APIRouter is imported but not used
        if 'APIRouter' in content and 'from fastapi import' in content and 'router = APIRouter()' not in content:
            issues.append("APIRouter is imported but router is not defined")
        
        # Check if router is used but not imported
        if 'router = APIRouter()' in content and 'APIRouter' not in content:
            issues.append("router is defined but APIRouter is not imported")
        
        # Check for common endpoint issues
        if '@router.get("")' in content or '@router.post("")' in content:
            issues.append("Empty path in router decorator")
        
        return len(issues) == 0, issues
    except Exception as e:
        return False, [f"Error checking router definition: {str(e)}"]

def check_operation_ids(file_path):
    """Check if the file has operation_id defined for endpoints."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        issues = []
        # Check for missing operation_id
        router_decorators = re.findall(r'@router\.(get|post|put|delete|patch)\([^)]+\)', content)
        for i, decorator in enumerate(router_decorators):
            # If operationId is not in the decorator
            if 'operationId=' not in content.split('@router')[i+1].split(')')[0]:
                issues.append(f"Missing operationId in {decorator} decorator")
        
        return len(issues) == 0, issues
    except Exception as e:
        return False, [f"Error checking operation_ids: {str(e)}"]

def fix_unterminated_strings(file_path):
    """Fix unterminated string literals in Python files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Store original content for comparison
        original_content = content
        
        # Fix single-quoted strings
        lines = content.split('\n')
        fixed_lines = []
        for line in lines:
            # Skip comments
            if line.strip().startswith('#'):
                fixed_lines.append(line)
                continue
                
            # Check for unterminated strings
            if line.count('"') % 2 == 1:
                line += '"'
            if line.count("'") % 2 == 1:
                line += "'"
                
            fixed_lines.append(line)
                
        content = '\n'.join(fixed_lines)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, f"Fixed unterminated strings in {file_path}"
        return False, f"No unterminated strings found in {file_path}"
    
    except Exception as e:
        error_msg = f"Error fixing strings in {file_path}: {str(e)}"
        return False, error_msg

def fix_router_definition(file_path):
    """Fix router definition in Python files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Store original content for comparison
        original_content = content
        
        # Fix missing router definition
        if 'APIRouter' in content and 'from fastapi import' in content and 'router = APIRouter()' not in content:
            # Add APIRouter to imports if missing
            if 'from fastapi import APIRouter' not in content:
                content = content.replace('from fastapi import', 'from fastapi import APIRouter, ')
            
            # Add router definition after imports
            lines = content.split('\n')
            import_section_end = 0
            for i, line in enumerate(lines):
                if line.strip() and not (line.startswith('import') or line.startswith('from')):
                    import_section_end = i
                    break
            
            if import_section_end > 0:
                lines.insert(import_section_end, '\nrouter = APIRouter()\n')
                content = '\n'.join(lines)
        
        # Fix empty paths
        content = content.replace('@router.get("")', '@router.get("/")')
        content = content.replace('@router.post("")', '@router.post("/")')
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, f"Fixed router definition in {file_path}"
        return False, f"No router issues found in {file_path}"
    
    except Exception as e:
        error_msg = f"Error fixing router in {file_path}: {str(e)}"
        return False, error_msg

def fix_operation_ids(file_path):
    """Fix missing operation_ids in Python files."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Store original content for comparison
        original_content = content
        
        # Find all endpoint functions and add operation_id if missing
        lines = content.split('\n')
        for i, line in enumerate(lines):
            # If this is a router decorator
            if '@router.' in line and ('get(' in line or 'post(' in line or 'put(' in line or 'delete(' in line or 'patch(' in line):
                # If operationId is not in the line
                if 'operationId=' not in line:
                    # Find the function name in the next few lines
                    for j in range(i+1, min(i+5, len(lines))):
                        if 'def ' in lines[j]:
                            function_name = lines[j].split('def ')[1].split('(')[0].strip()
                            # Add operationId to the decorator
                            if line.strip().endswith(')'):
                                # Replace the closing parenthesis with the operationId
                                lines[i] = line[:-1] + f", operationId=\"{function_name}\")" 
                            else:
                                # Add the operationId before the closing parenthesis
                                next_line = lines[i+1]
                                if ')' in next_line:
                                    closing_paren_index = next_line.find(')')
                                    lines[i+1] = next_line[:closing_paren_index] + f", operationId=\"{function_name}\"" + next_line[closing_paren_index:]
                            break
        
        content = '\n'.join(lines)
        
        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, f"Fixed operation_ids in {file_path}"
        return False, f"No operation_id issues found in {file_path}"
    
    except Exception as e:
        error_msg = f"Error fixing operation_ids in {file_path}: {str(e)}"
        return False, error_msg

@router.post("/review", operation_id="check_module")
def check_module(request: ModuleFixRequest) -> ModuleFixResponse:
    """Check module for common issues."""
    # Set default module path if not provided
    if not request.module_path:
        request.module_path = "app/apis"
    
    # Normalize path format
    module_path = request.module_path.replace('.', '/').replace('app/', 'src/app/')
    if not module_path.endswith('__init__.py') and os.path.isdir(module_path):
        module_path = os.path.join(module_path, '__init__.py')
    
    # Ensure the path exists
    if not os.path.exists(module_path):
        return ModuleFixResponse(
            success=False,
            message=f"Module path {module_path} does not exist",
            issues=[f"File not found: {module_path}"]
        )
    
    issues = []
    
    # Check syntax
    if request.check_type in ['all', 'syntax']:
        success, syntax_issues = check_syntax(module_path)
        if not success:
            issues.extend(syntax_issues)
    
    # Check unterminated strings
    if request.check_type in ['all', 'syntax']:
        success, string_issues = check_unterminated_strings(module_path)
        if not success:
            issues.extend(string_issues)
    
    # Check router definition
    if request.check_type in ['all', 'router']:
        success, router_issues = check_router_definition(module_path)
        if not success:
            issues.extend(router_issues)
    
    # Check operation_ids
    if request.check_type in ['all', 'operation_id']:
        success, operation_id_issues = check_operation_ids(module_path)
        if not success:
            issues.extend(operation_id_issues)
    
    if len(issues) == 0:
        return ModuleFixResponse(
            success=True,
            message=f"No issues found in {module_path}",
            issues=[]
        )
    else:
        return ModuleFixResponse(
            success=False,
            message=f"Found {len(issues)} issues in {module_path}",
            issues=issues
        )

@router.post("/fix", operation_id="fix_module")
def fix_module(request: ModuleFixRequest) -> ModuleFixResponse:
    """Fix issues in a module."""
    # Set default module path if not provided
    if not request.module_path:
        request.module_path = "app/apis"
    
    # Normalize path format
    module_path = request.module_path.replace('.', '/').replace('app/', 'src/app/')
    if not module_path.endswith('__init__.py') and os.path.isdir(module_path):
        module_path = os.path.join(module_path, '__init__.py')
    
    # Ensure the path exists
    if not os.path.exists(module_path):
        return ModuleFixResponse(
            success=False,
            message=f"Module path {module_path} does not exist",
            issues=[f"File not found: {module_path}"]
        )
    
    fixed = []
    
    # Fix unterminated strings
    if request.check_type in ['all', 'syntax']:
        success, message = fix_unterminated_strings(module_path)
        if success:
            fixed.append(message)
    
    # Fix router definition
    if request.check_type in ['all', 'router']:
        success, message = fix_router_definition(module_path)
        if success:
            fixed.append(message)
    
    # Fix operation_ids
    if request.check_type in ['all', 'operation_id']:
        success, message = fix_operation_ids(module_path)
        if success:
            fixed.append(message)
    
    # Check if there are still issues
    review_result = check_module(request)
    
    if review_result.success:
        return ModuleFixResponse(
            success=True,
            message=f"Fixed {len(fixed)} issues in {module_path}",
            fixed=fixed
        )
    else:
        return ModuleFixResponse(
            success=False,
            message=f"Fixed {len(fixed)} issues, but {len(review_result.issues)} issues remain in {module_path}",
            fixed=fixed,
            issues=review_result.issues
        )

@router.post("/check-all", operation_id="check_all_modules")
def check_all_modules() -> ModuleFixResponse:
    """Check all modules for issues."""
    api_dir = Path("src/app/apis")
    all_issues = {}
    
    # Process each API module
    for api_module in api_dir.glob("*"):
        if not api_module.is_dir():
            continue
            
        init_file = api_module / "__init__.py"
        if not init_file.exists():
            continue
        
        module_name = f"app.apis.{api_module.name}"
        
        # Check the module
        review_result = check_module(ModuleFixRequest(module_path=module_name))
        
        if not review_result.success:
            all_issues[module_name] = review_result.issues
    
    # Return the result
    if len(all_issues) == 0:
        return ModuleFixResponse(
            success=True,
            message=f"No issues found in any module",
            issues=[]
        )
    else:
        # Flatten the issues for response
        flat_issues = []
        for module, issues in all_issues.items():
            flat_issues.append(f"Issues in {module}:")
            for issue in issues:
                flat_issues.append(f"  - {issue}")
        
        return ModuleFixResponse(
            success=False,
            message=f"Found issues in {len(all_issues)} modules",
            issues=flat_issues
        )

@router.post("/fix-all", operation_id="fix_all_modules")
def fix_all_modules() -> ModuleFixResponse:
    """Fix issues in all modules."""
    api_dir = Path("src/app/apis")
    fixed = []
    remaining_issues = []
    
    # Process each API module
    for api_module in api_dir.glob("*"):
        if not api_module.is_dir():
            continue
            
        init_file = api_module / "__init__.py"
        if not init_file.exists():
            continue
        
        module_name = f"app.apis.{api_module.name}"
        
        # Fix the module
        fix_result = fix_module(ModuleFixRequest(module_path=module_name))
        
        if fix_result.fixed:
            fixed.extend(fix_result.fixed)
        
        if not fix_result.success:
            remaining_issues.append(f"Issues remain in {module_name}:")
            for issue in fix_result.issues:
                remaining_issues.append(f"  - {issue}")
    
    # Return the result
    if len(remaining_issues) == 0:
        return ModuleFixResponse(
            success=True,
            message=f"Fixed {len(fixed)} issues across all modules",
            fixed=fixed
        )
    else:
        return ModuleFixResponse(
            success=False,
            message=f"Fixed {len(fixed)} issues, but issues remain in some modules",
            fixed=fixed,
            issues=remaining_issues
        )
