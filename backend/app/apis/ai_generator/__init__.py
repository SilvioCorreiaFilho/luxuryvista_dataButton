"""AI Generator API for property content generation.

This module provides endpoints for:
- Generating property descriptions
- Generating property images
- Generating property features
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import random
import uuid
from fastapi import APIRouter
import databutton as db
from openai import OpenAI

from ..shared import PropertyData, PropertyResponse
from ..utils import sanitize_storage_key, sync_properties_to_storage, update_property_format

router = APIRouter()

# Constants for property generation
NEIGHBORHOODS = {
    "Lago Sul": {
        "address_prefix": "SHIS QL",
        "zip": "71630-015",
        "growth_range": (6.5, 9.2),
        "price_multiplier": 1.4
    },
    "Lago Norte": {
        "address_prefix": "SHIN QL",
        "zip": "71520-200",
        "growth_range": (5.8, 8.5),
        "price_multiplier": 1.2
    },
    "Asa Sul": {
        "address_prefix": "SQS",
        "zip": "70355-090",
        "growth_range": (5.0, 7.2),
        "price_multiplier": 1.0
    },
    "Asa Norte": {
        "address_prefix": "SQN",
        "zip": "70775-090",
        "growth_range": (4.8, 7.0),
        "price_multiplier": 0.95
    },
    "Park Way": {
        "address_prefix": "SMPW Quadra",
        "zip": "71741-005",
        "growth_range": (5.5, 8.0),
        "price_multiplier": 1.1
    }
}

ARCHITECTS = [
    "Oscar Niemeyer",
    "Lúcio Costa",
    "João Filgueiras Lima",
    "Lina Bo Bardi",
    "Paulo Mendes da Rocha"
]

DEFAULT_FEATURES = [
    "Rooftop infinity pool",
    "Wine cellar with tasting room",
    "Professional recording studio",
    "Solar energy system",
    "Spa and wellness center",
    "24/7 security system",
    "Private helipad",
    "Imported marble finishes",
    "Home theater with premium sound system",
    "Private garden with landscaping",
    "Smart home automation system", 
    "Gourmet chef's kitchen with premium appliances",
    "Indoor-outdoor swimming pool",
    "Heated infinity pool",
    "360° panoramic views"
]

async def generate_property(
    property_type: str,
    neighborhood: str,
    features: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Generate AI content for a luxury property.
    
    Args:
        property_type: Type of property (e.g., 'Luxury Residence', 'Penthouse', etc.)
        neighborhood: Neighborhood in Brasília
        features: Optional list of property features
        
    Returns:
        Dictionary with generated property data
    """
    try:
        # Use provided features or select random ones
        if not features:
            num_features = random.randint(6, 10)
            features = random.sample(DEFAULT_FEATURES, num_features)
            
        # Generate property data
        property_data = await _generate_property_data(property_type, neighborhood, features)
        
        print(f"Generated property content for {property_type} in {neighborhood}")
        
        return property_data
    except Exception as e:
        print(f"Error generating property content: {str(e)}")
        # Return basic property data if AI generation fails
        return _generate_fallback_property(property_type, neighborhood, features)

async def _generate_property_data(
    property_type: str,
    neighborhood: str,
    features: List[str]
) -> Dict[str, Any]:
    """Use AI to generate property content.
    
    Args:
        property_type: Type of property
        neighborhood: Neighborhood in Brasília
        features: List of property features
        
    Returns:
        Dictionary with generated property data
    """
    # Get OpenAI API key
    api_key = db.secrets.get("OPENAI_API_KEY")
    
    if not api_key:
        print("OpenAI API key not found, using fallback generation")
        return _generate_fallback_property(property_type, neighborhood, features)
    
    # Initialize OpenAI client
    client = OpenAI(api_key=api_key)
    
    # Generate title with AI
    title = await _generate_title_with_ai(client, property_type, neighborhood)
    
    # Generate description with AI
    description = await _generate_description_with_ai(client, property_type, neighborhood, features)
    
    # Generate property metrics
    property_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    # These ranges provide realistic luxury property values for Brasília
    bedrooms = random.randint(3, 8)
    bathrooms = bedrooms + random.randint(0, 3)
    area = random.randint(400, 1200)
    
    # Calculate price based on neighborhood and property type multipliers
    neighborhood_data = NEIGHBORHOODS.get(neighborhood, NEIGHBORHOODS["Lago Sul"])
    base_price = 5000000  # 5 million BRL base price
    
    # Apply property type multiplier
    type_multipliers = {
        "Luxury Residence": 1.0,
        "Penthouse": 1.6,
        "Villa": 1.3,
        "Mansion": 1.5,
        "Estate": 1.8
    }
    type_multiplier = type_multipliers.get(property_type, 1.0)
    
    # Calculate price
    neighborhood_multiplier = neighborhood_data["price_multiplier"]
    area_factor = area * (10000 + random.randint(5000, 35000))
    price = int(base_price + area_factor * neighborhood_multiplier * type_multiplier)
    
    # Calculate investment metrics
    growth_range = neighborhood_data["growth_range"]
    annual_growth = round(random.uniform(*growth_range), 2)
    roi = round(annual_growth * 1.2, 2)  # ROI slightly higher than growth
    
    # Format price with BRL currency
    formatted_price = f"R$ {price:,.2f}"
    
    # Create property data
    property_data = {
        "id": property_id,
        "title": title,
        "description": description,
        "property_type": {
            "id": sanitize_storage_key(f"type_{property_type.lower()}"),
            "name": property_type,
            "description": f"Luxurious {property_type.lower()} property"
        },
        "location": {
            "neighborhood": neighborhood,
            "address": f"{neighborhood_data['address_prefix']} {random.randint(1, 30)}",
            "zip_code": neighborhood_data["zip"],
            "city": "Brasília",
            "state": "DF",
            "country": "Brazil",
            "latitude": -15.8418 + random.uniform(-0.1, 0.1),
            "longitude": -47.8739 + random.uniform(-0.1, 0.1)
        },
        "price": formatted_price,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "area": area,
        "features": [
            {"name": feature, "description": None, "icon": None}
            for feature in features
        ],
        "images": [],  # Will be populated by image generation
        "status": "Available",
        "tags": [property_type, neighborhood, "Luxury", "Investment"],
        "investment_metrics": [
            {
                "name": "Annual Growth",
                "value": annual_growth,
                "unit": "%",
                "description": "Expected annual property value growth"
            },
            {
                "name": "ROI",
                "value": roi,
                "unit": "%",
                "description": "Expected return on investment"
            }
        ],
        "created_at": now,
        "updated_at": now,
        "published_at": now
    }
    
    return update_property_format(property_data)

async def _generate_title_with_ai(client: OpenAI, property_type: str, neighborhood: str) -> str:
    """Generate a title for the property using AI.
    
    Args:
        client: OpenAI client
        property_type: Type of property
        neighborhood: Neighborhood in Brasília
        
    Returns:
        Generated title
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a luxury real estate copywriter specializing in high-end properties in Brasília."
                },
                {
                    "role": "user",
                    "content": f"Create a compelling title for a {property_type} in {neighborhood}, Brasília. The title should be luxurious but not over-the-top. Keep it under 10 words."
                }
            ]
        )
        
        title = response.choices[0].message.content.strip()
        
        # Remove quotes if present
        title = title.strip('"')
        
        return title
    except Exception as e:
        print(f"Error generating title with AI: {e}")
        return f"Luxurious {property_type} in {neighborhood}"

async def _generate_description_with_ai(client: OpenAI, property_type: str, neighborhood: str, features: List[str]) -> str:
    """Generate a description for the property using AI.
    
    Args:
        client: OpenAI client
        property_type: Type of property
        neighborhood: Neighborhood in Brasília
        features: List of property features
        
    Returns:
        Generated description
    """
    try:
        # Format features as a comma-separated list
        features_text = ", ".join(features)
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a luxury real estate copywriter specializing in high-end properties in Brasília. Write compelling descriptions that highlight unique features and investment potential."
                },
                {
                    "role": "user",
                    "content": f"Create a detailed description for a {property_type} in {neighborhood}, Brasília. Include these features: {features_text}. The description should be sophisticated and highlight the property's luxury aspects and investment potential. Keep it under 300 words."
                }
            ]
        )
        
        description = response.choices[0].message.content.strip()
        
        return description
    except Exception as e:
        print(f"Error generating description with AI: {e}")
        return f"Stunning {property_type.lower()} in the prestigious {neighborhood} area of Brasília. This luxurious property features {', '.join(features[:3])} and more. A rare investment opportunity in one of Brasília's most sought-after neighborhoods."

def _generate_fallback_property(property_type: str, neighborhood: str, features: List[str]) -> Dict[str, Any]:
    """Generate basic property data without AI.
    
    Args:
        property_type: Type of property
        neighborhood: Neighborhood in Brasília
        features: List of property features
        
    Returns:
        Dictionary with basic property data
    """
    property_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    
    title = f"Luxurious {property_type} in {neighborhood}"
    description = f"Stunning {property_type.lower()} in the prestigious {neighborhood} area of Brasília. This luxurious property features {', '.join(features[:3])} and more. A rare investment opportunity in one of Brasília's most sought-after neighborhoods."
    
    # Basic property metrics
    bedrooms = random.randint(3, 8)
    bathrooms = bedrooms + random.randint(0, 3)
    area = random.randint(400, 1200)
    
    # Basic price calculation
    price = 5000000 + (area * 15000)  # Simple formula for fallback
    formatted_price = f"R$ {price:,.2f}"
    
    property_data = {
        "id": property_id,
        "title": title,
        "description": description,
        "property_type": {
            "id": sanitize_storage_key(f"type_{property_type.lower()}"),
            "name": property_type,
            "description": f"Luxurious {property_type.lower()} property"
        },
        "location": {
            "neighborhood": neighborhood,
            "address": f"Sample Address, {neighborhood}",
            "zip_code": NEIGHBORHOODS[neighborhood]["zip"],
            "city": "Brasília",
            "state": "DF",
            "country": "Brazil",
            "latitude": -15.8418,
            "longitude": -47.8739
        },
        "price": formatted_price,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "area": area,
        "features": [
            {"name": feature, "description": None, "icon": None}
            for feature in features
        ],
        "images": [],
        "status": "Available",
        "tags": [property_type, neighborhood, "Luxury", "Investment"],
        "investment_metrics": [
            {
                "name": "Annual Growth",
                "value": 7.0,
                "unit": "%",
                "description": "Expected annual property value growth"
            },
            {
                "name": "ROI",
                "value": 8.0,
                "unit": "%",
                "description": "Expected return on investment"
            }
        ],
        "created_at": now,
        "updated_at": now,
        "published_at": now
    }
    
    return update_property_format(property_data)
