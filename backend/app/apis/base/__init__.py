"""Base models for the APIs"""

from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

# Create an empty router to satisfy the module loader
router = APIRouter()

class BaseResponse(BaseModel):
    """Base response model"""
    success: bool
    message: str
    errors: Optional[List[str]] = None
