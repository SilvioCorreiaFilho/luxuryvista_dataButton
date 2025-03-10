"""
Property Storage Fallback

This module provides a fallback storage mechanism for property data when the database is not available.
It uses databutton.storage for persisting property data and images.
"""

from typing import List, Dict, Any, Optional, Union
import json
import random
import uuid
from datetime import datetime
import databutton as db

from app.apis.common_imports import sanitize_storage_key
from fastapi import APIRouter

# Create router
router = APIRouter(prefix="/fallback", tags=["fallback"])

class PropertyStorageFallback:
    """Fallback storage implementation for properties.
    
    This class provides methods for CRUD operations on properties using
    databutton.storage as the persistence layer when the database is not available.
    """
    
    def __init__(self):
        """Initialize the fallback storage"""
        self.properties_key = "luxury_properties.json"
        self.index_key = "property_index"
        
    def _load_properties(self) -> List[Dict[str, Any]]:
        """Load all properties from storage
        
        Returns:
            List of all properties
        """
        try:
            # Try to load from luxury_properties.json
            json_data = db.storage.text.get(self.properties_key, default='{"properties": []}')
            data = json.loads(json_data)
            return data.get("properties", [])
        except Exception as e:
            print(f"Error loading properties from {self.properties_key}: {e}")
            
            # Try to load from property_index as backup
            try:
                property_ids = db.storage.json.get(self.index_key, default=[])
                properties = []
                
                # Load each property individually
                for prop_id in property_ids:
                    try:
                        key = sanitize_storage_key(f"property_{prop_id}")
                        prop = db.storage.json.get(key)
                        if prop:
                            properties.append(prop)
                    except Exception as ex:
                        print(f"Error loading property {prop_id}: {ex}")
                        
                return properties
            except Exception as ex:
                print(f"Error loading property index: {ex}")
                return []
    
    def _save_properties(self, properties: List[Dict[str, Any]]) -> None:
        """Save all properties to storage
        
        Args:
            properties: List of all properties
        """
        try:
            # Save to luxury_properties.json
            db.storage.text.put(
                self.properties_key,
                json.dumps({"properties": properties})
            )
            
            # Update property index
            property_ids = [p.get("id") for p in properties if p.get("id")]
            db.storage.json.put(self.index_key, property_ids)
            
            # Update individual property files
            for prop in properties:
                if prop.get("id"):
                    key = sanitize_storage_key(f"property_{prop['id']}")
                    db.storage.json.put(key, prop)
        except Exception as e:
            print(f"Error saving properties: {e}")
            raise
    
    def _format_property(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure property has required fields and consistent format
        
        Args:
            property_data: Property data to format
            
        Returns:
            Formatted property data
        """
        # Copy to avoid modifying the original
        property_data = dict(property_data)
        
        # Add required fields if missing
        if "id" not in property_data:
            timestamp = int(datetime.now().timestamp())
            property_data["id"] = f"prop_{timestamp}_{random.randint(1000, 9999)}"
            
        if "created_at" not in property_data:
            property_data["created_at"] = datetime.now().isoformat()
            
        property_data["updated_at"] = datetime.now().isoformat()
        
        # Ensure images array exists
        if "images" not in property_data:
            property_data["images"] = []
        
        # Ensure location exists
        if "location" not in property_data:
            property_data["location"] = {}
            
        # Ensure features array exists
        if "features" not in property_data:
            property_data["features"] = []
            
        # Ensure status exists
        if "status" not in property_data:
            property_data["status"] = "active"
            
        return property_data
    
    def create_property(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new property
        
        Args:
            property_data: Property data to create
            
        Returns:
            Created property data
        """
        # Format the property data
        property_data = self._format_property(property_data)
        
        # Load existing properties
        properties = self._load_properties()
        
        # Add new property
        properties.append(property_data)
        
        # Save updated properties
        self._save_properties(properties)
        
        return property_data
    
    def get_properties(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get properties with optional filtering
        
        Args:
            filters: Optional filters to apply
            
        Returns:
            List of properties
        """
        # Load all properties
        properties = self._load_properties()
        
        # Apply filters if provided
        if filters:
            filtered_properties = []
            for prop in properties:
                match = True
                
                for key, value in filters.items():
                    # Handle nested fields with dot notation (e.g., location.city)
                    if '.' in key:
                        parts = key.split('.')
                        prop_value = prop
                        for part in parts:
                            if isinstance(prop_value, dict) and part in prop_value:
                                prop_value = prop_value[part]
                            else:
                                prop_value = None
                                break
                    else:
                        prop_value = prop.get(key)
                    
                    # Check if value matches
                    if prop_value != value:
                        match = False
                        break
                
                if match:
                    filtered_properties.append(prop)
            
            return filtered_properties
        
        return properties
    
    def get_property(self, property_id: str) -> Optional[Dict[str, Any]]:
        """Get a property by ID
        
        Args:
            property_id: ID of the property to get
            
        Returns:
            Property data or None if not found
        """
        # Try to load directly from individual property file
        try:
            key = sanitize_storage_key(f"property_{property_id}")
            return db.storage.json.get(key)
        except:
            # Fall back to searching all properties
            properties = self._load_properties()
            
            for prop in properties:
                if prop.get("id") == property_id:
                    return prop
            
            return None
    
    def update_property(self, property_id: str, property_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a property
        
        Args:
            property_id: ID of the property to update
            property_data: Property data to update
            
        Returns:
            Updated property data or None if not found
        """
        # Load all properties
        properties = self._load_properties()
        
        # Find the property to update
        for i, prop in enumerate(properties):
            if prop.get("id") == property_id:
                # Update the property
                updated_prop = {**prop, **property_data}
                updated_prop["id"] = property_id  # Ensure ID doesn't change
                updated_prop["updated_at"] = datetime.now().isoformat()
                
                # Replace in the list
                properties[i] = updated_prop
                
                # Save updated properties
                self._save_properties(properties)
                
                return updated_prop
        
        return None
    
    def delete_property(self, property_id: str) -> bool:
        """Delete a property
        
        Args:
            property_id: ID of the property to delete
            
        Returns:
            True if deleted, False otherwise
        """
        # Load all properties
        properties = self._load_properties()
        
        # Find the property to delete
        for i, prop in enumerate(properties):
            if prop.get("id") == property_id:
                # Remove from the list
                del properties[i]
                
                # Save updated properties
                self._save_properties(properties)
                
                # Remove individual property file
                try:
                    key = sanitize_storage_key(f"property_{property_id}")
                    # Use a workaround since delete doesn't exist
                    db.storage.json.put(key, None)
                except:
                    pass
                
                return True
        
        return False
    
    def upload_image(self, property_id: str, image_url: str, caption: str = "", is_main: bool = False) -> Optional[Dict[str, Any]]:
        """Add an image to a property
        
        Args:
            property_id: ID of the property
            image_url: URL of the image
            caption: Caption for the image
            is_main: Whether this is the main property image
            
        Returns:
            Image data or None if property not found
        """
        # Get the property
        property_data = self.get_property(property_id)
        if not property_data:
            return None
        
        # Get existing images
        images = property_data.get("images", [])
        
        # Create new image
        image_id = f"img_{len(images)}_{property_id}_{uuid.uuid4().hex[:8]}"
        new_image = {
            "id": image_id,
            "url": image_url,
            "caption": caption,
            "is_main": is_main,
            "order_index": len(images)
        }
        
        # If this is the main image, update existing images
        if is_main:
            for img in images:
                img["is_main"] = False
        
        # Add the new image
        images.append(new_image)
        property_data["images"] = images
        
        # Update the property
        self.update_property(property_id, {"images": images})
        
        return new_image


# Create a singleton instance for use throughout the app
property_storage_fallback = PropertyStorageFallback()

# Initialize the PropertyManager with the fallback storage
try:
    from ..facade import property_manager
    # Initialize property_manager to be done in the property_manager module
# to avoid circular imports
except ImportError:
    print("Could not initialize PropertyManager with fallback storage")
