"""Rate limiter for API requests"""

import time
import asyncio
from typing import Dict, Any, Optional
from fastapi import APIRouter

# Create router
router = APIRouter()

class RateLimiter:
    """
    A token bucket rate limiter.
    This implementation works for both synchronous and asynchronous code.
    """
    
    def __init__(self, max_calls: int, period: float):
        """
        Initialize a new rate limiter.
        
        Args:
            max_calls (int): Maximum number of calls allowed in the period
            period (float): Period in seconds
        """
        self.max_calls = max_calls
        self.period = period
        self.tokens = max_calls
        self.last_refill = time.monotonic()
        self._lock = asyncio.Lock()
    
    def _refill(self):
        """
        Refill tokens based on elapsed time.
        """
        now = time.monotonic()
        elapsed = now - self.last_refill
        refill_amount = elapsed * (self.max_calls / self.period)
        self.tokens = min(self.max_calls, self.tokens + refill_amount)
        self.last_refill = now
    
    async def acquire(self, tokens: int = 1) -> bool:
        """
        Acquire tokens from the bucket.
        
        Args:
            tokens (int): Number of tokens to acquire
            
        Returns:
            bool: True if tokens were acquired, False otherwise
        """
        async with self._lock:
            self._refill()
            
            if tokens <= self.tokens:
                self.tokens -= tokens
                return True
            
            # Calculate wait time if not enough tokens
            wait_time = (tokens - self.tokens) * (self.period / self.max_calls)
            
            # Wait if reasonable time, otherwise fail
            if wait_time <= 30:  # Don't wait more than 30 seconds
                await asyncio.sleep(wait_time)
                self.tokens = 0
                return True
            
            return False
    
    def try_acquire(self, tokens: int = 1) -> bool:
        """
        Try to acquire tokens without waiting.
        
        Args:
            tokens (int): Number of tokens to acquire
            
        Returns:
            bool: True if tokens were acquired, False otherwise
        """
        self._refill()
        
        if tokens <= self.tokens:
            self.tokens -= tokens
            return True
        
        return False
