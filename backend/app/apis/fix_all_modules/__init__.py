from fastapi import APIRouter, HTTPException
import os
from typing import Dict, List, Any

router = APIRouter(
    prefix="/fix-all-modules",
    tags=["fix-modules"],
)

def fix_file(file_path):
    """Fix string literals in a file directly."""
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if it has syntax errors
        try:
            compile(content, file_path, 'exec')
            return {"status": "ok", "message": "File already has valid syntax"}
        except SyntaxError as e:
            error_line = e.lineno
            error_msg = str(e)
            if "unterminated string literal" not in error_msg:
                return {"status": "error", "message": f"File has non-string-literal syntax error: {error_msg}"}
        
        # Fix the file
        lines = content.split('\n')
        if 0 <= error_line - 1 < len(lines):
            line = lines[error_line - 1]
            
            # Simple fix: add closing quote
            if "'" in line and line.count("'") % 2 == 1:
                fixed_line = line + "'"
                lines[error_line - 1] = fixed_line
            elif '"' in line and line.count('"') % 2 == 1:
                fixed_line = line + '"'
                lines[error_line - 1] = fixed_line
            else:
                # Default to adding a single quote
                fixed_line = line + "'"
                lines[error_line - 1] = fixed_line
            
            # Write the fixed content
            fixed_content = '\n'.join(lines)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            
            # Check if the fix worked
            try:
                compile(fixed_content, file_path, 'exec')
                return {"status": "fixed", "message": "Successfully fixed file"}
            except SyntaxError as e2:
                return {"status": "partial", "message": f"Fixed string but still has syntax error: {str(e2)}"}
        
        return {"status": "error", "message": "Could not identify line to fix"}
    except Exception as e:
        return {"status": "error", "message": f"Error processing file: {str(e)}"}

@router.get("/fix_module/{module_name}")
def fix_module(module_name: str):
    """Fix string literals in a specific module."""
    try:
        api_dir = "/app/src/app/apis"
        module_path = os.path.join(api_dir, module_name, "__init__.py")
        
        if not os.path.exists(module_path):
            raise HTTPException(status_code=404, detail=f"Module {module_name} not found")
        
        result = fix_file(module_path)
        return {"module": module_name, **result}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fix_all")
def fix_all_modules2():
    """Fix string literals in all modules."""
    try:
        api_dir = "/app/src/app/apis"
        results = []
        
        # Get all API modules
        modules = []
        for item in os.listdir(api_dir):
            if os.path.isdir(os.path.join(api_dir, item)):
                init_file = os.path.join(api_dir, item, "__init__.py")
                if os.path.exists(init_file):
                    modules.append((item, init_file))
        
        # Try to fix each module
        fixed_count = 0
        partial_count = 0
        error_count = 0
        ok_count = 0
        
        for module_name, init_file in modules:
            result = fix_file(init_file)
            result["module"] = module_name
            results.append(result)
            
            if result["status"] == "fixed":
                fixed_count += 1
            elif result["status"] == "partial":
                partial_count += 1
            elif result["status"] == "error":
                error_count += 1
            else:  # ok
                ok_count += 1
        
        return {
            "total_modules": len(modules),
            "fixed_count": fixed_count,
            "partial_count": partial_count,
            "error_count": error_count,
            "ok_count": ok_count,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
