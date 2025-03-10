from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import databutton as db
import psycopg2
from psycopg2.extras import RealDictCursor
import traceback
import time
import uuid
from datetime import datetime

router = APIRouter(prefix="/database-test")

class DatabaseTestResponse(BaseModel):
    status: str
    message: str
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.get("/connection", response_model=DatabaseTestResponse, tags=["diagnostics"])
def test_database_connection():
    """Test the PostgreSQL database connection"""
    try:
        # Retrieve credentials from secrets
        try:
            host = db.secrets.get("POSTGRES_HOST")
            port_str = db.secrets.get("POSTGRES_PORT")
            port = int(port_str) if port_str else 5432
            dbname = db.secrets.get("POSTGRES_DB")
            user = db.secrets.get("POSTGRES_USER")
            password = db.secrets.get("POSTGRES_PASSWORD")
            
            # Check if required credentials are available
            if not all([host, user, password]):
                return DatabaseTestResponse(
                    status="error",
                    message="Missing database credentials. Please set POSTGRES_HOST, POSTGRES_USER, and POSTGRES_PASSWORD in secrets.",
                    details={"missing_credentials": [
                        "POSTGRES_HOST" if not host else None,
                        "POSTGRES_USER" if not user else None,
                        "POSTGRES_PASSWORD" if not password else None
                    ]}
                )
        except Exception as e:
            return DatabaseTestResponse(
                status="error",
                message="Failed to retrieve database credentials from secrets",
                error=str(e)
            )
        
        print(f"Using direct credentials - Host: {host}, Port: {port}, DB: {dbname}, User: {user}")
        
        # Also try to get from secrets as a fallback, in case we need them later
        try:
            saved_host = db.secrets.get("POSTGRES_HOST")
            saved_port = db.secrets.get("POSTGRES_PORT")
            saved_dbname = db.secrets.get("POSTGRES_DB")
            saved_user = db.secrets.get("POSTGRES_USER")
            saved_password = db.secrets.get("POSTGRES_PASSWORD")
            
            print(f"Secrets available: Host: {bool(saved_host)}, Port: {bool(saved_port)}, DB: {bool(saved_dbname)}, User: {bool(saved_user)}, Password: {bool(saved_password)}")
        except Exception as e:
            print(f"Note: Could not retrieve secrets (this is just informational): {e}")
        
        # Hide password in output
        connection_info = {
            "host": host,
            "port": port,
            "database": dbname,
            "user": user,
            "password_length": len(password) if password else 0
        }
        
        # Try to connect with retries
        max_retries = 3
        retry_delay = 2  # seconds
        last_error = None
        
        for attempt in range(max_retries):
            try:
                # Connect to PostgreSQL with explicit parameters
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    dbname=dbname,
                    user=user,
                    password=password,
                    cursor_factory=RealDictCursor
                )
                
                # Test the connection
                cursor = conn.cursor()
                cursor.execute("SELECT version();")
                db_version = cursor.fetchone()["version"]
                
                # Get table information
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    ORDER BY table_name;
                """)
                
                tables = [table["table_name"] for table in cursor.fetchall()]
                
                # Close connection
                cursor.close()
                conn.close()
                
                # Return success response
                return DatabaseTestResponse(
                    status="success",
                    message="Database connection test successful",
                    details={
                        "connection": connection_info,
                        "version": db_version,
                        "tables": tables,
                        "attempts": attempt + 1
                    }
                )
                
            except Exception as e:
                last_error = str(e)
                error_traceback = traceback.format_exc()
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
        
        # If we get here, all attempts failed
        return DatabaseTestResponse(
            status="error",
            message="Failed to connect to the database after multiple attempts",
            details={
                "connection": connection_info,
                "attempts": max_retries
            },
            error=f"{last_error}\n{error_traceback}"
        )
        
    except Exception as e:
        return DatabaseTestResponse(
            status="error",
            message="Error retrieving database credentials or testing connection",
            error=f"{str(e)}\n{traceback.format_exc()}"
        )

@router.post("/setup", response_model=DatabaseTestResponse, tags=["diagnostics"])
def setup_test_database():
    """Set up test tables in the PostgreSQL database"""
    try:
        # Retrieve credentials from secrets
        try:
            host = db.secrets.get("POSTGRES_HOST")
            port_str = db.secrets.get("POSTGRES_PORT")
            port = int(port_str) if port_str else 5432
            dbname = db.secrets.get("POSTGRES_DB")
            user = db.secrets.get("POSTGRES_USER")
            password = db.secrets.get("POSTGRES_PASSWORD")
            
            # Check if required credentials are available
            if not all([host, user, password]):
                return DatabaseTestResponse(
                    status="error",
                    message="Missing database credentials. Please set POSTGRES_HOST, POSTGRES_USER, and POSTGRES_PASSWORD in secrets.",
                    details={"missing_credentials": [
                        "POSTGRES_HOST" if not host else None,
                        "POSTGRES_USER" if not user else None,
                        "POSTGRES_PASSWORD" if not password else None
                    ]}
                )
        except Exception as e:
            return DatabaseTestResponse(
                status="error",
                message="Failed to retrieve database credentials from secrets",
                error=str(e)
            )
        
        print(f"Using direct credentials - Host: {host}, Port: {port}, DB: {dbname}, User: {user}")
        
        # Try to connect
        print(f"Connecting to PostgreSQL at {host}:{port}/{dbname} as {user}")
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            cursor_factory=RealDictCursor
        )
        
        # Start transaction
        conn.autocommit = False
        cursor = conn.cursor()
        
        try:
            # Create test table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS test_table (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP NOT NULL
                );
            """)
            
            # Insert test data
            test_id = str(uuid.uuid4())
            now = datetime.now()
            cursor.execute(
                "INSERT INTO test_table (id, name, created_at) VALUES (%s, %s, %s)",
                (test_id, f"Test Record {now}", now)
            )
            
            # Commit transaction
            conn.commit()
            
            # Query test data
            cursor.execute("SELECT * FROM test_table ORDER BY created_at DESC LIMIT 5")
            test_records = cursor.fetchall()
            
            # Close connection
            cursor.close()
            conn.close()
            
            return DatabaseTestResponse(
                status="success",
                message="Test database setup successful",
                details={
                    "test_table_created": True,
                    "test_record_inserted": True,
                    "test_records": test_records
                }
            )
            
        except Exception as e:
            # Rollback transaction on error
            conn.rollback()
            cursor.close()
            conn.close()
            
            raise e
            
    except Exception as e:
        return DatabaseTestResponse(
            status="error",
            message="Failed to set up test database",
            error=f"{str(e)}\n{traceback.format_exc()}"
        )

@router.post("/init-cms-schema", response_model=DatabaseTestResponse, tags=["diagnostics"])
def initialize_cms_schema():
    """Initialize the CMS database schema"""
    try:
        # Retrieve credentials from secrets
        try:
            host = db.secrets.get("POSTGRES_HOST")
            port_str = db.secrets.get("POSTGRES_PORT")
            port = int(port_str) if port_str else 5432
            dbname = db.secrets.get("POSTGRES_DB")
            user = db.secrets.get("POSTGRES_USER")
            password = db.secrets.get("POSTGRES_PASSWORD")
            
            # Check if required credentials are available
            if not all([host, user, password]):
                return DatabaseTestResponse(
                    status="error",
                    message="Missing database credentials. Please set POSTGRES_HOST, POSTGRES_USER, and POSTGRES_PASSWORD in secrets.",
                    details={"missing_credentials": [
                        "POSTGRES_HOST" if not host else None,
                        "POSTGRES_USER" if not user else None,
                        "POSTGRES_PASSWORD" if not password else None
                    ]}
                )
        except Exception as e:
            return DatabaseTestResponse(
                status="error",
                message="Failed to retrieve database credentials from secrets",
                error=str(e)
            )
        
        print(f"Using direct credentials - Host: {host}, Port: {port}, DB: {dbname}, User: {user}")
        
        # Try to connect
        print(f"Connecting to PostgreSQL at {host}:{port}/{dbname} as {user}")
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=user,
            password=password,
            cursor_factory=RealDictCursor
        )
        
        # Start transaction
        conn.autocommit = False
        cursor = conn.cursor()
        
        try:
            # Create property_types table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS property_types (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT
                );
            """)
            
            # Create locations table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS locations (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    latitude FLOAT,
                    longitude FLOAT
                );
            """)
            
            # Create features table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS features (
                    id VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    icon VARCHAR(50)
                );
            """)
            
            # Create properties table with proper structure
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cms_properties (
                    id VARCHAR(36) PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    slug VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    property_type_id VARCHAR(36) REFERENCES property_types(id),
                    location_id VARCHAR(36) REFERENCES locations(id),
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
            """)
            
            # Create property_features table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS property_features (
                    property_id VARCHAR(36) REFERENCES cms_properties(id) ON DELETE CASCADE,
                    feature_id VARCHAR(36) REFERENCES features(id) ON DELETE CASCADE,
                    PRIMARY KEY (property_id, feature_id)
                );
            """)
            
            # Create property_images table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS property_images (
                    id VARCHAR(36) PRIMARY KEY,
                    property_id VARCHAR(36) REFERENCES cms_properties(id) ON DELETE CASCADE,
                    url TEXT NOT NULL,
                    caption VARCHAR(255),
                    is_main BOOLEAN DEFAULT FALSE
                );
            """)
            
            # Create property_investment_metrics table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS property_investment_metrics (
                    id VARCHAR(36) PRIMARY KEY,
                    property_id VARCHAR(36) REFERENCES cms_properties(id) ON DELETE CASCADE,
                    type VARCHAR(20) NOT NULL,
                    value VARCHAR(50) NOT NULL,
                    percentage VARCHAR(10) NOT NULL,
                    description TEXT
                );
            """)
            
            # Create property_tags table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS property_tags (
                    property_id VARCHAR(36) REFERENCES cms_properties(id) ON DELETE CASCADE,
                    tag VARCHAR(50) NOT NULL,
                    PRIMARY KEY (property_id, tag)
                );
            """)
            
            # Add indexes for performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_property_status ON cms_properties(status);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_property_slug ON cms_properties(slug);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_property_location ON cms_properties(location_id);")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_property_type ON cms_properties(property_type_id);")
            
            # Insert some sample property types
            cursor.execute("SELECT COUNT(*) AS count FROM property_types")
            if cursor.fetchone()[0] == 0:
                property_types = [
                    (str(uuid.uuid4()), "Mansion", "Luxurious standalone residences with multiple rooms and amenities"),
                    (str(uuid.uuid4()), "Penthouse", "Luxury apartments on the top floors with panoramic views"),
                    (str(uuid.uuid4()), "Waterfront Villa", "Exclusive properties located along the waterfront"),
                    (str(uuid.uuid4()), "Luxury Apartment", "High-end apartments with premium amenities")
                ]
                
                for type_id, name, description in property_types:
                    cursor.execute(
                        "INSERT INTO property_types (id, name, description) VALUES (%s, %s, %s)",
                        (type_id, name, description)
                    )
            
            # Insert some sample locations
            cursor.execute("SELECT COUNT(*) AS count FROM locations")
            if cursor.fetchone()[0] == 0:
                locations = [
                    (str(uuid.uuid4()), "Lago Sul", "Elegante área residencial à beira do lago", -15.8335, -47.8731),
                    (str(uuid.uuid4()), "Lago Norte", "Área exclusiva com vista para o lago Paranoá", -15.7403, -47.8333),
                    (str(uuid.uuid4()), "Park Way", "Bairro de mansões com amplas áreas verdes", -15.9001, -47.9669),
                    (str(uuid.uuid4()), "Setor Noroeste", "Bairro planejado com construções modernas", -15.7609, -47.9204)
                ]
                
                for loc_id, name, description, lat, lng in locations:
                    cursor.execute(
                        "INSERT INTO locations (id, name, description, latitude, longitude) VALUES (%s, %s, %s, %s, %s)",
                        (loc_id, name, description, lat, lng)
                    )
            
            # Insert some sample features
            cursor.execute("SELECT COUNT(*) AS count FROM features")
            if cursor.fetchone()[0] == 0:
                features = [
                    (str(uuid.uuid4()), "Swimming Pool", "pool"),
                    (str(uuid.uuid4()), "Gym", "fitness"),
                    (str(uuid.uuid4()), "Home Theater", "theater"),
                    (str(uuid.uuid4()), "Garden", "garden"),
                    (str(uuid.uuid4()), "Sauna", "sauna"),
                    (str(uuid.uuid4()), "Wine Cellar", "wine")
                ]
                
                for feat_id, name, icon in features:
                    cursor.execute(
                        "INSERT INTO features (id, name, icon) VALUES (%s, %s, %s)",
                        (feat_id, name, icon)
                    )
            
            # Commit transaction
            conn.commit()
            
            # Query schema info
            cursor.execute("""
                SELECT table_name, 
                       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name=t.table_name) AS column_count
                FROM (SELECT table_name FROM information_schema.tables WHERE table_schema='public') AS t
                ORDER BY table_name;
            """)
            schema_info = cursor.fetchall()
            
            # Close connection
            cursor.close()
            conn.close()
            
            return DatabaseTestResponse(
                status="success",
                message="CMS database schema initialized successfully",
                details={
                    "schema_info": schema_info,
                    "sample_data_inserted": True
                }
            )
            
        except Exception as e:
            # Rollback transaction on error
            conn.rollback()
            cursor.close()
            conn.close()
            
            raise e
            
    except Exception as e:
        return DatabaseTestResponse(
            status="error",
            message="Failed to initialize CMS schema",
            error=f"{str(e)}\n{traceback.format_exc()}"
        )