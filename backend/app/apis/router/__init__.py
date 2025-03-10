"""Router for the DeepSeek client wrapper"""

from fastapi import APIRouter, HTTPException, Depends
from app.apis.utilities import get_ai_client
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

# Create router with appropriate tags
router = APIRouter(prefix="/router-deepseek", tags=["ai"])

# API Models
class GenerateTextRequest(BaseModel):
    """Request model for text generation"""
    model: str = "deepseek-chat"
    messages: List[Dict[str, str]]
    temperature: float = 0.7
    max_tokens: int = 2000

class GenerateTextResponse(BaseModel):
    """Response model for text generation"""
    content: str
    model: str

# API Endpoints
@router.post("/generate", operation_id="router_text_generation")
async def router_text_generation(request: GenerateTextRequest) -> GenerateTextResponse:
    """Generate text using DeepSeek AI or OpenAI as fallback"""
    try:
        from app.apis.deepseek_client import DeepSeekClient
        
        # Initialize client
        client = DeepSeekClient()
        
        # Generate text
        response = client.chat.completions.create(
            model=request.model,
            messages=request.messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        # Extract content
        content = response.choices[0].message.content if response.choices else ""
        
        return GenerateTextResponse(
            content=content,
            model=request.model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating text: {str(e)}")
