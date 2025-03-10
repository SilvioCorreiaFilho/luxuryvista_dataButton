#!/usr/bin/env python3
"""
API Consistency Checker

This module provides functions to check and fix common API consistency issues,
including syntax errors, unterminated string literals, and import errors.
"""

import os
import re
import ast
import traceback
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
import logging

# Set up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up paths
APP_DIR = Path("/app/src/app")
APIS_DIR = APP_DIR / "apis"

# Create API router
router = APIRouter(prefix="/api-consistency")

# Define models
class CheckRequest(BaseModel):
    module: str

class FixRequest(BaseModel):
    module: str
    fix_type: str = "all"  # Options: "all", "string_literals", "imports", "operation_ids"

class FixAllRequest(BaseModel):
    fix_type: str = "all"  # Options: "all", "string_literals", "imports", "operation_ids"

class FixResult(BaseModel):
    module: str
    status: str
    message: str
    fixes: List[str] = []

class FixResponse(BaseModel):
    results: List[FixResult]
    total_modules: int
    fixed_modules: int
    modules_without_issues: int
    modules_with_errors: int

def is_syntax_valid(code: str) -> bool:
    """Check if the given code has valid syntax."""
    try:
        compile(code, '<string>', 'exec')
        return True
    except Exception:
        return False

def detect_issues(code: str) -> List[Dict[str, Any]]:
    """Detect various issues in the code.
    
    Returns a list of issues with their type, line number, and description.
    """
    issues = []
    
    # Check for syntax errors
    try:
        compile(code, '<string>', 'exec')
    except SyntaxError as e:
        issue_type = "syntax_error"
        if 'unterminated string literal' in str(e):
            issue_type = "unterminated_string"
        
        # Extract the line number
        line_match = re.search(r'line (\d+)', str(e))
        line_number = int(line_match.group(1)) if line_match else 0
        
        issues.append({
            "type": issue_type,
            "line": line_number,
            "description": str(e)
        })
    
    return issues

def fix_unterminated_string(code: str, line_number: int) -> str:
    """Fix unterminated string literal on a specific line."""
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
    if single_quotes % 2 == 1 and double_quotes % 2 == 0:
        # Odd number of single quotes - add a single quote
        lines[line_number - 1] = line + "'"
    elif double_quotes % 2 == 1 and single_quotes % 2 == 0:
        # Odd number of double quotes - add a double quote
        lines[line_number - 1] = line + '"'
    elif triple_single % 2 == 1:
        # Incomplete triple single quotes
        lines[line_number - 1] = line + "'''"
    elif triple_double % 2 == 1:
        # Incomplete triple double quotes
        lines[line_number - 1] = line + '"""'
    else:
        # More complex issue - try a few different approaches
        for quote_type in ["'", '"']:
            # Try adding to the end of the line
            test_code = code.split('\n')
            test_code[line_number - 1] = line + quote_type
            if is_syntax_valid('\n'.join(test_code)):
                return '\n'.join(test_code)
        
        # If we reach here, try adding to the end of the file
        for quote_type in ["'", '"']:
            test_code = code + quote_type
            if is_syntax_valid(test_code):
                return test_code
    
    return '\n'.join(lines)

def fix_module_syntax(module_name: str) -> Dict[str, Any]:
    """Fix syntax errors in a specific module."""
    init_path = APIS_DIR / module_name / "__init__.py"
    if not init_path.exists():
        return {"module": module_name, "status": "error", "message": "Module not found"}
    
    try:
        # Read the file content
        with open(init_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        max_iterations = 10  # Prevent infinite loops
        fixes_applied = []
        
        # Iteratively fix issues until no more syntax errors or max iterations reached
        for i in range(max_iterations):
            if is_syntax_valid(content):
                break
            
            # Detect issues
            issues = detect_issues(content)
            if not issues:
                break
            
            for issue in issues:
                if issue["type"] == "unterminated_string":
                    # Fix unterminated string
                    fixed_content = fix_unterminated_string(content, issue["line"])
                    if fixed_content != content:
                        content = fixed_content
                        fixes_applied.append(f"Fixed unterminated string at line {issue['line']}")
                    else:
                        fixes_applied.append(f"Couldn't fix unterminated string at line {issue['line']}")
                else:
                    # Other syntax errors
                    fixes_applied.append(f"Couldn't fix syntax error: {issue['description']}")
            
            # Check if we're making progress
            if is_syntax_valid(content):
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
                    "message": f"Fixed {len(fixes_applied)} issues",
                    "fixes": fixes_applied
                }
            else:
                return {
                    "module": module_name,
                    "status": "no_issues",
                    "message": "No syntax issues found"
                }
        else:
            return {
                "module": module_name,
                "status": "unfixable",
                "message": "Could not fix all syntax issues automatically",
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

def fix_all_modules_syntax() -> Dict[str, Any]:
    """Fix syntax issues in all API modules."""
    modules = [d.name for d in APIS_DIR.iterdir() if d.is_dir() and (d / "__init__.py").exists()]
    results = []
    fixed_count = 0
    no_issues_count = 0
    error_count = 0
    
    for module in modules:
        # Skip this module to avoid self-modification issues
        if module in ["api_consistency", "string_fixer", "enhanced_string_fixer", "api_fixer"]:
            continue
            
        result = fix_module_syntax(module)
        results.append(result)
        
        if result["status"] == "fixed":
            fixed_count += 1
        elif result["status"] == "no_issues":
            no_issues_count += 1
        else:  # error or unfixable
            error_count += 1
    
    return {
        "results": results,
        "total_modules": len(modules),
        "fixed_modules": fixed_count,
        "modules_without_issues": no_issues_count,
        "modules_with_errors": error_count
    }

# API Endpoints
@router.post("/check-module")
def check_api_consistency(request: CheckRequest) -> Dict[str, Any]:
    """Check a specific API module for consistency issues."""
    module_name = request.module
    init_path = APIS_DIR / module_name / "__init__.py"
    
    if not init_path.exists():
        raise HTTPException(status_code=404, detail=f"Module {module_name} not found")
    
    try:
        with open(init_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        is_valid = is_syntax_valid(content)
        issues = detect_issues(content) if not is_valid else []
        
        return {
            "module": module_name,
            "is_valid": is_valid,
            "issues": issues
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking module: {str(e)}")

@router.post("/fix-module-syntax")
def fix_module_syntax_endpoint(request: FixRequest) -> FixResult:
    """Fix syntax issues in a specific module."""
    try:
        result = fix_module_syntax(request.module)
        
        return FixResult(
            module=result["module"],
            status=result["status"],
            message=result["message"],
            fixes=result.get("fixes", [])
        )
    except Exception as e:
        logger.error(f"Error in fix_module_syntax_endpoint: {e}")
        return FixResult(
            module=request.module,
            status="error",
            message=f"Error: {str(e)}"
        )

@router.post("/fix-all-modules-syntax")
def fix_all_modules_syntax_endpoint(request: FixAllRequest = Body(...)) -> FixResponse:
    """Fix syntax issues in all modules."""
    try:
        result = fix_all_modules_syntax()
        
        return FixResponse(
            results=[FixResult(
                module=r["module"],
                status=r["status"],
                message=r["message"],
                fixes=r.get("fixes", [])
            ) for r in result["results"]],
            total_modules=result["total_modules"],
            fixed_modules=result["fixed_modules"],
            modules_without_issues=result["modules_without_issues"],
            modules_with_errors=result["modules_with_errors"]
        )
    except Exception as e:
        logger.error(f"Error in fix_all_modules_syntax_endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error fixing modules: {str(e)}")
