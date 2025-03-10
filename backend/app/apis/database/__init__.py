"""Database configuration and models for the LuxuryVista application.

This module handles database connection setup and defines SQLModel models for the application.
It uses Supabase as the database provider and includes proper connection pooling and error handling.
"""

from urllib.parse import quote_plus
from typing import List, Optional
import time

from sqlmodel import SQLModel, Field, create_engine, Session, Relationship
from sqlalchemy import text
from fastapi import APIRouter, HTTPException
import databutton as db

router = APIRouter()

# Database configuration
class DatabaseConfig:
    def __init__(self):
        # Get database credentials from secrets
        try:
            self.host = db.secrets.get("POSTGRES_HOST")
            self.port = db.secrets.get("POSTGRES_PORT") or "5432"
            self.name = db.secrets.get("POSTGRES_DB") or "postgres"
            self.user = db.secrets.get("POSTGRES_USER")
            self.password = db.secrets.get("POSTGRES_PASSWORD")
            
            # Check if we have all required credentials
            if not all([self.host, self.user, self.password]):
                print("Warning: Missing database credentials. Check POSTGRES_HOST, POSTGRES_USER, and POSTGRES_PASSWORD in secrets.")
                # Fall back to Supabase URL extraction if available
                supabase_url = db.secrets.get("SUPABASE_URL")
                if supabase_url and not self.host:
                    project_id = supabase_url.split('//')[1].split('.')[0]
                    self.host = f"{project_id}.supabase.co"
                    print(f"Using Supabase URL to derive host: {self.host}")
        except Exception as e:
            print(f"Error loading database credentials from secrets: {e}")
            raise ValueError("Failed to initialize database configuration") from e
        
    @property
    def url(self) -> str:
        """Build database URL with SSL configuration"""
        return f"postgresql://{self.user}:{quote_plus(self.password)}@{self.host}:{self.port}/{self.name}?sslmode=require"
    
    def get_engine(self):
        """Create SQLAlchemy engine with proper configuration"""
        return create_engine(
            self.url,
            pool_size=5,  # Number of permanent connections
            max_overflow=10,  # Number of connections that can be created above pool_size
            pool_timeout=30,  # Seconds to wait before giving up on getting a connection
            pool_recycle=1800,  # Recycle connections after 30 minutes
            pool_pre_ping=True,  # Enable connection health checks
            echo=False  # Set to True to log all SQL
        )

# Initialize database configuration - wrap in function to delay execution and allow API to load
def initialize_database():
    global engine, db_config, _db_initialized
    
    try:
        # Create DB config
        db_config = DatabaseConfig()
        
        # Configure database engine with proper pooling and timeouts
        engine = db_config.get_engine()
        
        # Test connection with shorter timeout
        try:
            with engine.connect() as conn:
                # Set statement timeout to 5 seconds to avoid long hangs
                conn.execute(text("SET statement_timeout = 5000"))
                conn.execute(text("SELECT 1"))
                print("Database connection test successful")
                _db_initialized = True
                return True
        except Exception as conn_e:
            print(f"Connection test failed: {conn_e}")
            _db_initialized = False
            return False
    except Exception as e:
        try:
            sanitized_url = db_config.url.replace(db_config.password, "***")
            print(f"Database connection error: {str(e)}")
            print(f"Connection URL (sanitized): {sanitized_url}")
        except Exception as url_error:
            print(f"Database connection error: {str(e)}")
            print(f"Could not log sanitized URL: {url_error}")
        _db_initialized = False
        return False

# Flag to track if database has been successfully initialized
_db_initialized = False

# Initialize variables with defaults to allow module to load even if DB connection fails
engine = None
db_config = None

# Attempt initial connection, but don't fail if it doesn't work
try:
    initialize_database()
except Exception as init_error:
    print(f"Initial database connection attempt failed: {init_error}")
    print("API will still load, but database operations will fail until connection is restored")

def get_session():
    """Get database session with retry logic."""
    global _db_initialized, engine
    
    # If database is not initialized, try to initialize it
    if not _db_initialized:
        if not initialize_database():
            raise HTTPException(status_code=503, detail="Database connection is currently unavailable")
    
    # Now we should have a working engine
    if engine is None:
        raise HTTPException(status_code=503, detail="Database connection is currently unavailable")
        
    with Session(engine) as session:
        yield session

# Models
class PropertyType(SQLModel, table=True):
    __tablename__ = "propertytype"
    __table_args__ = {'extend_existing': True}
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    properties: List["Property"] = Relationship(back_populates="type")

class Location(SQLModel, table=True):
    __tablename__ = "location"
    __table_args__ = {'extend_existing': True}
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: str
    properties: List["Property"] = Relationship(back_populates="location")

class InvestmentMetric(SQLModel, table=True):
    __tablename__ = "investmentmetric"
    __table_args__ = {'extend_existing': True}
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    type: str
    value: str
    percentage: str
    property: "Property" = Relationship(back_populates="investment_metrics")

class PropertyImage(SQLModel, table=True):
    __tablename__ = "propertyimage"
    __table_args__ = {'extend_existing': True}
    
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    url: str
    caption: Optional[str] = None
    property: "Property" = Relationship(back_populates="images")

class Property(SQLModel, table=True):
    __tablename__ = "property"
    __table_args__ = {'extend_existing': True}
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    type_id: int = Field(foreign_key="propertytype.id")
    location_id: int = Field(foreign_key="location.id")
    price: float
    bedrooms: int
    bathrooms: int
    area: float
    features: str = Field(default="[]")
    virtual_tour_url: Optional[str] = None
    property_video_url: Optional[str] = None
    drone_video_url: Optional[str] = None
    type: PropertyType = Relationship(back_populates="properties")
    location: Location = Relationship(back_populates="properties")
    images: List[PropertyImage] = Relationship(back_populates="property")
    investment_metrics: List[InvestmentMetric] = Relationship(back_populates="property")

# Create tables - wrapped in function to be called explicitly
def create_database_tables():
    """Create database tables - can be called explicitly from API endpoints"""
    global _db_initialized, engine
    
    if not _db_initialized:
        if not initialize_database():
            raise HTTPException(status_code=503, detail="Database connection is currently unavailable")
    
    if engine is None:
        raise HTTPException(status_code=503, detail="Database connection is currently unavailable")
    
    try:
        SQLModel.metadata.create_all(engine)
        print("Database tables created successfully")
        return {"success": True, "message": "Database tables created successfully"}
    except Exception as e:
        print(f"Failed to create database tables: {e}")
        return {"success": False, "error": str(e)}