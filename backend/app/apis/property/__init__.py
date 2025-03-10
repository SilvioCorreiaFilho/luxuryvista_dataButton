"""Property models and types.

This module provides the models for:
- Properties
- Property images
- Property features
- Property types
- Investment metrics
- Location data
"""

from fastapi import APIRouter

# Create router for the module
router = APIRouter()

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class PropertyImage(BaseModel):
    """Model for property images"""
    id: str = Field(..., description="Unique identifier for the image")
    url: str = Field(..., description="URL to the image")
    caption: Optional[str] = Field(None, description="Caption for the image")
    is_main: bool = Field(False, description="Whether this is the main image")
    property_id: Optional[str] = Field(None, description="ID of the property this image belongs to")

class Feature(BaseModel):
    """Model for property features"""
    name: str = Field(..., description="Name of the feature")
    description: Optional[str] = Field(None, description="Description of the feature")
    icon: Optional[str] = Field(None, description="Icon for the feature")

class Location(BaseModel):
    """Model for property location"""
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    address: str = Field(..., description="Full address")
    neighborhood: str = Field(..., description="Neighborhood name")
    city: str = Field("Brasília", description="City name")
    state: str = Field("DF", description="State abbreviation")
    country: str = Field("Brazil", description="Country name")
    zip_code: Optional[str] = Field(None, description="ZIP/Postal code")

class InvestmentMetric(BaseModel):
    """Model for investment metrics"""
    name: str = Field(..., description="Name of the metric")
    value: float = Field(..., description="Value of the metric")
    unit: str = Field(..., description="Unit of measurement")
    description: Optional[str] = Field(None, description="Description of the metric")

class PropertyType(BaseModel):
    """Model for property types"""
    id: str = Field(..., description="Unique identifier for the property type")
    name: str = Field(..., description="Name of the property type")
    description: Optional[str] = Field(None, description="Description of the property type")
    icon: Optional[str] = Field(None, description="Icon for the property type")

class Property(BaseModel):
    """Model for properties"""
    id: str = Field(..., description="Unique identifier for the property")
    title: str = Field(..., description="Title of the property")
    description: str = Field(..., description="Description of the property")
    property_type: PropertyType = Field(..., description="Type of property")
    location: Location = Field(..., description="Location details")
    price: str = Field(..., description="Price in BRL")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")
    area: int = Field(..., description="Total area in square meters")
    features: List[Feature] = Field(default_factory=list, description="List of property features")
    images: List[PropertyImage] = Field(default_factory=list, description="List of property images")
    status: str = Field("Available", description="Status of the property")
    tags: List[str] = Field(default_factory=list, description="List of tags")
    investment_metrics: Optional[List[InvestmentMetric]] = Field(None, description="Investment metrics")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")
    published_at: Optional[datetime] = Field(None, description="Publication timestamp")

class PropertyUpdateRequest(BaseModel):
    """Request model for updating properties"""
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[Dict[str, Any]] = None
    location: Optional[Dict[str, Any]] = None
    price: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[int] = None
    features: Optional[List[Dict[str, Any]]] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None
    investment_metrics: Optional[List[Dict[str, Any]]] = None

class PropertyCreateRequest(BaseModel):
    """Request model for creating properties"""
    title: str = Field(..., description="Title of the property")
    description: str = Field(..., description="Description of the property")
    property_type: Dict[str, Any] = Field(..., description="Type of property")
    location: Dict[str, Any] = Field(..., description="Location details")
    price: str = Field(..., description="Price in BRL")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")
    area: int = Field(..., description="Total area in square meters")
    features: List[Dict[str, Any]] = Field(default_factory=list, description="List of property features")
    status: str = Field("Available", description="Status of the property")
    tags: List[str] = Field(default_factory=list, description="List of tags")
    investment_metrics: Optional[List[Dict[str, Any]]] = None

class RegeneratePropertiesRequest(BaseModel):
    """Request model for property regeneration"""
    property_count: Optional[int] = Field(None, description="Number of properties to generate")
    property_types: Optional[List[str]] = Field(None, description="Types of properties to generate")
    force_regenerate: Optional[bool] = Field(None, description="Force regeneration of all properties")

class FixPropertyImagesRequest(BaseModel):
    """Request model for fixing property images"""
    force_rebuild_table: bool = Field(False, description="Force rebuild of property_images table structure")
    recreate_images: bool = Field(False, description="Force recreation of image objects even if they exist")

class FixPropertyImagesResponse(BaseModel):
    """Response model for fixing property images"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Status message")
    properties_updated: int = Field(..., description="Number of properties updated")
    images_migrated: int = Field(..., description="Number of images migrated")

# Import from shared module instead
from ..shared import MarketAnalysis

class PropertyData(BaseModel):
    """Combined model for property data"""
    id: str = Field(..., description="Unique identifier for the property")
    title: str = Field(..., description="Title of the property")
    description: str = Field(..., description="Description of the property")
    property_type: PropertyType = Field(..., description="Type of property")
    location: Location = Field(..., description="Location details")
    price: str = Field(..., description="Price in BRL")
    bedrooms: int = Field(..., description="Number of bedrooms")
    bathrooms: int = Field(..., description="Number of bathrooms")
    area: int = Field(..., description="Total area in square meters")
    features: List[Feature] = Field(default_factory=list, description="List of property features")
    images: List[PropertyImage] = Field(default_factory=list, description="List of property images")
    status: str = Field("Available", description="Status of the property")
    tags: List[str] = Field(default_factory=list, description="List of tags")
    investment_metrics: Optional[List[InvestmentMetric]] = Field(None, description="Investment metrics")
    market_analysis: Optional[MarketAnalysis] = Field(None, description="Market analysis data")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")
    published_at: Optional[datetime] = Field(None, description="Publication timestamp")

# Import models from shared module
from ..shared import GeneratePropertiesRequest

class PropertyResponse(BaseModel):
    """Response model for property operations"""
    properties: List[Dict[str, Any]] = Field(..., description="List of properties")
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Status message")

# Import models from shared module
# Note: RegenerationProgress was removed as it's not used
