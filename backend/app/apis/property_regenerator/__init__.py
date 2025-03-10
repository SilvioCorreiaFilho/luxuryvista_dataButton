"""Property regenerator module for updating luxury real estate listings.

This module serves as a facade/adapter for the property_generator module,
providing backward compatibility for legacy code that uses the old API.
"""

from fastapi import APIRouter, Request, Response, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Create router
router = APIRouter(prefix="/property-regenerator", tags=["properties"])

# Import ALL models from shared module first to avoid circular dependencies
# This must be the first import to avoid circular dependency issues
from ..shared import (
    RegeneratePropertiesRequest, 
    GeneratePropertiesRequest, 
    RegeneratePropertiesResponse,
    BaseResponse as SharedBaseResponse
)

# Import utility functions from common_imports module
from ..common_imports import import_function_safely, import_module_safely, get_shared_model

# Initialize variables for dynamic imports
PROPERTY_GENERATOR_AVAILABLE = False
generate_properties_new = None

# This will be called lazily when needed
def import_property_generator():
    global PROPERTY_GENERATOR_AVAILABLE, generate_properties_new
    
    # Import the generate_properties function from property_generator
    generate_properties_new = import_function_safely('app.apis.property_generator', 'generate_properties')
    
    if generate_properties_new is not None:
        PROPERTY_GENERATOR_AVAILABLE = True
        print("Successfully imported property_generator.generate_properties")
        return True
    else:
        PROPERTY_GENERATOR_AVAILABLE = False
        print("Warning: property_generator not available for regeneration")
        return False

# Legacy endpoint that redirects to new functionality
@router.post("/regenerate-all-properties", operation_id="regenerate_all_properties")
async def regenerate_all_properties(request: RegeneratePropertiesRequest, background_tasks: BackgroundTasks):
    """Legacy endpoint for regenerating all properties.

    This endpoint forwards requests to the new property_generator module.
    It maintains backward compatibility with older code that uses this endpoint.

    Args:
        request: Legacy regeneration request
        background_tasks: For background processing
    """
    # Import the property generator module if not already done
    if not PROPERTY_GENERATOR_AVAILABLE and not import_property_generator():
        return {
            "success": False,
            "message": "Property generator module not available",
            "properties": [],
            "errors": ["Required module not available"]
        }

    try:
        # Convert from old format to new format

        new_request = GeneratePropertiesRequest(
            count=request.property_count or 5,
            force_regenerate=request.force_regenerate or False,
            property_types=request.property_types
        )

        # Call the new implementation
        return await generate_properties_new(new_request, background_tasks)
    except Exception as e:
        return {
            "success": False,
            "message": f"Error regenerating properties: {str(e)}",
            "properties": [],
            "errors": [str(e)]
        }
