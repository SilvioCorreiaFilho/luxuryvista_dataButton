from fastapi import APIRouter, HTTPException, Body
import os
from typing import Dict, List, Optional, Any

router = APIRouter(
    prefix="/string-fixer3",
    tags=["string-fixer"],
    responses={404: {"description": "Not found"}},
)

@router.post("/fix-string-literals3")
def fix_string_literals3(module_name: str = Body(..., embed=True)):
    """
    Fix unterminated string literals in a Python module by directly adding the missing quote
    
    Args:
        module_name: Name of the module to fix
        
    Returns:
        dict: Status of the operation
    """
    try:
        api_dir = "/app/src/app/apis"
        module_path = os.path.join(api_dir, module_name, "__init__.py")
        
        if not os.path.exists(module_path):
            return {"error": f"Module {module_name} not found"}
        
        # Read the file
        with open(module_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if it has syntax errors
        try:
            compile(content, module_path, "exec")
            return {"status": "ok", "message": f"Module {module_name} already has valid syntax"}
        except SyntaxError as e:
            error_line = e.lineno
            error_msg = str(e)
            if "unterminated string literal" not in error_msg:
                return {"status": "error", "message": f"Module has non-string-literal syntax error: {error_msg}"}
        
        # Get content as lines
        lines = content.split('\n')
        if 0 <= error_line - 1 < len(lines):
            problem_line = lines[error_line - 1]
            
            # Analyze quotes in the line
            single_quotes = problem_line.count("'")
            double_quotes = problem_line.count('"')
            
            # Determine which type of quote to add
            if "'" in problem_line and single_quotes % 2 == 1:
                fixed_line = problem_line + "'"
                lines[error_line - 1] = fixed_line
                print(f"Fixed line {error_line} with single quote: {fixed_line}")
            elif '"' in problem_line and double_quotes % 2 == 1:
                fixed_line = problem_line + '"'
                lines[error_line - 1] = fixed_line
                print(f"Fixed line {error_line} with double quote: {fixed_line}")
            else:
                # Default to single quote if we can't determine
                fixed_line = problem_line + "'"
                lines[error_line - 1] = fixed_line
                print(f"Fixed line {error_line} with default single quote: {fixed_line}")
            
            # Write the fixed content
            fixed_content = '\n'.join(lines)
            with open(module_path, "w", encoding="utf-8") as f:
                f.write(fixed_content)
            
            # Validate fix worked
            try:
                compile(fixed_content, module_path, "exec")
                return {
                    "status": "fixed",
                    "module": module_name,
                    "line": error_line,
                    "original": problem_line,
                    "fixed": fixed_line
                }
            except SyntaxError as e2:
                return {
                    "status": "partial",
                    "module": module_name,
                    "message": f"Fixed string but still has syntax error: {str(e2)}"
                }
        
        return {"status": "error", "message": f"Could not identify line to fix in module {module_name}"}
    
    except Exception as e:
        return {"status": "error", "message": f"Error processing {module_name}: {str(e)}"}

@router.post("/fix-all-modules3")
def fix_all_modules3():
    """
    Fix unterminated string literals in all API modules
    
    Returns:
        dict: Status of operations
    """
    try:
        api_dir = "/app/src/app/apis"
        results = []
        
        # Get all API modules
        modules = []
        for item in os.listdir(api_dir):
            if os.path.isdir(os.path.join(api_dir, item)) and os.path.exists(os.path.join(api_dir, item, "__init__.py")):
                modules.append(item)
        
        # Try to fix each module
        fixed_count = 0
        failed_count = 0
        skipped_count = 0
        
        for module_name in modules:
            # Skip these utility modules
            if module_name in ["string_fixer", "string_fixer2", "string_fixer3", "fix_module", "module_checker",
                              "api_consistency", "api_fixer"]:
                skipped_count += 1
                continue
                
            # Try to fix the module
            result = fix_string_literals3(module_name)
            
            if result.get("status") == "fixed":
                fixed_count += 1
                results.append(result)
            elif result.get("status") == "error" or result.get("status") == "partial":
                failed_count += 1
                results.append(result)
            # Skip modules that are already ok
        
        return {
            "fixed_count": fixed_count,
            "failed_count": failed_count,
            "skipped_count": skipped_count,
            "results": results
        }
    except Exception as e:
        return {"status": "error", "message": f"Error fixing modules: {str(e)}"}
