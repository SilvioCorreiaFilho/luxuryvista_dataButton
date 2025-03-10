from fastapi import APIRouter, UploadFile, Form, File, HTTPException, status
from pydantic import BaseModel, Field
import databutton as db
import json
import re
import os
from typing import List, Optional
import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from datetime import datetime
from uuid import uuid4

router = APIRouter(prefix="/database-repair")


class DatabaseRepairResponse(BaseModel):
    message: str
    fixed_records: int = 0
    errors: List[str] = Field(default_factory=list)


class DatabaseUploadResponse(BaseModel):
    message: str
    uploaded_files: int = 0
    failed_files: int = 0
    file_urls: List[str] = Field(default_factory=list)


@contextmanager
def get_db_connection():
    """Context manager for PostgreSQL database connections"""
    connection = None
    try:
        # Get connection parameters from secrets
        connection = psycopg2.connect(
            host=db.secrets.get("POSTGRES_HOST"),
            port=db.secrets.get("POSTGRES_PORT"),
            database=db.secrets.get("POSTGRES_DB"),
            user=db.secrets.get("POSTGRES_USER"),
            password=db.secrets.get("POSTGRES_PASSWORD")
        )
        connection.autocommit = False
        yield connection
    except Exception as e:
        print(f"Database connection error: {e}")
        raise
    finally:
        if connection is not None:
            connection.close()


def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)


@router.post("/fix-property-types", response_model=DatabaseRepairResponse)
def fix_property_types():
    """Fix inconsistent property types in the database"""
    fixed_records = 0
    errors = []

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                # 1. Standardize property types
                cursor.execute("""
                    UPDATE properties
                    SET type = jsonb_build_object(
                        'name', CASE 
                            WHEN type->>'name' = 'cobertura' THEN 'Cobertura'
                            WHEN type->>'name' = 'mansao' THEN 'Mansão'
                            WHEN type->>'name' = 'apartamento' THEN 'Apartamento de Luxo'
                            WHEN type->>'name' = 'vista-lago' THEN 'Vista para o Lago'
                            ELSE type->>'name'
                        END,
                        'description', CASE
                            WHEN type->>'name' = 'cobertura' THEN 'Coberturas de alto padrão com vistas deslumbrantes'
                            WHEN type->>'name' = 'mansao' THEN 'Mansões exclusivas com amplos espaços e privacidade'
                            WHEN type->>'name' = 'apartamento' THEN 'Apartamentos luxuosos com acabamento premium'
                            WHEN type->>'name' = 'vista-lago' THEN 'Propriedades com vista privilegiada para o lago'
                            ELSE COALESCE(type->>'description', 'Descrição não disponível')
                        END
                    )
                    WHERE type ? 'name';
                """)
                fixed_records += cursor.rowcount

                # 2. Fix price and area data types (ensure they're numeric)
                cursor.execute("""
                    UPDATE properties
                    SET 
                        price = CASE 
                            WHEN jsonb_typeof(to_jsonb(price)) = 'string' THEN 
                                CAST(REGEXP_REPLACE(price::text, '[^0-9.]', '', 'g') AS NUMERIC)
                            ELSE price
                        END,
                        area = CASE 
                            WHEN jsonb_typeof(to_jsonb(area)) = 'string' THEN 
                                CAST(REGEXP_REPLACE(area::text, '[^0-9.]', '', 'g') AS NUMERIC)
                            ELSE area
                        END
                    WHERE 
                        jsonb_typeof(to_jsonb(price)) = 'string' OR 
                        jsonb_typeof(to_jsonb(area)) = 'string';
                """)
                fixed_records += cursor.rowcount

                # 3. Ensure all properties have analysis with investment metrics
                cursor.execute("""
                    UPDATE properties
                    SET analysis = jsonb_build_object(
                        'investmentMetrics', COALESCE(
                            analysis->'investmentMetrics',
                            jsonb_build_array(
                                jsonb_build_object(
                                    'type', 'ROI',
                                    'value', 'Estimado em 7% ao ano',
                                    'percentage', '7'
                                ),
                                jsonb_build_object(
                                    'type', 'Valorização',
                                    'value', 'Estimada em 15% em 3 anos',
                                    'percentage', '15'
                                ),
                                jsonb_build_object(
                                    'type', 'Liquidez',
                                    'value', 'Alta para o segmento',
                                    'percentage', '80'
                                )
                            )
                        )
                    )
                    WHERE 
                        analysis IS NULL OR 
                        NOT (analysis ? 'investmentMetrics') OR
                        jsonb_array_length(analysis->'investmentMetrics') = 0
                """)
                fixed_records += cursor.rowcount

                # Commit the transaction
                conn.commit()

        return DatabaseRepairResponse(
            message="Database repair completed successfully",
            fixed_records=fixed_records,
            errors=errors
        )

    except Exception as e:
        errors.append(str(e))
        return DatabaseRepairResponse(
            message="Database repair failed",
            fixed_records=0,
            errors=errors
        )


@router.post("/upload-property-images", response_model=DatabaseUploadResponse)
async def upload_property_images(
    property_id: str = Form(...),
    files: List[UploadFile] = File([])
):
    """Upload images for a specific property"""
    uploaded_files = 0
    failed_files = 0
    file_urls = []
    errors = []

    try:
        # First, check if the property exists
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute("SELECT id FROM properties WHERE id = %s", (property_id,))
                result = cursor.fetchone()
                if not result:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Property with ID {property_id} not found"
                    )

        # Process each uploaded file
        for file in files:
            try:
                contents = await file.read()
                if not contents:
                    failed_files += 1
                    errors.append(f"Empty file: {file.filename}")
                    continue

                # Generate a unique filename
                file_ext = os.path.splitext(file.filename)[1]
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                unique_id = str(uuid4())[:8]
                safe_filename = sanitize_storage_key(f"{property_id}_{timestamp}_{unique_id}{file_ext}")

                # Upload to media storage
                # This uses the brain.upload_media endpoint indirectly through databutton storage
                db.storage.binary.put(safe_filename, contents)

                # Get the public URL for this file
                # In a real Wagtail setup, we would use Wagtail's image model
                file_url = f"/api/media/{safe_filename}"
                file_urls.append(file_url)

                # Update the property with the new image
                with get_db_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            UPDATE properties
                            SET images = jsonb_array_append(
                                COALESCE(images, '[]'::jsonb),
                                '-1',
                                jsonb_build_object('url', %s, 'caption', %s)
                            )
                            WHERE id = %s
                        """, (file_url, file.filename, property_id))
                        conn.commit()

                uploaded_files += 1

            except Exception as e:
                failed_files += 1
                errors.append(f"Error processing {file.filename}: {str(e)}")

        return DatabaseUploadResponse(
            message="File upload completed",
            uploaded_files=uploaded_files,
            failed_files=failed_files,
            file_urls=file_urls
        )

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"File upload failed: {str(e)}"
        ) from e


@router.post("/normalize-field-names", response_model=DatabaseRepairResponse)
def normalize_field_names():
    """Fix inconsistent field naming (snake_case vs camelCase)"""
    fixed_records = 0
    errors = []

    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                # Convert snake_case to camelCase or vice versa as needed
                # This example standardizes to camelCase for frontend compatibility
                field_mappings = [
                    ('virtual_tour_url', 'virtualTourUrl'),
                    ('property_video_url', 'propertyVideoUrl'),
                    ('drone_video_url', 'droneVideoUrl')
                ]

                for old_field, new_field in field_mappings:
                    # First, copy data from old field to new field
                    cursor.execute(f"""
                        UPDATE properties
                        SET {new_field} = {old_field}
                        WHERE 
                            {old_field} IS NOT NULL AND
                            ({new_field} IS NULL OR {new_field} = '')
                    """)
                    affected = cursor.rowcount
                    fixed_records += affected

                # Commit the transaction
                conn.commit()

        return DatabaseRepairResponse(
            message="Field name normalization completed successfully",
            fixed_records=fixed_records,
            errors=errors
        )

    except Exception as e:
        errors.append(str(e))
        return DatabaseRepairResponse(
            message="Field name normalization failed",
            fixed_records=0,
            errors=errors
        )
