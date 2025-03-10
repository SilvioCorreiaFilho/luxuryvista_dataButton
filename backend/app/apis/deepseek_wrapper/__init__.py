"""DeepSeek AI Integration for property generation and text-related tasks

This module wraps the DeepSeek API to provide property generation functionality.
"""

import uuid
import json
import random
from typing import List, Dict, Any, Optional
from datetime import datetime
import databutton as db

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.apis.common_imports import (
    sanitize_storage_key, 
    generate_id, 
    get_timestamp,
    PROPERTY_TYPES,
    NEIGHBORHOODS,
    DEFAULT_FEATURES
)

# Create router
router = APIRouter(prefix="/deepseek", tags=["deepseek"])

class TextGenerationRequest(BaseModel):
    """Request model for text generation"""
    prompt: str
    max_tokens: int = 1000
    temperature: float = 0.7
    system_prompt: Optional[str] = None
    model: Optional[str] = None

class PropertyGenerationRequest(BaseModel):
    """Request model for property generation"""
    count: int = Field(1, description="Number of properties to generate")
    property_type: str = Field("Mansion", description="Type of property to generate")
    location: str = Field("Brasília", description="Location for the property")
    language: str = Field("pt", description="Language for content generation (pt or en)")

@router.post("/text-generation")
async def text_generation(request: TextGenerationRequest):
    """Generate text using DeepSeek AI"""
    try:
        # First try DeepSeek if credentials exist
        try:
            api_key = db.secrets.get("DEEPSEEK_API_KEY")
            if api_key:
                import httpx
                headers = {
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
                
                system_prompt = request.system_prompt or "You are a helpful assistant."
                model = request.model or "deepseek-chat"
                
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.prompt}
                    ],
                    "temperature": request.temperature,
                    "max_tokens": request.max_tokens
                }
                
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(
                        "https://api.deepseek.com/v1/chat/completions",
                        json=payload,
                        headers=headers
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if "choices" in result and len(result["choices"]) > 0:
                            content = result["choices"][0]["message"]["content"]
                            return {
                                "success": True,
                                "text": content,
                                "model": model
                            }
        except Exception as e:
            print(f"DeepSeek API error: {str(e)}")
            # Fall through to OpenAI fallback
            
        # Fallback to OpenAI
        try:
            from openai import OpenAI
            api_key = db.secrets.get("OPENAI_API_KEY")
            if api_key:
                client = OpenAI(api_key=api_key)
                system_prompt = request.system_prompt or "You are a helpful assistant."
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": request.prompt}
                    ],
                    temperature=request.temperature,
                    max_tokens=request.max_tokens
                )
                
                if response.choices and len(response.choices) > 0:
                    return {
                        "success": True,
                        "text": response.choices[0].message.content,
                        "model": "gpt-4o-mini"
                    }
        except Exception as e:
            print(f"OpenAI API fallback error: {str(e)}")
            # Continue to manual fallback
            
        # Manual fallback with canned responses
        return {
            "success": True,
            "text": "I apologize, but I'm unable to generate a complete response at this time. Please try again later.",
            "model": "fallback"
        }
        
    except Exception as e:
        print(f"Text generation error: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/generate-property")
async def generate_property_endpoint(request: PropertyGenerationRequest):
    """Generate properties using DeepSeek or OpenAI"""
    try:
        count = max(1, min(request.count, 10))  # Limit between 1-10
        property_type = request.property_type
        location = request.location
        language = request.language
        
        properties = []
        for _ in range(count):
            # Generate a property description using AI
            property_prompt = f"""
            Create a detailed and compelling description for a luxury {property_type} in {location}.
            Focus on high-end features, premium amenities, and the exclusivity of the property.
            Include the following details:
            - A catchy title
            - A brief subtitle
            - Property type: {property_type}
            - Location: {location}
            - Price range (in Brazilian Reais, millions)
            - Number of bedrooms (between 4-8)
            - Number of bathrooms (between 4-9)
            - Square footage (between 300-1200 sqm)
            - At least 5 luxury features or amenities
            - A detailed description (150-200 words)
            
            Format your response as a JSON object with the following structure:
            {{
                "title": "...",
                "subtitle": "...",
                "property_type": "{property_type}",
                "location": "{location}",
                "price": "...",
                "bedrooms": N,
                "bathrooms": N,
                "area": N,
                "features": ["feature1", "feature2", ...],
                "description": "..."
            }}
            
            The JSON should be valid and properly formatted.
            Write in the {language} language.
            """
            
            # Generate the property data
            system_prompt = "You are a luxury real estate expert specialized in creating compelling property listings for high-end real estate."
            text_gen_request = TextGenerationRequest(
                prompt=property_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=1000
            )
            
            text_response = await text_generation(text_gen_request)
            
            if text_response.get("success"):
                property_text = text_response.get("text", "")
                
                # Extract JSON from the text
                import re
                json_match = re.search(r'\{[\s\S]*\}', property_text)
                
                if json_match:
                    try:
                        property_json = json.loads(json_match.group(0))
                        
                        # Create a property object
                        property_id = generate_id("prop-")
                        
                        # Structure property data
                        property_data = {
                            "id": property_id,
                            "title": property_json.get("title", f"Luxury {property_type} in {location}"),
                            "subtitle": property_json.get("subtitle", "Exclusive luxury property"),
                            "description": property_json.get("description", "Luxury property with high-end finishes"),
                            "property_type": property_json.get("property_type", property_type),
                            "price": property_json.get("price", "R$ 15.000.000"),
                            "bedrooms": property_json.get("bedrooms", random.randint(4, 8)),
                            "bathrooms": property_json.get("bathrooms", random.randint(4, 9)),
                            "area": property_json.get("area", random.randint(300, 1200)),
                            "area_unit": "sqm",
                            "location": {
                                "neighborhood": location,
                                "city": "Brasília",
                                "state": "DF",
                                "country": "Brasil"
                            },
                            "features": [{
                                "name": feature,
                                "description": ""
                            } for feature in property_json.get("features", random.sample(DEFAULT_FEATURES, 5))],
                            "status": "for_sale",
                            "created_at": get_timestamp(),
                            "updated_at": get_timestamp(),
                            "images": []
                        }
                        
                        properties.append(property_data)
                    except json.JSONDecodeError as e:
                        print(f"Failed to parse property JSON: {e}")
                        # Fall through to the fallback property creation
                else:
                    print("No JSON found in generated text")
                    # Fall through to the fallback property creation
            
            # If we don't have a valid property yet, create a fallback one
            if len(properties) < _ + 1:
                # Create a fallback property
                property_id = generate_id("prop-")
                
                # Generate price (10-30 million)
                price = random.randint(10000000, 30000000)
                price_formatted = f"R$ {price/1000000:.1f} millhões"
                
                # Generate square footage (300-1200 sqm)
                area = random.randint(300, 1200)
                
                # Generate number of bedrooms and bathrooms
                bedrooms = random.randint(4, 8)
                bathrooms = random.randint(bedrooms, bedrooms + 2)
                
                # Get sample features
                features = random.sample(DEFAULT_FEATURES, 6)
                
                property_data = {
                    "id": property_id,
                    "title": f"Luxuosa {property_type} em {location}",
                    "subtitle": f"Exclusividade e sofisticação em uma localização privilegiada",
                    "description": "Propriedade de alto padrão com acabamentos premium, amplos espaços e vista deslumbrante. Perfeita para quem busca conforto, luxo e sofisticação em uma das áreas mais exclusivas da cidade.",
                    "property_type": property_type,
                    "price": price_formatted,
                    "bedrooms": bedrooms,
                    "bathrooms": bathrooms,
                    "area": area,
                    "area_unit": "sqm",
                    "location": {
                        "neighborhood": location,
                        "city": "Brasília",
                        "state": "DF",
                        "country": "Brasil"
                    },
                    "features": [{
                        "name": feature,
                        "description": ""
                    } for feature in features],
                    "status": "for_sale",
                    "created_at": get_timestamp(),
                    "updated_at": get_timestamp(),
                    "images": []
                }
                
                properties.append(property_data)
        
        return {
            "success": True,
            "message": f"{len(properties)} properties generated successfully",
            "properties": properties
        }
    except Exception as e:
        import traceback
        print(f"Error generating properties: {str(e)}")
        print(traceback.format_exc())
        return {
            "success": False,
            "message": f"Error generating properties: {str(e)}",
            "properties": []
        }

@router.post("/generate-prompt")
async def generate_prompt_endpoint(topic: str, context: Optional[str] = None):
    """Generate an optimized prompt for AI text generation"""
    try:
        prompt_engineering_request = TextGenerationRequest(
            prompt=f"""
            Create an optimized prompt that will get the best results from an AI image or text generator.
            
            Topic: {topic}
            Additional Context: {context or 'None provided'}
            
            Your prompt should:
            1. Be detailed and specific
            2. Include style references if relevant
            3. Specify medium (photo, painting, 3D render, etc.)
            4. Include specific settings, lighting, and composition details
            5. Be formatted as a single, well-structured paragraph
            
            Return only the optimized prompt text, without quotes or additional commentary.
            """,
            system_prompt="You are a prompt engineering expert who specializes in creating optimized prompts for AI image and text generators.",
            temperature=0.7,
            max_tokens=500
        )
        
        response = await text_generation(prompt_engineering_request)
        
        if response.get("success"):
            return {
                "success": True,
                "prompt": response.get("text", "").strip(),
                "topic": topic
            }
        else:
            return {
                "success": False,
                "message": "Failed to generate prompt",
                "error": response.get("error", "Unknown error")
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error generating prompt: {str(e)}"
        }