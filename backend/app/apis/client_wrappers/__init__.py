"""Client wrappers package

Contains compatibility layers for missing or problematic clients
"""

from fastapi import APIRouter

# Create router for client wrappers
router = APIRouter(prefix="/client-wrappers", tags=["clients"])

# Import client routers
try:
    from .deepseek_client.router import router as deepseek_router
    router.include_router(deepseek_router)
    print("DeepSeek router loaded successfully")
except ImportError as e:
    print(f"Could not load DeepSeek router: {e}")

# Expose main client classes for easy import
try:
    from deepseek_client import DeepSeekClient
    print("DeepSeek client class imported successfully")
except ImportError as e:
    print(f"Could not import DeepSeek client: {e}")

try: 
    from supabase_client import create_client
    print("Supabase client function imported successfully")
except ImportError as e:
    print(f"Could not import Supabase client: {e}")
