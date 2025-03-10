"""API for generating and updating property images with DALL-E with rate limiting"""

import time
import asyncio
import random
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
import databutton as db
from fastapi import APIRouter, HTTPException, BackgroundTasks

# Import utils safely to avoid circular dependencies
try:
    from ..utils import get_supabase, sanitize_storage_key
except ImportError:
    # Fallback implementations
    def sanitize_storage_key(key):
        import re
        return re.sub(r'[^a-zA-Z0-9._-]', '', key)

    def get_supabase():
        return None

# Try to import other dependencies
try:
    from ..common import adapt_property_for_response
except ImportError:
    # Fallback implementation
    def adapt_property_for_response(property_data):
        return property_data

try:
    from ..rate_limiter import RateLimiter
except ImportError:
    # Simple fallback rate limiter
    class RateLimiter:
        def __init__(self, max_calls, period):
            self.max_calls = max_calls
            self.period = period
            self.last_call_times = []

        async def acquire(self):
            """Simple rate limiting implementation"""
            now = time.time()
            
            # Remove timestamps older than period
            self.last_call_times = [t for t in self.last_call_times if now - t < self.period]
            
            # If we've hit the limit, wait
            if len(self.last_call_times) >= self.max_calls:
                oldest_call = self.last_call_times[0]
                sleep_time = max(0, self.period - (now - oldest_call))
                await asyncio.sleep(sleep_time)
                # Recalculate now after sleeping
                now = time.time()
            
            # Add current timestamp
            self.last_call_times.append(now)
            
            # For safety, add a small delay
            await asyncio.sleep(0.1)

# Create router
router = APIRouter(prefix="/property-images")

# Initialize rate limiter for DALL-E API
# Limits to 5 requests per minute (OpenAI's rate limit for DALL-E is 50 per minute)
dall_e_limiter = RateLimiter(max_calls=5, period=60)

# Define model classes directly
# This avoids complex import structure with potential circular dependencies
class PropertyImageRequest(BaseModel):
    property_id: str = Field(..., description="ID of the property to generate images for")
    count: int = Field(1, description="Number of images to generate (1-5)")
    force_regenerate: bool = Field(False, description="Force regeneration of images")

class BatchImageRequest(BaseModel):
    property_ids: List[str] = Field(..., description="List of property IDs to generate images for")
    count_per_property: int = Field(5, description="Number of images per property (1-5)")
    force_regenerate: bool = Field(False, description="Force regeneration of images")

class PropertyImage(BaseModel):
    id: str
    url: str
    caption: Optional[str] = None
    is_main: bool = False

# Try to import models from common_imports registry (for future compatibility)
try:
    from ..common_imports import get_shared_model
    
    # Get models from registry - not using these now but keeping code for future
    shared_models = {
        'PropertyImageRequest': get_shared_model('PropertyImageRequest'),
        'BatchImageRequest': get_shared_model('BatchImageRequest'),
        'PropertyImage': get_shared_model('PropertyImage')
    }
    # We could use these shared models in the future if needed
except ImportError:
    # Just continue with our directly defined models
    pass

# Helper functions
async def generate_dall_e_image(prompt: str) -> Optional[str]:
    """Generate an image with DALL-E based on a prompt"""
    try:
        # Get OpenAI API key
        api_key = db.secrets.get("OPENAI_API_KEY")
        if not api_key:
            print("OpenAI API key not found")
            return None

        # Use OpenAI API to generate image
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        # Wait for rate limiter
        await dall_e_limiter.acquire()

        # Generate image with DALL-E-3
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        # Return image URL
        if response and response.data and len(response.data) > 0:
            return response.data[0].url

        return None
    except Exception as e:
        print(f"Error generating image with DALL-E: {e}")
        return None

def create_image_prompt(property_data: Dict[str, Any], image_type: str) -> str:
    """Create a detailed prompt for DALL-E based on property data and image type"""
    # Extract property details
    property_type = property_data.get("property_type", {})
    if isinstance(property_type, dict):
        property_type_name = property_type.get("name", "luxury residence")
    else:
        property_type_name = str(property_type)

    # Title not used in prompts currently
    # title = property_data.get("title", "Luxury property")
    location = property_data.get("location", {})
    if isinstance(location, dict):
        location_name = location.get("name", "Brasília")
    else:
        location_name = str(location)

    # Extract architectural details from description
    description = property_data.get("description", "")
    description_excerpt = description[:500] if description else ""

    # Image type-specific prompts
    prompts = {
        "exterior front view": f"Photorealistic architectural photography of a {property_type_name} in {location_name}, front view, exterior. {description_excerpt} Daytime, beautiful landscaping, luxury real estate photography, high-end finish, 8K ultra detailed.",

        "interior living room": f"Photorealistic interior design photography of a {property_type_name} living room in {location_name}. Spacious, natural light, luxury furniture, high ceilings, hardwood floors, minimalist design, professionally staged, architectural digest style, 8K ultra detailed.",

        "swimming pool area": f"Photorealistic outdoor swimming pool of a luxury {property_type_name} in {location_name}. Infinity pool, lounge chairs, palm trees, outdoor lighting, panoramic view, sunset atmosphere, resort style, architectural digest quality, 8K ultra detailed.",

        "master bedroom": f"Photorealistic master bedroom interior in a luxury {property_type_name} in {location_name}. King-sized bed, walk-in closet, en-suite bathroom, floor-to-ceiling windows, city views, modern design, high-end finishes, 8K ultra detailed.",

        "aerial view": f"Aerial drone photography of a luxury {property_type_name} in {location_name}. Bird's eye view, lush landscape, private driveway, surrounded by greenery, swimming pool visible, modern architecture, sunny day, professional real estate photography, 8K ultra detailed."
    }

    prompt = prompts.get(image_type, prompts["exterior front view"])
    return prompt

async def generate_property_images(property_id: str, count: int = 1, force_regenerate: bool = False) -> List[Dict[str, Any]]:
    """Generate images for a property using DALL-E"""
    try:
        # Get property data
        supabase = get_supabase()
        if not supabase:
            print("No Supabase client available, using fallback storage")
            # Try to get property from storage
            try:
                property_data = db.storage.json.get(sanitize_storage_key(f"property_{property_id}"), default=None)
            except Exception as e:
                print(f"Error getting property from storage: {e}")
                property_data = None
        else:
            # Try to get property from database
            try:
                response = supabase.table("properties").select("*").eq("id", property_id).execute()
                if response and response.data and len(response.data) > 0:
                    property_data = response.data[0]
                else:
                    property_data = None
            except Exception as e:
                print(f"Error getting property from database: {e}")
                property_data = None

        # If property data not found, return empty list
        if not property_data:
            print(f"Property with ID {property_id} not found")
            return []

        # Check if property already has images and we're not forcing regeneration
        if not force_regenerate and property_data.get("images") and len(property_data.get("images", [])) > 0:
            print(f"Property {property_id} already has images and force_regenerate is False")
            return property_data.get("images", [])

        # Define image types to generate
        image_types = [
            "exterior front view",
            "interior living room",
            "swimming pool area",
            "master bedroom",
            "aerial view"
        ]

        # Limit count to 5
        count = min(count, 5)

        # Select random image types if count < 5
        if count < len(image_types):
            selected_types = random.sample(image_types, count)
        else:
            selected_types = image_types

        # Generate images
        generated_images = []
        for i, image_type in enumerate(selected_types):
            # Create prompt
            prompt = create_image_prompt(property_data, image_type)

            # Generate image
            image_url = await generate_dall_e_image(prompt)

            # Add image to list if successful
            if image_url:
                generated_images.append({
                    "id": f"img-{i}-{property_id}",
                    "property_id": property_id,
                    "url": image_url,
                    "caption": f"{image_type.title()}",
                    "is_main": i == 0  # First image is main
                })

        # If no images were generated, return existing images or empty list
        if not generated_images:
            print(f"No images were generated for property {property_id}")
            return property_data.get("images", [])

        # Update property with new images
        updated_images = property_data.get("images", []) if not force_regenerate else []
        updated_images.extend(generated_images)

        # Update property in database or storage
        try:
            if supabase:
                supabase.table("properties").update({"images": updated_images}).eq("id", property_id).execute()
            else:
                # Save to storage
                property_data["images"] = updated_images
                db.storage.json.put(sanitize_storage_key(f"property_{property_id}"), property_data)
        except Exception as e:
            print(f"Error updating property images: {e}")

        return updated_images
    except Exception as e:
        print(f"Error generating property images: {e}")
        return []

# Background task for batch processing
async def process_batch_image_generation(property_ids: List[str], count_per_property: int = 5, force_regenerate: bool = False):
    """Process batch image generation for multiple properties"""
    for property_id in property_ids:
        try:
            await generate_property_images(property_id, count_per_property, force_regenerate)
            # Add delay to respect rate limits
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Error processing property {property_id}: {e}")

# Endpoints
@router.post("/generate", operation_id="generate_images", response_model=None)
async def generate_images(request: PropertyImageRequest):
    """Generate images for a property using DALL-E"""
    try:
        # Validate count
        if request.count < 1 or request.count > 5:
            raise HTTPException(status_code=400, detail="Count must be between 1 and 5")

        # Generate images
        images = await generate_property_images(request.property_id, request.count, request.force_regenerate)

        return {
            "success": True,
            "property_id": request.property_id,
            "images": images
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating images: {str(e)}") from e

@router.post("/batch-generate", operation_id="batch_generate_images", response_model=None)
async def batch_generate_images(request: BatchImageRequest, background_tasks: BackgroundTasks):
    """Schedule batch image generation for multiple properties"""
    try:
        # Use count_per_property from request
        count_per_property = request.count_per_property

        # Validate count
        if count_per_property < 1 or count_per_property > 5:
            raise HTTPException(status_code=400, detail="Count per property must be between 1 and 5")

        # Validate property count
        if len(request.property_ids) > 20:
            raise HTTPException(status_code=400, detail="Cannot process more than 20 properties at once")

        # Schedule background task
        background_tasks.add_task(
            process_batch_image_generation,
            request.property_ids,
            count_per_property,  # Use the resolved count_per_property value
            request.force_regenerate
        )

        return {
            "success": True,
            "message": f"Scheduled image generation for {len(request.property_ids)} properties",
            "property_ids": request.property_ids
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scheduling batch image generation: {str(e)}") from e

@router.get("/status/{property_id}", operation_id="get_property_images_status", response_model=None)
async def get_property_images_status(property_id: str):
    """Get status of property images"""
    try:
        # Get property data
        supabase = get_supabase()
        if not supabase:
            # Try to get property from storage
            try:
                property_data = db.storage.json.get(sanitize_storage_key(f"property_{property_id}"), default=None)
            except Exception as e:
                print(f"Error getting property from storage: {e}")
                property_data = None
        else:
            # Try to get property from database
            try:
                response = supabase.table("properties").select("*").eq("id", property_id).execute()
                if response and response.data and len(response.data) > 0:
                    property_data = response.data[0]
                else:
                    property_data = None
            except Exception as e:
                print(f"Error getting property from database: {e}")
                property_data = None

        # If property data not found, return error
        if not property_data:
            raise HTTPException(status_code=404, detail=f"Property with ID {property_id} not found")

        # Return image status
        images = property_data.get("images", [])
        return {
            "property_id": property_id,
            "has_images": len(images) > 0,
            "image_count": len(images),
            "images": images
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting property images status: {str(e)}") from e
