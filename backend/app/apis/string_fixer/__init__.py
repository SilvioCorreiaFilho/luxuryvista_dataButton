#!/usr/bin/env python3
"""
String Literal Fixer

This module provides functions to detect and fix unterminated string literals
in Python modules.
"""

import os
import re
import traceback
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional

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

def fix_unterminated_string(content: str, line_number: int) -> str:
    """Fix unterminated string on a specific line."""
    lines = content.split('\n')
    if line_number <= 0 or line_number > len(lines):
        return content
    
    line = lines[line_number - 1]
    
    # Count quotes to determine which type is unterminated
    single_quotes = line.count("'")
    double_quotes = line.count('"')
    
    # Simple fix - add the missing quote
    if single_quotes % 2 == 1 and double_quotes % 2 == 0:
        # Odd number of single quotes, likely missing a closing single quote
        lines[line_number - 1] = line + "'"
    elif double_quotes % 2 == 1 and single_quotes % 2 == 0:
        # Odd number of double quotes, likely missing a closing double quote
        lines[line_number - 1] = line + '"'
    
    return '\n'.join(lines)

def fix_module_string_literals(module_name: str) -> Dict[str, Any]:
    """Fix string literals in a specific module."""
    init_path = APIS_DIR / module_name / "__init__.py"
    if not init_path.exists():
        return {"module": module_name, "status": "error", "message": "Module not found"}
    
    try:
        # Read the file content
        with open(init_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        max_iterations = 5  # Prevent infinite loops
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
            fixed_content = fix_unterminated_string(content, line_number)
            
            if fixed_content != content:
                content = fixed_content
                fixes_applied.append(f"Fixed unterminated string at line {line_number}")
            else:
                # If our simple fix didn't work, try a more aggressive approach
                lines = content.split('\n')
                if line_number <= len(lines):
                    # Try adding both quote types and see if that fixes it
                    test_single = content + "'"
                    test_double = content + '"'
                    
                    if is_syntax_valid(test_single):
                        content = test_single
                        fixes_applied.append(f"Added single quote at end of file")
                    elif is_syntax_valid(test_double):
                        content = test_double
                        fixes_applied.append(f"Added double quote at end of file")
                    else:
                        # If still not fixed, probably a more complex issue
                        fixes_applied.append(f"Couldn't fix line {line_number}")
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

def fix_all_modules() -> Dict[str, Any]:
    """Fix string literals in all API modules."""
    modules = [d.name for d in APIS_DIR.iterdir() if d.is_dir() and (d / "__init__.py").exists()]
    results = []
    fixed_count = 0
    no_issues_count = 0
    error_count = 0
    
    for module in modules:
        # Skip the string_fixer module itself
        if module == "string_fixer":
            continue
            
        result = fix_module_string_literals(module)
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

if __name__ == "__main__":
    # Test on a specific module if run directly
    results = fix_module_string_literals("property_facade")
    print(results)
