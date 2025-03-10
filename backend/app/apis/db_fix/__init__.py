#!/usr/bin/env python3
"""
Utility script for working with PostgreSQL and DeepSeek AI.
This script demonstrates:
1. Correct import pattern for DeepSeek client
2. Database connection and error handling for PostgreSQL
"""

import os
import sys
import traceback
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
import databutton as db
from fastapi import APIRouter, HTTPException

# Create an empty router to satisfy the module loader
router = APIRouter()

# === DEEPSEEK CLIENT SETUP ===
# Setup for the DeepSeek client
try:
    from deepseek import Client as DeepSeekClient
    print("Successfully imported DeepSeekClient")
except ImportError:
    print("Failed to import DeepSeekClient. Install it with: pip install deepseek-api")

# === DATABASE SETUP ===
try:
    import psycopg2
    from psycopg2 import sql
    from psycopg2.extras import RealDictCursor
    print("Successfully imported psycopg2")
except ImportError:
    print("Failed to import psycopg2. Install it with: pip install psycopg2-binary")


class DatabaseManager:
    """Manages database connections and operations."""
    
    def __init__(self, connection_params: Dict[str, Any]):
        """Initialize with database connection parameters."""
        self.connection_params = connection_params
        self.conn = None
        self.cursor = None
    
    def connect(self):
        """Establish a connection to the database."""
        try:
            self.conn = psycopg2.connect(**self.connection_params)
            self.cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            print("Successfully connected to the database")
            return True
        except Exception as e:
            print(f"Failed to connect to the database: {e}")
            return False
    
    def close(self):
        """Close database connections."""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("Database connection closed")
    
    def check_column_exists(self, table: str, column: str) -> bool:
        """Check if a column exists in a table."""
        try:
            query = sql.SQL("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = %s AND column_name = %s
                );
            """)
            self.cursor.execute(query, (table, column))
            result = self.cursor.fetchone()
            return result['exists'] if result else False
        except Exception as e:
            print(f"Error checking if column exists: {e}")
            return False
    
    def add_column_if_not_exists(self, table: str, column: str, data_type: str) -> bool:
        """Add a column to a table if it doesn't already exist."""
        try:
            if not self.check_column_exists(table, column):
                query = sql.SQL("ALTER TABLE {} ADD COLUMN {} {};").format(
                    sql.Identifier(table),
                    sql.Identifier(column),
                    sql.SQL(data_type)
                )
                self.cursor.execute(query)
                self.conn.commit()
                print(f"Added column '{column}' to table '{table}'")
                return True
            else:
                print(f"Column '{column}' already exists in table '{table}'")
                return True
        except Exception as e:
            print(f"Error adding column: {e}")
            self.conn.rollback()
            return False
    
    def get_properties(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetch properties from the database, handling missing columns."""
        try:
            # First ensure the drone_video_url column exists
            self.add_column_if_not_exists('properties', 'drone_video_url', 'TEXT')
            
            # Now we can safely query including that column
            query = sql.SQL("SELECT * FROM properties LIMIT %s;")
            self.cursor.execute(query, (limit,))
            return self.cursor.fetchall()
        except Exception as e:
            print(f"Error fetching properties: {e}")
            return []


def fix_database_schema():
    """Fix the database schema by adding missing columns."""
    try:
        # Get database credentials from secrets
        postgres_host = db.secrets.get("POSTGRES_HOST")
        postgres_port = db.secrets.get("POSTGRES_PORT")
        postgres_db = db.secrets.get("POSTGRES_DB")
        postgres_user = db.secrets.get("POSTGRES_USER")
        postgres_password = db.secrets.get("POSTGRES_PASSWORD")
        
        # Check if we have all needed credentials
        if not all([postgres_host, postgres_port, postgres_db, postgres_user, postgres_password]):
            print("Missing database credentials. Ensure all PostgreSQL secrets are set.")
            return False
        
        # Database connection parameters
        db_params = {
            'dbname': postgres_db,
            'user': postgres_user,
            'password': postgres_password,
            'host': postgres_host,
            'port': postgres_port
        }
        
        # Initialize database manager
        db_manager = DatabaseManager(db_params)
        
        # Connect to database
        if not db_manager.connect():
            print("Failed to connect to database.")
            return False
        
        try:
            # Fix the missing column issue
            result = db_manager.add_column_if_not_exists('properties', 'drone_video_url', 'TEXT')
            
            # Get properties to verify everything works
            if result:
                properties = db_manager.get_properties(limit=3)
                if properties:
                    print(f"Successfully verified database schema with {len(properties)} properties")
                else:
                    print("No properties found, but schema should be fixed")
            
            return result
        
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error in database schema fix: {e}\nDetails: {error_details}")
            return False
        
        finally:
            # Clean up
            db_manager.close()
    
    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error in fix_database_schema: {e}\nDetails: {error_details}")
        return False


# Request model for property database schema fix
class FixPropertyDatabaseSchemaRequest(BaseModel):
    force_rebuild_table: bool = Field(False, description="Force rebuild of property_images table structure")
    recreate_images: bool = Field(False, description="Force recreation of image objects even if they exist")

# Endpoint to fix property database schema
@router.post("/fix-property-database-schema", operation_id="fix_property_database_schema_endpoint")
def fix_property_database_schema_endpoint(request: FixPropertyDatabaseSchemaRequest = None):
    """Endpoint to fix property database schema."""
    try:
        result = fix_database_schema()
        if result:
            return {"success": True, "message": "Database schema fixed successfully"}
        else:
            return {"success": False, "message": "Failed to fix database schema"}
    except Exception as e:
        error_details = traceback.format_exc()
        raise HTTPException(status_code=500, detail=f"Error fixing database schema: {str(e)}")


# Function that can be called from other modules
def fix_property_database():
    """Public function to fix the property database schema."""
    return fix_database_schema()


if __name__ == "__main__":
    fix_database_schema()