"""SEO optimization module for luxury real estate properties.

This module provides endpoints for generating SEO-optimized titles, subtitles, and keywords
for luxury real estate listings based on social media research.
"""

import traceback
import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import databutton as db

# Import models directly from shared module first to avoid undefined references
from ..shared import SeoTitleSubtitleSuggestionRequest, SeoSuggestion, BaseResponse as SharedBaseResponse

# Import utility functions from common_imports module
from ..common_imports import import_function_safely, import_module_safely

# Create router
router = APIRouter(prefix="/seo", tags=["seo"])

# Request models
class SeoTitleSubtitleRequest(BaseModel):
    """Request model for SEO title and subtitle generation"""
    property_type: str = Field("luxury property", description="Type of property (e.g., Mansion, Villa)")
    location: str = Field("Brasília", description="Location of the property")
    platforms: List[str] = Field(["instagram", "reddit", "pinterest"], description="Social media platforms to research")
    language: str = Field("pt", description="Language for the content (pt for Portuguese, en for English)")

# Response models
# Define clear response class directly inheriting from SharedBaseResponse
class SeoTitleSubtitleResponse(SharedBaseResponse):
    """Response model for SEO title/subtitle generation"""
    suggestions: List[SeoSuggestion] = []
    keywords: Optional[List[Dict[str, Any]]] = None
    sources: Optional[Dict[str, Any]] = None
    text: Optional[str] = None

# Initialize property updater variables
PROPERTY_UPDATER_AVAILABLE = False
generate_seo_title_subtitle = None

# Function to dynamically import property_updater to avoid circular imports
def import_property_updater():
    global PROPERTY_UPDATER_AVAILABLE, generate_seo_title_subtitle
    generate_seo_title_subtitle = import_function_safely('app.apis.property_updater', 'generate_seo_title_subtitle')
    if generate_seo_title_subtitle is not None:
        PROPERTY_UPDATER_AVAILABLE = True
        return True
    else:
        PROPERTY_UPDATER_AVAILABLE = False
        print("Property updater not available, using direct implementation")
        return False

# Try to import OpenAI for direct content generation
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
    # Initialize OpenAI client
    openai_client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))
except (ImportError, Exception) as e:
    OPENAI_AVAILABLE = False
    openai_client = None
    print(f"OpenAI client not available: {e}")

# Try to import DeepSeek wrapper for alternative AI
try:
    from ..deepseek_wrapper import ai_client as deepseek_client
    DEEPSEEK_AVAILABLE = True
except ImportError:
    DEEPSEEK_AVAILABLE = False
    print("DeepSeek wrapper not available, will not use as fallback")

@router.post("/title-subtitle", response_model=SeoTitleSubtitleResponse, operation_id="seo_title_subtitle")
async def seo_title_subtitle(request: SeoTitleSubtitleRequest) -> SeoTitleSubtitleResponse:
    """Generate SEO-optimized title and subtitle suggestions for luxury properties based on social media research.
    
    This endpoint analyzes trends from Instagram, Reddit, and Pinterest to suggest
    the most effective title and subtitle combinations for property listings in Brasilia.
    
    Args:
        request: Configuration for SEO suggestions including property details and location
    """
    try:
        # First try to use property_updater if available
        # Dynamically import if not already done
        if not PROPERTY_UPDATER_AVAILABLE:
            import_property_updater()
            
        if PROPERTY_UPDATER_AVAILABLE:
            try:
                # Convert request format
                updater_request = SeoTitleSubtitleSuggestionRequest(
                    property_type=request.property_type,
                    location=request.location,
                    language=request.language
                )
                
                # Call property_updater function
                result = generate_seo_title_subtitle(updater_request)
                
                # Handle error
                if not result.success:
                    # Fall through to next method
                    print(f"Property updater SEO generation failed: {result.error}")
                else:
                    # Convert and return suggestions
                    return SeoTitleSubtitleResponse(
                        success=True,
                        message="Successfully generated SEO title and subtitle suggestions",
                        suggestions=[SeoSuggestion(title=s.title, subtitle=s.subtitle) for s in result.suggestions]
                    )
            except Exception as e:
                print(f"Error using property_updater: {e}")
                # Fall through to next method
        
        # Second option: Use OpenAI directly
        if OPENAI_AVAILABLE:
            try:
                # Generate social media research prompt
                research_prompt = f"""Research the most strategic SEO keywords for {request.property_type} in {request.location}.
                Focus on keywords commonly used on {', '.join(request.platforms)} by potential luxury property buyers and investors.
                
                For each platform, identify:
                1. Top 5 popular hashtags and keywords
                2. Common search terms used by high-net-worth individuals
                3. Trending luxury real estate terms specific to Brasília
                
                Also provide 10 combined SEO-optimized keywords that would work well across all platforms.
                
                Format your response as JSON with this structure:
                {{"combined_keywords": [{{"keyword": "keyword", "relevance": "high/medium/low", "search_volume": "estimated monthly searches"}}],
                "platform_specific": {{"instagram": [keywords], "reddit": [keywords], "pinterest": [keywords]}},
                "trending_terms": [trending terms],
                "local_terms": [Brasília-specific terms]}}
                """
                
                research_completion = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "system", "content": "You are a real estate SEO and social media expert specializing in luxury properties."},
                             {"role": "user", "content": research_prompt}],
                    response_format={"type": "json_object"}
                )
                
                if not research_completion or not research_completion.choices or len(research_completion.choices) == 0:
                    raise Exception("No research response from OpenAI")
                
                keyword_data = json.loads(research_completion.choices[0].message.content)
                
                # Now generate title/subtitle based on the keywords
                combined_keywords = keyword_data.get("combined_keywords", [])
                top_keywords = [k.get("keyword") for k in combined_keywords[:5]] if isinstance(combined_keywords[0], dict) else combined_keywords[:5]
                keywords_text = ", ".join(top_keywords) if top_keywords else "luxury, exclusive, high-end"
                
                # Define language settings
                language_prompt = ""
                if request.language == "pt":
                    language_prompt = "in Brazilian Portuguese (português do Brasil)"
                elif request.language == "en":
                    language_prompt = "in English"
                
                title_prompt = f"""Generate 5 SEO-optimized title and subtitle pairs {language_prompt} for a {request.property_type} in {request.location}.
                
                Use these keywords strategically: {keywords_text}
                
                Each suggestion should:
                1. Be attention-grabbing but elegant for luxury market
                2. Include key SEO terms naturally
                3. Highlight exclusivity and premium qualities
                4. For Portuguese, use proper accent marks and grammar
                5. Title should be 5-8 words, subtitle 10-15 words
                
                Format your response as JSON with this structure:
                {{"suggestions": [
                    {{"title": "Compelling Title", "subtitle": "Engaging subtitle that elaborates on the property's unique features"}},
                    {{"title": "Another Great Title", "subtitle": "Another excellent subtitle that highlights the property's value"}},
                    ...
                ]}}
                """
                
                title_completion = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "system", "content": "You are a luxury real estate copywriter specializing in SEO-optimized content."},
                             {"role": "user", "content": title_prompt}],
                    response_format={"type": "json_object"}
                )
                
                if not title_completion or not title_completion.choices or len(title_completion.choices) == 0:
                    raise Exception("No title/subtitle response from OpenAI")
                
                suggestion_data = json.loads(title_completion.choices[0].message.content)
                
                # Format and return response
                return SeoTitleSubtitleResponse(
                    success=True,
                    message="Successfully generated SEO title and subtitle suggestions",
                    suggestions=[SeoSuggestion(title=s["title"], subtitle=s["subtitle"]) for s in suggestion_data.get("suggestions", [])],
                    keywords=keyword_data.get("combined_keywords", []),
                    sources={
                        "platform_specific": keyword_data.get("platform_specific", {}),
                        "trending_terms": keyword_data.get("trending_terms", []),
                        "local_terms": keyword_data.get("local_terms", [])
                    }
                )
            except Exception as e:
                print(f"Error using OpenAI for SEO suggestions: {e}")
                # Fall through to next method
        
        # Third option: Use DeepSeek wrapper
        if DEEPSEEK_AVAILABLE:
            try:
                # Create a prompt for DeepSeek
                platforms_text = ", ".join(request.platforms)
                language_text = "Brazilian Portuguese" if request.language == "pt" else "English"
                
                prompt = f"""Generate 5 SEO-optimized title and subtitle pairs in {language_text} for a {request.property_type} in {request.location}.
                Research the most strategic keywords from {platforms_text} to identify trends in luxury real estate.
                
                Each suggestion should include a title (5-8 words) and a subtitle (10-15 words) that:
                1. Is attention-grabbing but elegant for the luxury market
                2. Includes key SEO terms naturally
                3. Highlights exclusivity and premium qualities
                
                Format your response as:
                
                SUGGESTION 1:
                Title: [Title]
                Subtitle: [Subtitle]
                
                SUGGESTION 2:
                Title: [Title]
                Subtitle: [Subtitle]
                
                (and so on for all 5 suggestions)
                """
                
                # Use DeepSeek to generate suggestions
                result = deepseek_client.generate_text(prompt, model="gpt-4o-mini")
                
                if result and result.get("text"):
                    generated_text = result["text"]
                    
                    # Return in a format that can be displayed directly
                    return SeoTitleSubtitleResponse(
                        success=True,
                        message="Successfully generated SEO title and subtitle suggestions",
                        text=generated_text
                    )
                else:
                    raise Exception("No valid response from DeepSeek")
            except Exception as e:
                print(f"Error using DeepSeek for SEO suggestions: {e}")
                # Fall through to fallback
        
        # Fallback: Return predefined suggestions
        return SeoTitleSubtitleResponse(
            success=True,
            message="Generated default SEO title and subtitle suggestions",
            suggestions=[
                SeoSuggestion(
                    title=f"Exclusiva {request.property_type} em {request.location}",
                    subtitle="Sofisticação e luxo em uma localização privilegiada com acabamentos premium"
                ),
                SeoSuggestion(
                    title=f"Elegante {request.property_type} com Vista Deslumbrante",
                    subtitle="Experiência de vida incomparável com conforto e exclusividade em {request.location}"
                ),
                SeoSuggestion(
                    title=f"Luxuosa {request.property_type} de Alto Padrão",
                    subtitle="Projeto arquitetônico único com amplos espaços e acabamentos refinados em {request.location}"
                ),
            ]
        )
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error generating SEO suggestions: {e}\nStack trace: {error_details}")
        return SeoTitleSubtitleResponse(
            success=False,
            message=f"Error generating SEO suggestions: {str(e)}",
            error=str(e)
        )
