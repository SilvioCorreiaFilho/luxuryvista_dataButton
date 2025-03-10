"""
Property Manager Module for LuxuryVista

This module acts as a facade between APIs and storage backends (database or fallback).
It handles routing property operations to the correct backend based on availability.
"""

from fastapi import APIRouter, Depends, Path, Query, HTTPException, Body
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Create a router for this module
router = APIRouter()

# Import shared models
from app.apis.shared import (
    PropertyData,
    BaseResponse,
    PropertyResponse
)

# Import shared property models
# Use models from shared module
from app.apis.shared import (
    PropertyImage,
    PropertyImageRequest,
    BatchImageRequest,
    GeneratePropertiesRequest,
    RegeneratePropertiesRequest
)

# Import the property manager and the fallback system
from app.apis.facade import property_manager
from app.apis.fallback import property_storage_fallback

# Initialize property_manager with the fallback storage
try:
    property_manager.initialize_fallback(property_storage_fallback)
    print("PropertyManager initialized with fallback storage successfully")
except Exception as e:
    print(f"Error initializing PropertyManager with fallback storage: {e}")

@router.post("/generate-property")
async def generate_property_endpoint(request: GeneratePropertiesRequest):
    """Generate one or more properties using AI"""
    try:
        # Forward to the property_manager
        if request.count <= 0:
            request.count = 5  # Default if invalid count
            
        # Generate the requested number of properties
        properties = []
        for _ in range(request.count):
            # Select a random property type if not specified
            property_type = None
            if request.property_types and len(request.property_types) > 0:
                import random
                property_type = random.choice(request.property_types)
            
            # Generate a property
            from app.apis.common_imports import PROPERTY_TYPES, NEIGHBORHOODS
            if not property_type:
                property_type = random.choice(PROPERTY_TYPES)
            neighborhood = random.choice(NEIGHBORHOODS)
            
            new_property = await property_manager.generate_property(
                property_type=property_type,
                neighborhood=neighborhood,
                language=request.language
            )
            properties.append(new_property)
        
        return {
            "success": True,
            "message": f"{len(properties)} properties generated successfully",
            "properties": properties
        }
    except Exception as e:
        import traceback
        print(f"Error generating properties: {str(e)}")
        print(traceback.format_exc())
        return {
            "success": False,
            "message": f"Error generating properties: {str(e)}",
            "properties": []
        }

@router.get("/properties")
async def get_properties_endpoint(neighborhood: Optional[str] = None, property_type: Optional[str] = None):
    """Get properties with optional filtering"""
    filters = {}
    if neighborhood:
        filters["location.neighborhood"] = neighborhood
    if property_type:
        filters["property_type"] = property_type
    
    properties = await property_manager.get_properties(filters)
    return {
        "success": True,
        "message": f"{len(properties)} properties found",
        "properties": properties,
        "count": len(properties)
    }

@router.get("/properties/{property_id}")
async def get_property_endpoint(property_id: str):
    """Get a property by ID"""
    property_data = await property_manager.get_property(property_id)
    if property_data:
        return {
            "success": True,
            "message": "Property found",
            "property": property_data
        }
    else:
        return {
            "success": False,
            "message": f"Property not found: {property_id}",
            "property": None
        }


@router.post("/generate", response_model=PropertyResponse)
async def generate_single_property(
    property_type: str = Query("Mansion", description="Type of property to generate"),
    neighborhood: str = Query("Lago Sul", description="Neighborhood location"),
    language: str = Query("pt", description="Language for content generation")
) -> PropertyResponse:
    """Generate a single property with AI content (typed response)"""
    try:
        property_data = await property_manager.generate_property(property_type, neighborhood, language)
        return PropertyResponse(
            success=True,
            message=f"Generated {property_type} in {neighborhood}",
            property=property_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate property: {str(e)}") from e


@router.post("/properties/filter", response_model=BaseResponse)
async def filter_properties(
    filters: Optional[Dict[str, Any]] = None
) -> BaseResponse:
    """Get all properties with filtering via POST request (typed response)"""
    try:
        properties = await property_manager.get_properties(filters)
        return BaseResponse(
            success=True,
            message=f"Retrieved {len(properties)} properties",
            data={"properties": properties}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get properties: {str(e)}") from e


@router.get("/property/{property_id}", response_model=PropertyResponse)
async def get_property_by_id(
    property_id: str = Path(..., description="ID of the property to get")
) -> PropertyResponse:
    """Get a property by ID with typed response"""
    try:
        property_data = await property_manager.get_property(property_id)
        if not property_data:
            raise HTTPException(status_code=404, detail=f"Property {property_id} not found")
            
        return PropertyResponse(
            success=True,
            message=f"Retrieved property {property_id}",
            property=property_data
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get property: {str(e)}") from e
