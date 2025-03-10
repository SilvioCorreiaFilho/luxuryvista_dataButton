#!/usr/bin/env python3
"""
String Literal Fixer

This module provides functions to detect and fix unterminated string literals in Python files.
"""

import re
from pathlib import Path
import os
import traceback
from typing import Dict, List, Tuple, Any, Optional

# Constants
APIS_DIR = Path("src/app/apis")

def is_valid_python(content: str) -> Tuple[bool, Optional[Exception]]:
    """Check if the content is valid Python code
    
    Args:
        content: Python code to check
        
    Returns:
        Tuple containing (is_valid, error)
    """
    try:
        compile(content, '<string>', 'exec')
        return True, None
    except SyntaxError as e:
        return False, e
    except Exception as e:
        return False, e

def detect_unclosed_quotes(line: str) -> Tuple[bool, str]:
    """Detect if a line has unclosed quotes and determine which type
    
    Args:
        line: Line of code to check
        
    Returns:
        Tuple of (has_unclosed_quotes, quote_type)
    """
    # Count quotes of each type
    single_quotes = line.count("'")
    double_quotes = line.count('"')
    
    # Check if any quotes are unclosed (odd count)
    if single_quotes % 2 == 1 and double_quotes % 2 == 0:
        return True, "'"
    elif double_quotes % 2 == 1 and single_quotes % 2 == 0:
        return True, '"'
    
    # Check for unclosed triple quotes
    triple_single = line.count("'''")
    triple_double = line.count('"""')
    
    if triple_single % 2 == 1:
        return True, "'''"
    elif triple_double % 2 == 1:
        return True, '"""'
    
    return False, ""

def fix_unterminated_string_literal(content: str, error: Optional[Exception] = None) -> Tuple[str, bool, str]:
    """Fix unterminated string literals in content
    
    Args:
        content: Python code to fix
        error: Optional SyntaxError from compilation
        
    Returns:
        Tuple of (fixed_content, was_fixed, message)
    """
    # If no error provided, try to compile to detect one
    if error is None:
        is_valid, error = is_valid_python(content)
        if is_valid:
            return content, False, "No syntax errors detected"
    
    # Check if the error is about unterminated string literal
    error_str = str(error)
    if "unterminated string literal" not in error_str:
        return content, False, f"Not a string literal error: {error_str}"
    
    # Extract line number from error
    line_match = re.search(r'line (\d+)', error_str)
    if not line_match:
        return content, False, f"Could not extract line number from error: {error_str}"
    
    line_number = int(line_match.group(1))
    lines = content.split('\n')
    
    if line_number <= 0 or line_number > len(lines):
        return content, False, f"Invalid line number: {line_number}"
    
    # Get the problematic line
    problematic_line = lines[line_number - 1]
    
    # Check what type of quote is unclosed
    has_unclosed, quote_type = detect_unclosed_quotes(problematic_line)
    
    if has_unclosed:
        # Fix by adding the missing quote
        lines[line_number - 1] = problematic_line + quote_type
        fixed_content = '\n'.join(lines)
        
        # Verify the fix worked
        is_valid, new_error = is_valid_python(fixed_content)
        if is_valid:
            return fixed_content, True, f"Fixed line {line_number} by adding {quote_type}"
    
    # If simple fix didn't work, try more complex approaches
    
    # Check if this is a docstring issue
    if line_number <= 3 and ('"""' in problematic_line or "'''" in problematic_line):
        # This might be an unterminated docstring
        # Find where to close it - add closing quotes before the next definition
        closing_quote = '"""' if '"""' in problematic_line else "'''"
        
        for i in range(line_number, min(line_number + 10, len(lines))):
            if lines[i].strip().startswith(('def ', 'class ', 'import ', 'from ')):
                # Insert closing quotes before this line
                lines[i] = closing_quote + '\n' + lines[i]
                fixed_content = '\n'.join(lines)
                
                # Verify the fix
                is_valid, _ = is_valid_python(fixed_content)
                if is_valid:
                    return fixed_content, True, f"Fixed unterminated docstring with {closing_quote}"
                break
    
    # Last resort - just add both types of triple quotes at the end of the file
    lines.append('"""')
    lines.append("'''")
    fixed_content = '\n'.join(lines)
    
    # Final verification
    is_valid, final_error = is_valid_python(fixed_content)
    if is_valid:
        return fixed_content, True, "Fixed by adding closing quotes at end of file"
    else:
        return content, False, f"Failed to fix: {str(final_error)}"

def fix_module_string_literals(module_name: str) -> Dict[str, Any]:
    """Fix unterminated string literals in a specific module
    
    Args:
        module_name: Name of the module to fix
        
    Returns:
        Dictionary with results of the fix operation
    """
    module_path = APIS_DIR / module_name
    init_file = module_path / "__init__.py"
    
    if not module_path.exists() or not module_path.is_dir():
        return {
            "module": module_name,
            "status": "error", 
            "message": f"Module directory {module_name} does not exist",
            "fixes": []
        }
    
    if not init_file.exists():
        return {
            "module": module_name,
            "status": "error",
            "message": f"__init__.py file does not exist in {module_name}",
            "fixes": []
        }
    
    try:
        # Read the file content
        with open(init_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if there are syntax errors
        is_valid, error = is_valid_python(content)
        if is_valid:
            return {
                "module": module_name,
                "status": "ok",
                "message": "No unterminated string literals found",
                "fixes": []
            }
        
        # Fix unterminated string literals
        fixed_content, was_fixed, message = fix_unterminated_string_literal(content, error)
        
        if was_fixed:
            # Write the fixed content back to the file
            with open(init_file, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            
            return {
                "module": module_name,
                "status": "fixed",
                "message": message,
                "fixes": [{
                    "file": str(init_file),
                    "description": message
                }]
            }
        else:
            return {
                "module": module_name,
                "status": "error",
                "message": message,
                "fixes": []
            }
    
    except Exception as e:
        error_details = traceback.format_exc()
        return {
            "module": module_name,
            "status": "error",
            "message": f"Error fixing module: {str(e)}",
            "error_details": error_details,
            "fixes": []
        }

def fix_all_modules_string_literals() -> Dict[str, Any]:
    """Fix unterminated string literals in all modules
    
    Returns:
        Dictionary with results of all fix operations
    """
    # Get all module directories
    try:
        modules = [d.name for d in APIS_DIR.iterdir() if d.is_dir()]
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error listing modules: {str(e)}"
        }
    
    results = []
    fixed_modules = 0
    modules_without_issues = 0
    modules_with_errors = 0
    
    for module_name in modules:
        result = fix_module_string_literals(module_name)
        results.append(result)
        
        if result["status"] == "fixed":
            fixed_modules += 1
        elif result["status"] == "ok":
            modules_without_issues += 1
        else:
            modules_with_errors += 1
    
    return {
        "results": results,
        "total_modules": len(modules),
        "fixed_modules": fixed_modules,
        "modules_without_issues": modules_without_issues,
        "modules_with_errors": modules_with_errors
    }