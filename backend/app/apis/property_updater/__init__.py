"""API for updating and regenerating all properties with enhanced data"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import json
import asyncio
import databutton as db
import traceback

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel

# Import models from shared module first to avoid undefined references
# Import models from safe_imports to avoid circular imports
try:
    from ..shared import (
        PropertyUpdateRequest,
        RegeneratePropertiesRequest,
        RegeneratePropertiesResponse,
        FixPropertyImagesRequest,
        FixPropertyImagesResponse,
        PropertyImage,
        PropertyType,
        Location,
        Feature,
        InvestmentMetric,
        GeneratePropertiesRequest,
        SeoTitleSubtitleSuggestionRequest,
        SeoSuggestion,
        BaseResponse
    )
except ImportError:
    print("Could not import from shared module, will use fallback implementations")
    
    # Fallback implementations
    class BaseResponse(BaseModel):
        """Base response model for API responses"""
        success: bool = True
        message: str = ""
        error: Optional[str] = None
    
    class SeoSuggestion(BaseModel):
        """SEO suggestion model for property titles and subtitles"""
        title: str
        subtitle: str
    
    class SeoTitleSubtitleSuggestionRequest(BaseModel):
        """Request model for SEO title/subtitle suggestions"""
        property_type: str
        location: str
        language: str = "pt"

# Import utilities from common_imports module for safe dynamic imports
try:
    from ..common_imports import import_functions_safely, import_function_safely, sanitize_storage_key, get_supabase, sync_properties_to_storage, get_openai_client
except ImportError:
    print("Could not import from common_imports, using fallback implementations")
    
    # Fallback implementations
    def import_functions_safely(module_path, function_names):
        return [None] * len(function_names)
        
    def import_function_safely(module_path, function_name):
        return None
        
    def sanitize_storage_key(key):
        import re
        return re.sub(r'[^a-zA-Z0-9._-]', '', key)
        
    def get_supabase():
        return None
        
    def sync_properties_to_storage(properties):
        return 0
        
    def get_openai_client():
        try:
            import databutton as db
            from openai import OpenAI
            return OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))
        except Exception:
            return None

# Import utils
# Safe property format update function
def update_property_format(property_data):
    """Update property format to current version"""
    import uuid
    
    if not property_data:
        return property_data
        
    # Make a copy to avoid modifying the original
    updated_property = dict(property_data)
    
    # Ensure all required fields exist
    for field in ["id", "title", "subtitle", "description", "price", "images"]:
        if field not in updated_property:
            if field == "id":
                updated_property["id"] = f"prop-{uuid.uuid4()}"
            elif field == "images":
                updated_property["images"] = []
            else:
                updated_property[field] = ""
    
    # Handle images specifically - ensure they're in a consistent format
    if "images" in updated_property:
        images = updated_property["images"]
        formatted_images = []
        
        if isinstance(images, list):
            for i, img in enumerate(images):
                if isinstance(img, str):
                    # Convert string URLs to object format
                    formatted_images.append({
                        "id": f"img-{i}-{updated_property['id']}",
                        "url": img,
                        "caption": f"Image {i+1}",
                        "is_main": i == 0,
                        "order_index": i
                    })
                elif isinstance(img, dict) and "url" in img:
                    # Ensure all required fields are present
                    if "id" not in img:
                        img["id"] = f"img-{i}-{updated_property['id']}"
                    if "is_main" not in img:
                        img["is_main"] = i == 0
                    if "order_index" not in img:
                        img["order_index"] = i
                    if "caption" not in img:
                        img["caption"] = f"Image {i+1}"
                    formatted_images.append(img)
        
        updated_property["images"] = formatted_images
    
    # Ensure property_type is correctly formatted
    if "property_type" in updated_property:
        if isinstance(updated_property["property_type"], str):
            updated_property["property_type"] = {"name": updated_property["property_type"]}
    
    # Ensure location is correctly formatted
    if "location" in updated_property:
        if isinstance(updated_property["location"], str):
            updated_property["location"] = {"name": updated_property["location"]}
    
    return updated_property

# Use the utility function imported above for dynamic imports

# Function to get module functions using imported utilities
def get_module(module_name: str, function_names: List[str]) -> List[Any]:
    """Dynamically import module functions to avoid circular dependencies
    
    Args:
        module_name: Name of the module to import from
        function_names: List of function names to import
        
    Returns:
        List of imported functions or None values if import fails
    """
    # Use the safer import utility from utils module
    return import_functions_safely(f"app.apis.{module_name}", function_names)

# Create router
router = APIRouter(prefix="/property-updater", tags=["properties"])

# SEO Generation function
# Use a proper response model that inherits from SharedBaseResponse
class SeoTitleSubtitleResponse(BaseResponse):
    """Response model for SEO title/subtitle generation"""
    suggestions: List[SeoSuggestion] = []

def generate_seo_title_subtitle(request: SeoTitleSubtitleSuggestionRequest) -> SeoTitleSubtitleResponse:
    """Generate SEO-optimized title and subtitle suggestions for properties.
    
    Args:
        request: Configuration for SEO suggestions
        
    Returns:
        Response with SEO suggestions
    """
    try:
        # Import OpenAI
        try:
            from openai import OpenAI
            api_key = db.secrets.get("OPENAI_API_KEY")
            if not api_key:
                print("OpenAI API key not found in secrets")
                raise Exception("OpenAI API key not found")
            openai_client = OpenAI(api_key=api_key)
        except Exception as e:
            print(f"Failed to initialize OpenAI client: {e}")
            raise
        
        # Generate title and subtitle with OpenAI
        language_text = "Brazilian Portuguese" if request.language == "pt" else "English"
        
        prompt = f"""Generate 5 SEO-optimized title and subtitle pairs in {language_text} for a {request.property_type} in {request.location}.
        Each suggestion should include a title (5-8 words) and a subtitle (10-15 words) that:
        1. Is attention-grabbing but elegant for the luxury market
        2. Includes key SEO terms naturally
        3. Highlights exclusivity and premium qualities
        
        Format your response as a JSON array with objects containing 'title' and 'subtitle' properties.
        """
        
        completion = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a luxury real estate marketing specialist with expertise in SEO optimization."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content
        
        # Extract suggestions from response
        try:
            import re
            import json
            
            # Extract JSON array if embedded in text
            json_match = re.search(r'\[\s*\{.*\}\s*\]', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                json_str = response_text
                
            suggestions_data = json.loads(json_str)
            
            # Validate and convert to model
            suggestions = []
            for item in suggestions_data:
                if "title" in item and "subtitle" in item:
                    suggestions.append(SeoSuggestion(
                        title=item["title"],
                        subtitle=item["subtitle"]
                    ))
            
            return SeoTitleSubtitleResponse(
                success=True,
                message="Successfully generated SEO title and subtitle suggestions",
                suggestions=suggestions
            )
        except Exception as json_error:
            print(f"Error parsing JSON response: {json_error}")
            # Fallback to default suggestions
            pass
            
        # Fallback suggestions
        language = request.language
        property_type = request.property_type
        location = request.location
        
        if language == "pt":
            return SeoTitleSubtitleResponse(
                success=True,
                message="Generated fallback SEO suggestions",
                suggestions=[
                    SeoSuggestion(
                        title=f"Exclusiva {property_type} em {location}",
                        subtitle="Sofisticação e luxo em uma localização privilegiada com acabamentos premium"
                    ),
                    SeoSuggestion(
                        title=f"Elegante {property_type} com Vista Deslumbrante",
                        subtitle=f"Experiência de vida incomparável com conforto e exclusividade em {location}"
                    ),
                    SeoSuggestion(
                        title=f"Luxuosa {property_type} de Alto Padrão",
                        subtitle=f"Projeto arquitetônico único com amplos espaços e acabamentos refinados em {location}"
                    ),
                ]
            )
        else:  # English
            return SeoTitleSubtitleResponse(
                success=True,
                message="Generated fallback SEO suggestions",
                suggestions=[
                    SeoSuggestion(
                        title=f"Exclusive {property_type} in {location}",
                        subtitle="Sophistication and luxury in a privileged location with premium finishes"
                    ),
                    SeoSuggestion(
                        title=f"Elegant {property_type} with Stunning Views",
                        subtitle=f"Unparalleled living experience with comfort and exclusivity in {location}"
                    ),
                    SeoSuggestion(
                        title=f"Luxurious High-End {property_type}",
                        subtitle=f"Unique architectural project with spacious areas and refined finishes in {location}"
                    ),
                ]
            )
    except Exception as e:
        print(f"Error generating SEO suggestions: {e}")
        return SeoTitleSubtitleResponse(
            success=False,
            message=f"Error generating SEO suggestions: {str(e)}",
            error=str(e)
        )


@router.post("/update-all-property-images", operation_id="update_property_images_format")
async def update_property_images_format() -> Dict[str, Any]:
    """Update all properties to ensure they have proper images and storage format."""
    try:
        # Get the luxury_properties.json file
        try:
            luxury_json_str = db.storage.text.get("luxury_properties.json", default='{"properties": []}')
            luxury_data = json.loads(luxury_json_str)
            properties = luxury_data.get("properties", [])
            print(f"Found {len(properties)} properties in luxury_properties.json")
        except Exception as e:
            print(f"Error loading luxury_properties.json: {e}")
            properties = []
            
        # No properties found, try to get from generated_properties
        if not properties:
            try:
                properties = db.storage.json.get("generated_properties", default=[])
                print(f"Found {len(properties)} properties in generated_properties")
            except Exception as e:
                print(f"Error loading generated_properties: {e}")
                properties = []
        
        # Still no properties, check individual property files
        if not properties:
            try:
                # List all files in storage with 'property' prefix
                all_files = db.storage.json.list()
                property_files = [file.name for file in all_files if file.name.startswith('property')]
                print(f"Found {len(property_files)} individual property files")
                
                # Load each property file
                for file_name in property_files:
                    try:
                        property_data = db.storage.json.get(file_name)
                        properties.append(property_data)
                    except Exception as file_error:
                        print(f"Error loading property file {file_name}: {file_error}")
            except Exception as list_error:
                print(f"Error listing property files: {list_error}")
        
        # If still no properties, generate defaults
        if not properties:
            print("No properties found, returning empty success")
            return {"success": True, "message": "No properties found to update", "updated": 0}
        
        print(f"Processing {len(properties)} properties")
        
        # Update each property
        updated_count = 0
        for prop in properties:
            try:
                # Update property format
                updated_prop = update_property_format(prop)
                
                # Save individual property file
                property_key = sanitize_storage_key(f"property_{updated_prop['id']}")
                db.storage.json.put(property_key, updated_prop)
                updated_count += 1
            except Exception as prop_error:
                print(f"Error updating property {prop.get('id', 'unknown')}: {prop_error}")
        
        # Save all properties back to luxury_properties.json
        try:
            db.storage.text.put("luxury_properties.json", json.dumps({"properties": properties}))
            print(f"Successfully updated luxury_properties.json with {len(properties)} properties")
        except Exception as save_error:
            print(f"Error saving to luxury_properties.json: {save_error}")
        
        # Also update generated_properties for backward compatibility
        try:
            db.storage.json.put("generated_properties", properties)
            print(f"Successfully updated generated_properties with {len(properties)} properties")
        except Exception as gen_error:
            print(f"Error saving to generated_properties: {gen_error}")
        
        return {
            "success": True,
            "message": f"Successfully updated {updated_count} properties",
            "updated": updated_count,
            "total": len(properties)
        }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error updating properties: {e}\nStack trace: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error updating properties: {str(e)}") from e

@router.post("/update-all-property-images2", operation_id="update_property_images_with_dalle")
async def update_property_images_with_dalle(background_tasks: BackgroundTasks) -> Dict[str, Any]:
    """Update all property images using DALL-E 3 to generate images specific to Brasília luxury real estate.
    
    This endpoint will generate new high-quality images for all properties in the database,
    using DALL-E 3 or DeepSeek to create photorealistic renders of Brasília luxury properties.
    """
    try:
        # Get all properties
        try:
            luxury_json_str = db.storage.text.get("luxury_properties.json", default='{"properties": []}')
            luxury_data = json.loads(luxury_json_str)
            properties = luxury_data.get("properties", [])
            print(f"Found {len(properties)} properties in luxury_properties.json")
        except Exception as e:
            print(f"Error loading luxury_properties.json: {e}")
            properties = []
        
        # If no properties in storage, try supabase
        if not properties:
            try:
                # Try to get from supabase
                supabase = get_supabase()
                if supabase:
                    response = supabase.table("properties").select("*").execute()
                    if response and response.data:
                        properties = response.data
                        print(f"Found {len(properties)} properties in Supabase")
            except Exception as e:
                print(f"Error fetching properties from Supabase: {e}")
        
        # If still no properties, return error
        if not properties:
            print("No properties found")
            return {"success": False, "message": "No properties found to update"}
        
        # Prepare property ids for background processing
        property_ids = [str(p.get("id")) for p in properties if p.get("id")]        
        if not property_ids:
            return {"success": False, "message": "No valid property IDs found"}
        
        print(f"Starting background task to update images for {len(property_ids)} properties")
        
        # Import property images module
        [process_batch_image_generation] = get_module("property_images", ["process_batch_image_generation"])
        if not process_batch_image_generation:
            return {"success": False, "message": "Failed to import property images module"}
        
        # Start batch processing in background
        background_tasks.add_task(
            process_batch_image_generation,
            property_ids,
            count_per_property=5,  # 5 images per property
            force_regenerate=True  # Force new images
        )
        
        return {
            "success": True,
            "message": f"Started image generation for {len(property_ids)} properties",
            "property_ids": property_ids
        }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error updating property images: {e}\nStack trace: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error updating property images: {str(e)}") from e

@router.post("/fix-property-database", operation_id="fix_property_database_endpoint")
async def fix_property_database_endpoint(request: FixPropertyImagesRequest = None) -> Dict[str, Any]:
    """Fix the property database structure by migrating images from properties.images JSON to property_images table.
    
    This endpoint will:
    1. Migrate all images from properties.images JSON to the property_images table
    2. Resolve any circular dependencies in the module structure
    3. Standardize the image data model
    4. Implement better error handling
    """
    try:
        if request is None:
            request = FixPropertyImagesRequest()
        
        # Get Supabase client
        supabase = get_supabase()
        if not supabase:
            return {"success": False, "message": "Supabase client not available"}
        
        # Create the property_images table if it doesn't exist
        if request.force_rebuild_table:
            try:
                # Check if table exists by trying to query it
                supabase.table("property_images").select("count", count="exact").limit(1).execute()
                table_exists = True
            except Exception as e:
                if "relation \"property_images\" does not exist" in str(e):
                    table_exists = False
                else:
                    # Some other error
                    return {"success": False, "message": f"Error checking if table exists: {str(e)}"}
            
            # Create the table if needed
            if not table_exists:
                print("property_images table doesn't exist. Please create it in Supabase.")
                return {
                    "success": False, 
                    "message": "property_images table doesn't exist. Please create it in the Supabase SQL editor with the following SQL:",
                    "sql": """
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
                }
        
        # Fetch all properties
        response = supabase.table("properties").select("*").execute()
        if not response or not response.data:
            return {"success": False, "message": "No properties found"}
        
        properties = response.data
        print(f"Found {len(properties)} properties to process")
        
        # Process each property
        properties_processed = 0
        images_migrated = 0
        errors = []
        
        for property_data in properties:
            try:
                property_id = property_data.get("id")
                if not property_id:
                    errors.append("Property missing ID field, skipping")
                    continue
                
                # Try to extract images from property data
                images = []
                
                # Check all possible image fields
                for field in ["images", "image_objects", "image_urls"]:
                    if field in property_data and property_data[field]:
                        field_images = property_data[field]
                        if isinstance(field_images, list):
                            for i, img in enumerate(field_images):
                                if isinstance(img, str):  # Just a URL
                                    images.append({
                                        "id": f"img-{i}-{property_id}",
                                        "property_id": property_id,
                                        "url": img,
                                        "caption": f"Image {i+1}",
                                        "is_main": i == 0,
                                        "order_index": i
                                    })
                                elif isinstance(img, dict) and "url" in img:  # Object with URL
                                    img["property_id"] = property_id
                                    if "id" not in img:
                                        img["id"] = f"img-{i}-{property_id}"
                                    if "is_main" not in img:
                                        img["is_main"] = i == 0
                                    if "order_index" not in img:
                                        img["order_index"] = i
                                    images.append(img)
                
                # If no images found in any field, skip
                if not images:
                    print(f"No images found for property {property_id}")
                    continue
                
                # Check existing images in property_images table
                existing_response = supabase.table("property_images").select("*").eq("property_id", property_id).execute()
                existing_images = existing_response.data if existing_response else []
                existing_urls = {img.get("url") for img in existing_images if img.get("url")}
                
                # Insert only new images to avoid duplicates
                images_inserted = 0
                for image in images:
                    if image.get("url") not in existing_urls or request.recreate_images:
                        try:
                            # Insert image
                            supabase.table("property_images").insert(image).execute()
                            images_inserted += 1
                            existing_urls.add(image.get("url"))
                        except Exception as img_error:
                            errors.append(f"Failed to insert image for property {property_id}: {str(img_error)}")
                
                # Update the count even if some images were already migrated
                images_migrated += images_inserted
                
                # Clear the images JSON array from the properties table to avoid duplication
                if images_inserted > 0 or existing_images:
                    update_data = {}
                    for field in ["images", "image_objects", "image_urls"]:
                        if field in property_data:
                            update_data[field] = None
                    
                    if update_data:
                        try:
                            supabase.table("properties").update(update_data).eq("id", property_id).execute()
                        except Exception as update_error:
                            errors.append(f"Failed to clear images from property {property_id}: {str(update_error)}")
                
                properties_processed += 1
                print(f"Processed property {property_id}: Migrated {images_inserted} images")
                
            except Exception as e:
                error_msg = f"Error processing property {property_data.get('id', 'unknown')}: {str(e)}"
                print(error_msg)
                errors.append(error_msg)
        
        return {
            "success": True,
            "message": f"Successfully processed {properties_processed} properties and migrated {images_migrated} images",
            "properties_processed": properties_processed,
            "images_migrated": images_migrated,
            "errors": errors if errors else None
        }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error fixing property database: {e}\nStack trace: {error_details}")
        return {"success": False, "message": f"Error: {str(e)}"}

@router.post("/regenerate-all-properties", operation_id="regenerate_all_properties2")
async def regenerate_all_properties(request: RegeneratePropertiesRequest = None, background_tasks: BackgroundTasks = None) -> Dict[str, Any]:
    """Regenerate luxury properties with enhanced data and images.
    
    This endpoint will completely refresh the property database with new luxury properties,
    each with detailed descriptions, features, and high-quality images.
    
    Args:
        request: Optional configuration for property regeneration
        background_tasks: Background tasks runner
    """
    try:
        if request is None:
            request = RegeneratePropertiesRequest()
        
        # Default to 15 properties if not specified
        property_count = request.property_count or 15
        
        # Import property generator module
        [generate_properties, GeneratePropertiesRequest] = get_module(
            "property_generator", 
            ["generate_properties", "GeneratePropertiesRequest"]
        )
        if not generate_properties or not GeneratePropertiesRequest:
            return {"success": False, "message": "Failed to import property generator module"}
        
        # Generate properties
        generation_request = GeneratePropertiesRequest(
            count=property_count,
            force_regenerate=True
        )
        
        result = await generate_properties(generation_request, background_tasks)
        
        if result and result.success:
            return {
                "success": True,
                "message": f"Successfully regenerated {len(result.properties)} properties with enhanced data",
                "property_count": len(result.properties)
            }
        else:
            return {
                "success": False,
                "message": "Failed to generate properties",
                "property_count": 0
            }
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error regenerating properties: {e}\nStack trace: {error_details}")
        raise HTTPException(status_code=500, detail=f"Error regenerating properties: {str(e)}") from e
