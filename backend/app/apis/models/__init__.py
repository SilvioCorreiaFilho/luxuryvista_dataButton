"""Models for the LuxuryVista APIs.

This module re-exports all property-related models for easier imports throughout the application.
It includes models for property data, requests, responses, and related entities like locations and features.

Note: This module is not intended to be used with wildcard imports.
"""

from fastapi import APIRouter

# Create an empty router to satisfy the module loader
# This router is not intended to be used for API endpoints
router = APIRouter()

# Imports
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# Base models are imported from shared

# Property models
# Import property models
from ..property import (
    # Core property models
    PropertyType,
    Location,
    Feature,
    InvestmentMetric,
    PropertyImage,
    PropertyData,
    
    # Request and response models
    PropertyUpdateRequest,
    FixPropertyImagesRequest,
    FixPropertyImagesResponse,
    PropertyResponse
)

# Import from shared module instead
from ..shared import (
    BaseResponse,
    MarketAnalysis,
    RegenerationProgress,
    GeneratePropertiesRequest,
    GeneratePropertiesResponse,
    SeoTitleSubtitleSuggestionRequest,
    SeoSuggestion
)

# Define locally to avoid import errors
class RegeneratePropertiesRequest(BaseModel):
    """Request model for property regeneration."""
    count: int = Field(15, description="Number of properties to generate")
    force_regenerate: bool = Field(True, description="Force regeneration of all properties")
    property_types: Optional[List[str]] = Field(["Mansion", "Villa", "Penthouse", "Estate", "Luxury Residence"], 
                                          description="Property types to generate")
    property_count: Optional[int] = Field(None, description="Alias for count for backward compatibility")

# Import shared models
from ..shared import (
    # Property data models
    PropertyData as SharedPropertyData,
    PropertyResponse as SharedPropertyResponse,
    
    # Property search models
    PropertySearchRequest,
    
    # Image related models
    PropertyImageRequest,
    BatchImageRequest,
    PropertyImageStatus,
    PropertyImageMigrationRequest,
    PropertyImageMigrationResponse,
    PropertyImageMigrationProgress,
    
    # Generation models
    RegenerationProgress as SharedRegenerationProgress,
    RegeneratePropertiesResponse,
    
    # Market analysis
    MarketAnalysis as SharedMarketAnalysis
)

# Define aliases to avoid conflicts with property module
PropertySearchResponse = SharedPropertyResponse  # Using PropertyResponse as PropertySearchResponse

# Define missing models that might be expected by the code
class PropertyCreate(BaseModel):
    """Model for creating a new property - to be implemented"""
    title: str = Field(..., description="Property title")
    description: str = Field(..., description="Property description")
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Luxury Villa in Lago Sul",
                "description": "Elegant villa with panoramic views"
            }
        }
    
class PropertyUpdate(BaseModel):
    """Model for updating an existing property - to be implemented"""
    title: Optional[str] = Field(None, description="Property title")
    description: Optional[str] = Field(None, description="Property description")
    
    class Config:
        schema_extra = {
            "example": {
                "title": "Updated Luxury Villa in Lago Sul",
                "description": "Updated elegant villa with panoramic views"
            }
        }
    
class PropertySearch(BaseModel):
    """Model for property search criteria - to be implemented"""
    query: Optional[str] = Field(None, description="Search query")
    
    class Config:
        schema_extra = {
            "example": {
                "query": "Lago Sul"
            }
        }

# Define public API
__all__ = [
    # Base models
    'BaseResponse',
    
    # Core property models
    'PropertyType',
    'Location',
    'Feature',
    'InvestmentMetric',
    'PropertyImage',
    'MarketAnalysis',
    'PropertyData',
    
    # Property CRUD models
    'PropertyCreate',
    'PropertyUpdate',
    'PropertySearch',
    'PropertyUpdateRequest',
    
    # Image-related models
    'PropertyImageRequest',
    'BatchImageRequest',
    'PropertyImageStatus',
    'PropertyImageMigrationRequest',
    'PropertyImageMigrationResponse',
    'PropertyImageMigrationProgress',
    
    # Property management models
    'FixPropertyImagesRequest',
    'RegeneratePropertiesRequest',
    'PropertySearchRequest',
    'RegenerationProgress',
    
    # Response models
    'PropertyResponse',
    'FixPropertyImagesResponse',
    'RegeneratePropertiesResponse',
    'PropertySearchResponse',
]