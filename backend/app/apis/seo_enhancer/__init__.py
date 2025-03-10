"""Enhanced SEO suggestion module for luxury real estate properties.

This module provides improved SEO title and subtitle generation with robust
fallback mechanisms and error handling.
"""

import json
import traceback
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, BackgroundTasks
import databutton as db

# Import shared models first to avoid undefined references
from ..shared import SeoSuggestion, BaseResponse as SharedBaseResponse

# Import utility functions from common_imports module
from ..common_imports import import_function_safely, import_module_safely

# Use the shared base response for consistency
class SeoResponse(SharedBaseResponse):
    """Response model for SEO operations"""
    suggestions: Optional[List[SeoSuggestion]] = None
    text: Optional[str] = None

# Create router
router = APIRouter(prefix="/seo-enhancer", tags=["seo"])

# Request models
class SeoRequest(BaseModel):
    """Base request model for SEO enhancements"""
    property_type: str = Field(..., description="Type of property (e.g., mansion, villa, penthouse)")
    location: str = Field(..., description="Location of the property")
    language: str = Field("pt", description="Language code (pt for Portuguese, en for English)")

class SeoTitleRequest(SeoRequest):
    """Request model for SEO title generation"""
    target_audience: Optional[str] = Field(None, description="Target audience description")
    keywords: Optional[List[str]] = Field(None, description="Specific keywords to include")

# Response models - defined at module level using SharedBaseResponse

def create_openai_client():
    """Create OpenAI client with API key from secrets"""
    try:
        from openai import OpenAI
        api_key = db.secrets.get("OPENAI_API_KEY")
        if not api_key:
            print("OpenAI API key not found in secrets")
            return None
        return OpenAI(api_key=api_key)
    except Exception as e:
        print(f"Error creating OpenAI client: {e}")
        return None

def get_language_settings(language_code: str) -> Dict[str, str]:
    """Get language-specific settings and prompts"""
    settings = {
        "pt": {
            "name": "Portuguese",
            "prompt_language": "Brazilian Portuguese",
            "fallback_titles": [
                "Exclusiva {property_type} em {location}",
                "Elegante {property_type} com Vista Panorâmica",
                "Luxuosa {property_type} de Alto Padrão",
                "{property_type} Exclusiva no Coração de {location}",
                "Requintada {property_type} com Vista Privilegiada"
            ],
            "fallback_subtitles": [
                "Sofisticação e luxo em uma localização privilegiada com acabamentos premium",
                "Experiência de vida incomparável com conforto e exclusividade em {location}",
                "Projeto arquitetônico único com amplos espaços e acabamentos refinados em {location}",
                "Design contemporâneo com materiais nobres e tecnologia de ponta para o mais exigente comprador",
                "O ápice da sofisticação imobiliária com privacidade e conforto em {location}"
            ],
        },
        "en": {
            "name": "English",
            "prompt_language": "English",
            "fallback_titles": [
                "Exclusive {property_type} in {location}",
                "Elegant {property_type} with Panoramic Views",
                "Luxurious High-End {property_type}",
                "Exclusive {property_type} in the Heart of {location}",
                "Exquisite {property_type} with Privileged Views"
            ],
            "fallback_subtitles": [
                "Sophistication and luxury in a privileged location with premium finishes",
                "Unparalleled living experience with comfort and exclusivity in {location}",
                "Unique architectural project with spacious areas and refined finishes in {location}",
                "Contemporary design with noble materials and cutting-edge technology for the most discerning buyer",
                "The pinnacle of real estate sophistication with privacy and comfort in {location}"
            ],
        }
    }
    return settings.get(language_code, settings["en"])

def generate_suggestions_with_openai(request: SeoTitleRequest) -> SeoResponse:
    """Generate suggestions using OpenAI API"""
    try:
        client = create_openai_client()
        if not client:
            raise Exception("OpenAI client creation failed")
            
        # Get language settings
        language_settings = get_language_settings(request.language)
        prompt_language = language_settings["prompt_language"]
        
        # Create prompt
        prompt = f"""Generate 5 SEO optimized title and subtitle pairs in {prompt_language} for a {request.property_type} in {request.location}.
        Research the most strategic keywords from Instagram, Reddit, and Pinterest to identify trends in luxury real estate.
        Each suggestion should include a title (5-8 words) and a longer subtitle (10-15 words).
        
        Focus on the luxury real estate market in Brazil, using emotionally compelling language
        that appeals to affluent buyers looking for exclusive properties.
        
        Format your response as a JSON array with objects containing 'title' and 'subtitle' properties.
        
        Consider these aspects for keywords:
        1. Luxury lifestyle terms (exclusivity, sophistication, elite)
        2. Architectural features (panoramic views, infinity pools, smart home)
        3. Location benefits ({request.location} landmarks, prestigious neighborhoods)
        4. Investment potential (premium investment, appreciation potential)
        5. Unique selling points (award-winning design, limited availability)
        
        Ensure the content is optimized for both search visibility and emotional appeal to luxury buyers.
        """
        
        # Call model
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a luxury real estate marketing specialist with expertise in SEO optimization."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        response_text = completion.choices[0].message.content
        
        # Try to parse JSON response
        try:
            import re
            
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
            
            if suggestions:
                return SeoResponse(
                    success=True,
                    message="Successfully generated SEO suggestions",
                    suggestions=suggestions
                )
            else:
                raise Exception("No valid suggestions found in response")
                
        except Exception as json_error:
            print(f"Error parsing JSON response: {json_error}")
            # Return text response as fallback
            return SeoResponse(
                success=True,
                message="Generated suggestions in text format",
                text=response_text
            )
            
    except Exception as e:
        print(f"Error generating suggestions with OpenAI: {e}")
        raise e

def try_deepseek_wrapper(request: SeoTitleRequest) -> Optional[SeoResponse]:
    """Try generating suggestions using deepseek wrapper"""
    try:
        # Import dynamically to avoid circular dependencies
        deepseek_module = import_module_safely('app.apis.deepseek_wrapper')
        if not deepseek_module:
            print("Failed to import deepseek_wrapper module")
            return None
        
        if not hasattr(deepseek_module, 'generate_prompt_endpoint'):
            print("generate_prompt_endpoint function not found in deepseek_wrapper module")
            return None
            
        # Get language settings
        language_settings = get_language_settings(request.language)
        prompt_language = language_settings["prompt_language"]
        
        # Create prompt
        prompt = f"""Generate 5 SEO optimized title and subtitle pairs in {prompt_language} for a {request.property_type} in {request.location}.
        Research the most strategic keywords from Instagram, Reddit, and Pinterest to identify trends in luxury real estate.
        Each suggestion should include a title (5-8 words) and a longer subtitle (10-15 words).
        
        Format as JSON array with title and subtitle properties. Focus on luxury real estate market in Brasil.
        """
        
        # Call generate_prompt_endpoint
        result = deepseek_module.generate_prompt_endpoint(prompt, "gpt-4o-mini")
        
        if result and hasattr(result, 'text') and result.text:
            # Try to parse as JSON
            try:
                import re
                # Extract JSON array if embedded in text
                json_match = re.search(r'\[\s*\{.*\}\s*\]', result.text, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    suggestions_data = json.loads(json_str)
                    
                    suggestions = []
                    for item in suggestions_data:
                        if "title" in item and "subtitle" in item:
                            suggestions.append(SeoSuggestion(
                                title=item["title"],
                                subtitle=item["subtitle"]
                            ))
                    
                    if suggestions:
                        return SeoResponse(
                            success=True,
                            message="Successfully generated SEO suggestions using DeepSeek",
                            suggestions=suggestions
                        )
            except Exception as json_error:
                print(f"Error parsing DeepSeek JSON response: {json_error}")
                # Fall back to text response
                return SeoResponse(
                    success=True,
                    message="Generated suggestions in text format using DeepSeek",
                    text=result.text
                )
    except Exception as e:
        print(f"Error using DeepSeek wrapper: {e}")
        return None
        
    return None

def get_fallback_suggestions(request: SeoTitleRequest) -> SeoResponse:
    """Generate fallback suggestions when API calls fail"""
    # Get language settings
    language_settings = get_language_settings(request.language)
    fallback_titles = language_settings["fallback_titles"]
    fallback_subtitles = language_settings["fallback_subtitles"]
    
    # Format with property type and location
    titles = [title.format(property_type=request.property_type, location=request.location) for title in fallback_titles]
    subtitles = [subtitle.format(property_type=request.property_type, location=request.location) for subtitle in fallback_subtitles]
    
    # Create suggestions
    suggestions = []
    for i in range(min(len(titles), len(subtitles))):
        suggestions.append(SeoSuggestion(
            title=titles[i],
            subtitle=subtitles[i]
        ))
    
    return SeoResponse(
        success=True,
        message="Generated fallback SEO suggestions",
        suggestions=suggestions
    )



@router.post("/title-subtitle", response_model=SeoResponse, operation_id="seo_title_subtitle2")
async def seo_title_subtitle(request: SeoTitleRequest) -> SeoResponse:
    """Generate SEO-optimized title and subtitle suggestions for luxury properties.
    
    This endpoint produces high-quality title and subtitle combinations optimized for
    SEO performance in the luxury real estate market, with special focus on properties in Brasília.
    
    Args:
        request: Configuration for SEO suggestions
    """
    try:
        # Method 1: Try OpenAI
        try:
            return generate_suggestions_with_openai(request)
        except Exception as openai_error:
            print(f"OpenAI generation failed: {openai_error}\nTrying alternative methods...")
        
        # Method 2: Try accessing the original SEO module
        try:
            import importlib
            seo_module = importlib.import_module('app.apis.seo')
            
            if hasattr(seo_module, 'seo_title_subtitle'):
                # Create a request object compatible with the original module
                original_request = seo_module.SeoTitleSubtitleRequest(
                    property_type=request.property_type,
                    location=request.location,
                    language=request.language,
                    platforms=["instagram", "reddit", "pinterest"]
                )
                
                result = await seo_module.seo_title_subtitle(original_request)
                
                if result and result.success and (result.suggestions or result.text):
                    # Convert original response format to our format
                    if result.suggestions:
                        return SeoResponse(
                            success=True,
                            message="Successfully generated SEO suggestions from original module",
                            suggestions=[SeoSuggestion(title=s.title, subtitle=s.subtitle) for s in result.suggestions]
                        )
                    elif result.text:
                        return SeoResponse(
                            success=True,
                            message="Generated suggestions in text format from original module",
                            text=result.text
                        )
        except Exception as seo_error:
            print(f"Original SEO module access failed: {seo_error}\nTrying next method...")
        
        # Method 3: Try DeepSeek wrapper
        deepseek_result = try_deepseek_wrapper(request)
        if deepseek_result:
            return deepseek_result
        
        # Method 4: Fall back to predefined suggestions if all else fails
        return get_fallback_suggestions(request)
        
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error generating SEO suggestions: {e}\nStack trace: {error_details}")
        
        # Even in case of error, provide fallback suggestions
        try:
            return get_fallback_suggestions(request)
        except Exception as fallback_error:
            print(f"Even fallback generation failed: {fallback_error}")
            return SeoResponse(
                success=False,
                message=f"Error generating SEO suggestions: {str(e)}",
                error=str(e)
            )
