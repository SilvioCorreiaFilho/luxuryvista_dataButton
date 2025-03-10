from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import os
import ast
import sys
import importlib
import traceback
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/health-check", tags=["utils"])

class ModuleHealth(BaseModel):
    module_name: str
    status: str
    error: Optional[str] = None

class HealthCheckResponse(BaseModel):
    status: str  # healthy, unhealthy, error
    total_modules: int
    healthy_count: int
    unhealthy_count: int
    healthy_modules: List[ModuleHealth] = []
    unhealthy_modules: List[ModuleHealth] = []

def check_module_health(module_path):
    """Check if a module can be imported without errors."""
    try:
        # For __init__.py files, use the direct path to check syntax
        if module_path.endswith("__init__.py") and os.path.exists(module_path):
            with open(module_path, "r", encoding="utf-8") as f:
                source = f.read()
            try:
                ast.parse(source)
                return True, None
            except SyntaxError as e:
                return False, f"Syntax error at line {e.lineno}, column {e.offset}: {e.msg}"
            except Exception as e:
                return False, f"Error parsing module: {str(e)}"
        
        # Otherwise try importing the module
        else:
            module_name = module_path.replace("/", ".").replace("src.", "").replace("__init__.py", "")
            if module_name.endswith("."):
                module_name = module_name[:-1]
                
            try:
                # Try to import the module
                if module_name in sys.modules:
                    importlib.reload(sys.modules[module_name])
                else:
                    importlib.import_module(module_name)
                return True, None
            except Exception as e:
                return False, str(e)
    except Exception as e:
        return False, f"Error checking module: {str(e)}"

@router.get("/", response_model=HealthCheckResponse, operation_id="check_health")
def check_health():
    """Check the health of all API modules."""
    result = {
        "status": "healthy",
        "total_modules": 0,
        "healthy_count": 0,
        "unhealthy_count": 0,
        "healthy_modules": [],
        "unhealthy_modules": []
    }
    
    try:
        api_dir = Path("src/app/apis")
        all_modules = []
        
        # Find all API modules
        for api_module in api_dir.glob("*"):
            if not api_module.is_dir():
                continue
                
            init_file = api_module / "__init__.py"
            if not init_file.exists():
                continue
            
            module_name = f"app.apis.{api_module.name}"
            all_modules.append((module_name, str(init_file)))
        
        # Check each module
        for module_name, module_path in all_modules:
            is_healthy, error = check_module_health(module_path)
            
            if is_healthy:
                result["healthy_modules"].append(
                    ModuleHealth(module_name=module_name, status="healthy")
                )
                result["healthy_count"] += 1
            else:
                result["unhealthy_modules"].append(
                    ModuleHealth(module_name=module_name, status="unhealthy", error=error)
                )
                result["unhealthy_count"] += 1
        
        result["total_modules"] = len(all_modules)
        
        # Determine overall status
        if result["unhealthy_count"] > 0:
            result["status"] = "unhealthy"
        
        return HealthCheckResponse(**result)
    
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error in health check: {e}\nStack trace: {error_details}")
        
        return HealthCheckResponse(
            status="error",
            total_modules=0,
            healthy_count=0,
            unhealthy_count=0,
            healthy_modules=[],
            unhealthy_modules=[
                ModuleHealth(
                    module_name="health_check",
                    status="error",
                    error=f"Error running health check: {str(e)}"
                )
            ]
        )
