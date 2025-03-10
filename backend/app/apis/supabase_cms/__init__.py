"""Supabase-based CMS implementation for LuxuryVista.

This module provides CMS functionality using Supabase as the backend.
"""

import uuid
from datetime import datetime
import json
import re
from typing import Dict, Any, List, Optional
import databutton as db
from supabase import create_client, Client
from fastapi import HTTPException, APIRouter

# Create router object for FastAPI to mount
router = APIRouter()

# Utility functions
def slugify(text):
    """Convert text to slug format"""
    if not text:
        return ""
    text = str(text).lower()  # Handle non-string input
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

# Utility functions
def get_supabase() -> Client:
    """Get a Supabase client with proper error handling."""
    try:
        url = db.secrets.get("SUPABASE_URL")
        key = db.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
        print(f"Connecting to Supabase: URL present: {bool(url)}, Key present: {bool(key)}")
        
        if not url or not key:
            print("Supabase credentials not properly configured")
            raise ValueError("Supabase credentials not properly configured")
            
        return create_client(url, key)
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

# Property Types
def get_property_types():
    """Get all property types from the CMS."""
    try:
        supabase = get_supabase()
        response = supabase.table('property_types').select('*').execute()
        return {"property_types": response.data, "count": len(response.data)}
    except Exception as e:
        print(f"Error fetching property types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def create_property_type(name: str, description: str):
    """Create a new property type in the CMS."""
    try:
        supabase = get_supabase()
        property_type_id = str(uuid.uuid4())
        data = {
            "id": property_type_id,
            "name": name,
            "description": description
        }
        
        response = supabase.table('property_types').insert(data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        print(f"Error creating property type: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Locations
def get_locations():
    """Get all locations from the CMS."""
    try:
        supabase = get_supabase()
        response = supabase.table('locations').select('*').execute()
        return {"locations": response.data, "count": len(response.data)}
    except Exception as e:
        print(f"Error fetching locations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def create_location(name: str, description: str, latitude: Optional[float] = None, longitude: Optional[float] = None):
    """Create a new location in the CMS."""
    try:
        supabase = get_supabase()
        location_id = str(uuid.uuid4())
        data = {
            "id": location_id,
            "name": name,
            "description": description,
            "latitude": latitude,
            "longitude": longitude
        }
        
        response = supabase.table('locations').insert(data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        print(f"Error creating location: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Features
def get_features():
    """Get all features from the CMS."""
    try:
        supabase = get_supabase()
        response = supabase.table('features').select('*').execute()
        return {"features": response.data, "count": len(response.data)}
    except Exception as e:
        print(f"Error fetching features: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def create_feature(name: str, icon: Optional[str] = None):
    """Create a new feature in the CMS."""
    try:
        supabase = get_supabase()
        feature_id = str(uuid.uuid4())
        data = {
            "id": feature_id,
            "name": name,
            "icon": icon
        }
        
        response = supabase.table('features').insert(data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        print(f"Error creating feature: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Properties
def get_properties(page=1, page_size=20, status=None):
    """Get properties from Supabase with pagination."""
    try:
        supabase = get_supabase()
        query = supabase.table("cms_properties")
        
        # Add filter if status is provided
        if status:
            query = query.eq("status", status)
        
        # Add pagination
        offset = (page - 1) * page_size
        query = query.order("created_at", desc=True).range(offset, offset + page_size - 1)
        
        # Execute query
        response = query.execute()
        properties = response.data if response.data else []
        
        # Get total count
        count_query = supabase.table("cms_properties")
        if status:
            count_query = count_query.eq("status", status)
        
        count_response = count_query.count("exact").execute()
        total_count = count_response.count if hasattr(count_response, "count") else len(properties)
        
        # Process properties to include related data
        processed_properties = []
        for prop in properties:
            # Get property type
            if prop.get("property_type_id"):
                property_type_response = supabase.table("property_types").select("*").eq("id", prop["property_type_id"]).execute()
                if property_type_response.data and len(property_type_response.data) > 0:
                    prop["property_type"] = property_type_response.data[0]
            
            # Get location
            if prop.get("location_id"):
                location_response = supabase.table("locations").select("*").eq("id", prop["location_id"]).execute()
                if location_response.data and len(location_response.data) > 0:
                    prop["location"] = location_response.data[0]
            
            # Get features
            features_response = supabase.table("property_features").select("features(id, name, icon)").eq("property_id", prop["id"]).execute()
            prop["features"] = [feature["features"] for feature in features_response.data] if features_response.data else []
            
            # Get images
            images_response = supabase.table("property_images").select("*").eq("property_id", prop["id"]).order("is_main", desc=True).execute()
            prop["images"] = images_response.data if images_response.data else []
            
            # Get investment metrics
            metrics_response = supabase.table("property_investment_metrics").select("*").eq("property_id", prop["id"]).execute()
            prop["investment_metrics"] = metrics_response.data if metrics_response.data else []
            
            # Get tags
            tags_response = supabase.table("property_tags").select("tag").eq("property_id", prop["id"]).execute()
            prop["tags"] = [tag_item["tag"] for tag_item in tags_response.data] if tags_response.data else []
            
            processed_properties.append(prop)
        
        return {
            "properties": processed_properties,
            "count": total_count,
            "page": page,
            "pages": (total_count + page_size - 1) // page_size
        }
    except Exception as e:
        print(f"Error getting properties from Supabase: {e}")
        return {"properties": [], "count": 0, "page": page, "pages": 0}

def get_property(property_id):
    """Get a property by ID from Supabase."""
    try:
        supabase = get_supabase()
        response = supabase.table("cms_properties").select("*").eq("id", property_id).execute()
        
        if not response.data or len(response.data) == 0:
            return None
        
        property_data = response.data[0]
        
        # Get property type
        if property_data.get("property_type_id"):
            property_type_response = supabase.table("property_types").select("*").eq("id", property_data["property_type_id"]).execute()
            if property_type_response.data and len(property_type_response.data) > 0:
                property_data["property_type"] = property_type_response.data[0]
        
        # Get location
        if property_data.get("location_id"):
            location_response = supabase.table("locations").select("*").eq("id", property_data["location_id"]).execute()
            if location_response.data and len(location_response.data) > 0:
                property_data["location"] = location_response.data[0]
        
        # Get features
        features_response = supabase.table("property_features").select("features(id, name, icon)").eq("property_id", property_data["id"]).execute()
        property_data["features"] = [feature["features"] for feature in features_response.data] if features_response.data else []
        
        # Get images
        images_response = supabase.table("property_images").select("*").eq("property_id", property_data["id"]).order("is_main", desc=True).execute()
        property_data["images"] = images_response.data if images_response.data else []
        
        # Get investment metrics
        metrics_response = supabase.table("property_investment_metrics").select("*").eq("property_id", property_data["id"]).execute()
        property_data["investment_metrics"] = metrics_response.data if metrics_response.data else []
        
        # Get tags
        tags_response = supabase.table("property_tags").select("tag").eq("property_id", property_data["id"]).execute()
        property_data["tags"] = [tag_item["tag"] for tag_item in tags_response.data] if tags_response.data else []
        
        return property_data
    except Exception as e:
        print(f"Error getting property from Supabase: {e}")
        return None

def create_property(property_data):
    """Create a new property in Supabase."""
    try:
        supabase = get_supabase()
        
        # Generate property ID if not provided
        property_id = property_data.get("id") or str(uuid.uuid4())
        
        # Generate slug if not provided
        slug = property_data.get("slug")
        if not slug:
            slug = slugify(property_data["title"])
            property_data["slug"] = slug
        
        # Set timestamps
        now = datetime.now().isoformat()
        if not property_data.get("created_at"):
            property_data["created_at"] = now
        if not property_data.get("updated_at"):
            property_data["updated_at"] = now
        
        # Prepare property object
        property_obj = {
            "id": property_id,
            "title": property_data["title"],
            "slug": property_data["slug"],
            "description": property_data["description"],
            "property_type_id": property_data["property_type"]["id"] if property_data.get("property_type") else None,
            "location_id": property_data["location"]["id"] if property_data.get("location") else None,
            "neighborhood": property_data.get("neighborhood"),
            "address": property_data.get("address"),
            "price": property_data["price"],
            "bedrooms": property_data["bedrooms"],
            "bathrooms": property_data["bathrooms"],
            "area": property_data["area"],
            "property_video_url": property_data.get("property_video_url"),
            "drone_video_url": property_data.get("drone_video_url"),
            "virtual_tour_url": property_data.get("virtual_tour_url"),
            "status": property_data.get("status") or "draft",
            "created_at": property_data["created_at"],
            "updated_at": property_data["updated_at"],
            "published_at": property_data.get("published_at")
        }
        
        # Insert property
        response = supabase.table("cms_properties").insert(property_obj).execute()
        
        if not response.data:
            print(f"Warning: No response data after inserting property {property_id}")
        
        # Insert features
        if property_data.get("features"):
            for feature in property_data["features"]:
                feature_id = feature["id"] if isinstance(feature, dict) and "id" in feature else feature
                feature_obj = {
                    "property_id": property_id,
                    "feature_id": feature_id
                }
                supabase.table("property_features").insert(feature_obj).execute()
        
        # Insert images
        if property_data.get("images"):
            for idx, image in enumerate(property_data["images"]):
                image_id = image.get("id") or str(uuid.uuid4())
                is_main = image.get("is_main") if "is_main" in image else (idx == 0)  # First image is main by default
                image_obj = {
                    "id": image_id,
                    "property_id": property_id,
                    "url": image.get("url", ""),
                    "caption": image.get("caption"),
                    "is_main": is_main
                }
                supabase.table("property_images").insert(image_obj).execute()
        
        # Insert investment metrics
        if property_data.get("investment_metrics") or property_data.get("analysis"):
            metrics_list = property_data.get("investment_metrics") or \
                          (property_data.get("analysis", {}).get("investmentMetrics") if property_data.get("analysis") else [])
            
            for metric in metrics_list:
                metric_id = metric.get("id") or str(uuid.uuid4())
                metric_obj = {
                    "id": metric_id,
                    "property_id": property_id,
                    "type": metric.get("type", ""),
                    "value": metric.get("value", ""),
                    "percentage": metric.get("percentage", ""),
                    "description": metric.get("description", "")
                }
                supabase.table("property_investment_metrics").insert(metric_obj).execute()
        
        # Insert tags
        if property_data.get("tags"):
            for tag in property_data["tags"]:
                tag_obj = {
                    "property_id": property_id,
                    "tag": tag
                }
                supabase.table("property_tags").insert(tag_obj).execute()
        
        # Return created property
        return get_property(property_id)
    except Exception as e:
        print(f"Error creating property in Supabase: {e}")
        return None

def update_property(property_id, property_data):
    """Update a property in Supabase."""
    try:
        supabase = get_supabase()
        
        # Set updated timestamp
        property_data["updated_at"] = datetime.now().isoformat()
        
        # Prepare property object
        property_obj = {
            "title": property_data["title"],
            "description": property_data["description"],
            "property_type_id": property_data["property_type"]["id"] if property_data.get("property_type") else None,
            "location_id": property_data["location"]["id"] if property_data.get("location") else None,
            "neighborhood": property_data.get("neighborhood"),
            "address": property_data.get("address"),
            "price": property_data["price"],
            "bedrooms": property_data["bedrooms"],
            "bathrooms": property_data["bathrooms"],
            "area": property_data["area"],
            "property_video_url": property_data.get("property_video_url"),
            "drone_video_url": property_data.get("drone_video_url"),
            "virtual_tour_url": property_data.get("virtual_tour_url"),
            "status": property_data.get("status"),
            "updated_at": property_data["updated_at"],
        }
        
        if property_data.get("published_at"):
            property_obj["published_at"] = property_data["published_at"]
        
        # Update property
        response = supabase.table("cms_properties").update(property_obj).eq("id", property_id).execute()
        
        # Update features - delete existing and insert new
        supabase.table("property_features").delete().eq("property_id", property_id).execute()
        if property_data.get("features"):
            for feature in property_data["features"]:
                feature_id = feature["id"] if isinstance(feature, dict) and "id" in feature else feature
                feature_obj = {
                    "property_id": property_id,
                    "feature_id": feature_id
                }
                supabase.table("property_features").insert(feature_obj).execute()
        
        # Update images - delete existing and insert new
        supabase.table("property_images").delete().eq("property_id", property_id).execute()
        if property_data.get("images"):
            for idx, image in enumerate(property_data["images"]):
                image_id = image.get("id") or str(uuid.uuid4())
                is_main = image.get("is_main") if "is_main" in image else (idx == 0)  # First image is main by default
                image_obj = {
                    "id": image_id,
                    "property_id": property_id,
                    "url": image.get("url", ""),
                    "caption": image.get("caption"),
                    "is_main": is_main
                }
                supabase.table("property_images").insert(image_obj).execute()
        
        # Update investment metrics - delete existing and insert new
        supabase.table("property_investment_metrics").delete().eq("property_id", property_id).execute()
        if property_data.get("investment_metrics") or property_data.get("analysis"):
            metrics_list = property_data.get("investment_metrics") or \
                          (property_data.get("analysis", {}).get("investmentMetrics") if property_data.get("analysis") else [])
            
            for metric in metrics_list:
                metric_id = metric.get("id") or str(uuid.uuid4())
                metric_obj = {
                    "id": metric_id,
                    "property_id": property_id,
                    "type": metric.get("type", ""),
                    "value": metric.get("value", ""),
                    "percentage": metric.get("percentage", ""),
                    "description": metric.get("description", "")
                }
                supabase.table("property_investment_metrics").insert(metric_obj).execute()
        
        # Update tags - delete existing and insert new
        supabase.table("property_tags").delete().eq("property_id", property_id).execute()
        if property_data.get("tags"):
            for tag in property_data["tags"]:
                tag_obj = {
                    "property_id": property_id,
                    "tag": tag
                }
                supabase.table("property_tags").insert(tag_obj).execute()
        
        # Return updated property
        return get_property(property_id)
    except Exception as e:
        print(f"Error updating property in Supabase: {e}")
        return None

def delete_property(property_id):
    """Delete a property from Supabase."""
    try:
        supabase = get_supabase()
        
        # Delete property features
        supabase.table("property_features").delete().eq("property_id", property_id).execute()
        
        # Delete property images
        supabase.table("property_images").delete().eq("property_id", property_id).execute()
        
        # Delete property investment metrics
        supabase.table("property_investment_metrics").delete().eq("property_id", property_id).execute()
        
        # Delete property tags
        supabase.table("property_tags").delete().eq("property_id", property_id).execute()
        
        # Delete property
        response = supabase.table("cms_properties").delete().eq("id", property_id).execute()
        
        return {"success": True, "message": "Property deleted successfully"}
    except Exception as e:
        print(f"Error deleting property from Supabase: {e}")
        return {"success": False, "message": f"Error deleting property: {str(e)}"}

# Database Setup
def setup_cms_database():
    """Set up the CMS database in Supabase."""
    try:
        # We'll use the schema setup function from the other module
        try:
            from app.apis.supabase_schema import setup_supabase_schema
            result = setup_supabase_schema()
            if not result.get("success"):
                print(f"Schema setup failed: {result.get('error')}")
                # Continue anyway to set up initial data
        except Exception as schema_error:
            print(f"Error with schema setup: {schema_error}")
            # Continue with setup even if schema creation failed
        
        # Check if we have property types
        property_types = get_property_types()
        if len(property_types["property_types"]) == 0:
            # Add some default property types
            default_types = [
                ("Mansion", "Luxurious standalone residences with multiple rooms and amenities"),
                ("Penthouse", "Luxury apartments on the top floors with panoramic views"),
                ("Waterfront Villa", "Exclusive properties located along the waterfront"),
                ("Luxury Apartment", "High-end apartments with premium amenities")
            ]
            
            for name, desc in default_types:
                create_property_type(name, desc)
        
        # Check if we have locations
        locations = get_locations()
        if len(locations["locations"]) == 0:
            # Add some default locations
            default_locations = [
                ("Lago Sul", "Elegante área residencial à beira do lago", -15.8335, -47.8731),
                ("Lago Norte", "Área exclusiva com vista para o lago Paranoá", -15.7403, -47.8333),
                ("Park Way", "Bairro de mansões com amplas áreas verdes", -15.9001, -47.9669),
                ("Setor Noroeste", "Bairro planejado com construções modernas", -15.7609, -47.9204)
            ]
            
            for name, desc, lat, lng in default_locations:
                create_location(name, desc, lat, lng)
        
        # Check if we have features
        features = get_features()
        if len(features["features"]) == 0:
            # Add some default features
            default_features = [
                ("Swimming Pool", "pool"),
                ("Gym", "fitness"),
                ("Home Theater", "theater"),
                ("Garden", "garden"),
                ("Sauna", "sauna"),
                ("Wine Cellar", "wine")
            ]
            
            for name, icon in default_features:
                create_feature(name, icon)
        
        return {
            "status": "success",
            "message": "CMS database initialized successfully",
            "details": {
                "property_types": get_property_types()["count"],
                "locations": get_locations()["count"],
                "features": get_features()["count"]
            }
        }
    except Exception as e:
        print(f"Error setting up CMS database: {e}")
        return {
            "status": "error",
            "message": "Failed to set up CMS database",
            "error": str(e)
        }
