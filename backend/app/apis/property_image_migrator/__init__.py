#!/usr/bin/env python3
"""
Supabase Storage to Database Image Migration Module
--------------------------------------------------

This API module migrates images from Supabase storage bucket to property_images database table.
It fixes the issue where images exist in storage but aren't properly linked in the database.
"""

import logging
import re
import json
import time
import traceback
import uuid
from typing import List, Dict, Any, Optional, Tuple

from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from pydantic import BaseModel, Field
import databutton as db

from ..utils import sanitize_storage_key

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
PROPERTY_ID_PATTERNS = [
    r'property[-_]([a-zA-Z0-9-]+)',  # property-123-abc or property_123-abc
    r'([a-zA-Z0-9-]+)[-_]property',  # 123-abc-property or 123-abc_property
    r'prop[-_]([a-zA-Z0-9-]+)',      # prop-123-abc or prop_123-abc
    r'([a-zA-Z0-9-]+)'               # Fallback: just get the first alphanumeric chunk
]

IMAGE_EXTENSIONS = r'\.(jpg|jpeg|png|gif|webp)$'
BATCH_SIZE = 50

# Create router
router = APIRouter(prefix="/property-image-migrator", tags=["property-images"])

# Import necessary libraries
try:
    from supabase import create_client
except ImportError:
    logger.error("Supabase client not installed")
    raise ImportError("Supabase client not installed. Install with: pip install supabase")


from ..utils import get_supabase


def ensure_property_images_table(supabase) -> bool:
    """Ensure the property_images table exists with the correct structure"""
    try:
        # Check if table exists by querying it
        supabase.table("property_images").select("count", count="exact").limit(1).execute()
        return True
    except Exception as e:
        if "relation \"property_images\" does not exist" in str(e):
            logger.error("property_images table doesn't exist. Please create it in Supabase.")
            return False
        else:
            logger.error(f"Error checking property_images table: {e}")
            return False


def extract_property_id(filename: str) -> Optional[str]:
    """Extract property ID from image filename using regex"""
    # Try different patterns from constants
    for pattern in PROPERTY_ID_PATTERNS:
        match = re.search(pattern, filename)
        if match:
            return match.group(1)
    
    return None


def get_order_index(index: int, is_main: bool) -> int:
    """Get the order index for an image, ensuring main image is first"""
    if is_main:
        return 0
    return index + 1 if index >= 0 else 1


def get_properties_from_db(supabase, page_size: int = 100) -> List[Dict[str, Any]]:
    """Get all properties from the database with pagination"""
    try:
        properties = []
        page = 0
        
        while True:
            response = supabase.table("properties") \
                .select("*") \
                .range(page * page_size, (page + 1) * page_size - 1) \
                .execute()
                
            if not response or not response.data:
                break
                
            properties.extend(response.data)
            
            # If we got fewer results than requested, we've reached the end
            if len(response.data) < page_size:
                break
                
            page += 1
            
        return properties
    except Exception as e:
        logger.error(f"Error fetching properties: {e}")
        return []


def get_existing_property_images(supabase, property_id: Optional[str] = None) -> Dict[str, List[Dict[str, Any]]]:
    """Get existing property images from the database, indexed by property_id"""
    try:
        query = supabase.table("property_images").select("*")
        if property_id:
            query = query.eq("property_id", property_id)
        
        response = query.execute()
        
        # Index by property_id
        result = {}
        if response and response.data:
            for img in response.data:
                prop_id = img.get("property_id")
                if prop_id:
                    if prop_id not in result:
                        result[prop_id] = []
                    result[prop_id].append(img)
        
        return result
    except Exception as e:
        logger.error(f"Error fetching existing property images: {e}")
        return {}


def get_storage_images(supabase) -> List[Dict[str, Any]]:
    """Get all images from Supabase storage"""
    try:
        # Get list of buckets
        buckets_response = supabase.storage.list_buckets()
        
        all_images = []
        for bucket in buckets_response:
            bucket_name = bucket.get("name")
            try:
                # List files in this bucket (recursively for nested folders)
                paths_to_check = [""]  # Start with root path
                processed_paths = set()
                
                while paths_to_check:
                    current_path = paths_to_check.pop(0)
                    
                    if current_path in processed_paths:
                        continue
                    
                    processed_paths.add(current_path)
                    prefix = f"{current_path}/" if current_path else ""
                    
                    try:
                        files_response = supabase.storage.from_(bucket_name).list(path=current_path)
                        
                        for file in files_response:
                            # Check if it's a folder
                            if file.get("id") is None and file.get("name"):
                                new_path = f"{prefix}{file.get('name')}"
                                paths_to_check.append(new_path)
                                continue
                                
                            # Skip if not an image
                            filename = file.get("name")
                            if not filename:
                                continue
                            
                            if not re.search(IMAGE_EXTENSIONS, filename.lower()):
                                continue
                            
                            # Add bucket info to file data
                            file["bucket"] = bucket_name
                            full_path = f"{prefix}{filename}"
                            file["full_path"] = full_path
                            file["public_url"] = supabase.storage.from_(bucket_name).get_public_url(full_path)
                            
                            # Extract property ID from filename
                            property_id = extract_property_id(filename)
                            if property_id:
                                file["property_id"] = property_id
                            
                            all_images.append(file)
                    except Exception as e:
                        logger.warning(f"Error listing files in path {current_path} of bucket {bucket_name}: {e}")
            except Exception as e:
                logger.error(f"Error processing bucket {bucket_name}: {e}")
        
        return all_images
    except Exception as e:
        logger.error(f"Error listing storage buckets: {e}")
        return []


def create_property_images_batch(supabase, image_data_batch: List[Dict[str, Any]]) -> int:
    """Create multiple property image entries in the database at once"""
    if not image_data_batch:
        return 0
        
    try:
        result = supabase.table("property_images").insert(image_data_batch).execute()
        return len(result.data) if result and result.data else 0
    except Exception as e:
        logger.error(f"Error creating property images batch: {e}")
        return 0


def update_property_images_batch(supabase, images_to_update: List[Tuple[str, Dict[str, Any]]]) -> int:
    """Update multiple property image entries in the database
    
    Args:
        supabase: Supabase client
        images_to_update: List of tuples (image_id, image_data)
        
    Returns:
        Number of successfully updated images
    """
    if not images_to_update:
        return 0
        
    updated_count = 0
    
    # Process in smaller batches to avoid overwhelming the database
    for i in range(0, len(images_to_update), BATCH_SIZE):
        batch = images_to_update[i:i + BATCH_SIZE]
        
        try:
            # Unfortunately Supabase doesn't support batch updates with different conditions
            # so we have to do them one by one
            for image_id, image_data in batch:
                result = supabase.table("property_images").update(image_data).eq("id", image_id).execute()
                if result and result.data:
                    updated_count += 1
        except Exception as e:
            logger.error(f"Error updating property images batch: {e}")
    
    return updated_count


def migrate_images(
    supabase, 
    specific_property_id: Optional[str] = None,
    force_update: bool = False,
    dry_run: bool = False,
    progress_tracker: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Migrate images from storage to database"""
    try:
        # Update progress if tracking enabled
        def update_progress(status=None, **kwargs):
            if progress_tracker:
                if status:
                    progress_tracker["status"] = status
                progress_tracker.update(kwargs)
                progress_tracker["last_update"] = time.time()
                db.storage.json.put(sanitize_storage_key(progress_tracker["progress_key"]), progress_tracker)
        
        # Ensure the property_images table exists
        if not ensure_property_images_table(supabase):
            update_progress(status="failed", error="property_images table missing")
            return {
                "success": False,
                "message": "property_images table doesn't exist or can't be accessed",
                "sql_needed": True
            }
        
        # Get properties from database for validation
        properties = get_properties_from_db(supabase)
        valid_property_ids = {str(p.get("id")): p for p in properties if p.get("id")}
        logger.info(f"Found {len(valid_property_ids)} valid properties in database")
        update_progress(total_properties=len(valid_property_ids))
        
        # Get existing property images
        existing_images = get_existing_property_images(supabase, specific_property_id)
        logger.info(f"Found existing images for {len(existing_images)} properties")
        
        # Get all images from storage
        storage_images = get_storage_images(supabase)
        logger.info(f"Found {len(storage_images)} images in storage")
        update_progress(existing_properties=len(existing_images), total_images=len(storage_images))
        
        # Process images
        images_created = 0
        images_updated = 0
        errors = []
        properties_processed = set()
        
        # Group images by property_id
        images_by_property = {}
        for img in storage_images:
            prop_id = img.get("property_id")
            if not prop_id:
                continue
                
            # Validate property ID exists
            if prop_id not in valid_property_ids and not force_update:
                errors.append(f"Property ID {prop_id} not found in database")
                continue
                
            if prop_id not in images_by_property:
                images_by_property[prop_id] = []
            images_by_property[prop_id].append(img)
        
        # If specific property ID is provided, filter to just that one
        if specific_property_id:
            if specific_property_id in images_by_property:
                images_by_property = {specific_property_id: images_by_property[specific_property_id]}
            else:
                update_progress(status="failed", error=f"No images for property {specific_property_id}")
                return {
                    "success": False,
                    "message": f"No images found for property ID {specific_property_id}"
                }
        
        # Process each property's images
        property_count = 0
        for prop_id, images in images_by_property.items():
            try:
                # Update progress
                property_count += 1
                update_progress(
                    processed_properties=property_count, 
                    current_property=prop_id, 
                    total_properties_to_process=len(images_by_property)
                )
                
                existing_for_property = existing_images.get(prop_id, [])
                existing_urls = {img.get("url") for img in existing_for_property if img.get("url")}
                existing_ids = {img.get("id"): img for img in existing_for_property if img.get("id")}
                
                # Sort images by name to establish an order
                images.sort(key=lambda x: x.get("name", ""))
                
                # Prepare batch operations
                images_to_create = []
                images_to_update = []
                
                for i, img in enumerate(images):
                    public_url = img.get("public_url")
                    
                    if not public_url:
                        continue
                    
                    # Check if this URL already exists
                    if public_url in existing_urls and not force_update:
                        continue
                    
                    # Create image ID
                    image_id = f"img-{i}-{prop_id}"
                    
                    # Create image data
                    image_data = {
                        "id": image_id,
                        "property_id": prop_id,
                        "url": public_url,
                        "caption": f"Property View {i+1}",
                        "is_main": i == 0,  # First image is main
                        "order_index": get_order_index(i, i == 0)
                    }
                    
                    # If dry run, just log what would happen
                    if dry_run:
                        action = "Update" if image_id in existing_ids else "Create"
                        logger.info(f"{action} image {image_id} for property {prop_id}: {public_url}")
                        continue
                    
                    # Add to appropriate batch
                    if image_id in existing_ids:
                        images_to_update.append((image_id, image_data))
                    else:
                        images_to_create.append(image_data)
                    
                    # Process batches when they reach the batch size
                    if len(images_to_create) >= BATCH_SIZE:
                        created = create_property_images_batch(supabase, images_to_create)
                        images_created += created
                        images_to_create = []
                        update_progress(images_created=images_created)
                    
                    if len(images_to_update) >= BATCH_SIZE:
                        updated = update_property_images_batch(supabase, images_to_update)
                        images_updated += updated
                        images_to_update = []
                        update_progress(images_updated=images_updated)
                
                # Process remaining items
                if images_to_create:
                    created = create_property_images_batch(supabase, images_to_create)
                    images_created += created
                    update_progress(images_created=images_created)
                
                if images_to_update:
                    updated = update_property_images_batch(supabase, images_to_update)
                    images_updated += updated
                    update_progress(images_updated=images_updated)
                
                properties_processed.add(prop_id)
                
            except Exception as e:
                error_msg = f"Error processing property {prop_id}: {str(e)}"
                logger.error(error_msg)
                errors.append(error_msg)
                update_progress(errors=errors)
        
        result = {
            "success": True,
            "message": f"Processed {len(properties_processed)} properties, created {images_created} images, updated {images_updated} images",
            "properties_processed": len(properties_processed),
            "images_created": images_created,
            "images_updated": images_updated,
            "errors": errors if errors else None,
            "dry_run": dry_run
        }
        
        update_progress(status="completed", result=result)
        return result
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error in migrate_images: {e}\nStack trace: {error_details}")
        
        if progress_tracker:
            progress_tracker["status"] = "failed"
            progress_tracker["error"] = str(e)
            progress_tracker["completed_at"] = time.time()
            db.storage.json.put(sanitize_storage_key(progress_tracker["progress_key"]), progress_tracker)
            
        return {"success": False, "message": f"Error: {str(e)}"}


# Request model for property image migration
class PropertyImageMigrationRequest(BaseModel):
    property_id: Optional[str] = Field(None, description="Specific property ID to migrate images for")
    force_update: bool = Field(False, description="Force update of existing images")
    dry_run: bool = Field(False, description="Show what would be migrated without making changes")


# Endpoint to migrate property images
@router.post("/migrate-images")
async def migrate_property_images(request: PropertyImageMigrationRequest) -> Dict[str, Any]:
    """Migrate images from Supabase storage to the property_images database table.
    
    This endpoint will:
    1. Scan all Supabase storage buckets for image files
    2. Extract property IDs from filenames
    3. Create entries in the property_images table for each image
    4. Link each image to its corresponding property
    """
    try:
        # Get Supabase client
        supabase = get_supabase()
        if not supabase:
            return {"success": False, "message": "Supabase client not available"}
        
        # Create progress tracker
        progress_key = f"image_migration_progress_{uuid.uuid4().hex}"
        progress_tracker = {
            "progress_key": progress_key,
            "status": "pending",
            "started_at": time.time(),
            "property_id": request.property_id,
            "force_update": request.force_update,
            "dry_run": request.dry_run,
            "last_update": time.time()
        }
        
        # Store initial progress
        db.storage.json.put(sanitize_storage_key(progress_key), progress_tracker)
        
        # Update status to running
        progress_tracker["status"] = "running"
        db.storage.json.put(sanitize_storage_key(progress_key), progress_tracker)
        
        # Migrate images
        result = migrate_images(
            supabase,
            specific_property_id=request.property_id,
            force_update=request.force_update,
            dry_run=request.dry_run,
            progress_tracker=progress_tracker
        )
        
        # Add progress key to the result
        result["progress_key"] = progress_key
        
        return result
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error migrating property images: {e}\nStack trace: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error migrating property images: {str(e)}") from e


# Endpoint to run a background image migration
@router.post("/migrate-images-background")
async def migrate_property_images_background(request: PropertyImageMigrationRequest, background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """Start a background task to migrate images from Supabase storage to the property_images database table."""
    try:
        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return {"success": False, "message": "Supabase client not available"}
        
        # Create progress tracker
        progress_key = f"image_migration_progress_{uuid.uuid4().hex}"
        progress_tracker = {
            "progress_key": progress_key,
            "status": "pending",
            "started_at": time.time(),
            "property_id": request.property_id,
            "force_update": request.force_update,
            "dry_run": request.dry_run,
            "last_update": time.time()
        }
        
        # Store initial progress
        db.storage.json.put(sanitize_storage_key(progress_key), progress_tracker)
        
        # Define the background task
        def background_migration():
            try:
                logger.info(f"Starting background image migration at {time.strftime('%Y-%m-%d %H:%M:%S')}")
                progress_tracker["status"] = "running"
                
                result = migrate_images(
                    supabase,
                    specific_property_id=request.property_id,
                    force_update=request.force_update,
                    dry_run=request.dry_run,
                    progress_tracker=progress_tracker
                )
                
                logger.info(f"Background image migration completed: {json.dumps(result)}")
                
                # Add completion time to progress tracker
                progress_tracker["completed_at"] = time.time()
                progress_tracker["status"] = "completed" 
                progress_tracker["result"] = result
                db.storage.json.put(sanitize_storage_key(progress_key), progress_tracker)
                
                # Store the result separately for backward compatibility
                result_key = f"image_migration_result_{int(time.time())}"
                db.storage.json.put(sanitize_storage_key(result_key), result)
                logger.info(f"Migration result stored at key: {result_key}")
            except Exception as e:
                error_details = traceback.format_exc()
                logger.error(f"Error in background migration: {e}\nStack trace: {error_details}")
                
                # Update progress tracker with error
                progress_tracker["status"] = "failed"
                progress_tracker["error"] = str(e)
                progress_tracker["error_details"] = error_details
                progress_tracker["completed_at"] = time.time()
                db.storage.json.put(sanitize_storage_key(progress_key), progress_tracker)
        
        # Add the task to background tasks
        background_tasks.add_task(background_migration)
        
        return {
            "success": True,
            "message": "Background image migration started",
            "property_id": request.property_id,
            "force_update": request.force_update,
            "dry_run": request.dry_run,
            "progress_key": progress_key  # Return the progress key so client can track progress
        }
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error starting background migration: {e}\nStack trace: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error starting background migration: {str(e)}") from e


# SQL template for creating the property_images table
property_images_table_sql = """
CREATE TABLE IF NOT EXISTS public.property_images (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES public.properties(id),
    url TEXT NOT NULL,
    caption TEXT,
    is_main BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);

-- Set up RLS policies
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Allow read access for all authenticated users
CREATE POLICY "Allow read access for all users" 
ON public.property_images FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update/delete for service role only
CREATE POLICY "Allow full access for service role" 
ON public.property_images USING (auth.role() = 'service_role');
"""


# Endpoint to get the SQL needed to create the property_images table
@router.get("/property-images-table-sql")
async def get_property_images_table_sql() -> Dict[str, Any]:
    """Get the SQL needed to create the property_images table in Supabase."""
    return {
        "success": True,
        "sql": property_images_table_sql
    }


# Endpoint to check migration progress
@router.get("/migration-progress/{progress_key}")
async def get_migration_progress(progress_key: str) -> Dict[str, Any]:
    """Get the progress of an ongoing or completed migration."""
    try:
        # Sanitize the progress key
        sanitized_key = sanitize_storage_key(progress_key)
        
        # Try to get the progress data
        try:
            progress_data = db.storage.json.get(sanitized_key)
            return {
                "success": True, 
                "progress": progress_data
            }
        except FileNotFoundError:
            return {
                "success": False,
                "message": f"No progress data found for key: {progress_key}"
            }
            
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error fetching migration progress: {e}\nStack trace: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error fetching migration progress: {str(e)}") from e
