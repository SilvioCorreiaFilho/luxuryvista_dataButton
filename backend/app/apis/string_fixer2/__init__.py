from fastapi import APIRouter, HTTPException, Body
import os
import re
from typing import Dict, List, Tuple, Optional, Any
import ast

router = APIRouter(
    prefix="/string-fixer2",
    tags=["string-fixer"],
    responses={404: {"description": "Not found"}},
)

@router.post("/fix-string-literals")
def fix_string_literals(module_path: str = Body(...)):
    """
    Fix unterminated string literals in a Python module.
    
    Args:
        module_path: The path to the Python module to fix
        
    Returns:
        dict: Results of the fix operation
    """
    try:
        api_dir = "/app/src/app/apis"
        full_path = os.path.join(api_dir, module_path, "__init__.py")
        
        # Check if the file exists
        if not os.path.exists(full_path):
            return {
                "success": False,
                "error": f"Module file not found: {full_path}"
            }
        
        # Read the file
        with open(full_path, 'r') as f:
            content = f.read()
        
        # Try to compile to check if there are any syntax errors
        try:
            compile(content, full_path, 'exec')
            return {
                "success": True,
                "module": module_path,
                "already_valid": True,
                "message": "Module already has valid syntax"
            }
        except SyntaxError as e:
            if "unterminated string literal" not in str(e):
                return {
                    "success": False,
                    "module": module_path,
                    "error": f"Module has syntax error that's not an unterminated string literal: {str(e)}"
                }
                
            # Get the line with the error
            error_line = e.lineno - 1  # 0-based indexing
        
        # Fix unterminated string literals
        lines = content.split('\n')
        fixed_lines = lines.copy()
        fixed = False
        
        # Special fix for the problematic line
        if 0 <= error_line < len(lines):
            line = lines[error_line]
            
            # Count quotes to identify which type is unbalanced
            single_quotes = line.count("'")
            double_quotes = line.count('"')
            
            if single_quotes % 2 == 1:
                # Unbalanced single quotes
                fixed_lines[error_line] = line + "'"
                fixed = True
            elif double_quotes % 2 == 1:
                # Unbalanced double quotes
                fixed_lines[error_line] = line + '"'
                fixed = True
        
        if fixed:
            # Write the fixed content
            fixed_content = '\n'.join(fixed_lines)
            with open(full_path, 'w') as f:
                f.write(fixed_content)
            
            # Check if the fix worked
            try:
                compile(fixed_content, full_path, 'exec')
                return {
                    "success": True,
                    "module": module_path,
                    "fixed": True,
                    "error_line": error_line + 1,
                    "original": lines[error_line],
                    "fixed_line": fixed_lines[error_line]
                }
            except SyntaxError as e2:
                return {
                    "success": False,
                    "module": module_path,
                    "partial_fix": True,
                    "error": f"Module still has syntax error after fix: {str(e2)}"
                }
        else:
            return {
                "success": False,
                "module": module_path,
                "error": "Could not identify how to fix the unterminated string literal"
            }
    
    except Exception as e:
        return {
            "success": False,
            "module": module_path,
            "error": f"Error fixing module: {str(e)}"
        }

@router.post("/fix-all-modules")
def fix_all_modules():
    """
    Fix unterminated string literals in all modules with such errors.
    
    Returns:
        dict: Results of the fix operations
    """
    try:
        api_dir = "/app/src/app/apis"
        results = []
        
        # Get a list of all API modules
        modules = []
        for item in os.listdir(api_dir):
            if os.path.isdir(os.path.join(api_dir, item)) and os.path.exists(os.path.join(api_dir, item, "__init__.py")):
                modules.append(item)
        
        # Process each module
        for module in modules:
            module_path = os.path.join(api_dir, module, "__init__.py")
            
            # Check if the module has syntax errors
            try:
                with open(module_path, 'r') as f:
                    content = f.read()
                compile(content, module_path, 'exec')
                # No errors, skip this module
                continue
            except SyntaxError as e:
                if "unterminated string literal" not in str(e):
                    # Not an unterminated string literal error, skip
                    continue
            
            # Fix the module
            result = fix_string_literals(module)
            results.append(result)
        
        # Summarize results
        success_count = sum(1 for r in results if r.get("success", False))
        failure_count = len(results) - success_count
        
        return {
            "total_processed": len(results),
            "success_count": success_count,
            "failure_count": failure_count,
            "details": results
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Error processing modules: {str(e)}"
        }

@router.get("/check-module")
def check_module(module: str):
    """
    Check if a module has syntax errors.
    
    Args:
        module: The name of the module to check
        
    Returns:
        dict: Results of the check
    """
    try:
        api_dir = "/app/src/app/apis"
        full_path = os.path.join(api_dir, module, "__init__.py")
        
        # Check if the file exists
        if not os.path.exists(full_path):
            return {
                "success": False,
                "error": f"Module file not found: {full_path}"
            }
        
        # Read the file
        with open(full_path, 'r') as f:
            content = f.read()
        
        # Try to compile to check if there are any syntax errors
        try:
            compile(content, full_path, 'exec')
            return {
                "success": True,
                "module": module,
                "is_valid": True,
                "message": "Module has valid syntax"
            }
        except SyntaxError as e:
            return {
                "success": True,
                "module": module,
                "is_valid": False,
                "error": str(e),
                "error_line": e.lineno,
                "error_type": "unterminated string literal" if "unterminated string literal" in str(e) else "other"
            }
    
    except Exception as e:
        return {
            "success": False,
            "module": module,
            "error": f"Error checking module: {str(e)}"
        }

@router.get("/check-all-modules")
def check_all_modules():
    """
    Check all modules for syntax errors.
    
    Returns:
        dict: Results of the checks
    """
    try:
        api_dir = "/app/src/app/apis"
        valid_modules = []
        invalid_modules = []
        
        # Get a list of all API modules
        modules = []
        for item in os.listdir(api_dir):
            if os.path.isdir(os.path.join(api_dir, item)) and os.path.exists(os.path.join(api_dir, item, "__init__.py")):
                modules.append(item)
        
        # Check each module
        for module in modules:
            result = check_module(module)
            if result.get("is_valid", False):
                valid_modules.append(module)
            else:
                invalid_modules.append({
                    "module": module,
                    "error": result.get("error", "Unknown error"),
                    "error_line": result.get("error_line", 0),
                    "error_type": result.get("error_type", "unknown")
                })
        
        return {
            "total_modules": len(modules),
            "valid_count": len(valid_modules),
            "invalid_count": len(invalid_modules),
            "valid_modules": valid_modules,
            "invalid_modules": invalid_modules
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Error checking modules: {str(e)}"
        }
