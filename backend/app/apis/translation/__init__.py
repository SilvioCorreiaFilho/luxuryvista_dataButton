import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI, APIError, RateLimitError
import databutton as db
from time import sleep
import json
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    tags=["translation"]
)

# Custom exceptions
class TranslationError(Exception):
    """Raised when translation fails"""
    pass

class OpenAIKeyError(Exception):
    """Raised when OpenAI API key is missing or invalid"""
    pass

# Request/Response models
class TranslateRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    from_lang: str = Field(..., description="Source language code")
    to_lang: str = Field(..., description="Target language code")

class TranslateResponse(BaseModel):
    translated_text: str = Field(..., description="Translated text")
    service_info: Optional[Dict[str, str]] = Field(None, description="Information about the translation service status")

# Constants
MAX_RETRIES = 3
INITIAL_DELAY = 0.5  # 500ms
MAX_DELAY = 4  # Maximum delay in seconds
OPENAI_MODEL = "gpt-4-turbo-preview"
ANTHROPIC_MODEL = "claude-3-haiku-20240307"

# Supported languages
SUPPORTED_LANGUAGES = {
    'pt-BR': 'Brazilian Portuguese',
    'en-US': 'English (US)',
    'es-ES': 'Spanish',
    'fr-FR': 'French',
    'de-DE': 'German',
    'it-IT': 'Italian',
    'zh-CN': 'Chinese (Simplified)',
    'ja-JP': 'Japanese',
    'ko-KR': 'Korean',
    'ru-RU': 'Russian'
}

# System message template
SYSTEM_MESSAGE_TEMPLATE = """
    You are a professional luxury real estate translator. Follow these rules:
    1. Translate from {from_lang} to {to_lang} maintaining an elegant, sophisticated tone
    2. Keep location names in their original form (e.g., 'Lago Sul', 'Sudoeste')
    3. Use refined language appropriate for luxury real estate
    4. Maintain any currency formatting (e.g., 'R$')
    5. Only return the translated text, nothing else
    6. Keep proper nouns like 'Ferola' unchanged
""".strip()

# Initialize clients
# OpenAI Client
try:
    openai_api_key = db.secrets.get("OPENAI_API_KEY")
    if not openai_api_key:
        logger.warning("OpenAI API key not found")
        openai_client = None
    else:
        openai_client = OpenAI(api_key=openai_api_key)
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {str(e)}")
    openai_client = None
    
# Anthropic/Claude Client
try:
    anthropic_api_key = db.secrets.get("ANTHROPIC_API_KEY")
    if not anthropic_api_key:
        logger.warning("Anthropic API key not found, checking for Claude/Anthropic key")
        anthropic_api_key = db.secrets.get("CLAUDE_API_KEY")
        if not anthropic_api_key:
            anthropic_api_key = db.secrets.get("DEEPSEEK_API_KEY")  # Try a third alternative
            if not anthropic_api_key:
                logger.warning("No alternative API keys found")
                has_anthropic = False
            else:
                has_anthropic = True
                logger.info("Using DeepSeek API key as fallback")
        else:
            has_anthropic = True
            logger.info("Using Claude API key")
    else:
        has_anthropic = True
        logger.info("Using Anthropic API key")
except Exception as e:
    logger.error(f"Failed to initialize alternative client: {str(e)}")
    has_anthropic = False

# At least one of the models must be available
if not openai_client and not has_anthropic:
    logger.warning("No translation services available. Will use original text as fallback.")

def get_openai_completion(messages: list[Dict[str, str]]) -> Any:
    """Get chat completion from OpenAI with proper error handling"""
    try:
        return openai_client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages
        )
    except RateLimitError as e:
        logger.warning(f"OpenAI rate limit exceeded: {str(e)}")
        raise TranslationError("Rate limit exceeded") from e
    except APIError as e:
        logger.error(f"OpenAI API error: {str(e)}")
        raise TranslationError("API error") from e
    except Exception as e:
        logger.error(f"Unexpected error in OpenAI call: {str(e)}")
        raise TranslationError("Unexpected error") from e

def get_claude_completion(system_prompt: str, user_prompt: str) -> str:
    """Get completion from Claude/alternative service with proper error handling"""
    if not has_anthropic:
        raise TranslationError("Alternative API not available")
    
    try:
        # Try to use Claude API if available
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": anthropic_api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        
        payload = {
            "model": ANTHROPIC_MODEL,
            "max_tokens": 1000,
            "messages": [
                {"role": "user", "content": user_prompt}
            ],
            "system": system_prompt
        }
        
        response = httpx.post(url, headers=headers, json=payload, timeout=30.0)
        response.raise_for_status()
        
        result = response.json()
        if "content" in result and len(result["content"]) > 0:
            for item in result["content"]:
                if item["type"] == "text":
                    return item["text"]
        
        raise TranslationError("Received empty or invalid response from service")
    except httpx.HTTPStatusError as e:
        logger.error(f"API HTTP error: {str(e)}")
        raise TranslationError(f"API error: {e.response.status_code}") from e
    except httpx.RequestError as e:
        logger.error(f"API request error: {str(e)}")
        raise TranslationError("API request failed") from e
    except Exception as e:
        logger.error(f"Unexpected error in API call: {str(e)}")
        raise TranslationError("Unexpected error with API") from e

def translate_text(text: str, from_lang: str, to_lang: str) -> str:
    """Translate text using available AI models with fallback"""
    system_message = SYSTEM_MESSAGE_TEMPLATE.format(
        from_lang=SUPPORTED_LANGUAGES[from_lang],
        to_lang=SUPPORTED_LANGUAGES[to_lang]
    )
    
    # Try OpenAI first if available
    if openai_client:
        try:
            completion = get_openai_completion([
                {"role": "system", "content": system_message},
                {"role": "user", "content": text}
            ])

            # Validate OpenAI response
            if not completion.choices or not completion.choices[0].message:
                logger.error("Invalid response from OpenAI: missing choices or message")
                raise TranslationError("Invalid response from OpenAI")

            translated_text = completion.choices[0].message.content
            if not translated_text or not translated_text.strip():
                logger.error("Invalid response from OpenAI: empty translation")
                raise TranslationError("Empty translation received from OpenAI")

            logger.info("Translation completed using OpenAI")
            return translated_text.strip()
        except Exception as e:
            logger.warning(f"OpenAI translation failed, trying alternative: {str(e)}")
            # Fall through to alternative service
    else:
        logger.info("OpenAI client not available, using alternative for translation")

    # Try alternative as fallback or primary if OpenAI not available
    if has_anthropic:
        try:
            translated_text = get_claude_completion(
                system_prompt=system_message,
                user_prompt=text
            )
            
            if not translated_text or not translated_text.strip():
                logger.error("Invalid response from alternative: empty translation")
                raise TranslationError("Empty translation received from alternative service")
            
            logger.info("Translation completed using alternative service")
            return translated_text.strip()
        except Exception as e:
            logger.error(f"Alternative translation failed: {str(e)}")
            # Return original text as last resort
            logger.warning("All translation services failed, returning original text")
            return text
    else:
        # If we got here and OpenAI failed but alternative isn't available
        logger.warning("No translation services available, returning original text")
        return text

@router.post("/translate", response_model=TranslateResponse)
def translate(body: TranslateRequest) -> TranslateResponse:
    """
    Translate text from one language to another using OpenAI's GPT model.
    Includes retry logic with exponential backoff.
    """
    # Handle empty text
    if not body.text.strip():
        return TranslateResponse(translated_text="")
    
    # Validate language codes
    if body.from_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Source language '{body.from_lang}' is not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES.keys())}"
        )
    
    if body.to_lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Target language '{body.to_lang}' is not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES.keys())}"
        )

    # Log which translation services are available
    available_services = []
    if openai_client:
        available_services.append("OpenAI")
    if has_anthropic:
        available_services.append("Alternative API")
    logger.info(f"Translation services available: {', '.join(available_services)}")
    
    # If source and target languages are the same, return original text
    if body.from_lang.lower() == body.to_lang.lower():
        return TranslateResponse(translated_text=body.text)

    delay = INITIAL_DELAY
    last_error: Optional[Exception] = None
    translation_service_available = openai_client is not None or has_anthropic
    
    # Quick check if we have any translation services available
    if not translation_service_available:
        logger.warning("No translation services available. Returning original text.")
        return TranslateResponse(
            translated_text=body.text,
            service_info={"status": "unavailable", "message": "Translation services unavailable"}
        )

    for attempt in range(MAX_RETRIES):
        try:
            translated_text = translate_text(
                text=body.text,
                from_lang=body.from_lang,
                to_lang=body.to_lang
            )
            
            # Check if translation actually happened
            if translated_text == body.text:
                return TranslateResponse(
                    translated_text=translated_text,
                    service_info={"status": "limited", "message": "Using original text due to service limitations"}
                )
            else:
                return TranslateResponse(
                    translated_text=translated_text,
                    service_info={"status": "success", "message": "Translation successful"}
                )

        except Exception as e:
            last_error = e
            logger.error(
                f"Translation error (attempt {attempt + 1}/{MAX_RETRIES}): {str(e)}"
            )

            # If this is not the last attempt, wait and try again
            if attempt < MAX_RETRIES - 1:
                sleep(min(delay, MAX_DELAY))
                delay *= 2
            else:
                # On last attempt, return original text with warning instead of error
                logger.warning(f"All translation attempts failed. Returning original text. Error: {str(last_error)}")
                return TranslateResponse(
                    translated_text=body.text,
                    service_info={"status": "error", "message": "Translation failed, using original text"}
                )