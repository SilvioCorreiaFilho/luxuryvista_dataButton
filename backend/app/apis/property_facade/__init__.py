"""Property Facade API - A simplified interface for property operations

This facade provides a clean API for property operations without circular dependencies,
acting as an intermediary between different property-related modules.
"""

from typing import Dict, Any, List, Optional, Union
from fastapi import APIRouter, HTTPException, BackgroundTasks
import databutton as db
import json
import traceback
import uuid
from datetime import datetime

# Import Pydantic models from shared module with safe error handling
try:
    from ..shared import (
        PropertiesResponse,
        PropertyResponse,
        GeneratePropertiesRequest,
        GeneratePropertiesResponse,
        PropertySearchRequest,
        PropertyUpdateRequest,
        BaseResponse
    )
except ImportError:
    # Fallback model implementations
    from pydantic import BaseModel, Field
    from typing import Dict, Any, List
    
    class BaseResponse(BaseModel):
        """Base response model"""
        success: bool = True
        message: str = ""
        error: Optional[str] = None
    
    class PropertyResponse(BaseModel):
        """Response model for a single property"""
        success: bool = True
        message: str = ""
        property: Optional[Dict[str, Any]] = None
        error: Optional[str] = None
    
    class PropertiesResponse(BaseModel):
        """Response model for multiple properties"""
        success: bool = True
        message: str = ""
        properties: List[Dict[str, Any]] = Field(default_factory=list)
        count: int = 0
        page: int = 1
        total_pages: int = 1
        error: Optional[str] = None
    
    class GeneratePropertiesRequest(BaseModel):
        """Request model for property generation"""
        count: int = 5
        property_types: Optional[List[str]] = None
        force_regenerate: bool = False
    
    class GeneratePropertiesResponse(BaseModel):
        """Response model for property generation"""
        success: bool = True
        message: str = ""
        properties: List[Dict[str, Any]] = Field(default_factory=list)
        task_id: Optional[str] = None
        error: Optional[str] = None
    
    class PropertySearchRequest(BaseModel):
        """Request model for property search"""
        query: Optional[str] = None
        property_type: Optional[str] = None
        min_price: Optional[float] = None
        max_price: Optional[float] = None
        min_bedrooms: Optional[int] = None
        max_bedrooms: Optional[int] = None
        min_bathrooms: Optional[int] = None
        max_bathrooms: Optional[int] = None
        min_area: Optional[float] = None
        max_area: Optional[float] = None
        neighborhood: Optional[str] = None
        limit: int = 10
        offset: int = 0
    
    class PropertyUpdateRequest(BaseModel):
        """Request model for property update"""
        property_id: str
        updates: Dict[str, Any]

# Import utility functions with safe error handling
try:
    from ..common_imports import (
        import_function_safely,
        import_module_safely,
        sanitize_storage_key
    )
except ImportError:
    # Fallback implementations
    def import_function_safely(module_path, function_name):
        """Safely import a function from a module"""
        try:
            module_parts = module_path.split('.')
            current_module = __import__(module_parts[0])
            
            for part in module_parts[1:]:
                current_module = getattr(current_module, part)
                
            return getattr(current_module, function_name)
        except (ImportError, AttributeError):
            return None
    
    def import_module_safely(module_path):
        """Safely import a module"""
        try:
            return __import__(module_path, fromlist=['*'])
        except ImportError:
            return None
    
    def sanitize_storage_key(key):
        """Sanitize a storage key to be valid"""
        import re
        return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Create router with appropriate prefix and tags
router = APIRouter(prefix="/property-manager", tags=["properties", "dbtn/module:facade"])

# Module cache to avoid repeated imports
_module_cache = {}

def get_module_function(module_name: str, function_name: str):
    """Safely get a function from a module, using cache for efficiency"""
    cache_key = f"{module_name}.{function_name}"
    if cache_key in _module_cache:
        return _module_cache[cache_key]
        
    function = import_function_safely(f"app.apis.{module_name}", function_name)
    _module_cache[cache_key] = function
    return function

@router.get("/properties-facade", operation_id="get_properties2", response_model=PropertiesResponse, tags=["properties"])
async def get_properties(page: int = 1, size: int = 10) -> PropertiesResponse:
    """Get a list of properties using the facade pattern to avoid circular dependencies.
    
    Args:
        page: Page number (starts at 1)
        size: Number of items per page
        
    Returns:
        Response containing the list of properties
    """
    # Convert page/size to limit/offset for internal use
    limit = size
    offset = (page - 1) * size
    try:
        # Try to use storage-based implementation
        try:
            # Get properties from JSON storage
            luxury_json_str = db.storage.text.get("luxury_properties.json", default='{"properties": []}')
            luxury_data = json.loads(luxury_json_str)
            all_properties = luxury_data.get("properties", [])
            
            # Apply pagination
            paginated_properties = all_properties[offset:offset + limit] if all_properties else []
            
            return PropertiesResponse(
                success=True,
                message=f"Successfully retrieved {len(paginated_properties)} properties",
                properties=paginated_properties,
                count=len(all_properties),
                page=offset // limit + 1 if limit > 0 else 1,
                total_pages=(len(all_properties) + limit - 1) // limit if limit > 0 else 1
            )
        except Exception as storage_error:
            print(f"Error retrieving properties from storage: {storage_error}")
            # Continue to try database implementation
            pass
        
        # Try to use supabase-based implementation if available
        get_properties_function = get_module_function("property_manager", "get_properties")
        
        if get_properties_function:
            # Call the implementation
            result = await get_properties_function(limit=limit, offset=offset)
            if result and isinstance(result, dict) and result.get("success"):
                return PropertiesResponse(
                    success=True,
                    message=result.get("message", "Successfully retrieved properties"),
                    properties=result.get("properties", []),
                    count=result.get("count", 0),
                    page=result.get("page", 1),
                    total_pages=result.get("total_pages", 1)
                )
        
        # If we reach here, try the fallback implementation
        get_properties_fallback = get_module_function("property_fallback", "get_properties")
        
        if get_properties_fallback:
            result = await get_properties_fallback(limit=limit, offset=offset)
            if result and isinstance(result, dict) and result.get("success"):
                return PropertiesResponse(
                    success=True,
                    message=result.get("message", "Successfully retrieved properties (fallback)"),
                    properties=result.get("properties", []),
                    count=result.get("count", 0),
                    page=result.get("page", 1),
                    total_pages=result.get("total_pages", 1)
                )
        
        # If all methods fail, return an empty result
        return PropertiesResponse(
            success=False,
            message="Failed to retrieve properties from any available source",
            properties=[],
            count=0,
            page=1,
            total_pages=1
        )
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error in get_properties facade: {e}\nStack trace: {error_details}")
        return PropertiesResponse(
            success=False,
            message=f"Error: {str(e)}",
            properties=[],
            count=0
        )

@router.get("/property-facade/{property_id}", operation_id="get_property_facade", response_model=PropertyResponse)
async def get_property(property_id: str) -> PropertyResponse:
    """Get a single property by ID using the facade pattern.
    
    Args:
        property_id: ID of the property to retrieve
        
    Returns:
        Response containing the property data
    """
    try:
        # Try to get from storage first
        try:
            # Check for individual property file
            property_key = sanitize_storage_key(f"property_{property_id}")
            property_data = db.storage.json.get(property_key, default=None)
            
            if property_data:
                return PropertyResponse(
                    success=True,
                    message="Property retrieved from storage",
                    property=property_data
                )
                
            # If not found in individual file, check luxury_properties.json
            luxury_json_str = db.storage.text.get("luxury_properties.json", default='{"properties": []}')
            luxury_data = json.loads(luxury_json_str)
            all_properties = luxury_data.get("properties", [])
            
            # Find property by ID
            for prop in all_properties:
                if str(prop.get("id")) == str(property_id):
                    return PropertyResponse(
                        success=True,
                        message="Property retrieved from luxury_properties.json",
                        property=prop
                    )
        except Exception as storage_error:
            print(f"Error retrieving property from storage: {storage_error}")
            # Continue to try database implementation
            pass
        
        # Try to use supabase-based implementation if available
        get_property_function = get_module_function("property_manager", "get_property")
        
        if get_property_function:
            # Call the implementation
            result = await get_property_function(property_id)
            if result and isinstance(result, dict) and result.get("success"):
                return PropertyResponse(
                    success=True,
                    message=result.get("message", "Successfully retrieved property"),
                    property=result.get("property")
                )
        
        # If we reach here, try the fallback implementation
        get_property_fallback = get_module_function("property_fallback", "get_property")
        
        if get_property_fallback:
            result = await get_property_fallback(property_id)
            if result and isinstance(result, dict) and result.get("success"):
                return PropertyResponse(
                    success=True,
                    message=result.get("message", "Successfully retrieved property (fallback)"),
                    property=result.get("property")
                )
        
        # If all methods fail, return a not found response
        return PropertyResponse(
            success=False,
            message=f"Property with ID {property_id} not found"
        )
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error in get_property facade: {e}\nStack trace: {error_details}")
        return PropertyResponse(
            success=False,
            message=f"Error: {str(e)}"
        )

@router.post("/search-facade", operation_id="search_properties_facade", response_model=PropertiesResponse)
async def search_properties(request: PropertySearchRequest) -> PropertiesResponse:
    """Search for properties using various criteria.
    
    Args:
        request: Search criteria
        
    Returns:
        Response containing matching properties
    """
    try:
        # First try the database implementation if available
        search_function = get_module_function("property_manager", "search_properties")
        
        if search_function:
            result = await search_function(request)
            if result and isinstance(result, dict) and result.get("success"):
                return PropertiesResponse(
                    success=True,
                    message=result.get("message", "Search completed successfully"),
                    properties=result.get("properties", []),
                    count=result.get("count", 0),
                    page=result.get("page", 1),
                    total_pages=result.get("total_pages", 1)
                )
        
        # If database implementation fails or is not available, use local storage search
        try:
            # Get all properties from storage
            luxury_json_str = db.storage.text.get("luxury_properties.json", default='{"properties": []}')
            luxury_data = json.loads(luxury_json_str)
            all_properties = luxury_data.get("properties", [])
            
            # Filter properties based on search criteria
            filtered_properties = []
            for prop in all_properties:
                # Apply filters
                include = True
                
                # Filter by property type
                if request.property_type and include:
                    prop_type = prop.get("property_type")
                    if isinstance(prop_type, dict):
                        prop_type = prop_type.get("name")
                    include = include and (not request.property_type or (prop_type and request.property_type.lower() in prop_type.lower()))
                
                # Filter by price range
                if request.min_price is not None and include:
                    price_numeric = prop.get("price_numeric", 0)
                    include = include and price_numeric >= request.min_price
                
                if request.max_price is not None and include:
                    price_numeric = prop.get("price_numeric", 0)
                    include = include and price_numeric <= request.max_price
                
                # Filter by bedrooms
                if request.min_bedrooms is not None and include:
                    bedrooms = prop.get("bedrooms", 0)
                    include = include and bedrooms >= request.min_bedrooms
                
                if request.max_bedrooms is not None and include:
                    bedrooms = prop.get("bedrooms", 0)
                    include = include and bedrooms <= request.max_bedrooms
                
                # Filter by bathrooms
                if request.min_bathrooms is not None and include:
                    bathrooms = prop.get("bathrooms", 0)
                    include = include and bathrooms >= request.min_bathrooms
                
                if request.max_bathrooms is not None and include:
                    bathrooms = prop.get("bathrooms", 0)
                    include = include and bathrooms <= request.max_bathrooms
                
                # Filter by area
                if request.min_area is not None and include:
                    area = prop.get("area", 0)
                    include = include and area >= request.min_area
                
                if request.max_area is not None and include:
                    area = prop.get("area", 0)
                    include = include and area <= request.max_area
                
                # Filter by neighborhood
                if request.neighborhood and include:
                    location = prop.get("location", {})
                    if isinstance(location, dict):
                        neighborhood = location.get("name", "")
                        include = include and (neighborhood and request.neighborhood.lower() in neighborhood.lower())
                
                # Filter by text search in title and description
                if request.query and include:
                    title = prop.get("title", "").lower()
                    description = prop.get("description", "").lower()
                    include = include and (request.query.lower() in title or request.query.lower() in description)
                
                # Add to filtered results if all criteria met
                if include:
                    filtered_properties.append(prop)
            
            # Apply pagination
            offset = request.offset
            limit = request.limit
            paginated_properties = filtered_properties[offset:offset + limit] if filtered_properties else []
            
            return PropertiesResponse(
                success=True,
                message=f"Found {len(filtered_properties)} properties matching your criteria",
                properties=paginated_properties,
                count=len(filtered_properties),
                page=offset // limit + 1 if limit > 0 else 1,
                total_pages=(len(filtered_properties) + limit - 1) // limit if limit > 0 else 1
            )
        except Exception as storage_error:
            print(f"Error searching properties in storage: {storage_error}")
            # Continue to fallback implementation
            pass
        
        # If both methods fail, return empty result
        return PropertiesResponse(
            success=False,
            message="Failed to search properties from any available source",
            properties=[],
            count=0
        )
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error in search_properties facade: {e}\nStack trace: {error_details}")
        return PropertiesResponse(
            success=False,
            message=f"Error: {str(e)}",
            properties=[],
            count=0
        )

@router.post("/generate-facade", operation_id="generate_property_facade", response_model=GeneratePropertiesResponse)
async def generate_properties(
    request: GeneratePropertiesRequest,
    background_tasks: BackgroundTasks
) -> GeneratePropertiesResponse:
    """Generate properties using the facade pattern to avoid circular dependencies.
    
    This endpoint will delegate to the appropriate property generator implementation.
    
    Args:
        request: Configuration for property generation
        background_tasks: Background tasks runner for async operations
        
    Returns:
        Response containing generated properties
    """
    try:
        # Try to get the property generator function
        generate_properties_func = get_module_function("property_generator", "generate_properties")
        
        if generate_properties_func:
            # Call the implementation
            result = await generate_properties_func(request, background_tasks)
            if result:
                return GeneratePropertiesResponse(
                    success=True,
                    message="Successfully generated properties",
                    properties=result.properties,
                    task_id=getattr(result, 'task_id', None)
                )
        
        # If the main generator fails, try the fallback
        generate_properties_fallback = get_module_function("property_fallback", "generate_properties")
        
        if generate_properties_fallback:
            result = await generate_properties_fallback(request, background_tasks)
            if result:
                return GeneratePropertiesResponse(
                    success=True,
                    message="Successfully generated properties (fallback)",
                    properties=result.properties,
                    task_id=getattr(result, 'task_id', None)
                )
        
        # If all methods fail, generate sample data
        properties = []
        timestamp = datetime.now().isoformat()
        
        # Generate sample properties
        property_types = [
            "Mansion", "Villa", "Penthouse", "Luxury Apartment", "Estate", "Chalet"
        ] if not request.property_types else request.property_types
        
        neighborhoods = [
            "Lago Sul", "Lago Norte", "Park Way", "Sudoeste", "Noroeste", "Asa Sul"
        ]
        
        import random
        for i in range(request.count):
            property_type = random.choice(property_types)
            neighborhood = random.choice(neighborhoods)
            
            # Generate a sample property
            property_id = f"sample_{uuid.uuid4().hex[:8]}"
            property_data = {
                "id": property_id,
                "title": f"{property_type} in {neighborhood}",
                "subtitle": "Luxury living at its finest",
                "description": f"Beautiful {property_type.lower()} in {neighborhood} with amazing views and premium amenities",
                "property_type": {
                    "id": f"type_{property_type.lower().replace(' ', '_')}",
                    "name": property_type
                },
                "location": {
                    "id": f"loc_{neighborhood.lower().replace(' ', '_')}",
                    "name": neighborhood,
                    "neighborhood": neighborhood,
                    "city": "Brasília",
                    "state": "DF",
                    "country": "Brasil"
                },
                "price": f"R$ {random.randint(5, 20)}.{random.randint(100, 999)}.000",
                "price_numeric": random.randint(5000000, 20000000),
                "currency": "BRL",
                "bedrooms": random.randint(3, 7),
                "bathrooms": random.randint(3, 9),
                "area": random.randint(300, 2000),
                "area_unit": "m²",
                "features": [
                    {"name": "Swimming Pool"}, 
                    {"name": "Home Gym"}, 
                    {"name": "Home Cinema"}, 
                    {"name": "Smart Home"}
                ],
                "features_list": ["Swimming Pool", "Home Gym", "Home Cinema", "Smart Home"],
                "status": "available",
                "created_at": timestamp,
                "updated_at": timestamp
            }
            properties.append(property_data)
        
        return GeneratePropertiesResponse(
            success=True,
            message=f"Generated {len(properties)} sample properties",
            properties=properties
        )
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error in generate_properties facade: {e}\nStack trace: {error_details}")
        return GeneratePropertiesResponse(
            success=False,
            message=f"Error: {str(e)}",
            error=str(e),
            properties=[]
        )
