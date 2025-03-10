"""Robust AI client wrapper with fallbacks for DeepSeek AI.

This module provides a flexible interface for interacting with DeepSeek AI
with support for different client versions and graceful degradation.
"""

from fastapi import APIRouter

# Create an empty router to satisfy the module loader
# This router is not intended to be used for API endpoints
router = APIRouter()

import os
import json
import random
from typing import Dict, Any, List, Optional, Union
import databutton as db

# Print version info for debugging
print("Loading AI client wrapper with fallback support")

# Try to import the DeepSeek AI client
DEEPSEEK_AVAILABLE = False
DeepSeekClient = None

# Try to import the client
try:
    from deepseek import Client as DeepSeekClient
    DEEPSEEK_AVAILABLE = True
    print("Successfully imported DeepSeek AI client")
except ImportError as e:
    print(f"DeepSeek AI client not available: {e}")

# Define fallback text for when we can't use DeepSeek
LUXURY_PROPERTY_DESCRIPTIONS = [
    """
Nestled in the prestigious [NEIGHBORHOOD] neighborhood, this magnificent [PROPERTY_TYPE] 
represents the pinnacle of luxury living in [LOCATION]. With [BEDROOMS] sumptuous bedrooms 
and [BATHROOMS] opulent bathrooms across [AREA] square meters of meticulously designed space, 
it offers an unparalleled residential experience.

The property showcases extraordinary architectural details and premium finishes throughout. 
Floor-to-ceiling windows bathe the interior in natural light while framing spectacular views 
of the surrounding landscape. The gourmet chef's kitchen features imported marble countertops, 
custom cabinetry, and state-of-the-art appliances that will delight culinary enthusiasts.

Outdoor amenities include a heated infinity pool, meticulously landscaped gardens, and 
expansive entertainment terraces, creating a private sanctuary for relaxation and 
sophisticated entertaining. The property's smart home technology controls lighting, 
security, climate, and entertainment systems with effortless precision.

Positioned in one of [LOCATION]'s most coveted addresses, this extraordinary residence 
offers proximity to exclusive shopping, fine dining, and cultural attractions, while 
maintaining an atmosphere of secluded luxury and tranquility. This is more than a home—it's 
a legacy property for the discerning investor seeking the best that [LOCATION] has to offer.
""",
    """
Welcome to the crown jewel of [NEIGHBORHOOD], a [PROPERTY_TYPE] that redefines luxury living 
in [LOCATION]. This architectural masterpiece offers [BEDROOMS] bedrooms and [BATHROOMS] bathrooms 
across [AREA] square meters of impeccably designed living space, blending classic elegance with 
contemporary sophistication.

Each space within this extraordinary residence has been thoughtfully crafted with rare materials 
and bespoke finishes. The grand living areas feature soaring ceilings, museum-quality wall 
finishes, and seamless indoor-outdoor flow. The chef's kitchen boasts custom cabinetry, 
quartzite countertops, and a suite of professional-grade appliances that would satisfy the 
most discerning culinary expert.

The primary suite is a sanctuary unto itself, with a private terrace, dual dressing rooms, 
and a spa-inspired bathroom featuring book-matched marble, a free-standing soaking tub, and 
a steam shower. Additional amenities include a temperature-controlled wine cellar, home 
theater, fitness studio, and smart home automation controlling every aspect of this 
extraordinary environment.

The grounds offer resort-style luxury with a negative-edge pool, outdoor kitchen, and 
meticulously landscaped gardens. Located minutes from [LOCATION]'s premier shopping and 
dining destinations, this property represents an unparalleled opportunity to acquire one 
of the city's most prestigious addresses.
""",
    """
Presenting an extraordinary opportunity in [LOCATION]'s exclusive [NEIGHBORHOOD] enclave, 
this magnificent [PROPERTY_TYPE] stands as a testament to architectural excellence and 
uncompromising luxury. With [BEDROOMS] bedrooms and [BATHROOMS] bathrooms distributed 
across [AREA] square meters of living space, the residence offers generous proportions 
for both intimate family living and grand-scale entertaining.

Designed by award-winning architects, the property showcases a harmonious blend of 
traditional elegance and contemporary innovation. The interior spaces feature soaring 
ceilings, walls of glass, and a thoughtful layout that maximizes natural light and 
seamlessly connects indoor and outdoor living areas. Premium materials including rare 
marble, exotic hardwoods, and artisanal metalwork create an atmosphere of refined luxury.

The culinary enthusiast will appreciate the professional-grade kitchen equipped with 
custom cabinetry, book-matched stone surfaces, and state-of-the-art appliances. The 
owner's suite offers a private retreat with spectacular views, a sitting area, and a 
spa-inspired bathroom with heated floors and a therapeutic soaking tub.

Outdoor amenities include a resort-style pool, summer kitchen, and meticulously 
landscaped gardens that create a private oasis in the heart of the city. Advanced 
security systems, smart home technology, and energy-efficient features complete this 
extraordinary offering in one of [LOCATION]'s most sought-after neighborhoods.
"""
]

def get_deepseek_api_key() -> Optional[str]:
    """Get DeepSeek API key from environment variables or secrets"""
    # Try getting from secrets first
    try:
        api_key = db.secrets.get("DEEPSEEK_API_KEY")
        if api_key:
            return api_key
    except Exception as e:
        print(f"Error getting DeepSeek API key from secrets: {e}")
    
    # Fallback to environment variable
    return os.environ.get("DEEPSEEK_API_KEY")

def create_deepseek_client(api_key: Optional[str] = None) -> Any:
    """Create a DeepSeek client with graceful fallback if package is not available"""
    if not DEEPSEEK_AVAILABLE:
        print("DeepSeek AI client not available, returning mock client")
        return MockDeepSeekClient()
    
    # Use provided API key or get from environment
    api_key = api_key or get_deepseek_api_key()
    
    if not api_key:
        print("DeepSeek API key not available, returning mock client")
        return MockDeepSeekClient()
    
    # Create client
    try:
        return DeepSeekClient(api_key=api_key)
    except Exception as e:
        print(f"Error creating DeepSeek client: {e}")
        return MockDeepSeekClient()

class MockDeepSeekClient:
    """Mock DeepSeek client that can be used when the real client is not available"""
    
    def __init__(self):
        pass
        
    def chat(self, messages, model="deepseek-chat", temperature=0.7, max_tokens=None):
        return self.completions.create(messages, model, temperature, max_tokens)
    
    class completions:
        @staticmethod
        def create(messages, model="deepseek-chat", temperature=0.7, max_tokens=None):
            """Generate a mock chat completion response"""
            # Extract the property details from the messages
            property_details = {}
            
            for message in messages:
                if isinstance(message, dict):
                    content = message.get("content", "")
                else:
                    # Handling ChatMessage objects
                    content = getattr(message, "content", "")
                    
                if "bedrooms" in content.lower():
                    # Try to extract property details
                    try:
                        if "bedrooms" in content.lower():
                            import re
                            bedrooms_match = re.search(r'(\d+)\s*bedrooms', content.lower())
                            if bedrooms_match:
                                property_details["bedrooms"] = bedrooms_match.group(1)
                        
                        if "bathrooms" in content.lower():
                            bathrooms_match = re.search(r'(\d+)\s*bathrooms', content.lower())
                            if bathrooms_match:
                                property_details["bathrooms"] = bathrooms_match.group(1)
                                
                        if "square meters" in content.lower() or "sq meters" in content.lower():
                            area_match = re.search(r'(\d+)\s*(?:square meters|sq meters)', content.lower())
                            if area_match:
                                property_details["area"] = area_match.group(1)
                                
                        # Extract property type
                        property_types = ["mansion", "penthouse", "villa", "estate", "apartment", "condo"]
                        for pt in property_types:
                            if pt in content.lower():
                                property_details["property_type"] = pt.capitalize()
                                break
                        
                        # Extract location and neighborhood
                        if "in" in content.lower():
                            location_match = re.search(r'in\s+([\w\s]+),\s*([\w\s]+)', content)
                            if location_match:
                                property_details["city"] = location_match.group(1).strip()
                                property_details["neighborhood"] = location_match.group(2).strip()
                    except Exception as e:
                        print(f"Error extracting property details: {e}")
            
            # Choose a random description template
            template = random.choice(LUXURY_PROPERTY_DESCRIPTIONS)
            
            # Replace placeholders with property details
            description = template
            description = description.replace("[BEDROOMS]", str(property_details.get("bedrooms", "4")))
            description = description.replace("[BATHROOMS]", str(property_details.get("bathrooms", "5")))
            description = description.replace("[AREA]", str(property_details.get("area", "350")))
            description = description.replace("[PROPERTY_TYPE]", property_details.get("property_type", "Luxury Residence"))
            description = description.replace("[LOCATION]", property_details.get("city", "Brasília"))
            description = description.replace("[NEIGHBORHOOD]", property_details.get("neighborhood", "Lago Sul"))
            
            # Create a response object with a structure similar to the API response
            class Choice:
                def __init__(self, text):
                    self.message = type('obj', (object,), {'content': text})
                    
            class Response:
                def __init__(self, text):
                    self.choices = [Choice(text)]
                    
            return Response(description)

def generate_property_description(
    property_data: Dict[str, Any],
    api_key: Optional[str] = None,
    model: str = "deepseek-chat"
) -> str:
    """Generate a property description using DeepSeek AI (with fallbacks)"""
    # Create a client - this will fall back to a mock if needed
    client = create_deepseek_client(api_key)
    
    # Extract key property information
    property_type = "Luxury Property"
    if isinstance(property_data.get('property_type'), dict):
        property_type = property_data.get('property_type', {}).get('name', 'Luxury Property')
    elif isinstance(property_data.get('property_type'), str):
        property_type = property_data.get('property_type')
    
    # Extract bedrooms, bathrooms, area
    bedrooms = property_data.get('bedrooms', 0)
    bathrooms = property_data.get('bathrooms', 0)
    area = property_data.get('area', 0)
    
    # Try to extract from specifications if present
    if 'specifications' in property_data and isinstance(property_data.get('specifications'), dict):
        specs = property_data.get('specifications', {})
        if not bedrooms and 'bedrooms' in specs:
            bedrooms = specs.get('bedrooms', 0)
        if not bathrooms and 'bathrooms' in specs:
            bathrooms = specs.get('bathrooms', 0)
        if not area and 'area' in specs:
            area = specs.get('area', 0)
    
    # Extract location information
    neighborhood = ""
    city = "Brasília"
    
    # Try different paths to get location info
    if isinstance(property_data.get('location'), dict):
        city = property_data.get('location', {}).get('name', city)
    elif isinstance(property_data.get('location'), str):
        city = property_data.get('location')
        
    if 'neighborhood' in property_data and property_data.get('neighborhood'):
        neighborhood = property_data.get('neighborhood')
    elif 'address' in property_data:
        address = property_data.get('address', {})
        if isinstance(address, dict):
            if 'neighborhood' in address:
                neighborhood = address.get('neighborhood', '')
            if 'city' in address and not city:
                city = address.get('city', city)
        
    # Format features as a list
    features_text = ""
    features = property_data.get('features', [])
    if features:
        if isinstance(features[0], dict):
            feature_list = [f.get('name', '') for f in features if isinstance(f, dict) and 'name' in f]
        else:
            feature_list = [f for f in features if isinstance(f, str)]
        features_text = ", ".join(feature_list)
    
    # Create system and user prompts
    system_prompt = """You are a luxury real estate copywriter specializing in elegant, 
compelling descriptions for high-end properties. Highlight unique features,
location advantages, and investment potential. Focus on creating vivid imagery 
and emphasizing exclusivity. Limit to 3-4 paragraphs."""
    
    user_prompt = f"""Create a luxury property description for this {property_type} in {city}{', ' + neighborhood if neighborhood else ''}.

Property details:
- {bedrooms} bedrooms
- {bathrooms} bathrooms
- {area} square meters
- Features: {features_text}

Make it elegant, compelling, and highlight the exclusivity of this property."""
    
    # Format messages based on the client version
    try:
        # Use standard message format for DeepSeek
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
            
        # Call the API with robust error handling for different response formats
        try:
            # Try using the chat.completions.create method (OpenAI-like interface)
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=800
            )
        except AttributeError:
            # Fallback to direct chat method if needed
            try:
                response = client.chat(
                    messages=messages,
                    model=model,
                    temperature=0.7,
                    max_tokens=800
                )
            except Exception as chat_error:
                print(f"Error using chat method: {chat_error}")
                raise
        
        # Extract text from response (handling different response structures)
        if hasattr(response, 'choices') and response.choices:
            if hasattr(response.choices[0], 'message'):
                if hasattr(response.choices[0].message, 'content'):
                    return response.choices[0].message.content
                else:
                    # Some versions might have a different structure
                    return response.choices[0].message
            else:
                # Handle legacy structure
                return response.choices[0].get('message', {}).get('content', "")
        else:
            # Completely different structure, try to parse JSON
            try:
                if isinstance(response, str):
                    data = json.loads(response)
                    return data.get('choices', [{}])[0].get('message', {}).get('content', "")
            except Exception:
                pass
                
            # Last fallback: simple string extraction
            response_str = str(response)
            if "content" in response_str:
                # Skip using regex, use simple string parsing
                try:
                    if "content" in response_str and ':"' in response_str:
                        parts = response_str.split(':"')
                        for part in parts:
                            if part.endswith('"') and len(part) > 3:
                                return part[:-1]  # Remove the trailing quote
                except Exception as extract_err:
                    print(f"Content extraction error: {extract_err}")
    except Exception as e:
        print(f"Error generating property description: {e}")
    
    # If all else fails, use a template description
    template = random.choice(LUXURY_PROPERTY_DESCRIPTIONS)
    description = template.replace("[BEDROOMS]", str(bedrooms))
    description = description.replace("[BATHROOMS]", str(bathrooms))
    description = description.replace("[AREA]", str(area))
    description = description.replace("[PROPERTY_TYPE]", property_type)
    description = description.replace("[LOCATION]", city)
    description = description.replace("[NEIGHBORHOOD]", neighborhood or "premium")
    
    return description