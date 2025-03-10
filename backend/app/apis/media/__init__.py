from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List
import databutton as db
import re

router = APIRouter()

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    return re.sub(r'[^a-zA-Z0-9._-]', '', key)

@router.post('/upload')
async def upload_media(files: List[UploadFile] = File(...)):
    """Upload media files"""
    try:
        uploaded_files = []
        for file in files:
            # Read file content
            content = await file.read()
            
            # Generate unique filename
            filename = sanitize_storage_key(file.filename)
            
            # Store file
            db.storage.binary.put(filename, content)
            
            # Get public URL
            url = f"/public/{filename}"
            
            uploaded_files.append({
                "filename": filename,
                "url": url,
                "size": len(content)
            })
        
        return {
            "message": "Files uploaded successfully",
            "files": uploaded_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get('/list')
def list_media():
    """List all media files"""
    try:
        files = db.storage.binary.list()
        return {
            "files": [
                {
                    "filename": file.name,
                    "url": f"/public/{file.name}",
                    "size": file.size
                } for file in files
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.delete('/{filename}')
def delete_media(filename: str):
    """Delete a media file"""
    try:
        # Sanitize filename
        filename = sanitize_storage_key(filename)
        
        # Delete file
        db.storage.binary.delete(filename)
        
        return {"message": f"File {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e