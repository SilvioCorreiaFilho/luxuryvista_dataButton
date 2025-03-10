"""Shared models for the LuxuryVista application.  

This module defines models that are shared between different APIs to avoid duplicate 
SQLModel class registration issues.
"""

# Standard imports
from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from decimal import Decimal
import re

from fastapi import APIRouter

# Define a router (required for FastAPI to register this as an API module)
router = APIRouter()

# Print message to show where the models are coming from
print("Loading models from app.apis.definitions")

class PropertyType(BaseModel):
    """Property type model."""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None

class Location(BaseModel):
    """Location model."""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class PropertyImage(BaseModel):
    """Property image model."""
    id: Optional[str] = None
    property_id: Optional[str] = None
    url: str
    caption: Optional[str] = None
    is_main: Optional[bool] = False

class Feature(BaseModel):
    """Feature model."""
    id: Optional[str] = None
    name: str
    icon: Optional[str] = None

class InvestmentMetric(BaseModel):
    """Investment metric model."""
    id: Optional[str] = None
    property_id: Optional[str] = None
    type: str
    value: str
    percentage: str
    description: Optional[str] = None

class Analysis(BaseModel):
    """Analysis model."""
    investment_metrics: List[InvestmentMetric] = []

class Property(BaseModel):
    """Property model."""
    id: Optional[str] = None
    title: str
    slug: Optional[str] = None
    description: str
    property_type: Union[PropertyType, str, dict]
    location: Union[Location, str, dict]
    neighborhood: Optional[str] = None
    address: Optional[Union[str, dict]] = None
    price: Decimal
    bedrooms: int
    bathrooms: int
    area: float
    features: Optional[List[Feature]] = []
    images: Optional[List[PropertyImage]] = []
    property_video_url: Optional[str] = None
    drone_video_url: Optional[str] = None
    virtual_tour_url: Optional[str] = None
    status: str = "draft"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    investment_metrics: Optional[List[InvestmentMetric]] = []
    tags: Optional[List[str]] = []
    market_analysis: Optional[Dict[str, Any]] = None

class PropertyCreate(BaseModel):
    """Property creation model."""
    title: str
    slug: Optional[str] = None
    description: str
    property_type: Union[str, dict, PropertyType]
    location: Union[str, dict, Location]
    neighborhood: Optional[str] = None
    address: Optional[str] = None
    price: Union[Decimal, float, str]
    bedrooms: int
    bathrooms: int
    area: float
    features: Optional[List[Union[Feature, dict, str]]] = []
    images: Optional[List[Union[PropertyImage, dict, str]]] = []
    property_video_url: Optional[str] = None
    drone_video_url: Optional[str] = None
    virtual_tour_url: Optional[str] = None
    status: str = "draft"
    investment_metrics: Optional[List[Union[InvestmentMetric, dict]]] = []
    tags: Optional[List[str]] = []
    market_analysis: Optional[Dict[str, Any]] = None
    
    # Validators to handle conversions
    @validator('price')
    def validate_price(cls, v):
        if isinstance(v, str):
            # Handle formatted price strings like "R$ 10.101.168,00"
            # Remove currency symbol, thousand separators, and convert decimal separator
            cleaned = v.replace('R$', '').replace(' ', '').strip()
            cleaned = cleaned.replace('.', '').replace(',', '.')
            return Decimal(cleaned)
        elif isinstance(v, float):
            return Decimal(str(v))
        return v
    
    @validator('property_type')
    def validate_property_type(cls, v):
        if isinstance(v, str):
            return {'name': v, 'description': None}
        return v
    
    @validator('location')
    def validate_location(cls, v):
        if isinstance(v, str):
            return {'name': v, 'description': None}
        return v

class PropertyUpdate(BaseModel):
    """Property update model."""
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[Union[str, dict, PropertyType]] = None
    location: Optional[Union[str, dict, Location]] = None
    neighborhood: Optional[str] = None
    address: Optional[str] = None
    price: Optional[Union[Decimal, float, str]] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area: Optional[float] = None
    features: Optional[List[Union[Feature, dict, str]]] = None
    images: Optional[List[Union[PropertyImage, dict, str]]] = None
    property_video_url: Optional[str] = None
    drone_video_url: Optional[str] = None
    virtual_tour_url: Optional[str] = None
    status: Optional[str] = None
    investment_metrics: Optional[List[Union[InvestmentMetric, dict]]] = None
    tags: Optional[List[str]] = None
    market_analysis: Optional[Dict[str, Any]] = None
    
    # Validators to handle conversions
    @validator('price')
    def validate_price(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            # Handle formatted price strings like "R$ 10.101.168,00"
            # Remove currency symbol, thousand separators, and convert decimal separator
            cleaned = v.replace('R$', '').replace(' ', '').strip()
            cleaned = cleaned.replace('.', '').replace(',', '.')
            return Decimal(cleaned)
        elif isinstance(v, float):
            return Decimal(str(v))
        return v
    
    @validator('property_type')
    def validate_property_type(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            return {'name': v, 'description': None}
        return v
    
    @validator('location')
    def validate_location(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            return {'name': v, 'description': None}
        return v

class PropertyResponse(Property):
    """Property response model."""
    id: str

class PropertyList(BaseModel):
    """Property list model."""
    properties: List[PropertyResponse]
    total: int
    page: int
    size: int

class PropertySearch(BaseModel):
    """Property search model."""
    query: str = ""
    property_type: Optional[str] = None
    location: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_bedrooms: Optional[int] = None
    min_bathrooms: Optional[int] = None
    min_area: Optional[float] = None
    features: Optional[List[str]] = None
    sort: Optional[str] = None
    order: Optional[str] = "desc"
    page: int = 1
    size: int = 10

class PropertySearchResponse(BaseModel):
    """Property search response model."""
    properties: List[PropertyResponse]
    total: int
    page: int
    size: int
    query: str