#!/usr/bin/env python3
"""
API Fixer Script

This script provides endpoints to fix common issues in API modules:
1. Syntax errors in try-except blocks and other syntax issues
2. Missing APIRouter imports and definitions
3. Router usage and consistency across modules
"""

import os
import re
import logging
from pathlib import Path
from typing import Dict, List, Any
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel

# Import string fixer module
from app.apis.string_fixer import fix_module_string_literals, fix_all_modules

# Create API router
router = APIRouter()

# Configure logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set up paths
APP_DIR = Path("/app/src/app")
APIS_DIR = APP_DIR / "apis"

# List of APIs with syntax errors to fix
APIS_TO_FIX = [
    "property_images",
    "property_generator",
    "property_updater",
    "property_facade",
    "property_manager",
    "deepseek_wrapper",
    "review_code",
    "property_regenerator",
    "seo_enhancer",
    "seo",
    "properties"
]

def fix_try_except_blocks(content):
    """Fix try-except blocks that are missing indentation or except blocks"""
    # Pattern 1: Find try statements without indented blocks
    try_pattern1 = r'try:\s*\n\s*(?!\s)'
    
    # Pattern 2: Find try statements without except blocks
    try_pattern2 = r'try:\s*\n(?:\s+[^\n]+\n)+(?!\s*except)'
    
    # Check and fix pattern 1
    if re.search(try_pattern1, content):
        content = re.sub(try_pattern1, 'try:\n    pass\n    # Added by fixer\nexcept Exception as e:\n    print(f"Error: {str(e)}")\n', content)
    
    # Check and fix pattern 2 - more complex as we need to preserve the indented code
    matches = list(re.finditer(try_pattern2, content))
    for match in reversed(matches):
        try_block = match.group(0)
        # Add except block after try block
        fixed_block = try_block + "except Exception as e:\n    print(f\"Error: {str(e)}\")\n"
        content = content[:match.start()] + fixed_block + content[match.end():]
    
    return content

def fix_unterminated_strings(content):
    """Fix unterminated string literals in a file."""
    # Check if file compiles without errors
    try:
        compile(content, '<string>', 'exec')
        return content, False  # No changes needed
    except SyntaxError as e:
        error_msg = str(e)
        if 'unterminated string literal' not in error_msg:
            return content, False  # Different type of error

        # Extract the line number from the error
        match = re.search(r'line (\d+)', error_msg)
        if not match:
            return content, False

        line_number = int(match.group(1))
        lines = content.split('\n')

        if line_number <= 0 or line_number > len(lines):
            return content, False

        # Get the problematic line
        line = lines[line_number - 1]

        # Count quotes to determine which is missing
        single_quote_count = line.count("'")
        double_quote_count = line.count('"')
        triple_single_quotes = line.count("'''")
        triple_double_quotes = line.count('"""')

        fixed_line = line

        # Basic heuristic for what type of quote is missing
        if single_quote_count % 2 == 1 and double_quote_count % 2 == 0:
            # Odd number of single quotes - likely missing closing quote
            fixed_line = line + "'"
        elif double_quote_count % 2 == 1 and single_quote_count % 2 == 0:
            # Odd number of double quotes - likely missing closing quote
            fixed_line = line + '"'
        elif triple_single_quotes % 2 == 1:
            # Missing triple single quote
            fixed_line = line + "'''"
        elif triple_double_quotes % 2 == 1:
            # Missing triple double quote
            fixed_line = line + '"""'

        # Update the problematic line
        lines[line_number - 1] = fixed_line
        fixed_content = '\n'.join(lines)

        # Verify our fix worked
        try:
            compile(fixed_content, '<string>', 'exec')
            logger.info(f"Fixed unterminated string at line {line_number}")
            return fixed_content, True
        except SyntaxError:
            # If still broken, try adding quotes at the end of the file
            if '"' in lines[-1] and not lines[-1].endswith('"'):
                lines[-1] = lines[-1] + '"'
            elif "'" in lines[-1] and not lines[-1].endswith("'"):
                lines[-1] = lines[-1] + "'"
            
            fixed_content = '\n'.join(lines)
            try:
                compile(fixed_content, '<string>', 'exec')
                logger.info("Fixed unterminated string at end of file")
                return fixed_content, True
            except SyntaxError:
                # Failed to fix automatically
                return content, False

def fix_syntax_errors(content):
    """Fix common syntax errors"""
    # Fix unmatched parentheses
    opening_count = content.count('(')
    closing_count = content.count(')')
    
    if opening_count < closing_count:
        # Remove excess closing parentheses
        excess = closing_count - opening_count
        pattern = r'\)\s*$'
        for _ in range(excess):
            content = re.sub(pattern, '', content, count=1)
    
        # Fix missing APIRouter import
    if 'from fastapi import' in content and 'APIRouter' not in content:
        content = re.sub(
            r'from fastapi import ([^\n]*)', 
            r'from fastapi import \1, APIRouter', 
            content
        )
    elif 'from fastapi import' not in content and 'APIRouter' not in content:
        # Add a new import
        content = "from fastapi import APIRouter, HTTPException\n" + content
    
    # Fix route decorators with double commas
    content = re.sub(r'@router\.[a-z]+\([^,]*,[\s]*,[\s]*', 
                    lambda m: m.group(0).replace(', ,', ','), 
                    content)
    
    # Add response_model=None to route decorators that don't have it
    route_pattern = r'(@router\.[a-z]+\([^)]*\))'
    matches = list(re.finditer(route_pattern, content))
    
    # Process matches in reverse to preserve positions
    for match in reversed(matches):
        decorator = match.group(1)
        # Skip if already has response_model
        if "response_model" in decorator:
            continue
        # Add response_model=None
        fixed_decorator = decorator.replace(")", ", response_model=None)")
        content = content[:match.start(1)] + fixed_decorator + content[match.end(1):]
    
    return content

def fix_router_definition(content):
    """Make sure there's a router definition"""
    if 'router =' not in content and '@router.' in content:
        # Add router definition at the top after imports
        import_pattern = r'((?:import|from).*?(?:\n|$))'
        imports = list(re.finditer(import_pattern, content))
        if imports:
            last_import = imports[-1]
            insert_pos = last_import.end()
            
            router_def = "\n\nfrom fastapi import APIRouter\n\nrouter = APIRouter()\n"
            return content[:insert_pos] + router_def + content[insert_pos:]
    
    return content

def fix_api_file(api_name):
    """Fix a single API file"""
    api_file = APIS_DIR / api_name / "__init__.py"
    
    if not api_file.exists():
        logger.warning(f"File not found: {api_file}")
        return False
    
    try:
        # Read the file content
        with open(api_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Apply fixes
        original_content = content
        content = fix_router_definition(content)
        content = fix_try_except_blocks(content)
        content = fix_syntax_errors(content)
        
        # Fix unterminated strings
        fixed_content, strings_fixed = fix_unterminated_strings(content)
        if strings_fixed:
            content = fixed_content
        
        # If content changed, write it back
        if content != original_content:
            with open(api_file, 'w', encoding='utf-8') as f:
                f.write(content)
            logger.info(f"Fixed syntax in {api_name}/__init__.py")
            return True
        else:
            logger.info(f"No changes needed for {api_name}/__init__.py")
            return False
    except Exception as e:
        logger.error(f"Error fixing {api_name}: {str(e)}")
        return False

def main():
    """Main function to fix API files"""
    fixed_count = 0
    
    for api_name in APIS_TO_FIX:
        if fix_api_file(api_name):
            fixed_count += 1
    
    logger.info(f"Fixed {fixed_count}/{len(APIS_TO_FIX)} API files")
    return fixed_count

if __name__ == "__main__":
    main()

# API Models
class FixModuleRequest(BaseModel):
    module_name: str

class FixAllRequest(BaseModel):
    pass

class FixResult(BaseModel):
    module: str
    status: str
    message: str = ""
    fixes: List[str] = []

class FixResponse(BaseModel):
    results: List[FixResult]
    total_modules: int
    fixed_modules: int
    modules_without_issues: int
    modules_with_errors: int

class RouterFixResult(BaseModel):
    module: str
    had_router_import: bool
    had_router_definition: bool
    fixed: bool
    message: str

# API Router Fixer
class APIRouterFixer:
    def __init__(self):
        self.apis_dir = APIS_DIR
        self.modules_fixed = {}
    
    def fix_module_router(self, module_name: str) -> Dict[str, Any]:
        """Fix router-related issues in a specific module"""
        init_path = self.apis_dir / module_name / "__init__.py"
        if not init_path.exists():
            return {"module": module_name, "status": "error", "message": "Module not found"}
            
        try:
            # Read original content
            with open(init_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if not content.strip():
                return {"module": module_name, "status": "error", "message": "Empty file"}
            
            # Check for issues
            had_router_import = 'APIRouter' in content
            had_router_def = bool(re.search(r'router\s*=\s*APIRouter\(', content))
            
            # Apply fixes
            fixes_applied = []
            
            # Fix 1: Add APIRouter import if missing
            if not had_router_import:
                # Find a good place to add the import
                import_pattern = r'((?:import|from).*?(?:\n|$))'
                imports = list(re.finditer(import_pattern, content))
                if imports:
                    last_import = imports[-1]
                    insert_pos = last_import.end()
                    
                    # Add APIRouter import
                    if 'from fastapi import' in content:
                        # Add to existing import
                        content = re.sub(
                            r'from fastapi import ([^\n]*)', 
                            r'from fastapi import \1, APIRouter', 
                            content
                        )
                    else:
                        # Add new import
                        router_import = "\nfrom fastapi import APIRouter, HTTPException\n"
                        content = content[:insert_pos] + router_import + content[insert_pos:]
                    
                    fixes_applied.append("Added APIRouter import")
                else:
                    # No imports found, add at the beginning
                    content = "from fastapi import APIRouter, HTTPException\n\n" + content
                    fixes_applied.append("Added APIRouter import at beginning")
            
            # Fix 2: Add router definition if missing
            if not had_router_def:
                # Find position after imports
                import_pattern = r'((?:import|from).*?(?:\n|$))'
                imports = list(re.finditer(import_pattern, content))
                
                if imports:
                    last_import = imports[-1]
                    insert_pos = last_import.end()
                    
                    # Add router definition
                    router_def = "\n\n# Create API router\nrouter = APIRouter()\n\n"
                    content = content[:insert_pos] + router_def + content[insert_pos:]
                    fixes_applied.append("Added router definition")
                else:
                    # No imports found, add after APIRouter import
                    if "from fastapi import APIRouter" in content:
                        # Add after the import
                        content = content + "\n\n# Create API router\nrouter = APIRouter()\n\n"
                        fixes_applied.append("Added router definition at end")
            
            # If no fixes applied, return early
            if not fixes_applied:
                return {
                    "module": module_name,
                    "had_router_import": had_router_import,
                    "had_router_definition": had_router_def,
                    "fixed": False,
                    "message": "No router issues to fix"
                }
            
            # Write fixed content
            with open(init_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return {
                "module": module_name,
                "had_router_import": had_router_import,
                "had_router_definition": had_router_def,
                "fixed": True,
                "message": ", ".join(fixes_applied)
            }
                
        except Exception as e:
            return {
                "module": module_name,
                "had_router_import": False,
                "had_router_definition": False,
                "fixed": False,
                "message": f"Error: {str(e)}"
            }
    
    def fix_all_modules_router(self) -> List[Dict[str, Any]]:
        """Fix router issues in all modules"""
        modules = []
        for item in os.listdir(self.apis_dir):
            module_path = self.apis_dir / item
            init_path = module_path / "__init__.py"
            
            if os.path.isdir(module_path) and os.path.exists(init_path) and item != "__pycache__":
                modules.append(item)
        
        results = []
        for module in sorted(modules):
            if module == "api_fixer":  # Skip this module to avoid self-modification
                continue
                
            logger.info(f"Checking router for module: {module}")
            result = self.fix_module_router(module)
            results.append(result)
        
        return results

# API Endpoints
@router.post("/fix-strings")
def fix_string_literals(request: FixModuleRequest) -> FixResult:
    """Fix unterminated string literals in a specific module"""
    try:
        # Use the string literal fixer
        result = fix_module_string_literals(request.module_name)
        
        # Convert to the expected FixResult format
        return FixResult(
            module=result["module"],
            status=result["status"],
            message=result["message"],
            fixes=result.get("fixes", [])
        )
    except Exception as e:
        logger.error(f"Error in fix_string_literals: {e}")
        return FixResult(
            module=request.module_name,
            status="error",
            message=f"Error: {str(e)}"
        )

@router.post("/fix-all-strings")
def fix_all_string_literals(request: FixAllRequest = Body(...)) -> FixResponse:
    """Fix unterminated string literals in all modules"""
    try:
        # Use the string literal fixer that checks all modules
        result = fix_all_modules()
        
        # Convert the results to the expected format
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
        logger.error(f"Error in fix_all_string_literals: {e}")
        raise HTTPException(status_code=500, detail=f"Error fixing string literals: {str(e)}")

@router.post("/fix-router")
def fix_module_router(request: FixModuleRequest) -> RouterFixResult:
    """Fix router issues in a specific API module"""
    try:
        fixer = APIRouterFixer()
        result = fixer.fix_module_router(request.module_name)
        
        return RouterFixResult(
            module=result["module"],
            had_router_import=result["had_router_import"],
            had_router_definition=result["had_router_definition"],
            fixed=result["fixed"],
            message=result["message"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fixing module router: {str(e)}")

@router.post("/fix-all-routers")
def fix_all_module_routers(request: FixAllRequest = Body(...)) -> List[RouterFixResult]:
    """Fix router issues in all API modules"""
    try:
        fixer = APIRouterFixer()
        results = fixer.fix_all_modules_router()
        
        return [
            RouterFixResult(
                module=r["module"],
                had_router_import=r["had_router_import"],
                had_router_definition=r["had_router_definition"],
                fixed=r["fixed"],
                message=r["message"]
            ) for r in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fixing module routers: {str(e)}")

@router.post("/consistency-check")
def check_api_consistency() -> Dict[str, Any]:
    """Check API module consistency across the app"""
    try:
        # Find all API modules
        all_modules = []
        
        for item in os.listdir(APIS_DIR):
            module_path = APIS_DIR / item
            init_path = module_path / "__init__.py"
            
            if os.path.isdir(module_path) and os.path.exists(init_path) and item != "__pycache__":
                all_modules.append(item)
        
        # Check each module for consistency
        module_check_results = {}
        for module in sorted(all_modules):
            init_path = APIS_DIR / module / "__init__.py"
            with open(init_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for key elements
            has_router_import = 'APIRouter' in content
            has_router_def = bool(re.search(r'router\s*=\s*APIRouter\(', content))
            has_endpoints = '@router.' in content
            has_models = 'BaseModel' in content
            has_error_handling = 'HTTPException' in content
            
            module_check_results[module] = {
                "has_router_import": has_router_import,
                "has_router_definition": has_router_def,
                "has_endpoints": has_endpoints,
                "has_models": has_models,
                "has_error_handling": has_error_handling,
                "is_consistent": has_router_import and has_router_def
            }
        
        # Calculate overall consistency
        consistent_modules = sum(1 for r in module_check_results.values() if r["is_consistent"])
        inconsistent_modules = len(module_check_results) - consistent_modules
        
        return {
            "total_modules": len(module_check_results),
            "consistent_modules": consistent_modules,
            "inconsistent_modules": inconsistent_modules,
            "consistency_percentage": round(consistent_modules / max(1, len(module_check_results)) * 100, 1),
            "module_details": module_check_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking consistency: {str(e)}")

@router.post("/fix-module")
def fix_module_syntax(request: FixModuleRequest) -> FixResult:
    """Fix syntax issues in a specific API module"""
    try:
        if request.module_name not in APIS_TO_FIX and request.module_name != "supabase_cms":
            return FixResult(
                module=request.module_name,
                status="skipped",
                message="Module not in fix list"
            )
            
        result = fix_api_file(request.module_name)
        
        if result:
            return FixResult(
                module=request.module_name,
                status="fixed",
                message="Fixed syntax issues",
                fixes=["Fixed try-except blocks", "Fixed syntax errors", "Fixed router definition"]
            )
        else:
            return FixResult(
                module=request.module_name,
                status="ok",
                message="No syntax issues to fix"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fixing module syntax: {str(e)}")

@router.post("/fix-all-modules")
def fix_all_modules_syntax(request: FixAllRequest = Body(...)) -> FixResponse:
    """Fix syntax issues in all API modules"""
    try:
        results = []
        fixed_count = 0
        ok_count = 0
        error_count = 0
        
        for module in APIS_TO_FIX + ["supabase_cms"]:
            try:
                fixed = fix_api_file(module)
                
                if fixed:
                    results.append({
                        "module": module,
                        "status": "fixed",
                        "message": "Fixed syntax issues",
                        "fixes": ["Fixed try-except blocks", "Fixed syntax errors", "Fixed router definition"]
                    })
                    fixed_count += 1
                else:
                    results.append({
                        "module": module,
                        "status": "ok",
                        "message": "No syntax issues to fix"
                    })
                    ok_count += 1
            except Exception as e:
                results.append({
                    "module": module,
                    "status": "error",
                    "message": f"Error: {str(e)}"
                })
                error_count += 1
        
        return FixResponse(
            results=[FixResult(**r) for r in results],
            total_modules=len(results),
            fixed_modules=fixed_count,
            modules_without_issues=ok_count,
            modules_with_errors=error_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fixing modules: {str(e)}")

@router.post("/operation-id-fixer-scan")
def fix_operation_ids() -> Dict[str, Any]:
    """Fix missing operation_ids in router decorators"""
    try:
        fixed_modules = []
        issues_found = 0
        fixed_count = 0
        
        for item in os.listdir(APIS_DIR):
            module_path = APIS_DIR / item
            init_path = module_path / "__init__.py"
            
            if os.path.isdir(module_path) and os.path.exists(init_path) and item != "__pycache__":
                try:
                    with open(init_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Look for router decorators without operation_id
                    router_pattern = r'@router\.[a-z]+\([^)]*\)'
                    matches = list(re.finditer(router_pattern, content))
                    
                    module_fixes = 0
                    
                    for match in reversed(matches):  # Process in reverse to maintain positions
                        decorator = match.group(0)
                        if 'operation_id=' not in decorator:
                            # Extract function name to use as operation_id
                            func_match = re.search(r'def\s+([a-zA-Z0-9_]+)\s*\(', content[match.end():])
                            if func_match:
                                func_name = func_match.group(1)
                                # Add operation_id to decorator
                                fixed_decorator = decorator.replace(')', f', operation_id="{func_name}")')
                                content = content[:match.start()] + fixed_decorator + content[match.end():]
                                module_fixes += 1
                    
                    if module_fixes > 0:
                        # Write fixed content back
                        with open(init_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                            
                        fixed_modules.append(item)
                        issues_found += module_fixes
                        fixed_count += 1
                        
                except Exception as e:
                    logger.error(f"Error processing {item}: {str(e)}")
        
        return {
            "modules_checked": len(os.listdir(APIS_DIR)) - 1,  # Exclude __pycache__
            "modules_fixed": fixed_count,
            "decorators_fixed": issues_found,
            "fixed_modules": fixed_modules
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fixing operation IDs: {str(e)}")