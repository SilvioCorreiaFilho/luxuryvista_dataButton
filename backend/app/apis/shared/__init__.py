"""Shared models and utilities for LuxuryVista APIs

This module provides shared models and utilities used across multiple APIs.
It helps prevent circular imports by centralizing commonly used models.
"""

from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime

# Create a router to satisfy the module loader
from fastapi import APIRouter
router = APIRouter()

# Import the register_shared_model function for model registry
try:
    from ..common_imports import register_shared_model
except ImportError:
    # Fallback if common_imports is not available
    def register_shared_model(name, model):
        pass

class LocationData(BaseModel):
    """Location data for properties"""
    neighborhood: str = Field(..., description="Neighborhood name")
    city: str = Field("Brasília", description="City name")
    state: str = Field("DF", description="State/province code")
    country: str = Field("Brasil", description="Country name")
    coordinates: Optional[Dict[str, float]] = Field(None, description="Geo coordinates if available")

class FeatureData(BaseModel):
    """Property feature details"""
    name: str = Field(..., description="Feature name")
    description: Optional[str] = Field("", description="Feature description")

class ImageData(BaseModel):
    """Property image details"""
    id: str = Field(..., description="Unique image ID")
    url: str = Field(..., description="Image URL")
    caption: Optional[str] = Field("", description="Image caption")
    is_main: Optional[bool] = Field(False, description="Whether this is the main property image")
    order_index: Optional[int] = Field(0, description="Display order index")

class PropertyData(BaseModel):
    """Full property data model"""
    id: str = Field(..., description="Unique property ID")
    title: str = Field(..., description="Property title")
    description: str = Field(..., description="Detailed property description")
    property_type: str = Field(..., description="Type of property (e.g., Mansion, Villa)")
    price: int = Field(..., description="Property price value")
    currency: str = Field("BRL", description="Currency code for price")
    area: int = Field(..., description="Property area value")
    area_unit: str = Field("sqm", description="Unit for area measurement")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")
    location: LocationData = Field(..., description="Property location details")
    features: List[FeatureData] = Field(default_factory=list, description="Property features")
    status: str = Field("for_sale", description="Property status (for_sale, sold, etc.)")
    images: List[ImageData] = Field(default_factory=list, description="Property images")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")

class BaseResponse(BaseModel):
    """Base API response model"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data payload")
    error: Optional[str] = Field(None, description="Error message if request failed")

# Register in shared model registry
register_shared_model('BaseResponse', BaseResponse)

class PropertyResponse(BaseModel):
    """Response model for property endpoints"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    property: Optional[PropertyData] = Field(None, description="Property data")
    properties: Optional[List[Dict[str, Any]]] = Field(None, description="List of properties")

# Register in shared model registry
register_shared_model('PropertyResponse', PropertyResponse)

class PropertiesResponse(BaseModel):
    """Response model for property list endpoints"""
    success: bool = Field(..., description="Whether the request was successful")
    message: str = Field(..., description="Response message")
    properties: List[PropertyData] = Field(default_factory=list, description="List of properties")
    count: int = Field(0, description="Total count of properties")
    page: Optional[int] = Field(1, description="Current page number")
    total_pages: Optional[int] = Field(1, description="Total number of pages")

# Register in shared model registry
register_shared_model('PropertiesResponse', PropertiesResponse)

# Property search and filter models
class PropertySearchRequest(BaseModel):
    """Request model for property search"""
    query: Optional[str] = Field(None, description="Search query")
    property_type: Optional[str] = Field(None, description="Filter by property type")
    min_price: Optional[int] = Field(None, description="Minimum price")
    max_price: Optional[int] = Field(None, description="Maximum price")
    min_bedrooms: Optional[int] = Field(None, description="Minimum number of bedrooms")
    max_bedrooms: Optional[int] = Field(None, description="Maximum number of bedrooms")
    min_bathrooms: Optional[int] = Field(None, description="Minimum number of bathrooms")
    max_bathrooms: Optional[int] = Field(None, description="Maximum number of bathrooms")
    min_area: Optional[int] = Field(None, description="Minimum area in square meters")
    max_area: Optional[int] = Field(None, description="Maximum area in square meters")
    neighborhood: Optional[str] = Field(None, description="Filter by neighborhood")
    features: Optional[List[str]] = Field(None, description="Filter by features")
    status: Optional[str] = Field(None, description="Filter by status")
    limit: int = Field(10, description="Number of results to return")
    offset: int = Field(0, description="Offset for pagination")

# Register in shared model registry
register_shared_model('PropertySearchRequest', PropertySearchRequest)

# Property update models
class PropertyUpdateRequest(BaseModel):
    """Request model for updating properties"""
    title: Optional[str] = Field(None, description="Property title")
    description: Optional[str] = Field(None, description="Property description")
    property_type: Optional[Dict[str, Any]] = Field(None, description="Property type")
    location: Optional[Dict[str, Any]] = Field(None, description="Location details")
    price: Optional[str] = Field(None, description="Price")
    bedrooms: Optional[int] = Field(None, description="Number of bedrooms")
    bathrooms: Optional[int] = Field(None, description="Number of bathrooms")
    area: Optional[int] = Field(None, description="Total area in square meters")
    features: Optional[List[Dict[str, Any]]] = Field(None, description="List of features")
    status: Optional[str] = Field(None, description="Property status")
    tags: Optional[List[str]] = Field(None, description="Property tags")

# Register in shared model registry
register_shared_model('PropertyUpdateRequest', PropertyUpdateRequest)

# Property image migration and fix models
class FixPropertyImagesRequest(BaseModel):
    """Request model for fixing property images"""
    force_rebuild_table: bool = Field(False, description="Force rebuild of property_images table structure")
    recreate_images: bool = Field(False, description="Force recreation of image objects even if they exist")

# Register in shared model registry
register_shared_model('FixPropertyImagesRequest', FixPropertyImagesRequest)

class FixPropertyImagesResponse(BaseModel):
    """Response model for fixing property images"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Status message")
    properties_processed: int = Field(0, description="Number of properties updated")
    images_migrated: int = Field(0, description="Number of images migrated")
    errors: Optional[List[str]] = Field(None, description="Errors encountered")

# Register in shared model registry
register_shared_model('FixPropertyImagesResponse', FixPropertyImagesResponse)

class PropertyImageStatus(BaseModel):
    """Status model for property image generation"""
    property_id: str = Field(..., description="Property ID")
    has_images: bool = Field(False, description="Whether the property has images")
    image_count: int = Field(0, description="Number of images")
    images: List[Dict[str, Any]] = Field(default_factory=list, description="Image details")

# Register in shared model registry
register_shared_model('PropertyImageStatus', PropertyImageStatus)

# Legacy models required by other modules

class PropertyImage(BaseModel):
    """Property image model"""
    id: str
    url: str
    caption: Optional[str] = None
    is_main: bool = False
    order_index: int = 0
    property_id: Optional[str] = None

# Register in shared model registry
register_shared_model('PropertyImage', PropertyImage)

class SeoSuggestion(BaseModel):
    """SEO title and subtitle suggestion"""
    title: str
    subtitle: str

# Register in shared model registry
register_shared_model('SeoSuggestion', SeoSuggestion)

class SeoTitleSubtitleSuggestionRequest(BaseModel):
    """Request model for SEO title and subtitle generation"""
    property_type: str = "luxury property"
    location: str = "Brasília"
    language: str = "pt"

# Register in shared model registry
register_shared_model('SeoTitleSubtitleSuggestionRequest', SeoTitleSubtitleSuggestionRequest)

class MarketAnalysis(BaseModel):
    """Market analysis model"""
    neighborhood_price_trend: str = "rising"
    avg_price_per_sqm: str = "R$ 15,000"
    investment_potential_score: int = 8
    rental_potential_score: int = 9
    comparable_properties: List[str] = []
    recommended_pricing_strategy: str = "premium"
    market_demand: str = "high"

# Register in shared model registry
register_shared_model('MarketAnalysis', MarketAnalysis)


class GeneratePropertiesRequest(BaseModel):
    """Request model for generating properties"""
    count: int = Field(5, description="Number of properties to generate")
    force_regenerate: bool = Field(False, description="Force regeneration even if properties exist")
    language: str = Field("pt", description="Language for content generation (pt or en)")

# Register in shared model registry
register_shared_model('GeneratePropertiesRequest', GeneratePropertiesRequest)

class GeneratePropertiesResponse(BaseResponse):
    """Response model for property generation endpoints"""
    properties: List[Dict[str, Any]] = Field(default_factory=list, description="Generated properties")
    task_id: Optional[str] = Field(None, description="Background task ID if applicable")

# Register in shared model registry
register_shared_model('GeneratePropertiesResponse', GeneratePropertiesResponse)

class RegeneratePropertiesRequest(BaseModel):
    """Request model for regenerating all properties"""
    property_count: Optional[int] = Field(None, description="Number of properties to generate")
    force_regenerate: bool = Field(False, description="Force regeneration of properties")
    force_regenerate_images: bool = Field(False, description="Force regeneration of images")
    property_types: Optional[List[str]] = Field(None, description="Types of properties to generate")

# Register in shared model registry
register_shared_model('RegeneratePropertiesRequest', RegeneratePropertiesRequest)

class RegeneratePropertiesResponse(BaseResponse):
    """Response model for property regeneration"""
    task_id: Optional[str] = None
    started: bool = False
    message: str = ""
    properties_count: int = 0

# Register in shared model registry
register_shared_model('RegeneratePropertiesResponse', RegeneratePropertiesResponse)

class RegenerationProgress(BaseModel):
    """Regeneration progress model"""
    task_id: str
    status: str = "pending"
    started_at: str
    completed_at: Optional[str] = None
    progress: Dict[str, Any] = {}
    message: str = ""
    error: Optional[str] = None

# Register in shared model registry
register_shared_model('RegenerationProgress', RegenerationProgress)


class PropertyImageRequest(BaseModel):
    """Request model for generating property images"""
    property_id: str = Field(..., description="ID of the property to generate images for")
    count: int = Field(1, description="Number of images to generate (1-5)")
    force_regenerate: bool = Field(False, description="Force regeneration of images")
    title: Optional[str] = Field(None, description="Property title for context")
    property_type: Optional[str] = Field(None, description="Type of property")
    description: Optional[str] = Field(None, description="Property description")
    features: List[str] = Field(default_factory=list, description="Property features")
    style: str = Field("photorealistic", description="Image style")
    location: Optional[str] = Field(None, description="Property location")

# Register in shared model registry
register_shared_model('PropertyImageRequest', PropertyImageRequest)

class BatchImageRequest(BaseModel):
    """Request model for batch image generation"""
    property_ids: List[str] = Field(..., description="List of property IDs to generate images for")
    count_per_property: int = Field(5, description="Number of images per property (1-5)")
    force_regenerate: bool = Field(False, description="Force regeneration of images")
    replace_existing: bool = Field(False, description="Replace existing images")
    style: str = Field("photorealistic", description="Image style")

# Register in shared model registry
register_shared_model('BatchImageRequest', BatchImageRequest)

# Property image migration models
class PropertyImageMigrationRequest(BaseModel):
    """Request model for property image migration"""
    force_rebuild_table: bool = Field(False, description="Force rebuild of property_images table structure")
    recreate_images: bool = Field(False, description="Force recreation of image objects even if they exist")
    migrate_background: bool = Field(True, description="Run migration in background task")

# Register in shared model registry
register_shared_model('PropertyImageMigrationRequest', PropertyImageMigrationRequest)

class PropertyImageMigrationResponse(BaseResponse):
    """Response model for property image migration"""
    properties_processed: int = Field(0, description="Number of properties processed")
    images_migrated: int = Field(0, description="Number of images migrated")
    errors: Optional[List[str]] = Field(None, description="Errors encountered during migration")
    task_id: Optional[str] = Field(None, description="Background task ID if applicable")

# Register in shared model registry
register_shared_model('PropertyImageMigrationResponse', PropertyImageMigrationResponse)

class PropertyImageMigrationProgress(BaseModel):
    """Progress model for property image migration"""
    task_id: str = Field(..., description="Background task ID")
    status: str = Field("pending", description="Migration status")
    properties_processed: int = Field(0, description="Number of properties processed")
    images_migrated: int = Field(0, description="Number of images migrated")
    errors: List[str] = Field(default_factory=list, description="Errors encountered")
    started_at: str = Field(..., description="ISO timestamp when migration started")
    completed_at: Optional[str] = Field(None, description="ISO timestamp when migration completed")

# Register in shared model registry
register_shared_model('PropertyImageMigrationProgress', PropertyImageMigrationProgress)