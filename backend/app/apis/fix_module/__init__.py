from fastapi import APIRouter, HTTPException, Body
import os
import ast
import tokenize
import io
from typing import Dict, List, Tuple, Optional, Any

router = APIRouter(
    prefix="/fix-module",
    tags=["code-fixer"],
    responses={404: {"description": "Not found"}},
)

@router.post("/fix-string-literals")
def fix_string_literals(module_name: str = Body(...)):
    """
    Fix unterminated string literals in a Python module.
    
    Args:
        module_name: The name of the module to fix (e.g., "settings")
        
    Returns:
        dict: Results of the fix operation
    """
    try:
        # Construct the path to the module
        api_dir = "/app/src/app/apis"
        module_path = os.path.join(api_dir, module_name, "__init__.py")
        
        # Check if the file exists
        if not os.path.exists(module_path):
            return {"error": f"Module not found: {module_name}"}
        
        # Read the file content
        with open(module_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Check if the file has syntax errors
        try:
            compile(content, module_path, "exec")
            return {"module": module_name, "status": "ok", "message": "Module already has valid syntax"}
        except SyntaxError as e:
            error_line = e.lineno
            error_msg = str(e)
            
            # Only fix unterminated string literals
            if "unterminated string literal" not in error_msg:
                return {"module": module_name, "status": "error", "message": f"Module has non-string-literal syntax error: {error_msg}"}
        
        # Split the content into lines
        lines = content.split("\n")
        if error_line <= 0 or error_line > len(lines):
            return {"module": module_name, "status": "error", "message": f"Invalid error line: {error_line}"}
            
        # Get the problematic line (0-indexed in the list)
        line = lines[error_line - 1]
        
        # Count quotes to find unbalanced ones
        single_quotes = line.count("'")
        double_quotes = line.count('"')
        triple_single = line.count("'''")
        triple_double = line.count('"""')
        
        # Adjust counts for triple quotes
        single_quotes -= triple_single * 3
        double_quotes -= triple_double * 3
        
        # Apply fixes based on the type of quotes that are unbalanced
        fixes = []
        fixed_line = line
        if single_quotes % 2 == 1:
            fixed_line += "'"
            fixes.append(f"Fixed single quote at line {error_line}")
        elif double_quotes % 2 == 1:
            fixed_line += '"'
            fixes.append(f"Fixed double quote at line {error_line}")
        elif triple_single % 2 == 1:
            # If the line ends in a partial triple quote
            if line.endswith("''") or line.endswith("'"):
                missing_quotes = 3 - (1 if line.endswith("'") else 2)
                fixed_line += "'" * missing_quotes
                fixes.append(f"Fixed triple single quote at line {error_line}")
            else:
                # Add a full triple quote on the next line
                lines.insert(error_line, "'''")
                fixes.append(f"Added closing triple single quote after line {error_line}")
        elif triple_double % 2 == 1:
            # If the line ends in a partial triple quote
            if line.endswith('""') or line.endswith('"'):
                missing_quotes = 3 - (1 if line.endswith('"') else 2)
                fixed_line += '"' * missing_quotes
                fixes.append(f"Fixed triple double quote at line {error_line}")
            else:
                # Add a full triple quote on the next line
                lines.insert(error_line, '"""')
                fixes.append(f"Added closing triple double quote after line {error_line}")
        else:
            # If we couldn't determine the type of unterminated string, try a simple approach
            if line.count("'") > line.count('"'):
                fixed_line += "'"
                fixes.append(f"Fixed single quote at line {error_line} (best guess)")
            else:
                fixed_line += '"'
                fixes.append(f"Fixed double quote at line {error_line} (best guess)")
        
        # Update the line in the list
        lines[error_line - 1] = fixed_line
        
        # Join the lines back into a single string
        new_content = "\n".join(lines)
        
        # Try to compile the modified content to check if the syntax error is fixed
        try:
            compile(new_content, module_path, "exec")
            # If it compiles, write the changes back to the file
            with open(module_path, "w", encoding="utf-8") as f:
                f.write(new_content)
            return {
                "module": module_name,
                "status": "fixed",
                "message": "Successfully fixed string literals",
                "fixes": fixes
            }
        except SyntaxError as e:
            # If still having syntax errors, return information about the remaining issue
            return {
                "module": module_name,
                "status": "unfixable",
                "message": "Could not fix all string literals automatically",
                "fixes": fixes,
                "remaining_error": str(e)
            }
    except Exception as e:
        return {"error": f"Error processing module {module_name}: {str(e)}"}

@router.post("/fix-all-modules")
def fix_all_modules():
    """
    Fix unterminated string literals in all API modules.
    
    Returns:
        dict: Results of fix operations
    """
    try:
        # Get a list of all API modules
        api_dir = "/app/src/app/apis"
        modules = []
        for item in os.listdir(api_dir):
            if os.path.isdir(os.path.join(api_dir, item)):
                init_file = os.path.join(api_dir, item, "__init__.py")
                if os.path.exists(init_file):
                    modules.append(item)
        
        # Try to fix each module
        results = []
        for module_name in modules:
            try:
                # Check if the module has a syntax error related to string literals
                module_path = os.path.join(api_dir, module_name, "__init__.py")
                with open(module_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                try:
                    compile(content, module_path, "exec")
                    # Skip modules with no syntax errors
                    continue
                except SyntaxError as e:
                    if "unterminated string literal" not in str(e):
                        # Skip modules with non-string-literal syntax errors
                        continue
                
                # Fix the module
                result = fix_string_literals(module_name)
                results.append(result)
            except Exception as e:
                results.append({"module": module_name, "status": "error", "message": str(e)})
        
        # Count successes and failures
        fixed = [r for r in results if r.get("status") == "fixed"]
        unfixable = [r for r in results if r.get("status") == "unfixable"]
        errors = [r for r in results if r.get("status") == "error"]
        
        return {
            "total_processed": len(results),
            "fixed": len(fixed),
            "unfixable": len(unfixable),
            "errors": len(errors),
            "results": results
        }
    except Exception as e:
        return {"error": f"Error fixing modules: {str(e)}"}
