"""DeepSeek Compatibility Layer

This module provides a compatibility layer for using DeepSeek AI,
handling various import patterns and providing fallbacks.

Usage:
    from app.apis.deepseek_compat import DeepSeekClient

    client = DeepSeekClient(api_key="your_api_key")
    response = client.generate(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello!"}
        ]
    )
    print(response.choices[0].message.content)
"""

import os
import json
import importlib.util
from typing import List, Dict, Any, Optional, Union
from fastapi import APIRouter

# Create router
router = APIRouter(prefix="/deepseek-compat", tags=["ai"])

class DeepSeekMessage:
    """DeepSeek message response class."""
    def __init__(self, content: str):
        self.content = content

class DeepSeekChoice:
    """DeepSeek choice response class."""
    def __init__(self, message: Dict[str, Any]):
        self.message = DeepSeekMessage(message.get("content", ""))

class DeepSeekResponse:
    """DeepSeek response class."""
    def __init__(self, choices: List[Dict[str, Any]]):
        self.choices = [DeepSeekChoice(choice.get("message", {})) for choice in choices]

class DeepSeekClient:
    """
    Compatibility layer for DeepSeek AI.
    
    This class tries various methods to use DeepSeek:
    1. Import from deepseek package if available
    2. Import from deepseek_ai package if available
    3. Use REST API directly as fallback
    
    Args:
        api_key: DeepSeek API key
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        if not self.api_key:
            print("No DeepSeek API key provided. Set DEEPSEEK_API_KEY environment variable.")
        
        # Try to import DeepSeek client in various ways
        self.native_client = None
        self.client_type = self._initialize_client()
        
        print(f"DeepSeek client initialized (type: {self.client_type})")
    
    def _initialize_client(self) -> str:
        """
        Try to initialize DeepSeek client using various methods.
        
        Returns:
            String indicating the client type used
        """
        # Method 1: Try import from deepseek package
        try:
            # Different possible class/module names
            possible_imports = [
                ("deepseek", "Client"),
                ("deepseek", "DeepSeekClient"),
                ("deepseek.client", "Client"),
                ("deepseek.client", "DeepSeekClient")
            ]
            
            for module_name, class_name in possible_imports:
                try:
                    module = importlib.import_module(module_name)
                    client_class = getattr(module, class_name)
                    self.native_client = client_class(api_key=self.api_key)
                    return f"native:{module_name}.{class_name}"
                except (ImportError, AttributeError):
                    continue
        except Exception as e:
            print(f"Could not import from deepseek package: {e}")
        
        # Method 2: Try import from deepseek_ai package
        try:
            possible_imports = [
                ("deepseek_ai", "Client"),
                ("deepseek_ai", "DeepSeekClient"),
                ("deepseek_ai.client", "Client"),
                ("deepseek_ai.client", "DeepSeekClient")
            ]
            
            for module_name, class_name in possible_imports:
                try:
                    module = importlib.import_module(module_name)
                    client_class = getattr(module, class_name)
                    self.native_client = client_class(api_key=self.api_key)
                    return f"native:{module_name}.{class_name}"
                except (ImportError, AttributeError):
                    continue
        except Exception as e:
            print(f"Could not import from deepseek_ai package: {e}")
        
        # Method 3: Check for deepseek-python package
        try:
            possible_imports = [
                ("deepseek_python", "Client"),
                ("deepseek_python", "DeepSeekClient"),
                ("deepseek_python.client", "Client"),
                ("deepseek_python.client", "DeepSeekClient")
            ]
            
            for module_name, class_name in possible_imports:
                try:
                    module = importlib.import_module(module_name)
                    client_class = getattr(module, class_name)
                    self.native_client = client_class(api_key=self.api_key)
                    return f"native:{module_name}.{class_name}"
                except (ImportError, AttributeError):
                    continue
        except Exception as e:
            print(f"Could not import from deepseek_python package: {e}")
        
        # If we get here, we couldn't import any native client
        # We'll use REST API directly
        try:
            # Check if requests is available
            import requests
            return "rest_api"
        except ImportError:
            print("Could not import requests. Please install it with: pip install requests")
            return "unavailable"
    
    def generate(self, model: str, messages: List[Dict[str, str]], 
                 temperature: float = 0.7, max_tokens: int = 2000) -> DeepSeekResponse:
        """
        Generate text using DeepSeek AI.
        
        Args:
            model: Model name to use
            messages: List of messages for the conversation
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            DeepSeekResponse object
        """
        # If we have a native client, use it
        if self.native_client:
            try:
                response = self.native_client.generate(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response
            except Exception as e:
                print(f"Native client failed, falling back to REST API: {e}")
        
        # Otherwise use REST API directly
        if self.client_type == "rest_api":
            return self._generate_with_rest_api(model, messages, temperature, max_tokens)
        
        # If we get here, we have no way to generate text
        print("No DeepSeek client available")
        return DeepSeekResponse([{"message": {"content": "Error: No DeepSeek client available"}}])
    
    def _generate_with_rest_api(self, model: str, messages: List[Dict[str, str]],
                               temperature: float = 0.7, max_tokens: int = 2000) -> DeepSeekResponse:
        """
        Generate text using DeepSeek REST API directly.
        
        Args:
            model: Model name to use
            messages: List of messages for the conversation
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum number of tokens to generate
            
        Returns:
            DeepSeekResponse object
        """
        try:
            import requests
            
            url = "https://api.deepseek.com/v1/chat/completions"
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
            
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                return DeepSeekResponse(result.get("choices", []))
            else:
                print(f"DeepSeek API error: {response.status_code} - {response.text}")
                return DeepSeekResponse([{"message": {"content": f"Error: {response.status_code} - {response.text}"}}])
        except Exception as e:
            print(f"Error with REST API: {e}")
            return DeepSeekResponse([{"message": {"content": f"Error: {str(e)}"}}])
    
    def chat(self, model: str, messages: List[Dict[str, str]], 
             temperature: float = 0.7, max_tokens: int = 2000) -> DeepSeekResponse:
        """
        Alias for generate() to maintain compatibility with different client versions.
        """
        return self.generate(model, messages, temperature, max_tokens)


# Helper function to create a client
def create_client(api_key: Optional[str] = None) -> DeepSeekClient:
    """
    Create a DeepSeek client with the given API key.
    
    Args:
        api_key: DeepSeek API key
        
    Returns:
        DeepSeekClient instance
    """
    return DeepSeekClient(api_key)
