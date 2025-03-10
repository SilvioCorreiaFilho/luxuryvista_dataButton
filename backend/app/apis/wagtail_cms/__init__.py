"""API Router Module for CMS functionality.

This module provides endpoints for managing CMS content using Supabase as the backend.
It handles the optional dependency on supabase_cms and provides appropriate fallbacks.
"""

# Standard library imports
import importlib.util
import json
import logging
import re
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any, Callable, Union

# Third-party imports
import databutton as db
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from supabase import Client, create_client

# Local application imports
from app.apis.definitions import (
    Feature, 
    InvestmentMetric, 
    Location, 
    Property, 
    PropertyImage, 
    PropertyType
)
from app.apis.utils import get_supabase

# Set up logging
logger = logging.getLogger(__name__)

# Initialize router
router = APIRouter(prefix="/wagtail", tags=["cms"])

# Constants
SUPABASE_CMS_AVAILABLE = False
CMS_FUNCTIONS = {}

def setup_supabase_cms() -> Dict[str, Callable]:
    """
    Initialize supabase_cms functionality if available.
    
    Returns:
        Dict[str, Callable]: Dictionary of CMS functions or None if not available
    """
    global SUPABASE_CMS_AVAILABLE
    
    try:
        # Check if the module exists before attempting import
        if importlib.util.find_spec("app.apis.supabase_cms"):
            from app.apis import supabase_cms
            
            # Create a mapping of functions to make them accessible
            cms_functions = {
                "get_property_types": supabase_cms.get_property_types,
                "create_property_type": supabase_cms.create_property_type,
                "get_locations": supabase_cms.get_locations,
                "create_location": supabase_cms.create_location,
                "get_features": supabase_cms.get_features,
                "create_feature": supabase_cms.create_feature,
                "setup_cms_database": supabase_cms.setup_cms_database,
                "get_properties": supabase_cms.get_properties,
                "get_property": supabase_cms.get_property,
                "create_property": supabase_cms.create_property,
                "update_property": supabase_cms.update_property,
                "delete_property": supabase_cms.delete_property,
            }
            
            SUPABASE_CMS_AVAILABLE = True
            logger.info("Supabase CMS functionality is available")
            return cms_functions
        else:
            logger.warning("supabase_cms module not available")
            return {}
    except ImportError as e:
        logger.warning(f"Could not import supabase_cms module: {e}")
        logger.warning("Some CMS functionality may be unavailable")
        return {}

# Initialize CMS functions
CMS_FUNCTIONS = setup_supabase_cms()

def get_cms_client() -> Client:
    """
    Get a Supabase client for CMS operations.
    
    This dependency checks if CMS functionality is available before proceeding.
    
    Returns:
        Client: Supabase client
        
    Raises:
        HTTPException: If CMS functionality is not available
    """
    if not SUPABASE_CMS_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="CMS functionality is currently unavailable"
        )
    
    # Re-use the common Supabase client
    return get_supabase()

def get_cms_client_or_none() -> Optional[Client]:
    """
    Get a Supabase client for CMS operations, or None if not available.
    
    This dependency is used for endpoints that can fallback to alternative data sources.
    
    Returns:
        Optional[Client]: Supabase client or None
    """
    if not SUPABASE_CMS_AVAILABLE:
        return None
    
    # Re-use the common Supabase client
    return get_supabase()

# Example endpoint with proper error handling and fallback
@router.get("/property-types", response_model=List[PropertyType])
async def get_property_types(
    cms_client: Optional[Client] = Depends(get_cms_client_or_none)
) -> List[PropertyType]:
    """
    Get all property types from the CMS.
    
    Args:
        cms_client: Supabase client or None if CMS is unavailable
        
    Returns:
        List of property types
    """
    try:
        if cms_client and "get_property_types" in CMS_FUNCTIONS:
            # Use the CMS function if available
            return await CMS_FUNCTIONS["get_property_types"](cms_client)
        
        # Fallback to default property types
        logger.info("Using fallback property types data")
        return [
            PropertyType(id="1", name="Residence", description="Standard residential property"),
            PropertyType(id="2", name="Apartment", description="Apartment unit"),
            PropertyType(id="3", name="Commercial", description="Commercial property"),
            PropertyType(id="4", name="Land", description="Undeveloped land"),
        ]
    except Exception as e:
        logger.error(f"Error retrieving property types: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to retrieve property types: {str(e)}"
        )

# Add more endpoints here following the same pattern
# Endpoints added following the recommended pattern