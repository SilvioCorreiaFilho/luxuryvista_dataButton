#!/usr/bin/env python3
"""
Module Checker

This module provides functions to check if API modules can be properly imported and used.
"""

import os
import sys
import importlib
import importlib.util
import traceback
from pathlib import Path
from typing import Dict, List, Any, Optional
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
router = APIRouter(prefix="/module-checker")

# Define models
class CheckRequest(BaseModel):
    module: str

class CheckAllRequest(BaseModel):
    pass

class ModuleStatus(BaseModel):
    module: str
    status: str
    message: str
    has_router: bool = False
    exception: Optional[str] = None

class CheckResponse(BaseModel):
    modules: List[ModuleStatus]
    total: int
    valid: int
    invalid: int

def check_module(module_name: str) -> Dict[str, Any]:
    """Check if a specific module can be imported and has a router."""
    init_path = APIS_DIR / module_name / "__init__.py"
    if not init_path.exists():
        return {
            "module": module_name,
            "status": "error",
            "message": "Module not found",
            "has_router": False
        }
    
    try:
        # Directly try to import the module
        module_path = f"app.apis.{module_name}"
        
        # Ensure we're importing fresh (not from cache)
        if module_path in sys.modules:
            del sys.modules[module_path]
        
        # Attempt to import
        module = importlib.import_module(module_path)
        
        # Check if module has a router
        has_router = hasattr(module, 'router')
        
        return {
            "module": module_name,
            "status": "valid",
            "message": "Module imports successfully" + (", has router" if has_router else ", no router"),
            "has_router": has_router
        }
    except Exception as e:
        error_details = traceback.format_exc()
        return {
            "module": module_name,
            "status": "invalid",
            "message": f"Import failed: {str(e)}",
            "has_router": False,
            "exception": error_details
        }

def check_all_modules() -> Dict[str, Any]:
    """Check all API modules for import errors and router existence."""
    modules = [d.name for d in APIS_DIR.iterdir() if d.is_dir() and (d / "__init__.py").exists()]
    results = []
    valid_count = 0
    invalid_count = 0
    
    for module in modules:
        # Skip this module to avoid self-import issues
        if module == "module_checker":
            continue
            
        result = check_module(module)
        results.append(result)
        
        if result["status"] == "valid":
            valid_count += 1
        else:  # error or invalid
            invalid_count += 1
    
    return {
        "modules": results,
        "total": len(modules),
        "valid": valid_count,
        "invalid": invalid_count
    }

# API Endpoints
@router.post("/check-module")
def check_module_endpoint(request: CheckRequest) -> ModuleStatus:
    """Check if a specific module can be imported and has a router."""
    try:
        result = check_module(request.module)
        return ModuleStatus(**result)
    except Exception as e:
        logger.error(f"Error in check_module_endpoint: {e}")
        return ModuleStatus(
            module=request.module,
            status="error",
            message=f"Error: {str(e)}",
            has_router=False,
            exception=traceback.format_exc()
        )

@router.post("/check-all-modules")
def check_all_modules_endpoint(request: CheckAllRequest = Body(...)) -> CheckResponse:
    """Check all modules for import errors and router existence."""
    try:
        result = check_all_modules()
        
        return CheckResponse(
            modules=[ModuleStatus(**r) for r in result["modules"]],
            total=result["total"],
            valid=result["valid"],
            invalid=result["invalid"]
        )
    except Exception as e:
        logger.error(f"Error in check_all_modules_endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Error checking modules: {str(e)}")
