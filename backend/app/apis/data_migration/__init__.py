"""Data migration API for LuxuryVista.

This API provides tools to migrate data between different systems.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import databutton as db
import json
import uuid
from datetime import datetime
import logging
import re

# Import utilities
from app.apis.utils import get_supabase

# Define slugify function locally to avoid circular imports
def slugify(text):
    """Convert text to slug format"""
    if not text:
        return ""
    text = str(text).lower()  # Handle non-string input
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text
# Import individually to force complete module reload
import app.apis.supabase_cms

# Assign functions to local variables
get_cms_property_types = app.apis.supabase_cms.get_property_types
create_cms_property_type = app.apis.supabase_cms.create_property_type
get_cms_locations = app.apis.supabase_cms.get_locations
create_cms_location = app.apis.supabase_cms.create_location
get_cms_features = app.apis.supabase_cms.get_features
create_cms_feature = app.apis.supabase_cms.create_feature

router = APIRouter(prefix="/migration")

# Models
class MigrationResponse(BaseModel):
    status: str
    message: str
    details: Optional[Dict[str, Any]] = None

# Utility functions
def get_strapi_data():
    """Get property data from Strapi storage."""
    try:
        # Try to load from Databutton storage
        strapi_json = db.storage.text.get("strapi_properties.json", default="{}")
        strapi_data = json.loads(strapi_json)
        return strapi_data.get("properties", [])
    except Exception as e:
        print(f"Error loading Strapi data: {e}")
        return []

def get_or_create_property_type(name, description=""):
    """Get an existing property type or create a new one."""
    # Get existing property types
    response = get_cms_property_types()
    property_types = response.get("property_types", [])
    
    # Look for a match by name
    for prop_type in property_types:
        if prop_type["name"].lower() == name.lower():
            return prop_type
    
    # Create a new property type if not found
    new_type = create_cms_property_type(name, description)
    return new_type

def get_or_create_location(name, description="", latitude=None, longitude=None):
    """Get an existing location or create a new one."""
    # Get existing locations
    response = get_cms_locations()
    locations = response.get("locations", [])
    
    # Look for a match by name
    for location in locations:
        if location["name"].lower() == name.lower():
            return location
    
    # Create a new location if not found
    new_location = create_cms_location(name, description, latitude, longitude)
    return new_location

def get_or_create_feature(name, icon=None):
    """Get an existing feature or create a new one."""
    # Get existing features
    response = get_cms_features()
    features = response.get("features", [])
    
    # Look for a match by name
    for feature in features:
        if feature["name"].lower() == name.lower():
            return feature
    
    # Create a new feature if not found
    new_feature = create_cms_feature(name, icon)
    return new_feature

# Migration endpoints
@router.post("/strapi-to-cms", response_model=MigrationResponse)
def migrate_from_strapi(background_tasks: BackgroundTasks):
    """Migrate data from Strapi to the Wagtail-like CMS"""
    try:
        # Start migration in background task to prevent timeout
        background_tasks.add_task(run_strapi_migration)
        
        return MigrationResponse(
            status="success",
            message="Migration process started in the background. Check logs for progress."
        )
    except Exception as e:
        print(f"Error starting migration: {e}")
        return MigrationResponse(
            status="error",
            message=f"Failed to start migration: {str(e)}"
        )

def run_strapi_migration():
    """Execute the migration from Strapi to CMS"""
    try:
        # Get Strapi data
        strapi_properties = get_strapi_data()
        
        if not strapi_properties:
            print("No Strapi properties found for migration")
            return
        
        print(f"Starting migration of {len(strapi_properties)} properties from Strapi to CMS")
        
        # Get Supabase client
        supabase = get_supabase()
        
        # Process each property
        success_count = 0
        error_count = 0
        
        for idx, property_data in enumerate(strapi_properties):
            try:
                print(f"Processing property {idx+1}/{len(strapi_properties)}: {property_data.get('title', 'Unnamed')}")
                
                # Prepare property data
                property_id = property_data.get("id") or str(uuid.uuid4())
                
                # Get or create property type
                property_type = None
                if property_data.get("type"):
                    property_type = get_or_create_property_type(
                        name=property_data["type"].get("name", "Unknown"),
                        description=property_data["type"].get("description", f"Luxury {property_data['type'].get('name', 'property')}")
                    )
                else:
                    # Default property type
                    property_type = get_or_create_property_type("Luxury Residence", "High-end luxury residence")
                
                # Get or create location
                location = None
                if property_data.get("location"):
                    location = get_or_create_location(
                        name=property_data["location"].get("name", "Unknown"),
                        description=property_data["location"].get("description", f"Located in {property_data['location'].get('name', 'Unknown')}"),
                        latitude=property_data["location"].get("latitude"),
                        longitude=property_data["location"].get("longitude")
                    )
                else:
                    # Default location
                    location = get_or_create_location("Brasília", "The capital city of Brazil", -15.7801, -47.9292)
                
                # Process features
                feature_ids = []
                if property_data.get("features"):
                    for feature_name in property_data["features"]:
                        feature = get_or_create_feature(feature_name)
                        if feature:
                            feature_ids.append(feature["id"])
                
                # Create slug if not present
                slug = property_data.get("slug")
                if not slug:
                    slug = slugify(property_data.get("title", f"property-{property_id}"))
                
                # Format timestamps
                now = datetime.now().isoformat()
                created_at = property_data.get("created_at") or now
                updated_at = property_data.get("updated_at") or now
                published_at = property_data.get("published_at") or now
                
                # Prepare property record
                new_property = {
                    "id": property_id,
                    "title": property_data.get("title", ""),
                    "slug": slug,
                    "description": property_data.get("description", ""),
                    "property_type_id": property_type.get("id") if property_type else None,
                    "location_id": location.get("id") if location else None,
                    "neighborhood": property_data.get("neighborhood", ""),
                    "address": property_data.get("address", ""),
                    "price": property_data.get("price", 0),
                    "bedrooms": property_data.get("bedrooms", 0),
                    "bathrooms": property_data.get("bathrooms", 0),
                    "area": property_data.get("area", 0),
                    "property_video_url": property_data.get("property_video_url"),
                    "drone_video_url": property_data.get("drone_video_url"),
                    "virtual_tour_url": property_data.get("virtual_tour_url"),
                    "status": property_data.get("status", "published"),
                    "created_at": created_at,
                    "updated_at": updated_at,
                    "published_at": published_at
                }
                
                # Insert property into cms_properties table
                response = supabase.table("cms_properties").upsert(new_property).execute()
                
                if not response.data:
                    print(f"Warning: No response data after inserting property {property_id}")
                
                # Process images
                if property_data.get("images"):
                    for idx, image in enumerate(property_data["images"]):
                        image_id = image.get("id") or str(uuid.uuid4())
                        is_main = idx == 0  # First image is main
                        
                        new_image = {
                            "id": image_id,
                            "property_id": property_id,
                            "url": image.get("url", ""),
                            "caption": image.get("caption"),
                            "is_main": is_main
                        }
                        
                        supabase.table("property_images").upsert(new_image).execute()
                
                # Process feature relationships
                for feature_id in feature_ids:
                    supabase.table("property_features").upsert({
                        "property_id": property_id,
                        "feature_id": feature_id
                    }).execute()
                
                # Process investment metrics
                if property_data.get("analysis") and property_data["analysis"].get("investmentMetrics"):
                    for metric in property_data["analysis"]["investmentMetrics"]:
                        metric_id = metric.get("id") or str(uuid.uuid4())
                        
                        new_metric = {
                            "id": metric_id,
                            "property_id": property_id,
                            "type": metric.get("type", ""),
                            "value": metric.get("value", ""),
                            "percentage": metric.get("percentage", ""),
                            "description": ""
                        }
                        
                        supabase.table("property_investment_metrics").upsert(new_metric).execute()
                
                # Process tags
                if property_data.get("tags"):
                    for tag in property_data["tags"]:
                        supabase.table("property_tags").upsert({
                            "property_id": property_id,
                            "tag": tag
                        }).execute()
                
                success_count += 1
                print(f"Successfully migrated property: {property_data.get('title')}")
                
            except Exception as e:
                error_count += 1
                print(f"Error migrating property {property_data.get('title', 'Unknown')}: {e}")
        
        migration_summary = {
            "total": len(strapi_properties),
            "success": success_count,
            "errors": error_count
        }
        
        # Save migration summary to storage
        db.storage.json.put("migration_summary", migration_summary)
        
        print(f"Migration completed: {success_count} successful, {error_count} failed")
        
    except Exception as e:
        print(f"Migration process failed: {e}")
        db.storage.json.put("migration_error", {"error": str(e)})
