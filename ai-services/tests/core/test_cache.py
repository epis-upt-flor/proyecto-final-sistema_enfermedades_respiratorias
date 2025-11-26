"""
Unit tests for Cache utilities
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json

from core.cache import init_cache, get_cache_client, set_cache, get_cache, delete_cache, clear_cache_pattern


class TestCache:
    """Test Cache utilities"""
    
    @pytest.fixture
    def mock_redis(self):
        """Create mock Redis client"""
        mock = AsyncMock()
        mock.ping = AsyncMock(return_value=True)
        mock.setex = AsyncMock(return_value=True)
        mock.set = AsyncMock(return_value=True)
        mock.get = AsyncMock(return_value=None)
        mock.delete = AsyncMock(return_value=1)
        mock.keys = AsyncMock(return_value=["key1", "key2", "key3"])
        mock.flushdb = AsyncMock(return_value=True)
        return mock
    
    @pytest.mark.asyncio
    async def test_init_cache_success(self, mock_redis):
        """Test successful cache initialization"""
        with patch('core.cache.redis.from_url', return_value=mock_redis):
            with patch('core.cache.settings') as mock_settings:
                mock_settings.REDIS_URL = "redis://localhost:6379"
                
                client = await init_cache()
                
                assert client is not None
                mock_redis.ping.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_init_cache_failure(self):
        """Test cache initialization failure"""
        with patch('core.cache.cache_client', None), \
             patch('core.cache._is_initializing', False), \
             patch('core.cache.redis.from_url', side_effect=Exception("Connection error")):
            with patch('core.cache.settings') as mock_settings:
                mock_settings.REDIS_URL = "redis://localhost:6379"
                
                client = await init_cache()
                
                # Should return None on failure
                assert client is None
    
    @pytest.mark.asyncio
    async def test_set_cache_dict(self, mock_redis):
        """Test setting cache with dict value"""
        with patch('core.cache.cache_client', mock_redis):
            result = await set_cache("key1", {"data": "value"}, ttl=60)
            
            assert result is True
            mock_redis.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_set_cache_string(self, mock_redis):
        """Test setting cache with string value"""
        with patch('core.cache.cache_client', mock_redis):
            result = await set_cache("key1", "value", ttl=60)
            
            assert result is True
            mock_redis.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_set_cache_no_ttl(self, mock_redis):
        """Test setting cache without TTL"""
        with patch('core.cache.cache_client', mock_redis):
            result = await set_cache("key1", "value")
            
            assert result is True
            mock_redis.set.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_set_cache_no_client(self):
        """Test setting cache when client is None"""
        with patch('core.cache.cache_client', None):
            result = await set_cache("key1", "value")
            
            assert result is False
    
    @pytest.mark.asyncio
    async def test_get_cache_hit(self, mock_redis):
        """Test getting cache (hit)"""
        mock_redis.get.return_value = json.dumps({"data": "value"})
        
        with patch('core.cache.cache_client', mock_redis):
            result = await get_cache("key1")
            
            assert result == {"data": "value"}
    
    @pytest.mark.asyncio
    async def test_get_cache_miss(self, mock_redis):
        """Test getting cache (miss)"""
        mock_redis.get.return_value = None
        
        with patch('core.cache.cache_client', mock_redis):
            result = await get_cache("key1")
            
            assert result is None
    
    @pytest.mark.asyncio
    async def test_get_cache_string_value(self, mock_redis):
        """Test getting cache with string value"""
        mock_redis.get.return_value = "simple_string"
        
        with patch('core.cache.cache_client', mock_redis):
            result = await get_cache("key1")
            
            assert result == "simple_string"
    
    @pytest.mark.asyncio
    async def test_get_cache_no_client(self):
        """Test getting cache when client is None"""
        with patch('core.cache.cache_client', None):
            result = await get_cache("key1")
            
            assert result is None
    
    @pytest.mark.asyncio
    async def test_delete_cache(self, mock_redis):
        """Test deleting cache"""
        with patch('core.cache.cache_client', mock_redis):
            result = await delete_cache("key1")
            
            assert result is True
            mock_redis.delete.assert_called_once_with("key1")
    
    @pytest.mark.asyncio
    async def test_delete_cache_no_client(self):
        """Test deleting cache when client is None"""
        with patch('core.cache.cache_client', None):
            result = await delete_cache("key1")
            
            assert result is False
    
    @pytest.mark.asyncio
    async def test_clear_cache(self, mock_redis):
        """Test clearing all cache"""
        with patch('core.cache.cache_client', mock_redis):
            result = await clear_cache_pattern("*")
            
            assert result >= 0
            # clear_cache_pattern uses keys() and delete(), not flushdb
            mock_redis.keys.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_clear_cache_no_client(self):
        """Test clearing cache when client is None"""
        with patch('core.cache.cache_client', None):
            result = await clear_cache_pattern("*")
            
            assert result == 0
    
    def test_get_cache_client(self, mock_redis):
        """Test getting cache client"""
        with patch('core.cache.cache_client', mock_redis):
            client = get_cache_client()
            
            assert client is not None

