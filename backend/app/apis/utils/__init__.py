"""Utility functions for the APIs.

This module provides utility functions for:
- Storage operations
- Supabase client management
- Authentication
- Data sanitization
"""

from fastapi import APIRouter

# Create a router to satisfy the module loader
# This router is not intended to have endpoints
router = APIRouter()

import importlib
from typing import Optional, List, Dict, Any, Callable, TypeVar, Union
import re
import json
import random
from datetime import datetime
import databutton as db
from supabase import create_client, Client

# Import common import utilities
from ..common_imports import (
    import_module_safely,
    import_function_safely,
    import_functions_safely,
    sanitize_storage_key,
)

# Re-export sanitize_storage_key for backward compatibility
# The actual function is now in common_imports

def get_supabase() -> Optional[Client]:
    """Get Supabase client instance using secrets.
    
    Returns:
        Supabase client or None if configuration is missing
    """
    try:
        url = db.secrets.get("SUPABASE_URL")
        key = db.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            print("Missing Supabase configuration")
            return None
            
        return create_client(url, key)
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        return None

async def upload_file_to_storage(
    supabase: Client,
    bucket_name: str,
    file_path: str,
    file_content: bytes,
    content_type: Optional[str] = None
) -> str:
    """Upload a file to Supabase Storage.
    
    Args:
        supabase: Supabase client
        bucket_name: Storage bucket name
        file_path: Path where the file should be stored (including filename)
        file_content: Binary content of the file
        content_type: MIME type of the file
        
    Returns:
        Public URL of the uploaded file
    """
    try:
        # Check if bucket exists, create it if not
        buckets = supabase.storage.list_buckets()
        bucket_exists = any(bucket.name == bucket_name for bucket in buckets)
        
        if not bucket_exists:
            supabase.storage.create_bucket(bucket_name, public=True)
            print(f"Created new bucket: {bucket_name}")
        
        # Upload file
        options = {"content-type": content_type} if content_type else None
        result = supabase.storage.from_(bucket_name).upload(
            file_path,
            file_content,
            file_options=options
        )
        
        if not result:
            raise Exception("Upload failed - no result returned")
            
        # Get public URL
        url_result = supabase.storage.from_(bucket_name).get_public_url(file_path)
        
        if not url_result:
            raise Exception("Failed to get public URL for uploaded file")
            
        return url_result
    except Exception as e:
        print(f"Error uploading file to {bucket_name}/{file_path}: {e}")
        raise

async def delete_file_from_storage(
    supabase: Client,
    bucket_name: str,
    file_path: str
) -> bool:
    """Delete a file from Supabase Storage.
    
    Args:
        supabase: Supabase client
        bucket_name: Storage bucket name
        file_path: Path to the file to delete
        
    Returns:
        Boolean indicating success
    """
    try:
        supabase.storage.from_(bucket_name).remove([file_path])
        return True
    except Exception as e:
        print(f"Error deleting file {bucket_name}/{file_path}: {e}")
        # Don't raise the exception - file might already be deleted
        return False

async def list_files_in_storage(
    supabase: Client,
    bucket_name: str,
    folder_path: Optional[str] = None
) -> list:
    """List files in a Supabase Storage bucket.
    
    Args:
        supabase: Supabase client
        bucket_name: Storage bucket name
        folder_path: Optional subfolder to list
        
    Returns:
        List of file information objects
    """
    try:
        path = folder_path or ""
        result = supabase.storage.from_(bucket_name).list(path)
        return result
    except Exception as e:
        print(f"Error listing files in {bucket_name}/{folder_path}: {e}")
        raise

def sync_properties_to_storage(properties: list) -> None:
    """Sync properties to storage.
    
    Args:
        properties: List of properties to sync
    """
    try:
        # Save to luxury_properties.json
        db.storage.text.put(
            "luxury_properties.json",
            json.dumps({"properties": properties})
        )
        print(f"Synced {len(properties)} properties to luxury_properties.json")
        
        # Also update generated_properties for backward compatibility
        db.storage.json.put("generated_properties", properties)
        print(f"Synced {len(properties)} properties to generated_properties")
        
        # Save individual property files
        for prop in properties:
            if prop.get("id"):
                key = sanitize_storage_key(f"property_{prop['id']}")
                db.storage.json.put(key, prop)
    except Exception as e:
        print(f"Error syncing properties to storage: {e}")
        raise

def update_property_format(property_data: dict) -> dict:
    """Update property format to latest version.
    
    Args:
        property_data: Property data to update
        
    Returns:
        Updated property data
    """
    try:
        # Ensure required fields
        if "id" not in property_data:
            property_data["id"] = f"prop_{int(datetime.now().timestamp())}_{random.randint(1000, 9999)}"
            
        if "created_at" not in property_data:
            property_data["created_at"] = datetime.now().isoformat()
            
        if "updated_at" not in property_data:
            property_data["updated_at"] = datetime.now().isoformat()
            
        # Ensure images array exists
        if "images" not in property_data:
            property_data["images"] = []
            
        # Convert old image format if needed
        images = property_data["images"]
        if images and isinstance(images, list):
            updated_images = []
            for i, img in enumerate(images):
                if isinstance(img, str):  # Just a URL
                    updated_images.append({
                        "id": f"img_{i}_{property_data['id']}",
                        "url": img,
                        "caption": f"Property image {i+1}",
                        "is_main": i == 0
                    })
                elif isinstance(img, dict) and "url" in img:
                    if "id" not in img:
                        img["id"] = f"img_{i}_{property_data['id']}"
                    if "is_main" not in img:
                        img["is_main"] = i == 0
                    updated_images.append(img)
            property_data["images"] = updated_images
            
        return property_data
    except Exception as e:
        print(f"Error updating property format: {e}")
        raise

# Moved to common module
try:
    from ..common import adapt_property_for_response
except ImportError:
    # Fallback implementation if common module is not available
    def adapt_property_for_response(property_data: dict) -> dict:
        """Adapt property data for API response."""
        return property_data

# These utility functions are now imported from common_imports