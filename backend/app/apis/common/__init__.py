"""Common utility functions and helpers for APIs.

This module provides common utility functions used across multiple APIs:
- Property adapters
- Data formatting utilities
- Shared helper functions
"""

from fastapi import APIRouter

# Create a router to satisfy the module loader
# This router is not intended to have endpoints
router = APIRouter()

from typing import Dict, Any, Optional
import random
from datetime import datetime

def adapt_property_for_response(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """Convert property data to a consistent format for API responses.
    
    Args:
        property_data: Property data to adapt
        
    Returns:
        Adapted property data
    """
    try:
        result = dict(property_data)
        
        # Ensure ID is a string
        if 'id' in result and result['id'] is not None:
            result['id'] = str(result['id'])
        
        # Ensure dates are properly formatted
        for date_field in ['created_at', 'updated_at', 'published_at']:
            if date_field in result and result[date_field] is not None:
                try:
                    if isinstance(result[date_field], datetime):
                        result[date_field] = result[date_field].isoformat()
                except Exception as e:
                    print(f"Error formatting date field {date_field}: {e}")
        
        # Ensure images are properly formatted
        if 'images' in result and result['images'] and isinstance(result['images'], list):
            updated_images = []
            for i, img in enumerate(result['images']):
                if isinstance(img, str):  # Just a URL
                    updated_images.append({
                        "id": f"img_{i}_{result.get('id', random.randint(1000, 9999))}",
                        "url": img,
                        "caption": f"Property image {i+1}",
                        "is_main": i == 0
                    })
                elif isinstance(img, dict) and "url" in img:
                    if "id" not in img:
                        img["id"] = f"img_{i}_{result.get('id', random.randint(1000, 9999))}"
                    if "is_main" not in img:
                        img["is_main"] = i == 0
                    updated_images.append(img)
            result["images"] = updated_images
        
        # Format property type
        if 'property_type' in result and isinstance(result['property_type'], dict):
            if 'id' not in result['property_type'] and 'name' in result['property_type']:
                from ..utils import sanitize_storage_key
                result['property_type']['id'] = sanitize_storage_key(result['property_type']['name'].lower())
        
        # Format location
        if 'location' in result and isinstance(result['location'], dict):
            location = result['location']
            # Ensure all required fields are present
            if 'latitude' not in location or 'longitude' not in location:
                location['latitude'] = location.get('latitude', -15.7801)
                location['longitude'] = location.get('longitude', -47.9292)
            if 'address' not in location and 'name' in location:
                location['address'] = f"{location['name']}, Brasília, DF, Brazil"
            if 'neighborhood' not in location and 'name' in location:
                location['neighborhood'] = location['name']
        
        return result
    except Exception as e:
        print(f"Error adapting property for response: {e}")
        return property_data
