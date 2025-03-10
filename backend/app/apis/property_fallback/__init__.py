"""
Property Fallback API for LuxuryVista

This module provides a fallback API for property management when the database is unavailable.
It uses the PropertyStorageFallback and PropertyManager classes to provide a backup system.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from typing import List, Dict, Any, Optional
import uuid
import tempfile
import os
import shutil
import json
from pydantic import BaseModel

# Import shared models
from ..shared import BaseResponse, PropertyResponse, PropertyData
from ..shared import GeneratePropertiesRequest

class GeneratePropertiesResponse(BaseResponse):
    """Response model for property generation"""
    properties: List[Dict[str, Any]] = []

# Import property manager from facade
from ..facade import property_manager

# Create router
router = APIRouter(prefix="/property-fallback")

class PropertyFallbackResponse(BaseResponse):
    """Response model for property fallback operations"""
    property: Optional[Dict[str, Any]] = None

class PropertiesFallbackResponse(BaseResponse):
    """Response model for multiple properties"""
    properties: List[Dict[str, Any]] = []

class PropertyUpdateRequest(BaseModel):
    """Request model for updating a property"""
    data: Dict[str, Any]

class PropertyImageUploadRequest(BaseModel):
    """Request model for uploading a property image"""
    caption: Optional[str] = None
    is_main: bool = False

@router.post("/create", response_model=PropertyFallbackResponse)
async def create_property_fallback(property_data: Dict[str, Any]) -> PropertyFallbackResponse:
    """Create a new property with fallback storage"""
    try:
        property_data = await property_manager.create_property(property_data)
        return PropertyFallbackResponse(
            success=True,
            message="Property created successfully",
            property=property_data
        )
    except Exception as e:
        return PropertyFallbackResponse(
            success=False,
            message="Failed to create property",
            error=str(e)
        )

@router.get("/properties", response_model=PropertiesFallbackResponse)
async def get_properties_fallback(
    neighborhood: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    status: Optional[str] = None
) -> PropertiesFallbackResponse:
    """Get properties with optional filtering"""
    try:
        # Build filters
        filters = {}
        if neighborhood:
            filters["neighborhood"] = neighborhood
        if property_type:
            filters["property_type"] = property_type
        if status:
            filters["status"] = status
        
        properties = await property_manager.get_properties(filters)
        
        # Apply price filters (can't do in DB with fallback storage)
        if min_price is not None or max_price is not None:
            filtered_properties = []
            for prop in properties:
                price = prop.get("price", 0)
                if isinstance(price, str):
                    try:
                        price = int(price.replace(",", "").replace("R$", "").strip())
                    except ValueError:
                        price = 0
                
                if min_price is not None and price < min_price:
                    continue
                if max_price is not None and price > max_price:
                    continue
                
                filtered_properties.append(prop)
            properties = filtered_properties
        
        return PropertiesFallbackResponse(
            success=True,
            message=f"Found {len(properties)} properties",
            properties=properties
        )
    except Exception as e:
        return PropertiesFallbackResponse(
            success=False,
            message="Failed to get properties",
            error=str(e),
            properties=[]
        )

@router.get("/property/{property_id}", response_model=PropertyFallbackResponse)
async def get_property_fallback(property_id: str) -> PropertyFallbackResponse:
    """Get a property by ID"""
    try:
        property_data = await property_manager.get_property(property_id)
        if not property_data:
            return PropertyFallbackResponse(
                success=False,
                message=f"Property not found: {property_id}",
                error="Property not found"
            )
        
        return PropertyFallbackResponse(
            success=True,
            message="Property retrieved successfully",
            property=property_data
        )
    except Exception as e:
        return PropertyFallbackResponse(
            success=False,
            message=f"Failed to get property: {property_id}",
            error=str(e)
        )

@router.put("/property/{property_id}", response_model=PropertyFallbackResponse)
async def update_property_fallback(property_id: str, request: PropertyUpdateRequest) -> PropertyFallbackResponse:
    """Update a property"""
    try:
        updated_property = await property_manager.update_property(property_id, request.data)
        if not updated_property:
            return PropertyFallbackResponse(
                success=False,
                message=f"Property not found: {property_id}",
                error="Property not found"
            )
        
        return PropertyFallbackResponse(
            success=True,
            message="Property updated successfully",
            property=updated_property
        )
    except Exception as e:
        return PropertyFallbackResponse(
            success=False,
            message=f"Failed to update property: {property_id}",
            error=str(e)
        )

@router.delete("/property/{property_id}", response_model=BaseResponse)
async def delete_property_fallback(property_id: str) -> BaseResponse:
    """Delete a property"""
    try:
        success = await property_manager.delete_property(property_id)
        if not success:
            return BaseResponse(
                success=False,
                message=f"Property not found: {property_id}",
                error="Property not found"
            )
        
        return BaseResponse(
            success=True,
            message="Property deleted successfully"
        )
    except Exception as e:
        return BaseResponse(
            success=False,
            message=f"Failed to delete property: {property_id}",
            error=str(e)
        )

@router.post("/property/{property_id}/upload-image", response_model=PropertyFallbackResponse)
async def upload_property_image_fallback(
    property_id: str,
    file: UploadFile,
    caption: str = Form(""),
    is_main: bool = Form(False)
) -> PropertyFallbackResponse:
    """Upload an image for a property"""
    # Create a temporary file to store the uploaded file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
        # Copy the uploaded file to the temporary file
        shutil.copyfileobj(file.file, temp_file)
        temp_file_path = temp_file.name
    
    try:
        # Upload the image
        await property_manager.upload_image(
            property_id,
            temp_file_path,
            caption,
            is_main
        )
        
        # Get the updated property
        property_data = await property_manager.get_property(property_id)
        
        return PropertyFallbackResponse(
            success=True,
            message="Image uploaded successfully",
            property=property_data
        )
    except Exception as e:
        return PropertyFallbackResponse(
            success=False,
            message=f"Failed to upload image: {str(e)}",
            error=str(e)
        )
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)

@router.post("/generate", response_model=GeneratePropertiesResponse)
async def generate_properties(request: GeneratePropertiesRequest) -> GeneratePropertiesResponse:
    """Generate properties with AI content"""
    try:
        # Define property types and neighborhoods
        property_types = [
            "Luxury Residence", 
            "Penthouse", 
            "Villa", 
            "Mansion", 
            "Estate"
        ]
        
        neighborhoods = [
            "Lago Sul", 
            "Lago Norte", 
            "Asa Sul", 
            "Asa Norte", 
            "Park Way"
        ]
        
        # Generate properties
        properties = []
        for i in range(request.count):
            property_type = property_types[i % len(property_types)]
            neighborhood = neighborhoods[i % len(neighborhoods)]
            
            property_data = await property_manager.generate_property(
                property_type, 
                neighborhood,
                language=request.language
            )
            properties.append(property_data)
        
        return GeneratePropertiesResponse(
            success=True,
            message=f"Generated {len(properties)} properties",
            properties=properties
        )
    except Exception as e:
        return GeneratePropertiesResponse(
            success=False,
            message=f"Failed to generate properties: {str(e)}",
            error=str(e),
            properties=[]
        )
