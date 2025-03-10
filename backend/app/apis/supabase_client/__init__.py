"""Supabase client wrapper

Provides a simplified Supabase client with fallback mechanisms
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Create router for Supabase client endpoints
router = APIRouter(prefix="/supabase", tags=["database"])

import os
import requests
import json
import databutton as db

print("Loading Supabase client wrapper")

class SimpleSupabaseClient:
    """A simplified Supabase client"""
    
    def __init__(self, url=None, key=None):
        self.url = url or db.secrets.get('SUPABASE_URL')
        self.key = key or db.secrets.get('SUPABASE_SERVICE_ROLE_KEY') or db.secrets.get('SUPABASE_API_KEY')
        
        if not self.url or not self.key:
            print("Supabase URL or key not provided. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in secrets.")
        else:
            print(f"Initialized Supabase client wrapper for {self.url}")
        
        # Remove trailing slash from URL if present
        if self.url and self.url.endswith('/'):
            self.url = self.url[:-1]
        
        self.rest_url = f"{self.url}/rest/v1" if self.url else ""
        self.storage_url = f"{self.url}/storage/v1" if self.url else ""
        
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}"
        }
        
        # Initialize components
        self.storage = StorageClient(self)
    
    def table(self, table_name):
        """Get a table query builder"""
        return TableQuery(self, table_name)
    
    def rpc(self, function_name, params=None):
        """Call a stored procedure"""
        return RPCQuery(self, function_name, params)

class TableQuery:
    """Query builder for Supabase tables"""
    
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
        self.query_params = {}
        self.headers = {**client.headers}
        self.insert_data = None
        self.update_data = None
        self.select_columns = "*"
    
    def select(self, columns="*"):
        """Select columns"""
        self.select_columns = columns
        return self
    
    def insert(self, data):
        """Insert data"""
        self.insert_data = data
        return self
    
    def update(self, data):
        """Update data"""
        self.update_data = data
        return self
    
    def limit(self, count):
        """Limit results"""
        self.query_params["limit"] = count
        return self
    
    def eq(self, column, value):
        """Equal filter"""
        self.query_params[column] = f"eq.{value}"
        return self
    
    def execute(self):
        """Execute the query"""
        if not self.client.url or not self.client.key:
            raise ValueError("Supabase URL and key are required")
        
        url = f"{self.client.rest_url}/{self.table_name}"
        headers = {**self.headers}
        
        try:
            if self.insert_data is not None:
                # Insert operation
                headers["Content-Type"] = "application/json"
                headers["Prefer"] = "return=representation"
                
                response = requests.post(
                    url, 
                    headers=headers,
                    json=self.insert_data if isinstance(self.insert_data, list) else [self.insert_data]
                )
            elif self.update_data is not None:
                # Update operation
                headers["Content-Type"] = "application/json"
                headers["Prefer"] = "return=representation"
                
                # Build query parameters for the update
                params = self.query_params
                
                response = requests.patch(
                    url,
                    headers=headers,
                    params=params,
                    json=self.update_data
                )
            else:
                # Select operation
                params = self.query_params.copy()
                if self.select_columns != "*":
                    params["select"] = self.select_columns
                
                response = requests.get(url, headers=headers, params=params)
            
            if 200 <= response.status_code < 300:
                return SupabaseResponse(response.json())
            else:
                error_msg = f"Supabase API error: {response.status_code} - {response.text}"
                print(error_msg)
                raise Exception(error_msg)
        except Exception as e:
            print(f"Error executing Supabase query: {e}")
            raise

class RPCQuery:
    """Query builder for Supabase RPC calls"""
    
    def __init__(self, client, function_name, params=None):
        self.client = client
        self.function_name = function_name
        self.params = params or {}
    
    def execute(self):
        """Execute the RPC call"""
        if not self.client.url or not self.client.key:
            raise ValueError("Supabase URL and key are required")
        
        url = f"{self.client.rest_url}/rpc/{self.function_name}"
        headers = {**self.client.headers, "Content-Type": "application/json"}
        
        try:
            response = requests.post(url, headers=headers, json=self.params)
            
            if 200 <= response.status_code < 300:
                try:
                    return SupabaseResponse(response.json())
                except json.JSONDecodeError:
                    return SupabaseResponse(response.text)
            else:
                error_msg = f"Supabase RPC error: {response.status_code} - {response.text}"
                print(error_msg)
                raise Exception(error_msg)
        except Exception as e:
            print(f"Error executing Supabase RPC: {e}")
            raise

class StorageClient:
    """Client for Supabase Storage"""
    
    def __init__(self, client):
        self.client = client
    
    def list_buckets(self):
        """List storage buckets"""
        if not self.client.url or not self.client.key:
            raise ValueError("Supabase URL and key are required")
        
        url = f"{self.client.storage_url}/bucket"
        
        try:
            response = requests.get(url, headers=self.client.headers)
            
            if 200 <= response.status_code < 300:
                return response.json()
            else:
                error_msg = f"Error listing buckets: {response.status_code} - {response.text}"
                print(error_msg)
                return []
        except Exception as e:
            print(f"Error listing buckets: {e}")
            return []
    
    def create_bucket(self, bucket_name, options=None):
        """Create a storage bucket"""
        if not self.client.url or not self.client.key:
            raise ValueError("Supabase URL and key are required")
        
        url = f"{self.client.storage_url}/bucket"
        payload = {
            "name": bucket_name,
            "public": True,
            **(options or {})
        }
        
        try:
            response = requests.post(
                url, 
                headers={**self.client.headers, "Content-Type": "application/json"},
                json=payload
            )
            
            if 200 <= response.status_code < 300:
                return response.json()
            else:
                error_msg = f"Error creating bucket: {response.status_code} - {response.text}"
                print(error_msg)
                if "duplicate" in response.text.lower() or response.status_code == 409:
                    print(f"Bucket '{bucket_name}' already exists")
                    return {"name": bucket_name}
                raise Exception(error_msg)
        except Exception as e:
            print(f"Error creating bucket: {e}")
            raise
    
    def from_(self, bucket_name):
        """Get a bucket object"""
        return BucketOperations(self.client, bucket_name)

class BucketOperations:
    """Operations on a specific bucket"""
    
    def __init__(self, client, bucket_name):
        self.client = client
        self.bucket_name = bucket_name
    
    def upload(self, path, file, file_options=None):
        """Upload a file to the bucket"""
        if not self.client.url or not self.client.key:
            raise ValueError("Supabase URL and key are required")
        
        url = f"{self.client.storage_url}/object/{self.bucket_name}/{path}"
        
        if isinstance(file, bytes):
            # Binary data
            headers = {
                **self.client.headers,
                "Content-Type": (file_options or {}).get("content-type", "application/octet-stream")
            }
            
            try:
                response = requests.post(url, headers=headers, data=file)
                
                if 200 <= response.status_code < 300:
                    return response.json()
                else:
                    error_msg = f"Error uploading file: {response.status_code} - {response.text}"
                    print(error_msg)
                    raise Exception(error_msg)
            except Exception as e:
                print(f"Error uploading file: {e}")
                raise
        else:
            raise ValueError("File must be bytes")
    
    def get_public_url(self, path):
        """Get the public URL for a file"""
        if not self.client.url:
            raise ValueError("Supabase URL is required")
        
        return f"{self.client.url}/storage/v1/object/public/{self.bucket_name}/{path}"

class SupabaseResponse:
    """Wrapper for Supabase API response"""
    
    def __init__(self, data):
        self.data = data

def create_client(url, key):
    """Create a Supabase client"""
    # First try the real Supabase client if available
    try:
        from supabase import create_client as real_create_client
        try:
            return real_create_client(url, key)
        except Exception as e:
            print(f"Error creating real Supabase client: {e}, falling back to wrapper")
            pass
    except ImportError:
        pass
    
    # Fall back to our wrapper
    return SimpleSupabaseClient(url, key)
