"""Shared property models for LuxuryVista

This module contains all shared property-related Pydantic models
to avoid circular imports between modules.
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime
from fastapi import APIRouter

# Create router
router = APIRouter(prefix="/property-models", tags=["properties"])

class PropertyImage(BaseModel):
    """Property image model"""
    id: str
    url: str
    caption: Optional[str] = None
    is_main: bool = False
    order_index: int = 0

class PropertyImageRequest(BaseModel):
    """Request model for generating property images"""
    property_id: str
    title: str
    property_type: str
    description: str
    features: List[str] = []
    style: str = "photorealistic"
    location: Optional[str] = None

class BatchImageRequest(BaseModel):
    """Request model for batch image generation"""
    property_ids: List[str]
    replace_existing: bool = False
    style: str = "photorealistic"

class GeneratePropertiesRequest(BaseModel):
    """Request model for generating properties"""
    count: int = Field(5, description="Number of properties to generate")
    force_regenerate: bool = Field(False, description="Force regeneration even if properties exist")
    language: str = Field("pt", description="Language for content generation (pt or en)")
    property_types: Optional[List[str]] = Field(None, description="Property types to generate")
    location: Optional[str] = Field(None, description="Location for properties")

class RegeneratePropertiesRequest(BaseModel):
    """Request model for regenerating all properties"""
    property_count: Optional[int] = Field(None, description="Number of properties to generate")
    force_regenerate_images: bool = Field(False, description="Force regeneration of images")
    property_types: Optional[List[str]] = Field(None, description="Property types to generate")