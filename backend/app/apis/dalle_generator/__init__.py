"""DALL-E image generation API."""

from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from openai import OpenAI
import databutton as db

router = APIRouter()

class DalleRequest(BaseModel):
    prompt: str
    n: int = 1
    size: str = "1792x1024"
    quality: str = "hd"
    style: str = "vivid"

class DalleResponse(BaseModel):
    success: bool
    images: List[str]
    message: Optional[str] = None

@router.post("/generate")
def generate_dalle_image(request: DalleRequest) -> DalleResponse:
    """Generate an image using DALL-E 3."""
    try:
        client = OpenAI(api_key=db.secrets.get("OPENAI_API_KEY"))
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=request.prompt,
            n=request.n,
            size=request.size,
            quality=request.quality,
            style=request.style
        )
        
        return DalleResponse(
            success=True,
            images=[image.url for image in response.data]
        )
    except Exception as e:
        return DalleResponse(
            success=False,
            images=[],
            message=str(e)
        )