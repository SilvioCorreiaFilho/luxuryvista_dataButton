"""Common imports utility module to avoid circular dependencies

This module provides shared utility functions, constants, and imports
that can be used across different API modules without causing circular imports.

It includes:
- Storage utilities (sanitize_storage_key, generate_id)
- Date/time utilities (get_timestamp)
- Property-related constants and utilities
- Safe import utilities for dynamic importing
"""

import re
import random
import uuid
from typing import Any, List, Dict, Callable, Optional, TypeVar, Union
from datetime import datetime
from importlib import import_module
from fastapi import APIRouter
from pydantic import BaseModel, Field

# Create a router to satisfy the module loader
router = APIRouter()

# Storage utilities
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols
    
    Args:
        key: The key to sanitize
        
    Returns:
        Sanitized key
    """
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# ID and timestamp utilities
def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix
    
    Args:
        prefix: Optional prefix for the ID
        
    Returns:
        Unique ID string
    """
    timestamp = int(datetime.now().timestamp())
    random_suffix = random.randint(1000, 9999)
    return f"{prefix}{timestamp}_{random_suffix}"

def get_timestamp() -> str:
    """Get current timestamp in ISO format
    
    Returns:
        Current timestamp string
    """
    return datetime.now().isoformat()

# Property-related constants
PROPERTY_TYPES = [
    "Mansion", 
    "Villa", 
    "Penthouse", 
    "Luxury Apartment", 
    "Estate", 
    "Chalet"
]

NEIGHBORHOODS = [
    "Lago Sul", 
    "Lago Norte", 
    "Park Way", 
    "Sudoeste", 
    "Noroeste", 
    "Asa Sul"
]

DEFAULT_FEATURES = [
    "Piscina infinita", 
    "Spa privativo", 
    "Adega climatizada", 
    "Academia", 
    "Cinema em casa", 
    "Sistema de automação residencial", 
    "Garagem para 4+ carros", 
    "Segurança 24 horas", 
    "Sauna", 
    "Jardim paisagístico", 
    "Terraço panorâmico", 
    "Cozinha gourmet"
]

# Property utility functions
def translate_property_data(property_data: Dict[str, Any], language: str = "pt") -> Dict[str, Any]:
    """Translate property data to the specified language
    
    Args:
        property_data: Property data to translate
        language: Target language (pt or en)
        
    Returns:
        Translated property data
    """
    # Currently just returns the original data, would implement actual translation if needed
    return property_data

# Safe import utilities
T = TypeVar('T')

# Shared model registry
_shared_models = {}

def register_shared_model(name: str, model_class: Any) -> None:
    """Register a model class in the shared registry
    
    Args:
        name: Name to register the model under
        model_class: The model class to register
    """
    _shared_models[name] = model_class
    
def get_shared_model(name: str) -> Optional[Any]:
    """Get a model class from the shared registry
    
    Args:
        name: Name of the registered model
        
    Returns:
        The model class or None if not found
    """
    return _shared_models.get(name)

# Client utilities
def get_openai_client():
    """Get an OpenAI client instance
    
    Returns:
        OpenAI client or None if initialization fails
    """
    try:
        import databutton as db
        from openai import OpenAI
        api_key = db.secrets.get("OPENAI_API_KEY")
        if api_key:
            return OpenAI(api_key=api_key)
        return None
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None

def get_supabase():
    """Get a Supabase client instance
    
    Returns:
        Supabase client or None if initialization fails
    """
    try:
        import databutton as db
        # This is a placeholder - actual implementation would use the supabase-py package
        # The real implementation would fetch credentials from db.secrets
        return None
    except Exception as e:
        print(f"Error initializing Supabase client: {e}")
        return None


# Define base models that other modules can import
class SharedBaseResponse(BaseModel):
    """Base response model used across all APIs."""
    success: bool = Field(default=True)
    message: str = Field(default="Operation completed successfully")
    error: Optional[str] = Field(default=None)

class PropertyType(BaseModel):
    """Property type model"""
    id: Optional[str] = Field(default=None)
    name: str = Field(...)
    description: Optional[str] = Field(default=None)

class Location(BaseModel):
    """Location model for properties"""
    id: Optional[str] = Field(default=None)
    name: str = Field(...)
    latitude: Optional[float] = Field(default=None)
    longitude: Optional[float] = Field(default=None)
    neighborhood: Optional[str] = Field(default=None)
    city: Optional[str] = Field(default=None)
    state: Optional[str] = Field(default=None)
    country: Optional[str] = Field(default=None)

class PropertyFeature(BaseModel):
    """Property feature model"""
    id: Optional[str] = Field(default=None)
    name: str = Field(...)
    description: Optional[str] = Field(default=None)

class PropertyImage(BaseModel):
    """Property image model"""
    id: Optional[str] = Field(default=None)
    url: str = Field(...)
    alt: Optional[str] = Field(default=None)
    is_primary: Optional[bool] = Field(default=False)
    property_id: Optional[str] = Field(default=None)

class BaseProperty(BaseModel):
    """Base property model with common fields"""
    id: Optional[str] = Field(default=None)
    title: str = Field(...)
    subtitle: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)
    property_type: Optional[PropertyType] = Field(default=None)
    location: Optional[Location] = Field(default=None)
    price: Optional[str] = Field(default=None)
    currency: Optional[str] = Field(default=None)
    bedrooms: Optional[int] = Field(default=None)
    bathrooms: Optional[int] = Field(default=None)
    area: Optional[float] = Field(default=None)
    area_unit: Optional[str] = Field(default=None)
    features: Optional[List[PropertyFeature]] = Field(default=None)
    images: Optional[List[PropertyImage]] = Field(default=None)
    status: Optional[str] = Field(default=None)
    created_at: Optional[str] = Field(default=None)
    updated_at: Optional[str] = Field(default=None)
    published_at: Optional[str] = Field(default=None)

# Request/Response model pairs
class SeoTitleSubtitleRequest(BaseModel):
    """Request model for SEO title and subtitle generation"""
    property_type: str = Field(...)
    location: str = Field(...)
    language: Optional[str] = Field(default="en")

class SeoTitleSubtitleResponse(SharedBaseResponse):
    """Response model for SEO title and subtitle generation"""
    title: str = Field(default="")
    subtitle: str = Field(default="")

class PropertySearchRequest(BaseModel):
    """Request model for property search"""
    query: Optional[str] = Field(default=None)
    property_type: Optional[str] = Field(default=None)
    min_price: Optional[int] = Field(default=None)
    max_price: Optional[int] = Field(default=None)
    min_bedrooms: Optional[int] = Field(default=None)
    max_bedrooms: Optional[int] = Field(default=None)
    min_bathrooms: Optional[int] = Field(default=None)
    max_bathrooms: Optional[int] = Field(default=None)
    min_area: Optional[int] = Field(default=None)
    max_area: Optional[int] = Field(default=None)
    neighborhood: Optional[str] = Field(default=None)
    features: Optional[List[str]] = Field(default=None)
    status: Optional[str] = Field(default=None)
    limit: int = Field(default=10)
    offset: int = Field(default=0)

class PropertySearchResponse(SharedBaseResponse):
    """Response model for property search"""
    properties: List[Dict[str, Any]] = Field(default_factory=list)
    count: int = Field(default=0)
    page: int = Field(default=1)
    total_pages: int = Field(default=1)

# Define models for property operations
class PropertyData(BaseProperty):
    """Full property data model"""
    # Additional fields specific to the expanded property model
    features_list: Optional[List[str]] = Field(default=None)
    price_numeric: Optional[int] = Field(default=None)
    image_urls: Optional[List[str]] = Field(default=None)

class BaseResponse(SharedBaseResponse):
    """Base response model for generic operations"""
    data: Optional[Dict[str, Any]] = Field(default=None)

class PropertyResponse(SharedBaseResponse):
    """Response model for single property operations"""
    property: Optional[Dict[str, Any]] = Field(default=None)

class PropertiesResponse(SharedBaseResponse):
    """Response model for multiple property operations"""
    properties: List[Dict[str, Any]] = Field(default_factory=list)
    count: int = Field(default=0)
    page: int = Field(default=1)
    total_pages: int = Field(default=1)

class PropertyImageRequest(BaseModel):
    """Request model for property image generation"""
    property_id: str = Field(...)
    count: int = Field(default=1)
    force_regenerate: bool = Field(default=False)
    
class BatchImageRequest(BaseModel):
    """Request model for batch image generation"""
    property_ids: List[str] = Field(...)
    count_per_property: int = Field(default=1)
    force_regenerate: bool = Field(default=False)

class GeneratePropertiesRequest(BaseModel):
    """Request model for property generation"""
    count: int = Field(default=5)
    property_types: Optional[List[str]] = Field(default=None)
    force_regenerate: bool = Field(default=False)
    language: str = Field(default="pt")
    location: Optional[str] = Field(default=None)
    
class RegeneratePropertiesRequest(BaseModel):
    """Request model for property regeneration"""
    property_count: int = Field(default=5)
    force_regenerate: bool = Field(default=True)
    property_types: Optional[List[str]] = Field(default=None)

class PropertyUpdateRequest(BaseModel):
    """Request model for property updates"""
    id: str = Field(...)
    data: Dict[str, Any] = Field(...)

class GeneratePropertiesResponse(SharedBaseResponse):
    """Response model for property generation"""
    properties: List[Dict[str, Any]] = Field(default_factory=list)
    task_id: Optional[str] = Field(default=None)

# Register all models in the shared registry
register_shared_model('SharedBaseResponse', SharedBaseResponse)
register_shared_model('PropertyType', PropertyType)
register_shared_model('Location', Location)
register_shared_model('PropertyFeature', PropertyFeature)
register_shared_model('PropertyImage', PropertyImage)
register_shared_model('BaseProperty', BaseProperty)
register_shared_model('PropertyData', PropertyData)
register_shared_model('BaseResponse', BaseResponse)
register_shared_model('PropertyResponse', PropertyResponse)
register_shared_model('PropertiesResponse', PropertiesResponse)
register_shared_model('PropertyImageRequest', PropertyImageRequest)
register_shared_model('BatchImageRequest', BatchImageRequest)
register_shared_model('GeneratePropertiesRequest', GeneratePropertiesRequest)
register_shared_model('RegeneratePropertiesRequest', RegeneratePropertiesRequest)
register_shared_model('PropertyUpdateRequest', PropertyUpdateRequest)
register_shared_model('GeneratePropertiesResponse', GeneratePropertiesResponse)
register_shared_model('SeoTitleSubtitleRequest', SeoTitleSubtitleRequest)
register_shared_model('SeoTitleSubtitleResponse', SeoTitleSubtitleResponse)
register_shared_model('PropertySearchRequest', PropertySearchRequest)
register_shared_model('PropertySearchResponse', PropertySearchResponse)

# Storage utilities for property data
def sync_properties_to_storage(properties: List[Dict[str, Any]]) -> None:
    """Sync properties to storage for fallback access
    
    Args:
        properties: List of properties to sync
    """
    try:
        import databutton as db
        import json
        
        # Save all properties in a single file
        db.storage.text.put(
            "luxury_properties.json",
            json.dumps({"properties": properties})
        )
        
        # Save individual property files and update index
        property_ids = []
        for prop in properties:
            if prop.get("id"):
                property_ids.append(prop["id"])
                key = sanitize_storage_key(f"property_{prop['id']}")
                db.storage.json.put(key, prop)
        
        # Update property index
        db.storage.json.put("property_index", property_ids)
    except Exception as e:
        print(f"Error syncing properties to storage: {e}")
        raise

def import_module_safely(module_path: str) -> Optional[Any]:
    """Safely import a module without raising exceptions
    
    Args:
        module_path: Dotted path to the module
        
    Returns:
        Imported module or None if import fails
    """
    try:
        return import_module(module_path)
    except (ImportError, ModuleNotFoundError) as e:
        print(f"Failed to import module {module_path}: {e}")
        return None

def import_function_safely(module_path: str, function_name: str, default_func: Callable[..., T] = None) -> Callable[..., T]:
    """Safely import a function from a module
    
    Args:
        module_path: Dotted path to the module
        function_name: Name of the function to import
        default_func: Default function to return if import fails
        
    Returns:
        Imported function or default function if import fails
    """
    module = import_module_safely(module_path)
    if module and hasattr(module, function_name):
        return getattr(module, function_name)
    return default_func

def import_functions_safely(module_path: str, function_names: List[str]) -> Dict[str, Callable]:
    """Safely import multiple functions from a module
    
    Args:
        module_path: Dotted path to the module
        function_names: Names of functions to import
        
    Returns:
        Dictionary of function_name -> function
    """
    module = import_module_safely(module_path)
    result = {}
    
    if module:
        for name in function_names:
            if hasattr(module, name):
                result[name] = getattr(module, name)
    
    return result

# Module cache for imports to avoid redundant imports
_module_cache = {}

def get_module_function(module_name: str, function_name: str) -> Optional[Callable]:
    """Safely get a function from a module, using cache for efficiency
    
    Args:
        module_name: Name of the module (without app.apis prefix)
        function_name: Name of the function to import
        
    Returns:
        Function if found, None otherwise
    """
    cache_key = f"{module_name}.{function_name}"
    if cache_key in _module_cache:
        return _module_cache[cache_key]
        
    function = import_function_safely(f"app.apis.{module_name}", function_name)
    _module_cache[cache_key] = function
    return function

def get_module(module_name: str) -> Optional[Any]:
    """Safely get a module, using cache for efficiency
    
    Args:
        module_name: Name of the module (without app.apis prefix)
        
    Returns:
        Module if found, None otherwise
    """
    cache_key = f"module.{module_name}"
    if cache_key in _module_cache:
        return _module_cache[cache_key]
        
    module = import_module_safely(f"app.apis.{module_name}")
    _module_cache[cache_key] = module
    return module