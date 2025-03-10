"""
Property Manager for LuxuryVista

This module acts as a facade between APIs and storage backends (database or fallback).
It handles routing property operations to the correct backend based on availability.
"""

import os
import uuid
import json
import random
import re
import base64
import asyncio
import httpx
from datetime import datetime
from typing import List, Dict, Any, Optional, Union, Tuple
import databutton as db
from fastapi import APIRouter, HTTPException, File, UploadFile
from pydantic import BaseModel

# Fallback storage will be set via initialize_fallback method to avoid circular imports
from app.apis.common_imports import sanitize_storage_key, generate_id, get_timestamp
from app.apis.common_imports import PROPERTY_TYPES, NEIGHBORHOODS, DEFAULT_FEATURES, translate_property_data

# Create router
router = APIRouter(prefix="/property-manager", tags=["property-manager"])

class PropertyManager:
    """Manager class to handle property operations across different backends"""
    
    def __init__(self):
        """Initialize the PropertyManager"""
        self.fallback_storage = None  # Will be set via initialize_fallback
        self.openai_client = None
        self.use_fallback = True  # Set to True for now, will check DB connection later
        
    def initialize_fallback(self, fallback_storage):
        """Initialize with a fallback storage implementation
        
        Args:
            fallback_storage: Storage implementation for fallback
        """
        self.fallback_storage = fallback_storage
        print(f"PropertyManager initialized with fallback storage: {fallback_storage.__class__.__name__}")
        
    async def _initialize_openai(self):
        """Initialize OpenAI client"""
        if self.openai_client is None:
            try:
                from openai import OpenAI
                api_key = db.secrets.get("OPENAI_API_KEY")
                if api_key:
                    self.openai_client = OpenAI(api_key=api_key)
            except Exception as e:
                print(f"Error initializing OpenAI client: {e}")
                
    async def _generate_description(self, property_type: str, neighborhood: str, language: str = "pt") -> str:
        """Generate a property description using AI
        
        Args:
            property_type: Type of property
            neighborhood: Neighborhood location
            language: Language for description (pt or en)
            
        Returns:
            Generated description text
        """
        await self._initialize_openai()
        
        if not self.openai_client:
            # Fallback descriptions if OpenAI not available
            descriptions = [
                "Luxuosa propriedade com acabamentos premium, situada em uma localiza\u00e7\u00e3o privilegiada.",
                "Im\u00f3vel de alto padr\u00e3o com design elegante e vistas deslumbrantes para o horizonte da cidade.",
                "Resid\u00eancia exclusiva com amplos espa\u00e7os, perfeita para quem busca conforto e sofistica\u00e7\u00e3o."
            ]
            return random.choice(descriptions)
            
        try:
            prompt = f"""Generate a detailed and compelling description for a {property_type} in {neighborhood}.
            Focus on luxury features, premium amenities, and the exclusivity of the property.
            The description should be elegant, sophisticated, and appeal to high-end clients.
            Write in {language} language.
            Keep it between 150-250 words.
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a luxury real estate copywriter with extensive experience marketing high-end properties."},
                    {"role": "user", "content": prompt}
                ]
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error generating property description: {e}")
            return "Propriedade de luxo em localiza\u00e7\u00e3o exclusiva. Entre em contato para mais detalhes."
    
    async def _generate_features(self, property_type: str, neighborhood: str, count: int = 8, language: str = "pt") -> List[Dict[str, str]]:
        """Generate property features
        
        Args:
            property_type: Type of property
            neighborhood: Neighborhood location
            count: Number of features to generate
            language: Language for features (pt or en)
            
        Returns:
            List of feature dictionaries with name and description
        """
        # Select random features from the default list
        features_list = random.sample(DEFAULT_FEATURES, min(count, len(DEFAULT_FEATURES)))
        
        return [
            {"name": feature, "description": ""} 
            for feature in features_list
        ]
    
    async def _upload_image_to_storage(self, file_path: str, caption: str = "") -> str:
        """Upload an image to storage and return the URL
        
        Args:
            file_path: Path to the image file
            caption: Caption for the image
            
        Returns:
            URL of the uploaded image
        """
        try:
            # Generate a unique ID for the image
            image_id = f"property-img-{uuid.uuid4()}"
            
            # Read the image file
            with open(file_path, "rb") as f:
                image_data = f.read()
            
            # Save image to storage
            image_key = sanitize_storage_key(image_id)
            db.storage.binary.put(image_key, image_data)
            
            # Return the URL (this would be different in production)
            return f"/api/storage/binary/{image_key}"
        except Exception as e:
            print(f"Error uploading image to storage: {e}")
            raise e
    
    async def generate_property(self, property_type: str, neighborhood: str, language: str = "pt") -> Dict[str, Any]:
        """Generate a property with AI content
        
        Args:
            property_type: Type of property
            neighborhood: Neighborhood location
            language: Language for content generation (pt or en)
            
        Returns:
            Generated property data
        """
        # Generate a property ID
        property_id = generate_id("prop-")
        
        # Generate price (10-30 million)
        price = random.randint(10000000, 30000000)
        
        # Generate square footage (300-1200 sqm)
        area = random.randint(300, 1200)
        
        # Generate number of bedrooms and bathrooms
        bedrooms = random.randint(3, 8)
        bathrooms = random.randint(bedrooms - 1, bedrooms + 2)
        
        # Generate property description
        description = await self._generate_description(property_type, neighborhood, language)
        
        # Generate features
        features = await self._generate_features(property_type, neighborhood, 8, language)
        
        # Create property data
        property_data = {
            "id": property_id,
            "title": f"{property_type} in {neighborhood}",
            "description": description,
            "property_type": property_type,
            "price": price,
            "currency": "BRL",
            "area": area,
            "area_unit": "sqm",
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "location": {
                "neighborhood": neighborhood,
                "city": "Bras\u00edlia",
                "state": "DF",
                "country": "Brasil"
            },
            "features": features,
            "status": "for_sale",
            "images": [],
            "created_at": get_timestamp(),
            "updated_at": get_timestamp()
        }
        
        # Translate if needed
        if language != "en":
            property_data = translate_property_data(property_data, language)
        
        # Save property
        if self.use_fallback and self.fallback_storage:
            created_property = self.fallback_storage.create_property(property_data)
            return created_property
        
        # Database implementation would go here
        return property_data
    
    async def create_property(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new property
        
        Args:
            property_data: Property data to create
            
        Returns:
            Created property data
        """
        if self.use_fallback and self.fallback_storage:
            return self.fallback_storage.create_property(property_data)
        
        # Database implementation would go here
        return {}
    
    async def get_properties(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get properties with optional filtering
        
        Args:
            filters: Optional filters to apply
            
        Returns:
            List of properties
        """
        if self.use_fallback and self.fallback_storage:
            return self.fallback_storage.get_properties(filters)
        
        # Database implementation would go here
        return []
    
    async def get_property(self, property_id: str) -> Optional[Dict[str, Any]]:
        """Get a property by ID
        
        Args:
            property_id: ID of the property to get
            
        Returns:
            Property data or None if not found
        """
        if self.use_fallback and self.fallback_storage:
            return self.fallback_storage.get_property(property_id)
        
        # Database implementation would go here
        return None
    
    async def update_property(self, property_id: str, property_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a property
        
        Args:
            property_id: ID of the property to update
            property_data: Property data to update
            
        Returns:
            Updated property data or None if not found
        """
        if self.use_fallback and self.fallback_storage:
            return self.fallback_storage.update_property(property_id, property_data)
        
        # Database implementation would go here
        return None
    
    async def delete_property(self, property_id: str) -> bool:
        """Delete a property
        
        Args:
            property_id: ID of the property to delete
            
        Returns:
            True if deleted, False otherwise
        """
        if self.use_fallback and self.fallback_storage:
            return self.fallback_storage.delete_property(property_id)
        
        # Database implementation would go here
        return False
    
    async def upload_image(self, property_id: str, file_path: str, caption: str = "", is_main: bool = False) -> Optional[Dict[str, Any]]:
        """Upload an image for a property
        
        Args:
            property_id: ID of the property
            file_path: Path to the image file
            caption: Caption for the image
            is_main: Whether this is the main property image
            
        Returns:
            Image data or None if property not found
        """
        try:
            # Upload image to storage
            image_url = await self._upload_image_to_storage(file_path, caption)
            
            if self.use_fallback and self.fallback_storage:
                return self.fallback_storage.upload_image(property_id, image_url, caption, is_main)
            
            # Database implementation would go here
            return None
        except Exception as e:
            print(f"Error uploading image: {e}")
            return None

# Create an instance for use throughout the app
property_manager = PropertyManager()

@router.post("/generate-facade")
async def generate_property_facade(property_type: str, neighborhood: str, language: str = "pt") -> Dict[str, Any]:
    """Generate a property with AI content via facade"""
    return await property_manager.generate_property(property_type, neighborhood, language)

@router.get("/properties-facade")
async def get_properties_facade(neighborhood: Optional[str] = None, property_type: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get properties with optional filtering via facade"""
    filters = {}
    if neighborhood:
        filters["location.neighborhood"] = neighborhood
    if property_type:
        filters["property_type"] = property_type
        
    return await property_manager.get_properties(filters)

@router.get("/property-facade/{property_id}")
async def get_property_facade(property_id: str) -> Dict[str, Any]:
    """Get a property by ID via facade"""
    property_data = await property_manager.get_property(property_id)
    if not property_data:
        raise HTTPException(status_code=404, detail=f"Property not found: {property_id}")
    return property_data