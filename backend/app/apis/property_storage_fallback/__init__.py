"""Storage-based fallback for property management when database is unavailable.

This module provides a fallback mechanism using Databutton's storage when
the primary database (Supabase) is unavailable. It implements basic CRUD
operations for property management.
"""

import uuid
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import databutton as db

from fastapi import APIRouter
from app.apis.common_imports import sanitize_storage_key

# Create a router for this API
router = APIRouter(prefix="/property-storage-fallback", tags=["property-storage-fallback"])


class PropertyStorageFallback:
    """Storage-based fallback for property management when database is unavailable"""
    
    def __init__(self):
        """Initialize the PropertyStorageFallback"""
        self.properties_key = "properties_fallback"
        self.images_key_prefix = "property_images_"
    
    def _read_properties(self) -> List[Dict[str, Any]]:
        """Read properties from storage"""
        try:
            return db.storage.json.get(self.properties_key, default=[])
        except Exception as e:
            print(f"Error reading properties from storage: {str(e)}")
            return []
    
    def _write_properties(self, properties: List[Dict[str, Any]]) -> bool:
        """Write properties to storage"""
        try:
            db.storage.json.put(sanitize_storage_key(self.properties_key), properties)
            return True
        except Exception as e:
            print(f"Error writing properties to storage: {str(e)}")
            return False
    
    def create_property(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new property in storage
        
        Args:
            property_data: Dictionary containing property details
            
        Returns:
            The created property with ID and timestamps added
        """
        # Generate an ID and timestamps
        property_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        # Add metadata
        property_data["id"] = property_id
        property_data["created_at"] = now
        property_data["updated_at"] = now
        property_data["images"] = property_data.get("images", [])
        
        # Save to storage
        properties = self._read_properties()
        properties.append(property_data)
        self._write_properties(properties)
        
        print(f"Property saved to storage fallback: {property_id}")
        return property_data
    
    def get_properties(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get properties from storage with optional filtering
        
        Args:
            filters: Optional dictionary of field:value pairs to filter by
            
        Returns:
            List of properties matching the filters
        """
        properties = self._read_properties()
        
        # Apply filters if provided
        if filters:
            filtered_properties = []
            for prop in properties:
                match = True
                for key, value in filters.items():
                    if key not in prop or prop[key] != value:
                        match = False
                        break
                if match:
                    filtered_properties.append(prop)
            return filtered_properties
        
        return properties
    
    def get_property(self, property_id: str) -> Optional[Dict[str, Any]]:
        """Get a property by ID from storage
        
        Args:
            property_id: ID of the property to retrieve
            
        Returns:
            Property data or None if not found
        """
        properties = self._read_properties()
        
        for prop in properties:
            if prop.get("id") == property_id:
                return prop
                
        return None
    
    def update_property(self, property_id: str, property_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a property in storage
        
        Args:
            property_id: ID of the property to update
            property_data: Dictionary containing property details to update
            
        Returns:
            Updated property data or None if property not found
        """
        properties = self._read_properties()
        
        for i, prop in enumerate(properties):
            if prop.get("id") == property_id:
                # Update property data
                properties[i].update(property_data)
                properties[i]["updated_at"] = datetime.now().isoformat()
                
                # Save to storage
                self._write_properties(properties)
                
                print(f"Property updated in storage fallback: {property_id}")
                return properties[i]
                
        print(f"Property not found for update: {property_id}")
        return None
    
    def delete_property(self, property_id: str) -> bool:
        """Delete a property from storage
        
        Args:
            property_id: ID of the property to delete
            
        Returns:
            True if property was deleted, False otherwise
        """
        properties = self._read_properties()
        
        for i, prop in enumerate(properties):
            if prop.get("id") == property_id:
                # Remove the property
                del properties[i]
                
                # Save to storage
                self._write_properties(properties)
                
                # Delete associated images
                image_key = sanitize_storage_key(f"{self.images_key_prefix}{property_id}")
                try:
                    db.storage.json.put(image_key, [])
                except Exception as e:
                    print(f"Error clearing property images: {str(e)}")
                
                print(f"Property deleted from storage fallback: {property_id}")
                return True
                
        print(f"Property not found for deletion: {property_id}")
        return False
    
    def upload_image(self, property_id: str, image_url: str, caption: str = "", is_main: bool = False) -> Optional[Dict[str, Any]]:
        """Upload an image for a property to storage
        
        Args:
            property_id: ID of the property
            image_url: URL of the image
            caption: Optional caption for the image
            is_main: Whether this is the main property image
            
        Returns:
            Image data or None if property not found
        """
        # Get the property
        property_data = self.get_property(property_id)
        if not property_data:
            print(f"Property not found for image upload: {property_id}")
            return None
        
        # Generate an image ID
        image_id = f"img-{uuid.uuid4()}"
        
        # Create image object
        image_data = {
            "id": image_id,
            "property_id": property_id,
            "url": image_url,
            "caption": caption or "Property image",
            "is_main": is_main,
            "created_at": datetime.now().isoformat()
        }
        
        # Update property images
        properties = self._read_properties()
        for i, prop in enumerate(properties):
            if prop.get("id") == property_id:
                images = prop.get("images", [])
                
                # If this is the main image, unset other main images
                if is_main:
                    for img in images:
                        img["is_main"] = False
                
                # Add the new image
                images.append(image_data)
                properties[i]["images"] = images
                properties[i]["updated_at"] = datetime.now().isoformat()
                
                # Save to storage
                self._write_properties(properties)
                
                print(f"Image uploaded to storage fallback: {image_id}")
                return image_data
        
        return None


# Create an instance for use in the app
property_storage_fallback = PropertyStorageFallback()


# API endpoints for the fallback system
@router.post("/properties")
def create_property_fallback(property_data: Dict[str, Any]):
    """Create a property using the storage fallback system"""
    return property_storage_fallback.create_property(property_data)


@router.get("/properties")
def get_properties_fallback(property_type: Optional[str] = None, location: Optional[str] = None):
    """Get properties using the storage fallback system"""
    filters = {}
    if property_type:
        filters["property_type"] = property_type
    if location:
        filters["location"] = location
    
    return property_storage_fallback.get_properties(filters)


@router.get("/properties/{property_id}")
def get_property_fallback(property_id: str):
    """Get a property by ID using the storage fallback system"""
    return property_storage_fallback.get_property(property_id)


@router.put("/properties/{property_id}")
def update_property_fallback(property_id: str, property_data: Dict[str, Any]):
    """Update a property using the storage fallback system"""
    return property_storage_fallback.update_property(property_id, property_data)


@router.delete("/properties/{property_id}")
def delete_property_fallback(property_id: str):
    """Delete a property using the storage fallback system"""
    success = property_storage_fallback.delete_property(property_id)
    return {"success": success}


@router.post("/properties/{property_id}/images")
def upload_property_image_fallback(property_id: str, image_url: str, caption: Optional[str] = "", is_main: Optional[bool] = False):
    """Upload an image for a property using the storage fallback system"""
    return property_storage_fallback.upload_image(property_id, image_url, caption, is_main)
