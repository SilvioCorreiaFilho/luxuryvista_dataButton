from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
import asyncio
from typing import List, Optional, Any
from decimal import Decimal
import json
import databutton as db
from supabase import create_client, Client
import re

# Always import models from the app-level definitions module
# Import property images API for image generation
from app.apis.property_images import generate_property_images, process_batch_image_generation

from app.apis.definitions import (
    PropertyType, Location, PropertyImage, InvestmentMetric,
    Analysis, Property, PropertyCreate, PropertyUpdate, PropertyResponse,
    PropertyList, PropertySearch, PropertySearchResponse
)

# Define utility functions for this module

def get_supabase() -> Client:
    """Get Supabase client for database operations"""
    try:
        url = db.secrets.get("SUPABASE_URL")
        key = db.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
        print(f"Using Supabase connection: URL present: {bool(url)}, Key present: {bool(key)}")

        if not url or not key:
            print("Supabase credentials not properly configured")
            raise ValueError("Supabase credentials not properly configured")

        return create_client(url, key)
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

# Function moved to common module
from ..common import adapt_property_for_response

# Keep an alias for backward compatibility
def _adapt_property_for_response(property_data):
    """Adapt property data from database to response format"""
    # Make a copy to avoid modifying the original data
    result = dict(property_data)
    
    # Ensure ID is a string
    if 'id' in result and result['id'] is not None:
        result['id'] = str(result['id'])
    
    # Handle property type
    if 'property_type' in result:
        if isinstance(result['property_type'], str):
            result['property_type'] = {'name': result['property_type'], 'description': None}
        elif isinstance(result['property_type'], dict):
            # Ensure the dict has the required fields
            if 'name' not in result['property_type']:
                result['property_type']['name'] = 'Unknown'
    else:
        result['property_type'] = {'name': 'Unknown', 'description': None}
    
    # For backwards compatibility, also set the type field
    result['type'] = result['property_type']
    
    # Handle location - MUST be a dict with at least a name field
    if 'location' in result and result['location'] is not None:
        if isinstance(result['location'], str):
            result['location'] = {'name': result['location'], 'description': None}
        elif isinstance(result['location'], dict):
            # Ensure the dict has the required fields
            if 'name' not in result['location']:
                result['location']['name'] = 'Unknown'
        else:
            # If it's neither a string nor a dict, create a default location
            result['location'] = {'name': 'Unknown', 'description': None}
    else:
        # Ensure location is never None
        result['location'] = {'name': 'Unknown', 'description': None}
    
    # Handle neighborhood from address if not present
    if ('neighborhood' not in result or not result['neighborhood']) and 'address' in result and isinstance(result['address'], dict):
        if 'neighborhood' in result['address']:
            result['neighborhood'] = result['address']['neighborhood']
    
    # Handle address field (sometimes it's a dict in our DB)
    if 'address' in result and isinstance(result['address'], dict):
        # Convert address dict to string
        address_parts = []
        if 'street' in result['address']:
            address_parts.append(result['address']['street'])
        if 'neighborhood' in result['address']:
            address_parts.append(result['address']['neighborhood'])
        if 'city' in result['address']:
            address_parts.append(result['address']['city'])
        if 'state' in result['address']:
            address_parts.append(result['address']['state'])
        if 'postalCode' in result['address']:
            address_parts.append(result['address']['postalCode'])
        result['address'] = ', '.join(filter(None, address_parts))
    
    # Handle specifications (legacy format) by moving fields to the root
    if 'specifications' in result and isinstance(result['specifications'], dict):
        specs = result['specifications']
        if 'bedrooms' in specs:
            result['bedrooms'] = specs['bedrooms']
        if 'bathrooms' in specs:
            result['bathrooms'] = specs['bathrooms']
        if 'area' in specs:
            result['area'] = specs['area']
        # Allow totalArea as a property
        if 'area' in specs and 'totalArea' not in result:
            result['totalArea'] = specs['area']
    
    # Handle features - should be a list of Feature objects
    if 'features' in result:
        if isinstance(result['features'], list):
            features_list = []
            for feature in result['features']:
                if isinstance(feature, str):
                    features_list.append({'name': feature, 'icon': None})
                elif isinstance(feature, dict) and 'name' in feature:
                    features_list.append(feature)
                elif feature:  # Handle any non-empty value
                    features_list.append({'name': str(feature), 'icon': None})
            result['features'] = features_list
        else:
            result['features'] = []
    else:
        result['features'] = []
    
    # Handle images - should be a list of PropertyImage objects
    if 'images' in result:
        if isinstance(result['images'], list):
            images_list = []
            for idx, image in enumerate(result['images']):
                if isinstance(image, str):
                    # Create a PropertyImage object with a unique ID
                    image_id = f"img-{idx}-{abs(hash(image))}"
                    images_list.append({
                        'id': image_id,
                        'url': image,
                        'caption': f"Property image {idx+1}",
                        'is_main': idx == 0
                    })
                elif isinstance(image, dict) and 'url' in image:
                    # Ensure all required fields are present
                    if 'id' not in image:
                        image['id'] = f"img-{idx}-{abs(hash(image['url']))}"
                    if 'caption' not in image:
                        image['caption'] = f"Property image {idx+1}"
                    if 'is_main' not in image:
                        image['is_main'] = idx == 0
                    images_list.append(image)
            result['images'] = images_list
        else:
            result['images'] = []
    else:
        result['images'] = []
    
    # Handle investment metrics
    if 'investment_metrics' not in result and 'market_analysis' in result and isinstance(result['market_analysis'], dict):
        # Create investment metrics from market analysis
        metrics = []
        
        for key, value in result['market_analysis'].items():
            if key in ['pricePerSqMeter', 'neighborhoodGrowth'] and value is not None:
                percentage = "0%"
                if key == 'neighborhoodGrowth' and isinstance(value, (int, float)):
                    percentage = f"{value}%"
                metrics.append({
                    'type': key,
                    'value': str(value),
                    'percentage': percentage,
                    'description': None
                })
            elif isinstance(value, str):
                metrics.append({
                    'type': key,
                    'value': value,
                    'percentage': "0%",
                    'description': None
                })
        
        if metrics:
            result['investment_metrics'] = metrics
    
    # Create analysis object if needed for backward compatibility
    if 'investment_metrics' in result and 'analysis' not in result:
        result['analysis'] = {'investmentMetrics': result['investment_metrics']}
    
    # Ensure required fields with default values
    if 'bedrooms' not in result:
        result['bedrooms'] = 0
    if 'bathrooms' not in result:
        result['bathrooms'] = 0
    if 'area' not in result:
        result['area'] = 0.0
    if 'price' not in result:
        result['price'] = 0
    if 'status' not in result:
        result['status'] = 'draft'
    if 'title' not in result or not result['title']:
        result['title'] = 'Untitled Property'
    if 'description' not in result or not result['description']:
        result['description'] = 'No description available'
    
    # Ensure the price is a number
    if 'price' in result and isinstance(result['price'], str):
        try:
            result['price'] = float(result['price'].replace(',', ''))
        except (ValueError, TypeError):
            result['price'] = 0
    
    return result

router = APIRouter()

# get_supabase is now imported from utils

@router.get("/properties", response_model=PropertyList, operation_id="get_properties2")
def get_properties(
    page: Optional[int] = 1,
    size: Optional[int] = 10,
) -> PropertyList:
    """Get all properties."""
    if page < 1:
        raise HTTPException(status_code=400, detail="Page must be greater than 0")
    if size < 1 or size > 100:
        raise HTTPException(status_code=400, detail="Size must be between 1 and 100")
    try:
        # Get properties from storage instead of Supabase
        try:
            # Try Supabase first
            supabase = get_supabase()
            offset = (page - 1) * size
            total = supabase.table("properties").select("count", count="exact").execute()
            total_count = total.count
            response = supabase.table("properties").select("*").range(offset, offset + size - 1).execute()
            db_properties = response.data
        except Exception as db_error:
            print(f"Error getting properties from database: {str(db_error)}")
            db_properties = []
            total_count = 0

        # If no properties in database, use storage
        if not db_properties or total_count == 0:
            print("Using storage-based properties")
            try:
                # Import property functions from storage
                import json
                properties_json = db.storage.text.get("luxury_properties.json")
                storage_data = json.loads(properties_json)
                all_storage_properties = storage_data.get("properties", [])
                
                # Calculate pagination
                offset = (page - 1) * size
                end = offset + size
                paginated_properties = all_storage_properties[offset:end]
                
                properties = [PropertyResponse(**adapt_property_for_response(property)) for property in paginated_properties]
                total_count = len(all_storage_properties)
            except Exception as storage_error:
                print(f"Error getting properties from storage: {str(storage_error)}")
                properties = []
                total_count = 0
        else:
            # Use database properties
            properties = [PropertyResponse(**adapt_property_for_response(property)) for property in db_properties]

        return PropertyList(
            properties=properties,
            total=total_count,
            page=page,
            size=size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/properties/{property_id}", response_model=PropertyResponse, operation_id="get_property2")
def get_property(property_id: str) -> PropertyResponse:
    """Get a property by ID."""
    try:
        # Try to get from supabase first
        try:
            supabase = get_supabase()
            response = supabase.table("properties").select("*").eq("id", property_id).single().execute()
            if response.data:
                return PropertyResponse(**adapt_property_for_response(response.data))
        except Exception as db_error:
            print(f"Error getting property from database: {str(db_error)}")
        
        # If not found or error occurred, try from storage
        try:
            print(f"Trying to get property {property_id} from storage")
            import json
            properties_json = db.storage.text.get("luxury_properties.json")
            all_properties = json.loads(properties_json).get("properties", [])
            
            # Find property by ID
            for prop in all_properties:
                if str(prop.get("id")) == str(property_id):
                    return PropertyResponse(**adapt_property_for_response(prop))
        except Exception as storage_error:
            print(f"Error getting property from storage: {str(storage_error)}")
        
        # If we reach here, property was not found
        raise HTTPException(status_code=404, detail="Property not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

# Custom JSON encoder to handle Decimal types
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        # Handle HttpUrl objects from pydantic
        if hasattr(obj, '__str__'):
            try:
                return str(obj)
            except Exception:
                pass
        return super().default(obj)

def serialize_property(property_data: dict) -> dict:
    """Serialize property data for database storage."""
    # Convert to JSON and back to handle special types
    try:
        json_str = json.dumps(property_data, cls=CustomJSONEncoder)
        return json.loads(json_str)
    except Exception as e:
        print(f"Serialization error: {str(e)}")
        # Recursively convert problematic types
        result = {}
        for key, value in property_data.items():
            if isinstance(value, dict):
                result[key] = serialize_property(value)
            elif isinstance(value, list):
                result[key] = [serialize_property(item) if isinstance(item, dict) else 
                              str(item) if hasattr(item, '__str__') else item 
                              for item in value]
            elif isinstance(value, Decimal):
                result[key] = float(value)
            elif hasattr(value, '__str__'):
                try:
                    result[key] = str(value)
                except Exception:
                    result[key] = None
            else:
                result[key] = value
        return result

@router.post("/properties", response_model=PropertyResponse, operation_id="create_property2")
def create_property(property_data: PropertyCreate) -> PropertyResponse:
    """Create a new property."""
    supabase = get_supabase()
    try:
        # Convert to dict and serialize to handle Decimal types
        property_dict = property_data.dict(exclude_unset=True)
        property_dict = serialize_property(property_dict)

        # Insert into database
        response = supabase.table("properties").insert(property_dict).execute()
        return PropertyResponse(**adapt_property_for_response(response.data[0]))
    except Exception as e:
        print(f"Error creating property: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.put("/properties/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: str,
    property_data: PropertyUpdate,
) -> PropertyResponse:
    """Update a property."""
    supabase = get_supabase()
    try:
        response = supabase.table("properties").update(property_data.dict()).eq("id", property_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Property not found")
        return PropertyResponse(**adapt_property_for_response(response.data[0]))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.delete("/properties/{property_id}")
def delete_property(property_id: str) -> dict:
    """Delete a property."""
    supabase = get_supabase()
    try:
        response = supabase.table("properties").delete().eq("id", property_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Property not found")
        return {"message": "Property deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.post("/properties/search", response_model=PropertySearchResponse)
def search_properties(
    search: PropertySearch,
) -> PropertySearchResponse:
    """Search properties."""
    if search.page < 1:
        raise HTTPException(status_code=400, detail="Page must be greater than 0")
    if search.size < 1 or search.size > 100:
        raise HTTPException(status_code=400, detail="Size must be between 1 and 100")
    supabase = get_supabase()
    try:
        # Calculate offset
        offset = (search.page - 1) * search.size

        # Build query
        query = supabase.table("properties").select("*")

        # Add full text search
        query = query.textSearch("fts", search.query)

        # Add sorting
        if search.sort:
            query = query.order(search.sort, ascending=(search.order == "asc"))

        # Get total count
        total = query.execute(count="exact")
        total_count = total.count

        # Get properties
        response = query.range(offset, offset + search.size - 1).execute()
        properties = [PropertyResponse(**adapt_property_for_response(property)) for property in response.data]

        return PropertySearchResponse(
            properties=properties,
            total=total_count,
            page=search.page,
            size=search.size,
            query=search.query
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/properties/update-all-images")
async def update_all_property_images(background_tasks: BackgroundTasks, image_count: int = 5, force_regenerate: bool = True) -> dict:
    """Update all property images with DALL-E, respecting rate limits.
    
    Args:
        image_count: Number of images to generate per property (1-5)
        force_regenerate: Force regeneration of images even if they already exist
    """
    try:
        # Validate image count
        if image_count < 1 or image_count > 5:
            raise HTTPException(status_code=400, detail="Image count must be between 1 and 5")
            
        # Get all property IDs
        property_ids = []
        
        # Try to get properties from Supabase
        try:
            supabase = get_supabase()
            response = supabase.table("properties").select("id").execute()
            if response and response.data:
                property_ids = [str(prop["id"]) for prop in response.data]
        except Exception as db_error:
            print(f"Error getting properties from database: {str(db_error)}")
            
        # If database has no properties, try storage
        if not property_ids:
            try:
                import json
                properties_json = db.storage.text.get("luxury_properties.json")
                all_properties = json.loads(properties_json).get("properties", [])
                property_ids = [str(prop.get("id")) for prop in all_properties if prop.get("id")]
            except Exception as storage_error:
                print(f"Error getting properties from storage: {str(storage_error)}")
                
        # If no property IDs found, return error
        if not property_ids:
            raise HTTPException(status_code=404, detail="No properties found")
            
        # Schedule background task to update images
        background_tasks.add_task(
            process_batch_image_generation,
            property_ids,
            image_count,
            force_regenerate
        )
        
        return {
            "success": True,
            "message": f"Scheduled image update for {len(property_ids)} properties. Images will be generated at a rate of 5 per minute.",
            "property_count": len(property_ids),
            "image_count_per_property": image_count,
            "property_ids": property_ids
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating property images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating property images: {str(e)}")