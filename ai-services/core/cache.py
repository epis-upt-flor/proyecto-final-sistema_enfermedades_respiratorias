"""
Redis cache utilities
"""

import redis.asyncio as redis
import json
import structlog
from typing import Any, Optional, Union
from datetime import timedelta

from .config import settings

logger = structlog.get_logger()

# Global cache client
cache_client: Optional[redis.Redis] = None


async def init_cache():
    """Initialize Redis cache connection"""
    global cache_client
    
    try:
        cache_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        
        # Test connection
        await cache_client.ping()
        logger.info("Successfully connected to Redis cache")
        
    except Exception as e:
        logger.error("Failed to connect to Redis", error=str(e))
        # Continue without cache if Redis is not available
        cache_client = None


async def get_cache():
    """Get cache client instance"""
    return cache_client


async def set_cache(
    key: str, 
    value: Any, 
    ttl: Optional[int] = None
) -> bool:
    """Set cache value"""
    if not cache_client:
        return False
        
    try:
        # Serialize value to JSON
        if isinstance(value, (dict, list)):
            value = json.dumps(value)
        
        # Set with TTL
        if ttl:
            await cache_client.setex(key, ttl, value)
        else:
            await cache_client.set(key, value)
            
        return True
        
    except Exception as e:
        logger.error("Failed to set cache", key=key, error=str(e))
        return False


async def get_cache(key: str) -> Optional[Any]:
    """Get cache value"""
    if not cache_client:
        return None
        
    try:
        value = await cache_client.get(key)
        if value:
            # Try to deserialize JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        return None
        
    except Exception as e:
        logger.error("Failed to get cache", key=key, error=str(e))
        return None


async def delete_cache(key: str) -> bool:
    """Delete cache value"""
    if not cache_client:
        return False
        
    try:
        await cache_client.delete(key)
        return True
        
    except Exception as e:
        logger.error("Failed to delete cache", key=key, error=str(e))
        return False


async def clear_cache_pattern(pattern: str) -> int:
    """Clear cache keys matching pattern"""
    if not cache_client:
        return 0
        
    try:
        keys = await cache_client.keys(pattern)
        if keys:
            return await cache_client.delete(*keys)
        return 0
        
    except Exception as e:
        logger.error("Failed to clear cache pattern", pattern=pattern, error=str(e))
        return 0
