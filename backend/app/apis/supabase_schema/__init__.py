"""Setup script for creating the Wagtail CMS schema in Supabase.

This script creates the necessary tables and relationships in Supabase.
"""

import databutton as db
import requests
import json
import time
from fastapi import APIRouter

# Create router object for FastAPI to mount
router = APIRouter()

# SQL statements to create the schema
SCHEMA_SQL = """
-- Create property_types table
CREATE TABLE IF NOT EXISTS property_types (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude FLOAT,
    longitude FLOAT
);

-- Create features table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50)
);

-- Create properties table with proper structure
CREATE TABLE IF NOT EXISTS cms_properties (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    property_type_id UUID REFERENCES property_types(id),
    location_id UUID REFERENCES locations(id),
    neighborhood VARCHAR(255),
    address TEXT,
    price DECIMAL(12, 2) NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    area DECIMAL(10, 2) NOT NULL,
    property_video_url VARCHAR(255),
    drone_video_url VARCHAR(255),
    virtual_tour_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP
);

-- Create property_features table
CREATE TABLE IF NOT EXISTS property_features (
    property_id UUID REFERENCES cms_properties(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES features(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, feature_id)
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY,
    property_id UUID REFERENCES cms_properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption VARCHAR(255),
    is_main BOOLEAN DEFAULT FALSE
);

-- Create property_investment_metrics table
CREATE TABLE IF NOT EXISTS property_investment_metrics (
    id UUID PRIMARY KEY,
    property_id UUID REFERENCES cms_properties(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    value VARCHAR(50) NOT NULL,
    percentage VARCHAR(10) NOT NULL,
    description TEXT
);

-- Create property_tags table
CREATE TABLE IF NOT EXISTS property_tags (
    property_id UUID REFERENCES cms_properties(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (property_id, tag)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_status ON cms_properties(status);
CREATE INDEX IF NOT EXISTS idx_property_slug ON cms_properties(slug);
CREATE INDEX IF NOT EXISTS idx_property_location ON cms_properties(location_id);
CREATE INDEX IF NOT EXISTS idx_property_type ON cms_properties(property_type_id);
"""

def setup_supabase_schema():
    """Set up the CMS schema in Supabase"""
    try:
        # Get Supabase credentials
        supabase_url = db.secrets.get("SUPABASE_URL")
        supabase_key = db.secrets.get("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not supabase_key:
            print("Missing Supabase credentials")
            return {"success": False, "error": "Missing Supabase credentials"}
            
        # Format the URL for the SQL API
        sql_url = f"{supabase_url}/rest/v1/rpc/exec_sql"
        
        # Set the headers
        headers = {
            "apikey": supabase_key,
            "Authorization": f"Bearer {supabase_key}",
            "Content-Type": "application/json"
        }
        
        # Execute the SQL
        response = requests.post(
            sql_url,
            headers=headers,
            json={"query": SCHEMA_SQL}
        )
        
        if response.status_code != 200:
            print(f"Error executing SQL: {response.status_code} - {response.text}")
            return {"success": False, "error": response.text}
        
        print("Schema created successfully")
        return {"success": True}
        
    except Exception as e:
        print(f"Error setting up schema: {e}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    print("Setting up Supabase schema...")
    result = setup_supabase_schema()
    print(f"Schema setup result: {result}")
