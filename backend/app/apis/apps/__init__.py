"""Application configuration for LuxuryVista."""

from fastapi import APIRouter

router = APIRouter()

@router.get("/apps/info")
def get_app_info():
    """Get application information."""
    return {
        "name": "LuxuryVista",
        "version": "1.0.0",
        "description": "Luxury property management platform"
    }
