"""Utility functions for the LuxuryVista application"""

from fastapi import APIRouter

# Create a router for this module to prevent import errors
router = APIRouter(prefix="/utils", tags=["utilities"])

import databutton as db
import traceback
import json
import re
from typing import Dict, List, Any, Optional, Union

# Global cache for clients
_openai_client = None
_supabase_client = None

# AI Client utility functions
def get_ai_client():
    """Get an AI client (OpenAI or DeepSeek)"""
    global _openai_client
    
    # Return cached client if available
    if _openai_client:
        return _openai_client
    
    # First try OpenAI as it's more reliable
    try:
        from openai import OpenAI
        api_key = db.secrets.get("OPENAI_API_KEY")
        if api_key:
            _openai_client = OpenAI(api_key=api_key)
            print("Using OpenAI client")
            return _openai_client
    except Exception as e:
        print(f"Error creating OpenAI client: {e}")
    
    # Then try DeepSeek if available
    try:
        import deepseek
        if hasattr(deepseek, 'DeepSeekAPI'):
            api_key = db.secrets.get("DEEPSEEK_API_KEY")
            if api_key:
                # Use the DeepSeek API based on the actual interface available
                _openai_client = deepseek.DeepSeekAPI(api_key=api_key)
                print("Using DeepSeek client")
                return _openai_client
    except Exception as e:
        print(f"Error creating DeepSeek client: {e}")
    
    return None

def generate_property_description(property_data):
    """Generate a property description using AI"""
    try:
        client = get_ai_client()
        if not client:
            return "AI services unavailable. Please configure API keys."
            
        # Extract property details
        property_type = property_data.get("property_type", "Luxury Property")
        if isinstance(property_type, dict):
            property_type = property_type.get("name", "Luxury Property")
            
        location = property_data.get("location", "Brasília")
        if isinstance(location, dict):
            location = location.get("name", "Brasília")
            
        bedrooms = property_data.get("bedrooms", 4)
        bathrooms = property_data.get("bathrooms", 4)
        area = property_data.get("area", 500)
        
        # Create prompt
        prompt = f"""Create a luxurious real estate description for this high-end property:
        
        Property Type: {property_type}
        Location: {location}
        Size: {area} m² with {bedrooms} bedrooms and {bathrooms} bathrooms
        
        Make it sound sophisticated and appealing to affluent buyers.
        Focus on exclusivity, premium finishes, and the luxury lifestyle.
        Keep it to 2-3 paragraphs."""
        
        # Generate description
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a luxury real estate copywriter who creates compelling property descriptions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Error generating property description: {e}")
        return "Unable to generate description at this time."

def generate_image_prompt(property_data, image_type="exterior"):
    """Generate a prompt for image generation based on property data"""
    try:
        # Extract property details
        property_type = property_data.get("property_type", "Luxury Property")
        if isinstance(property_type, dict):
            property_type = property_type.get("name", "Luxury Property")
            
        location = property_data.get("location", "Brasília")
        if isinstance(location, dict):
            location = location.get("name", "Brasília")
        
        # Image type prompts
        prompts = {
            "exterior": f"Photorealistic exterior view of a luxury {property_type} in {location}. Modern architecture, premium materials, lush landscaping, daytime, professional real estate photography style.",
            
            "interior": f"Photorealistic interior view of a luxury {property_type} in {location}. Spacious living room with high ceilings, modern furniture, large windows with natural light, marble floors, sophisticated design.",
            
            "aerial": f"Aerial drone photography of a luxury {property_type} in {location}. Bird's eye view, property surrounded by greenery, swimming pool visible, exclusive neighborhood, sunny day.",
            
            "pool": f"Photorealistic swimming pool of a luxury {property_type} in {location}. Infinity edge pool, designer lounge chairs, outdoor kitchen, pergola, tropical landscaping, sunset lighting.",
            
            "bedroom": f"Photorealistic master bedroom of a luxury {property_type} in {location}. King-sized bed, walk-in closet, en-suite bathroom, floor-to-ceiling windows, high-end furnishings, mood lighting."
        }
        
        # Get prompt based on image type
        prompt = prompts.get(image_type, prompts["exterior"])
        
        # Add quality specifications
        prompt += " 8K ultra-detailed, architectural photography."
        
        return prompt
        
    except Exception as e:
        print(f"Error generating image prompt: {e}")
        return f"Photorealistic luxury {property_type} in {location}, professional real estate photography."

# Sanitize storage key function
def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

# Supabase utility functions
def get_supabase():
    """Get a Supabase client"""
    global _supabase_client
    
    # Return cached client if available
    if _supabase_client:
        return _supabase_client
    
    try:
        from supabase import create_client
        url = db.secrets.get("SUPABASE_URL")
        key = db.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
        if not url or not key:
            print("Supabase credentials not properly configured")
            return None
            
        _supabase_client = create_client(url, key)
        return _supabase_client
    except Exception as e:
        print(f"Error creating Supabase client: {e}")
        return None

def adapt_property_for_response(property_data):
    """Adapt property data for API response"""
    if not property_data:
        return {}
        
    result = dict(property_data)
    
    # Ensure ID is a string
    if 'id' in result and result['id'] is not None:
        result['id'] = str(result['id'])
        
    return result