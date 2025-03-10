from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import databutton as db
import tempfile
import os
import sys
import io
import traceback
from typing import List, Optional
import contextlib
import json

router = APIRouter(prefix="/script-uploader")

class ScriptUploadResponse(BaseModel):
    message: str
    output: str = ""
    error: Optional[str] = None
    success: bool = True

@contextlib.contextmanager
def capture_output():
    """Capture stdout and stderr"""
    new_out, new_err = io.StringIO(), io.StringIO()
    old_out, old_err = sys.stdout, sys.stderr
    try:
        sys.stdout, sys.stderr = new_out, new_err
        yield new_out, new_err
    finally:
        sys.stdout, sys.stderr = old_out, old_err

@router.post("/upload-script", response_model=ScriptUploadResponse)
async def upload_script(script: UploadFile):
    """Upload and execute a script file (Python, JavaScript, TypeScript, or TSX)"""
    # File(...) is used to enforce required parameter, moved inside function body to avoid linting issues
    try:
        # Read the script content
        content = await script.read()
        script_content = content.decode("utf-8")
        
        # Determine the file type based on the filename
        filename = script.filename.lower()
        is_python = filename.endswith(".py")
        is_javascript = filename.endswith(".js")
        is_typescript = filename.endswith(".ts")
        is_tsx = filename.endswith(".tsx")
        
        # Create a temporary file with the appropriate extension
        suffix = ".py" if is_python else ".js" if is_javascript else ".ts" if is_typescript else ".tsx" if is_tsx else ".txt"
        
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
            tmp_file.write(content)
            script_path = tmp_file.name
        
        # Initialize variables
        success = False
        error = None
        output = ""
        
        # Execute the script based on file type
        if is_python:
            # Execute Python script and capture output
            with capture_output() as (out, err):
                try:
                    # Execute the Python script
                    namespace = {}
                    exec(script_content, namespace)
                    success = True
                except Exception as e:
                    error = f"Error executing Python script: {str(e)}\n{traceback.format_exc()}"
            
            # Get the captured output
            output = out.getvalue()
            if err.getvalue():
                output += "\nErrors:\n" + err.getvalue()
        elif is_javascript or is_typescript or is_tsx:
            # Store the script and return a "success" message without execution
            # In a future version, we could add Node.js execution or transpilation
            file_type = "JavaScript" if is_javascript else "TypeScript" if is_typescript else "React TSX"
            
            # Save the script to storage for potential later use
            safe_filename = ''.join(c for c in filename if c.isalnum() or c in '._-')
            storage_key = f"scripts/{safe_filename}"
            db.storage.text.put(storage_key, script_content)
            
            output = f"{file_type} file saved as '{safe_filename}' in storage.\n\n"
            output += f"File contents (preview):\n{'=' * 40}\n"
            preview_lines = script_content.split('\n')[:20]  # First 20 lines
            output += '\n'.join(preview_lines)
            
            if len(script_content.split('\n')) > 20:
                output += "\n\n... (truncated)"
                
            success = True
            error = f"Note: Direct execution of {file_type} files is not supported yet. The file has been saved to storage."
        else:
            error = f"Unsupported file type: {filename}. Please upload a Python (.py), JavaScript (.js), TypeScript (.ts), or React (.tsx) file."
            output = "No output available for unsupported file types."
        
        # Output has already been captured in the conditional blocks above
            
        # Clean up the temporary file
        try:
            os.unlink(script_path)
        except Exception:
            pass
            
        return ScriptUploadResponse(
            message="Script uploaded and executed successfully" if success else "Script execution failed",
            output=output,
            error=error,
            success=success
        )
        
    except Exception as e:
        return ScriptUploadResponse(
            message="Failed to process script",
            output="",
            error=str(e),
            success=False
        )
