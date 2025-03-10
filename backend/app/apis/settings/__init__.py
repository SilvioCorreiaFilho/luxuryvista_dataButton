"""Application settings for LuxuryVista.

This module contains all the settings required for the application to work properly.
"""

from fastapi import APIRouter
import databutton as db

router = APIRouter()

@router.get("/settings")
def get_settings():
    """Get application settings."""
    return {
        "app": {
            "name": "LuxuryVista",
            "version": "1.0.0",
            "description": "Luxury property management platform",
            "default_language": "pt-BR"
        },
        "features": {
            "search": True,
            "analytics": True,
            "translation": True,
            "virtual_tours": True,
            "property_videos": True
        },
        "ui": {
            "theme": "light",
            "animations": True,
            "map_provider": "mapbox",
            "map_api_key": db.secrets.get("MAPBOX_API_KEY")
        },
        "database": {
            "provider": "supabase",
            "tables": ["properties", "locations", "property_types", "images", "metrics"]
        }
    }
