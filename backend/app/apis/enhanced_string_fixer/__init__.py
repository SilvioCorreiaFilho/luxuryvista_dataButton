#!/usr/bin/env python3
"""
Enhanced String Literal Fixer

This module provides advanced functions to detect and fix unterminated string literals
in Python modules, especially in API module files.
"""

import os
import re
import traceback
from pathlib import Path
from typing import Dict, List, Tuple, Set, Any, Optional

# Set up paths
APP_DIR = Path("/app/src/app")
APIS_DIR = APP_DIR / "apis"

def is_syntax_valid(code: str) -> bool:
    """Check if the given code has valid syntax."""
    try:
        compile(code, '<string>', 'exec')
        return True
    except SyntaxError:
        return False

def detect_unterminated_string(code: str) -> Optional[Tuple[int, str]]:
    """Detect unterminated string literals in code.
    
    Returns:
        Tuple of (line_number, error_message) if an unterminated string is found, None otherwise
    """
    try:
        compile(code, '<string>', 'exec')
        return None  # No syntax error
    except SyntaxError as e:
        if 'unterminated string literal' in str(e):
            # Extract the line number from the error message
            line_match = re.search(r'line (\d+)', str(e))
            if line_match:
                line_number = int(line_match.group(1))
                return (line_number, str(e))
        return None  # Different type of syntax error

def fix_string_literal(code: str, line_number: int) -> str:
    """Fix an unterminated string literal in the specified line.
    
    Args:
        code: The source code
        line_number: The line number with the unterminated string
        
    Returns:
        The fixed code
    """
    lines = code.split('\n')
    if line_number <= 0 or line_number > len(lines):
        return code
    
    line = lines[line_number - 1]
    
    # Check for different string types
    single_quotes = line.count("'")
    double_quotes = line.count('"')
    triple_single = line.count("'''")
    triple_double = line.count('"""')
    
    # Determine which string type is unterminated
    if single_quotes % 2 == 1 and '"' not in line:  # Odd number of single quotes
        lines[line_number - 1] = line + "'"
    elif double_quotes % 2 == 1 and "'" not in line:  # Odd number of double quotes
        lines[line_number - 1] = line + '"'
    elif triple_single % 2 == 1:  # Incomplete triple single quotes
        lines[line_number - 1] = line + "'''"
    elif triple_double % 2 == 1:  # Incomplete triple double quotes
        lines[line_number - 1] = line + '"""'
    elif "'" in line and not line.endswith("'") and single_quotes % 2 == 1:
        # Single quote not terminated at end of line
        lines[line_number - 1] = line + "'"
    elif '"' in line and not line.endswith('"') and double_quotes % 2 == 1:
        # Double quote not terminated at end of line
        lines[line_number - 1] = line + '"'
    else:
        # More complex cases - need to examine character by character
        fixed_line = fix_complex_string_termination(line)
        if fixed_line != line:
            lines[line_number - 1] = fixed_line
    
    return '\n'.join(lines)

def fix_complex_string_termination(line: str) -> str:
    """Handle more complex string termination scenarios by scanning character by character."""
    # Find the last quote character that doesn't have a matching pair
    in_single_quote = False
    in_double_quote = False
    escaped = False
    
    for i, char in enumerate(line):
        if char == '\\' and not escaped:
            escaped = True
            continue
        
        if char == "'" and not in_double_quote and not escaped:
            in_single_quote = not in_single_quote
        elif char == '"' and not in_single_quote and not escaped:
            in_double_quote = not in_double_quote
        
        escaped = False
    
    # Check if we ended inside a string and add the appropriate closing quote
    if in_single_quote:
        return line + "'"
    elif in_double_quote:
        return line + '"'
    
    return line

def fix_module_string_literals_enhanced(module_name: str, force_fix: bool = False) -> Dict[str, Any]:
    """Fix string literals in a specific module.
    
    Args:
        module_name: Name of the module to fix
        force_fix: Whether to force fixing even if no syntax error is detected
        
    Returns:
        Dictionary with results of the fixing operation
    """
    init_path = APIS_DIR / module_name / "__init__.py"
    if not init_path.exists():
        return {"module": module_name, "status": "error", "message": "Module not found"}
    
    try:
        # Read the file content
        with open(init_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        max_iterations = 10  # Prevent infinite loops on unfixable files
        fixes_applied = []
        
        # Iteratively fix string literals until no more syntax errors
        for i in range(max_iterations):
            if is_syntax_valid(content) and not force_fix:
                break
            
            # Find unterminated string
            string_error = detect_unterminated_string(content)
            if not string_error and not force_fix:
                break
            
            if string_error:
                line_number, error_msg = string_error
                # Fix the string literal
                fixed_content = fix_string_literal(content, line_number)
                
                if fixed_content != content:
                    content = fixed_content
                    fixes_applied.append(f"Fixed unterminated string at line {line_number}")
                else:
                    # If our fix didn't change anything, try more aggressive approach
                    lines = content.split('\n')
                    for fix_line in range(max(1, line_number-1), min(len(lines)+1, line_number+2)):
                        if fix_line <= len(lines):
                            line = lines[fix_line-1]
                            if '"' in line and not line.endswith('"'):
                                lines[fix_line-1] = line + '"'
                                fixes_applied.append(f"Aggressively fixed double quote at line {fix_line}")
                            elif "'" in line and not line.endswith("'"):
                                lines[fix_line-1] = line + "'"
                                fixes_applied.append(f"Aggressively fixed single quote at line {fix_line}")
                    
                    new_content = '\n'.join(lines)
                    if new_content != content:
                        content = new_content
                    else:
                        # If still no change, we can't fix automatically
                        fixes_applied.append(f"Failed to fix string at line {line_number}")
                        break
            elif force_fix:
                # Examine all lines for potential issues even without syntax error
                lines = content.split('\n')
                changes_made = False
                
                for line_number, line in enumerate(lines, 1):
                    single_quotes = line.count("'")
                    double_quotes = line.count('"')
                    
                    if single_quotes % 2 == 1 and '"' not in line:
                        lines[line_number-1] = line + "'"
                        fixes_applied.append(f"Forced fix of single quote at line {line_number}")
                        changes_made = True
                    elif double_quotes % 2 == 1 and "'" not in line:
                        lines[line_number-1] = line + '"'
                        fixes_applied.append(f"Forced fix of double quote at line {line_number}")
                        changes_made = True
                
                if changes_made:
                    content = '\n'.join(lines)
                else:
                    break  # No more issues to fix
            else:
                break  # No more issues to fix
            
            # Check if we've actually made progress
            if i > 0 and is_syntax_valid(content):
                break
        
        # Check if we've fixed the issue
        if is_syntax_valid(content):
            if content != original_content:
                # Write back the fixed content
                with open(init_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                return {
                    "module": module_name,
                    "status": "fixed", 
                    "message": f"Fixed {len(fixes_applied)} string literals",
                    "fixes": fixes_applied
                }
            else:
                return {
                    "module": module_name,
                    "status": "no_issues",
                    "message": "No string literal issues found"
                }
        else:
            return {
                "module": module_name,
                "status": "unfixable",
                "message": "Could not fix all string literals automatically",
                "fixes": fixes_applied
            }
    except Exception as e:
        error_details = traceback.format_exc()
        return {
            "module": module_name,
            "status": "error",
            "message": f"Error fixing module: {str(e)}",
            "error_details": error_details
        }

def fix_all_modules_string_literals_enhanced() -> Dict[str, Any]:
    """Fix string literals in all API modules.
    
    Returns:
        Dictionary with results of the fixing operation
    """
    modules = [d.name for d in APIS_DIR.iterdir() if d.is_dir() and (d / "__init__.py").exists()]
    results = []
    fixed_count = 0
    no_issues_count = 0
    error_count = 0
    
    for module in modules:
        result = fix_module_string_literals_enhanced(module)
        results.append(result)
        
        if result["status"] == "fixed":
            fixed_count += 1
        elif result["status"] == "no_issues":
            no_issues_count += 1
        else:
            error_count += 1
    
    return {
        "results": results,
        "total_modules": len(modules),
        "fixed_modules": fixed_count,
        "modules_without_issues": no_issues_count,
        "modules_with_errors": error_count
    }

# Additional utility function to fix a specific file directly
def fix_file_string_literals(file_path: str) -> Dict[str, Any]:
    """Fix string literals in a specific file path.
    
    Args:
        file_path: Path to the file to fix
        
    Returns:
        Dictionary with results of the fixing operation
    """
    path = Path(file_path)
    if not path.exists():
        return {"file": file_path, "status": "error", "message": "File not found"}
    
    try:
        # Read the file content
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        max_iterations = 10  # Prevent infinite loops on unfixable files
        fixes_applied = []
        
        # Iteratively fix string literals until no more syntax errors
        for i in range(max_iterations):
            if is_syntax_valid(content):
                break
            
            # Find unterminated string
            string_error = detect_unterminated_string(content)
            if not string_error:
                break
            
            line_number, error_msg = string_error
            # Fix the string literal
            fixed_content = fix_string_literal(content, line_number)
            
            if fixed_content != content:
                content = fixed_content
                fixes_applied.append(f"Fixed unterminated string at line {line_number}")
            else:
                # If our fix didn't change anything, try more aggressive approach
                lines = content.split('\n')
                for fix_line in range(max(1, line_number-1), min(len(lines)+1, line_number+2)):
                    if fix_line <= len(lines):
                        line = lines[fix_line-1]
                        if '"' in line and not line.endswith('"'):
                            lines[fix_line-1] = line + '"'
                            fixes_applied.append(f"Aggressively fixed double quote at line {fix_line}")
                        elif "'" in line and not line.endswith("'"):
                            lines[fix_line-1] = line + "'"
                            fixes_applied.append(f"Aggressively fixed single quote at line {fix_line}")
                
                new_content = '\n'.join(lines)
                if new_content != content:
                    content = new_content
                else:
                    # If still no change, we can't fix automatically
                    fixes_applied.append(f"Failed to fix string at line {line_number}")
                    break
            
            # Check if we've actually made progress
            if i > 0 and is_syntax_valid(content):
                break
        
        # Check if we've fixed the issue
        if is_syntax_valid(content):
            if content != original_content:
                # Write back the fixed content
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                return {
                    "file": str(path),
                    "status": "fixed", 
                    "message": f"Fixed {len(fixes_applied)} string literals",
                    "fixes": fixes_applied
                }
            else:
                return {
                    "file": str(path),
                    "status": "no_issues",
                    "message": "No string literal issues found"
                }
        else:
            return {
                "file": str(path),
                "status": "unfixable",
                "message": "Could not fix all string literals automatically",
                "fixes": fixes_applied
            }
    except Exception as e:
        error_details = traceback.format_exc()
        return {
            "file": str(path),
            "status": "error",
            "message": f"Error fixing file: {str(e)}",
            "error_details": error_details
        }

if __name__ == "__main__":
    # Test on a specific module if run directly
    results = fix_module_string_literals_enhanced("property_facade")
    print(results)
