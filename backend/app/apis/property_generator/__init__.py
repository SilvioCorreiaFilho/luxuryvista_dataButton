"""Property generator API for creating luxury properties"""

import json
import random
import string
import time
import traceback
import uuid
import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, BackgroundTasks, HTTPException
import databutton as db

# Import utility functions from common_imports safely
try:
    from ..common_imports import import_function_safely, import_module_safely, register_shared_model, get_shared_model

    # Get models from shared registry to avoid circular imports
    GeneratePropertiesRequest = get_shared_model('GeneratePropertiesRequest')
    PropertyResponse = get_shared_model('PropertyResponse')
    BaseResponse = get_shared_model('BaseResponse')
except ImportError:
    print("Could not import from common_imports, using fallback implementations")
    # Fallback implementations
    def import_function_safely(module_path, function_name):
        return None
        
    def import_module_safely(module_path):
        return None
        
    def register_shared_model(name, model):
        return None
        
    def get_shared_model(name):
        return None
        
    # Set these to None since we couldn't import them
    GeneratePropertiesRequest = None
    PropertyResponse = None
    BaseResponse = None

# Fallback implementations if models aren't in registry
if not PropertyResponse:
    from pydantic import BaseModel, Field
    from typing import List, Dict, Optional
    
    class PropertyResponse(BaseModel):
        """Response model for property endpoints"""
        success: bool = Field(..., description="Whether the request was successful")
        message: str = Field(..., description="Response message")
        properties: Optional[List[Dict[str, Any]]] = Field(None, description="List of properties")
    
    # Register model for others to use
    register_shared_model('PropertyResponse', PropertyResponse)

if not GeneratePropertiesRequest:
    from pydantic import BaseModel, Field
    
    class GeneratePropertiesRequest(BaseModel):
        """Request model for generating properties"""
        count: int = Field(5, description="Number of properties to generate")
        force_regenerate: bool = Field(False, description="Force regeneration even if properties exist")
        language: str = Field("pt", description="Language for content generation (pt or en)")
    
    # Register model for others to use
    register_shared_model('GeneratePropertiesRequest', GeneratePropertiesRequest)

# Create router
router = APIRouter(prefix="/property-generator", tags=["properties"])

# Try to import the supabase client
try:
    from ..supabase_client import get_supabase
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("Supabase client not available, will use storage-based fallback")

# Try to import the AI client
try:
    from ..deepseek_wrapper import ai_client
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("AI client not available, using static descriptions")

# Default locations in Brasília
BRASILIA_LOCATIONS = [
    {"id": "plano-piloto", "name": "Plano Piloto", "lat": -15.7801, "lng": -47.9292},
    {"id": "lago-sul", "name": "Lago Sul", "lat": -15.8367, "lng": -47.8755},
    {"id": "lago-norte", "name": "Lago Norte", "lat": -15.7436, "lng": -47.8825},
    {"id": "park-way", "name": "Park Way", "lat": -15.9093, "lng": -47.9667},
    {"id": "jardim-botanico", "name": "Jardim Botânico", "lat": -15.8744, "lng": -47.7919},
    {"id": "sudoeste", "name": "Sudoeste", "lat": -15.7948, "lng": -47.9279},
    {"id": "noroeste", "name": "Noroeste", "lat": -15.7366, "lng": -47.9176},
]

# Property types
PROPERTY_TYPES = [
    "Luxury Villa",
    "Penthouse",
    "Mansion",
    "Exclusive Residence",
    "Architectural Masterpiece",
    "Designer Home",
    "Contemporary Estate",
]

# Luxury features
LUXURY_FEATURES = [
    {"id": "smart-home", "name": "Smart Home System"},
    {"id": "infinity-pool", "name": "Infinity Pool"},
    {"id": "home-theater", "name": "Home Theater"},
    {"id": "wine-cellar", "name": "Wine Cellar"},
    {"id": "spa", "name": "Private Spa"},
    {"id": "gym", "name": "Fitness Center"},
    {"id": "rooftop-terrace", "name": "Rooftop Terrace"},
    {"id": "gourmet-kitchen", "name": "Gourmet Kitchen"},
    {"id": "home-office", "name": "Executive Home Office"},
    {"id": "garden", "name": "Landscaped Garden"},
    {"id": "security", "name": "24/7 Security System"},
    {"id": "sauna", "name": "Sauna"},
    {"id": "elevator", "name": "Private Elevator"},
    {"id": "guest-house", "name": "Guest House"},
    {"id": "art-display", "name": "Art Gallery Wall"},
    {"id": "automated-blinds", "name": "Automated Blinds & Curtains"},
    {"id": "sustainable", "name": "Sustainable Energy Systems"},
    {"id": "water-feature", "name": "Water Feature"},
    {"id": "car-gallery", "name": "Car Gallery"},
    {"id": "panoramic-views", "name": "Panoramic Views of Brasília"},
]



# Helper functions
def generate_unique_id():
    """Generate a unique ID with time-based entropy"""
    # Get the current timestamp and convert to string
    timestamp = str(int(time.time()))
    # Add some random digits
    random_part = ''.join(random.choices(string.digits, k=6))
    # Combine for a unique ID
    return f"{timestamp}{random_part}"

def generate_property_description(property_data):
    """Generate a property description using AI or fallback"""
    if AI_AVAILABLE:
        try:
            description = ai_client.generate_property_description(property_data)
            if description and len(description) > 100:
                return description
        except Exception as e:
            print(f"Error generating property description with AI: {e}")
    
    # Fallback descriptions
    property_type = property_data.get("property_type", "Luxury Villa")
    location_name = "Brasília"
    if isinstance(property_data.get("location"), dict):
        location_name = property_data["location"].get("name", "Brasília")
    
    descriptions = [
        f"This magnificent {property_type} in {location_name} represents the pinnacle of luxury living. " +
        "With its sleek, modernist design inspired by Brasília's architectural heritage, this residence offers an unparalleled lifestyle of comfort and exclusivity. " +
        "Floor-to-ceiling windows frame breathtaking views while allowing natural light to cascade throughout the meticulously designed interior spaces. " +
        "Premium materials, including Brazilian hardwoods and Italian marble, create an atmosphere of refined elegance.",
        
        f"Discover unprecedented luxury in this exceptional {property_type} located in the prestigious {location_name} area. " +
        "This architectural masterpiece showcases clean lines and geometric precision characteristic of Brasília's design ethos, while incorporating contemporary elements for modern living. " +
        "The sophisticated interior features a seamless flow between spaces, with designer fixtures and bespoke furnishings creating an ambiance of understated opulence. " +
        "From the meticulously landscaped grounds to the state-of-the-art amenities, every detail has been carefully curated.",
        
        f"An extraordinary {property_type} of uncompromising quality in {location_name}'s most coveted neighborhood. " +
        "This residence embodies the visionary spirit of Brasília with its bold geometric forms and harmonious integration with the surrounding landscape. " +
        "The interior spaces are characterized by sweeping volumes, premium finishes, and a thoughtful layout that balances grandeur with intimate comfort. " +
        "Cutting-edge technology is seamlessly incorporated throughout, offering both convenience and enhanced security.",
    ]
    
    return random.choice(descriptions)

def generate_investment_metrics():
    """Generate realistic investment metrics for luxury properties"""
    return {
        "annual_return": round(random.uniform(4.5, 7.2), 1),  # 4.5% to 7.2%
        "price_appreciation": round(random.uniform(3.8, 9.5), 1),  # 3.8% to 9.5%
        "rental_yield": round(random.uniform(3.2, 5.8), 1),  # 3.2% to 5.8%
        "occupancy_rate": round(random.uniform(85, 98), 1),  # 85% to 98%
        "maintenance_cost": round(random.uniform(0.5, 1.8), 1),  # 0.5% to 1.8% of property value
    }

def generate_property_features(count=10):
    """Generate a list of luxury features"""
    return random.sample(LUXURY_FEATURES, min(count, len(LUXURY_FEATURES)))

def generate_single_property():
    """Generate a single luxury property in Brasília"""
    try:
        # Select a random location in Brasília
        location = random.choice(BRASILIA_LOCATIONS)
        
        # Generate basic property data
        property_type = random.choice(PROPERTY_TYPES)
        bedrooms = random.randint(3, 7)
        bathrooms = random.randint(bedrooms - 1, bedrooms + 2)
        area = random.randint(300, 1200)  # square meters
        
        # Generate price (in BRL)
        price_per_sqm = random.randint(15000, 35000)  # 15k to 35k BRL per square meter
        price = area * price_per_sqm
        
        # Format price with dot separator for thousands
        formatted_price = f"R$ {price:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        
        # Current timestamp in ISO format
        current_time = datetime.now().isoformat()
        
        # Basic property data
        property_data = {
            "id": generate_unique_id(),
            "title": f"Exclusive {property_type} in {location['name']}, Brasília",
            "price": formatted_price,
            "price_numeric": price,
            "area": area,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "property_type": {"id": property_type.lower().replace(" ", "-"), "name": property_type},
            "location": location,
            "features": generate_property_features(10),
            "created_at": current_time,
            "updated_at": current_time,
        }
        
        # Add investment metrics
        property_data["investmentmetric"] = generate_investment_metrics()
        
        # Generate description
        property_data["description"] = generate_property_description(property_data)
        
        # Placeholder for images - will be populated later
        property_data["images"] = []
        
        return property_data
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error generating property: {e}\nStack trace: {error_details}")
        return None

def generate_image_urls_for_property(property_data):
    """Generate image URLs for a property"""
    # These are placeholder paths that the frontend understands
    # In a real implementation, these would be actual image URLs from a CDN
    # or other storage service, possibly generated using DALL-E or another image generator
    image_themes = [
        "exterior",
        "living-room",
        "bedroom",
        "swimming-pool",
        "aerial",
    ]
    
    # Create a set of 5 images per property
    images = []
    for theme in image_themes:
        image_id = f"{property_data['id']}-{theme}"
        # This URL format is expected by the frontend
        images.append({
            "id": image_id,
            "url": f"/api/property-images/{image_id}",
            "alt": f"{property_data['property_type']} {theme.replace('-', ' ')} view",
            "theme": theme
        })
    
    return images

def save_properties_to_storage(properties):
    """Save properties to storage"""
    # First, try to load existing data
    try:
        luxury_json_str = db.storage.text.get("luxury_properties.json", default='{"properties": []}')
        luxury_data = json.loads(luxury_json_str)
        existing_properties = luxury_data.get("properties", [])
        print(f"Found {len(existing_properties)} existing properties in storage")
    except Exception as e:
        print(f"Error loading existing properties from storage: {e}")
        existing_properties = []
    
    # Get existing property IDs for deduplication
    existing_ids = set(str(p.get("id")) for p in existing_properties if p.get("id"))
    
    # Add new properties that don't already exist
    new_properties = [p for p in properties if str(p.get("id")) not in existing_ids]
    
    # Merge and save
    all_properties = existing_properties + new_properties
    print(f"Saving {len(all_properties)} properties to storage ({len(new_properties)} new)")
    
    # Save to storage
    db.storage.text.put("luxury_properties.json", json.dumps({"properties": all_properties}, ensure_ascii=False))
    
    return len(new_properties)

def save_properties_to_supabase(properties):
    """Save properties to Supabase"""
    if not SUPABASE_AVAILABLE:
        print("Supabase client not available, skipping database save")
        return 0
    
    try:
        supabase = get_supabase()
        if not supabase:
            print("Failed to get Supabase client, skipping database save")
            return 0
        
        # Insert properties into the database
        saved_count = 0
        for prop in properties:
            # Clone the property to avoid modifying the original
            property_to_save = prop.copy()
            
            # Convert data to format expected by database
            # For example, ensure images is a JSON string
            if "images" in property_to_save and isinstance(property_to_save["images"], list):
                property_to_save["images"] = json.dumps(property_to_save["images"])
            
            # Handle features format
            if "features" in property_to_save and isinstance(property_to_save["features"], list):
                property_to_save["features"] = json.dumps(property_to_save["features"])
            
            # Handle location format
            if "location" in property_to_save and isinstance(property_to_save["location"], dict):
                # Save location reference id
                location_id = property_to_save["location"].get("id")
                if location_id:
                    property_to_save["location_id"] = location_id
                
                # Remove location object as it's stored in a different table
                del property_to_save["location"]
            
            # Handle investment metrics
            if "investmentmetric" in property_to_save and isinstance(property_to_save["investmentmetric"], dict):
                property_to_save["investmentmetric"] = json.dumps(property_to_save["investmentmetric"])
            
            try:
                # Try to insert the property
                result = supabase.table("properties").insert(property_to_save).execute()
                if result and result.data:
                    saved_count += 1
                    print(f"Saved property {property_to_save.get('id')} to Supabase")
            except Exception as e:
                print(f"Error saving property to Supabase: {e}")
                # Try to continue with other properties
                continue
        
        return saved_count
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error saving properties to Supabase: {e}\nStack trace: {error_details}")
        return 0

# API Endpoints
@router.post("/generate-properties", response_model=None)
async def generate_properties(request: GeneratePropertiesRequest, background_tasks: BackgroundTasks):
    """Generate luxury properties in Brasília.
    
    This endpoint will generate new luxury properties with detailed descriptions,
    investment metrics, and features. Each property includes placeholders for images.
    
    Args:
        request: Configuration for property generation
    """
    try:
        print(f"Received request: {request}")
        
        # Log available request attributes for debugging
        print(f"Request attributes: {dir(request)}")
        
        # Limit count to reasonable value
        count = min(max(request.count, 1), 15)
        print(f"Generating {count} properties")
        
        # Use the hardcoded property types from the module
        # property_types are already defined in the PROPERTY_TYPES constant
        
        # Generate properties
        properties = []
        for _ in range(count):
            try:
                property_data = generate_single_property()
                if property_data:
                    # Add image placeholders
                    property_data["images"] = generate_image_urls_for_property(property_data)
                    properties.append(property_data)
            except Exception as prop_error:
                # Catch and log errors during individual property generation
                print(f"Error generating individual property: {prop_error}")
                error_details = traceback.format_exc()
                print(f"Property generation error details: {error_details}")
        
        if not properties:
            return PropertyResponse(
                properties=[],
                success=False,
                message="Failed to generate properties"
            )
        
        # Save to storage (this always works even if database fails)
        save_properties_to_storage(properties)
        
        # Try to save to Supabase in the background
        background_tasks.add_task(save_properties_to_supabase, properties)
        
        # Schedule image generation in the background using safer dynamic import
        try:
            # Try to dynamically import the batch image generation function
            property_images_module = import_module_safely("app.apis.property_images")
            
            if property_images_module and hasattr(property_images_module, "process_batch_image_generation"):
                process_batch_image_generation = property_images_module.process_batch_image_generation
                
                # Convert property IDs to strings to ensure compatibility
                property_ids = [str(p.get("id")) for p in properties if p.get("id")]
                background_tasks.add_task(
                    process_batch_image_generation,
                    property_ids,
                    count_per_property=5,  # Generate 5 images per property
                    force_regenerate=True
                )
                print(f"Scheduled image generation for {len(property_ids)} properties")
            else:
                print("Batch image generation function not available, trying alternative import method")
                
                # Try the second import approach with the function utility
                batch_process_fn = import_function_safely("app.apis.property_images", "process_batch_image_generation")
                
                if batch_process_fn:
                    # Convert property IDs to strings to ensure compatibility
                    property_ids = [str(p.get("id")) for p in properties if p.get("id")]
                    background_tasks.add_task(
                        batch_process_fn,
                        property_ids,
                        count_per_property=5,  # Generate 5 images per property
                        force_regenerate=True
                    )
                    print(f"Scheduled image generation for {len(property_ids)} properties using alternative import")
                else:
                    print("Failed to import process_batch_image_generation function, skipping image generation")
        except ImportError as ie:
            print(f"Could not import process_batch_image_generation: {ie}")
            print("Property images module not available, skipping image generation")
        except Exception as e:
            print(f"Error setting up image generation: {e}")
            print(f"Type: {type(e).__name__}, Details: {str(e)}")
            print("Property images module not fully available, skipping image generation")
        
        return PropertyResponse(
            properties=properties,
            success=True,
            message=f"Successfully generated {len(properties)} properties"
        )
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error generating properties: {e}\nStack trace: {error_details}")
        
        # Return a more graceful error response instead of raising an exception
        return PropertyResponse(
            properties=[],
            success=False,
            message=f"Error generating properties: {str(e)}"
        )
