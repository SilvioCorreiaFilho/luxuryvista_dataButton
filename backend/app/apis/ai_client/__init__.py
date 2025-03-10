from typing import Dict, Any, List, Optional
import time
import json
import random
import databutton as db
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

# Create router for AI client endpoints
router = APIRouter(prefix="/ai", tags=["ai"])

class DeepSeekClientFallback:
    """Fallback implementation of DeepSeek client using OpenAI instead."""
    
    def __init__(self, api_key=None):
        self.name = "DeepSeekClientFallback"
        try:
            from openai import OpenAI
            api_key = api_key or db.secrets.get("OPENAI_API_KEY")
            if not api_key:
                print("Warning: No API key provided for DeepSeekClientFallback")
            self.client = OpenAI(api_key=api_key)
            print("Successfully initialized DeepSeekClientFallback with OpenAI")
        except Exception as e:
            print(f"Error initializing OpenAI client for DeepSeekClientFallback: {e}")
            self.client = None
    
    def chat_completion(self, messages, max_tokens=1000, temperature=0.7, model="gpt-4o-mini", **kwargs):
        """Simulate DeepSeek chat completion using OpenAI."""
        if not self.client:
            return self._mock_response(messages)
        
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            return {
                "choices": [{
                    "message": {
                        "content": response.choices[0].message.content
                    }
                }]
            }
        except Exception as e:
            print(f"Error in DeepSeekClientFallback chat_completion: {e}")
            return self._mock_response(messages)
    
    def _mock_response(self, messages):
        """Provide a mock response when OpenAI is not available."""
        last_message = messages[-1]["content"] if messages else ""
        
        # Very basic response generation
        response_text = "Thank you for your message. I'm using a fallback system since the AI service is currently unavailable. "
        
        if "property" in last_message.lower() or "real estate" in last_message.lower():
            response_text += "This luxury property offers elegant living spaces, premium amenities, and an exclusive location. "
            response_text += "With its architectural excellence and impeccable design, it represents the epitome of sophisticated living."
        else:
            response_text += "I'm unable to provide a detailed response at this time, but I'd be happy to assist you further when the service is restored."
        
        return {
            "choices": [{
                "message": {
                    "content": response_text
                }
            }]
        }

# Attempt to import DeepSeek or use fallback
try:
    try:
        from deepseek import DeepSeekClient
        print("Successfully imported DeepSeekClient")
    except ImportError:
        # Try older import pattern
        try:
            from deepseek.deepseek import DeepSeekClient
            print("Successfully imported DeepSeekClient using alternate import")
        except ImportError:
            print("Failed to import DeepSeekClient. Install it with: pip install deepseek-api")
            DeepSeekClient = DeepSeekClientFallback
except Exception as e:
    print(f"Error during DeepSeek import: {e}")
    DeepSeekClient = DeepSeekClientFallback

# Function to create a DeepSeek client with API key
def create_deepseek_client(api_key=None):
    """Create a DeepSeek client with fallback to OpenAI"""
    try:
        if api_key:
            return DeepSeekClient(api_key=api_key)
        
        # Try to get from secrets
        api_key = db.secrets.get("DEEPSEEK_API_KEY")
        if api_key:
            return DeepSeekClient(api_key=api_key)
        
        # Fall back to OpenAI
        print("No DeepSeek API key found, using fallback")
        return DeepSeekClientFallback()
    except Exception as e:
        print(f"Error creating DeepSeek client: {e}")
        return DeepSeekClientFallback()
