"""Standalone property description generator module.

This module provides property description generation capabilities
without any dependencies on other modules to avoid import issues.
"""

from fastapi import APIRouter
import random
import traceback
import databutton as db
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

# Create a router with endpoints
router = APIRouter(prefix="/descriptions", tags=["properties"])

# API Request/Response models
class GenerateDescriptionRequest(BaseModel):
    property_data: Dict[str, Any] = Field(..., description="Property data for description generation")
    api_key: Optional[str] = Field(None, description="Optional API key for AI service")
    model: str = Field("deepseek-chat", description="AI model to use for generation")

class GenerateDescriptionResponse(BaseModel):
    description: str

# Define luxury property descriptions for fallback
LUXURY_DESCRIPTIONS = [
    """Nestled in a prestigious neighborhood, this magnificent property represents the pinnacle of luxury living. With sumptuous bedrooms and opulent bathrooms across meticulously designed space, it offers an unparalleled residential experience.

The property showcases extraordinary architectural details and premium finishes throughout. Floor-to-ceiling windows bathe the interior in natural light while framing spectacular views of the surrounding landscape.

Outdoor amenities include a heated infinity pool, meticulously landscaped gardens, and expansive entertainment terraces, creating a private sanctuary for relaxation and sophisticated entertaining.""",
    
    """Welcome to the crown jewel of luxury real estate, an architectural masterpiece offering bedrooms and bathrooms across impeccably designed living space, blending classic elegance with contemporary sophistication.

Each space within this extraordinary residence has been thoughtfully crafted with rare materials and bespoke finishes. The grand living areas feature soaring ceilings, museum-quality wall finishes, and seamless indoor-outdoor flow.

The grounds offer resort-style luxury with a negative-edge pool, outdoor kitchen, and meticulously landscaped gardens. Located minutes from premier shopping and dining destinations.""",
    
    """Presenting an extraordinary opportunity, this magnificent property stands as a testament to architectural excellence and uncompromising luxury. The residence offers generous proportions for both intimate family living and grand-scale entertaining.

Designed by award-winning architects, the property showcases a harmonious blend of traditional elegance and contemporary innovation. Premium materials including rare marble, exotic hardwoods, and artisanal metalwork create an atmosphere of refined luxury.

Outdoor amenities include a resort-style pool, summer kitchen, and meticulously landscaped gardens that create a private oasis in the heart of the city."""
]

# Define Brasília-specific luxury descriptions
BRASILIA_LUXURY_DESCRIPTIONS = [
    """This extraordinary residence in Brasília represents the pinnacle of modernist luxury. Designed with clean lines and geometric precision that echo the city's architectural heritage, the property creates a harmonious connection between indoor and outdoor living spaces.

The interior showcases museum-quality finishes including rare Brazilian hardwoods, imported stone, and bespoke lighting that highlights the dramatic volumes. Floor-to-ceiling windows frame spectacular views of the city's iconic skyline and bring abundant natural light to the living spaces.

The grounds feature a negative-edge pool, outdoor lounging areas, and meticulously landscaped gardens designed to create a private sanctuary. Located in one of Brasília's most prestigious addresses, this property offers unparalleled access to the city's diplomatic quarter and cultural landmarks.""",
    
    """This exceptional residence in Lago Sul represents the pinnacle of luxury living in Brasília. Designed by the renowned João Filgueiras Lima, the residence embodies the city's architectural legacy while offering contemporary amenities.

The property is characterized by its bold geometric forms and dramatic cantilevers that create sheltered outdoor living spaces. Floor-to-ceiling windows throughout the home capture the abundant natural light and offer spectacular views of the surrounding landscape.

The main living areas flow seamlessly onto expansive terraces, perfect for entertaining. The property's design thoughtfully integrates with the natural topography, creating a sense of harmony with the environment.""",
    
    """This architectural masterpiece in Brasília's exclusive diplomatic sector represents the convergence of modernist principles and contemporary luxury. Designed with the clean lines and spatial fluidity characteristic of Oscar Niemeyer's vision, the residence creates a sense of weightlessness and light.

The interior spaces feature soaring ceilings and an open floor plan that maximizes natural light and ventilation. Custom millwork and built-ins throughout the home showcase Brazilian craftsmanship and attention to detail.

Outdoor amenities include an infinity pool positioned to capture panoramic views of Lake Paranoá, tropical landscaping with mature specimen trees, and multiple outdoor living and dining areas perfect for entertaining."""
]

@router.post("/generate")
async def generate_description(request: GenerateDescriptionRequest) -> GenerateDescriptionResponse:
    """Generate a detailed luxury property description"""
    description = generate_property_description(
        property_data=request.property_data,
        api_key=request.api_key,
        model=request.model
    )
    return GenerateDescriptionResponse(description=description)


def generate_property_description(property_data: Dict[str, Any], api_key: Optional[str] = None, model: str = "deepseek-chat") -> str:
    """
    Generate detailed property description using multiple models with fallbacks.
    
    This function tries to use the DeepSeek API first, but falls back to a template-based
    approach if that fails. It ensures rich property descriptions regardless of API availability.
    
    Args:
        property_data (dict): Data about the property
        api_key (str, optional): Custom API key. Defaults to None.
        model (str, optional): Model to use. Defaults to "deepseek-chat".
        
    Returns:
        str: A detailed property description
    """
    try:
        # Extract basic property info with safe defaults
        bedrooms = 0
        bathrooms = 0
        area = 0
        property_type = "Luxury Property"
        location = "Brasília"
        neighborhood = ""
        
        # Handle different property_type formats
        if "property_type" in property_data:
            if isinstance(property_data["property_type"], dict) and "name" in property_data["property_type"]:
                property_type = property_data["property_type"]["name"]
            elif isinstance(property_data["property_type"], str):
                property_type = property_data["property_type"]
        
        # Extract specifications from nested dictionaries
        if "specifications" in property_data and isinstance(property_data["specifications"], dict):
            specs = property_data["specifications"]
            if "bedrooms" in specs:
                bedrooms = specs["bedrooms"]
            if "bathrooms" in specs:
                bathrooms = specs["bathrooms"]
            if "area" in specs:
                area = specs["area"]
        else:
            # Try direct attributes
            if "bedrooms" in property_data:
                bedrooms = property_data["bedrooms"]
            if "bathrooms" in property_data:
                bathrooms = property_data["bathrooms"]
            if "area" in property_data:
                area = property_data["area"]
        
        # Extract location with fallbacks
        if "location" in property_data:
            if isinstance(property_data["location"], dict) and "name" in property_data["location"]:
                location = property_data["location"]["name"]
            elif isinstance(property_data["location"], str):
                location = property_data["location"]
                
        # Extract neighborhood with fallbacks
        if "neighborhood" in property_data:
            neighborhood = property_data["neighborhood"]
        elif "address" in property_data and isinstance(property_data["address"], dict):
            if "neighborhood" in property_data["address"]:
                neighborhood = property_data["address"]["neighborhood"]
        
        # Try to use DeepSeek for advanced descriptions
        try:
            deepseek_api_key = api_key or db.secrets.get("DEEPSEEK_API_KEY")
            if not deepseek_api_key:
                print("No DeepSeek API key available, using fallback description generation")
                raise ValueError("No DeepSeek API key available")
            
            # Build system and user content for the request
            system_content = "You are a luxury real estate copywriter specializing in high-end Brazilian properties. Create sophisticated, evocative descriptions that highlight architectural excellence, premium amenities, and prestigious locations. Focus on Brasília's unique modernist architecture when relevant."
            
            # Extract property details in a safe way
            if isinstance(property_data.get("property_type"), dict):
                prop_type = property_data.get("property_type", {}).get("name", "luxury property")
            else:
                prop_type = str(property_data.get("property_type", "luxury property"))
                
            location_info = property_data.get("location", "Brasília")
            if isinstance(location_info, dict):
                location = location_info.get("name", "Brasília")
            else:
                location = str(location_info or "Brasília")
                
            neighborhood = property_data.get("neighborhood", "")
            if not neighborhood and isinstance(property_data.get("address"), dict):
                neighborhood = property_data["address"].get("neighborhood", "")
                
            # Build a rich context for the property
            features_text = ""
            if "features" in property_data and property_data["features"]:
                features = property_data["features"]
                if isinstance(features[0], dict):
                    features_text = ", ".join([f.get("name", "") for f in features[:5] if isinstance(f, dict) and "name" in f])
                else:
                    features_text = ", ".join([str(f) for f in features[:5]])
                
            # Get specifications
            bedrooms = str(property_data.get("bedrooms", ""))
            if not bedrooms and "specifications" in property_data:
                bedrooms = str(property_data["specifications"].get("bedrooms", ""))
                
            bathrooms = str(property_data.get("bathrooms", ""))
            if not bathrooms and "specifications" in property_data:
                bathrooms = str(property_data["specifications"].get("bathrooms", ""))
                
            area = str(property_data.get("area", ""))
            if not area and "specifications" in property_data:
                area = str(property_data["specifications"].get("area", ""))
                
            # Add Brasília-specific context if relevant
            brasilia_context = ""
            if "brasília" in location.lower() or "brasilia" in location.lower():
                architects = ["Oscar Niemeyer", "Lúcio Costa", "João Filgueiras Lima", "Athos Bulcão"]
                design_elements = [
                    "modernist concrete curves", 
                    "sweeping architectural lines", 
                    "abundant natural light", 
                    "geometric precision",
                    "harmonious integration with the landscape"
                ]
                brasilia_context = f" The property exemplifies the signature {random.choice(design_elements)} that define Brasília's UNESCO World Heritage architecture, inspired by the vision of {random.choice(architects)}."
            
            # Create final context for the API
            if bedrooms and bathrooms and area:
                specs_text = f" with {bedrooms} bedrooms, {bathrooms} bathrooms, and {area} square meters"
            else:
                specs_text = ""
                
            user_content = f"Write a sophisticated, detailed description for a {prop_type} in {location}{', ' + neighborhood if neighborhood else ''}{specs_text}. {brasilia_context} The property features {features_text}. Create 3 paragraphs: first highlighting the architecture and location, second describing interior features, and third about outdoor amenities and investment value. Use rich, evocative language suitable for ultra-luxury real estate. Begin directly with the description, no need for introductions."
            
            # Initialize response variable
            ai_response = None
            
            # Try DeepSeek client
            try:
                from deepseek import Client as DeepSeekClient
                
                client = DeepSeekClient(api_key=deepseek_api_key)
                messages = [
                    {"role": "system", "content": system_content},
                    {"role": "user", "content": user_content}
                ]
                
                # Try with DeepSeek Chat model
                response = client.chat.completions.create(
                    model="deepseek-chat",
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                
                if response and hasattr(response, 'choices') and len(response.choices) > 0:
                    ai_response = response.choices[0].message.content
                    print("Successfully used DeepSeek Chat model")
                elif isinstance(response, dict) and 'choices' in response and len(response['choices']) > 0:
                    ai_response = response['choices'][0]['message']['content']
                    print("Successfully used DeepSeek Chat model (dict response)")
            except Exception as deepseek_error:
                print(f"Error with DeepSeek client: {deepseek_error}")
                
                # Fallback: Direct API call using requests
                try:
                    import requests
                    import json
                    
                    headers = {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": f"Bearer {deepseek_api_key}"
                    }
                    
                    payload = {
                        "model": "deepseek-chat",
                        "messages": [
                            {"role": "system", "content": system_content},
                            {"role": "user", "content": user_content}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    }
                    
                    response = requests.post(
                        "https://api.deepseek.com/v1/chat/completions",
                        headers=headers,
                        data=json.dumps(payload),
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if 'choices' in result and len(result['choices']) > 0:
                            ai_response = result['choices'][0]['message']['content']
                            print("Successfully used direct API request to DeepSeek")
                except Exception as request_error:
                    print(f"Error with direct DeepSeek API request: {request_error}")
            
            # If we got a response from any method, return it
            if ai_response:
                return ai_response
            else:
                print("All DeepSeek API methods failed, falling back to template")
                raise ValueError("Failed to get response from DeepSeek API")
        except Exception as ai_error:
            print(f"Falling back to template-based description due to: {ai_error}")
        
        # Choose a template based on location
        if 'brasília' in location.lower() or 'brasilia' in location.lower():
            description = random.choice(BRASILIA_LUXURY_DESCRIPTIONS)
        else:
            # Choose a random description template
            description = random.choice(LUXURY_DESCRIPTIONS)
        
        # Add a custom intro and conclusion
        custom_intro = f"This stunning {property_type} in {location}{', ' + neighborhood if neighborhood else ''} features {bedrooms} bedrooms and {bathrooms} bathrooms across {area} square meters of luxury living space."
        
        custom_conclusion = f"This extraordinary {property_type} represents a rare opportunity to acquire one of {location}'s most coveted addresses. Contact us today to experience the epitome of luxury real estate."
        
        # Combine the custom sections with the template
        full_description = f"{custom_intro}\n\n{description}\n\n{custom_conclusion}"
        
        return full_description
    
    except Exception as e:
        # In case of any errors, return a generic luxury description
        error_details = traceback.format_exc()
        print(f"Error generating property description: {e}\nStack trace: {error_details}")
        return """This magnificent luxury property represents the pinnacle of refined living, featuring elegant architecture, premium finishes, and state-of-the-art amenities. With spacious bedrooms, designer bathrooms, and expansive living areas, this residence offers an unparalleled lifestyle in one of the most coveted locations. Contact us today to experience this extraordinary property firsthand."""
