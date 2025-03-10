"""DeepSeek client wrapper with OpenAI compatibility"""

from fastapi import APIRouter, HTTPException
from app.apis.utilities import get_ai_client
from pydantic import BaseModel, Field

# Create router for DeepSeek client API
router = APIRouter(prefix="/deepseek-client", tags=["ai"])

# API Models
class TextGenerationRequest(BaseModel):
    """Request model for text generation"""
    model: str = "deepseek-chat"
    messages: list = Field(..., description="List of messages in the conversation")
    temperature: float = 0.7
    max_tokens: int = 2000

class TextGenerationResponse(BaseModel):
    """Response model for text generation"""
    content: str
    model: str

import os
import requests
import json
import databutton as db

print("Loading DeepSeek client wrapper")

def format_messages(messages_input):
    """Format messages to ensure they're in the correct structure"""
    # Case 1: If it's just a string, convert to proper format
    if isinstance(messages_input, str):
        return [
            {"role": "system", "content": "You are a luxury real estate copywriter."},
            {"role": "user", "content": messages_input}
        ]
    
    # Case 2: If it's already a list but elements might be strings
    if isinstance(messages_input, list):
        formatted_messages = []
        for msg in messages_input:
            if isinstance(msg, dict) and "role" in msg and "content" in msg:
                # Already in correct format
                formatted_messages.append(msg)
            elif isinstance(msg, str):
                # Convert string to message object
                formatted_messages.append({"role": "user", "content": msg})
        
        # If we have messages, return them
        if formatted_messages:
            return formatted_messages
    
    # Default fallback
    return [
        {"role": "system", "content": "You are a luxury real estate copywriter."},
        {"role": "user", "content": "Create a sophisticated description for a luxury property."}
    ]

class DeepSeekClient:
    """A wrapper for the DeepSeek API with OpenAI-compatible interface"""
    
    def __init__(self, api_key=None):
        self.api_key = api_key or db.secrets.get('DEEPSEEK_API_KEY')
        if not self.api_key:
            print("No DeepSeek API key provided. Set DEEPSEEK_API_KEY in secrets.")
        
        # Create OpenAI-compatible chat interface
        self.chat = ChatCompletions(self)
        
        print("Initialized DeepSeek client wrapper")
    
    def generate(self, model, messages, temperature=0.7, max_tokens=2000):
        """Generate text using the DeepSeek API"""
        if not self.api_key:
            raise ValueError("DeepSeek API key is required")
            
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(
                "https://api.deepseek.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return DeepSeekResponse(response.json())
            
            # Fall back to OpenAI if DeepSeek fails
            try:
                from openai import OpenAI
                openai_api_key = db.secrets.get("OPENAI_API_KEY")
                if openai_api_key:
                    client = OpenAI(api_key=openai_api_key)
                    openai_response = client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=messages,
                        temperature=temperature,
                        max_tokens=max_tokens
                    )
                    # Convert OpenAI response to DeepSeek format
                    return self._convert_openai_to_deepseek_format(openai_response)
            except Exception as openai_error:
                print(f"OpenAI fallback also failed: {openai_error}")
            
            error_msg = f"DeepSeek API error: {response.status_code} - {response.text}"
            print(error_msg)
            raise Exception(error_msg)
        except Exception as e:
            print(f"Error with DeepSeek API: {e}")
            raise
    
    def _convert_openai_to_deepseek_format(self, openai_response):
        """Convert OpenAI response format to DeepSeek format"""
        try:
            # Create a simple dictionary that mimics DeepSeek response structure
            fake_response = {
                "choices": [
                    {
                        "message": {
                            "content": openai_response.choices[0].message.content,
                            "role": "assistant"
                        }
                    }
                ]
            }
            return DeepSeekResponse(fake_response)
        except Exception as e:
            print(f"Error converting OpenAI response: {e}")
            # Return a minimal working response
            return DeepSeekResponse({
                "choices": [
                    {
                        "message": {
                            "content": "Sorry, I encountered an error processing your request.",
                            "role": "assistant"
                        }
                    }
                ]
            })

class ChatCompletions:
    """OpenAI-compatible chat completions interface"""
    
    def __init__(self, client):
        self.client = client
    
    def create(self, model, messages, temperature=0.7, max_tokens=2000, **kwargs):
        """Create a chat completion (OpenAI-compatible interface)"""
        return self.client.generate(model, messages, temperature, max_tokens)

class DeepSeekResponse:
    """Wrapper for DeepSeek API response"""
    
    def __init__(self, response_data):
        self.data = response_data
        self.choices = [DeepSeekChoice(choice) for choice in response_data.get("choices", [])]

class DeepSeekChoice:
    """Wrapper for a choice in DeepSeek API response"""
    
    def __init__(self, choice_data):
        self.data = choice_data
        self.message = DeepSeekMessage(choice_data.get("message", {}))

class DeepSeekMessage:
    """Wrapper for a message in DeepSeek API response"""
    
    def __init__(self, message_data):
        self.data = message_data
        self.content = message_data.get("content", "")
        self.role = message_data.get("role", "assistant")

# API Endpoints
@router.post("/generate", operation_id="deepseek_client_text_generation")
def deepseek_client_text_generation(request: TextGenerationRequest) -> TextGenerationResponse:
    """Generate text using DeepSeek AI with OpenAI fallback"""
    try:
        # Initialize client
        client = DeepSeekClient()
        
        # Format messages properly
        messages = format_messages(request.messages)
        
        # Generate text
        response = client.chat.create(
            model=request.model,
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        # Extract content
        content = response.choices[0].message.content if response.choices else ""
        
        return TextGenerationResponse(
            content=content,
            model=request.model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating text: {str(e)}")
