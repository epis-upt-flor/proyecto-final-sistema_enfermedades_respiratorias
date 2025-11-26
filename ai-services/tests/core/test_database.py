"""
Tests para core/database.py
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException

from core.database import init_database, create_indexes, get_database, close_database


class TestDatabase:
    """Tests para database utilities"""
    
    @pytest.fixture
    def mock_motor_client(self):
        """Create mock Motor client"""
        mock_client = AsyncMock()
        mock_client.admin = AsyncMock()
        mock_client.admin.command = AsyncMock(return_value={"ok": 1})
        mock_client.respicare = MagicMock()
        mock_client.close = MagicMock()
        return mock_client
    
    @pytest.mark.asyncio
    async def test_init_database_success(self, mock_motor_client):
        """Test init_database exitoso"""
        with patch('core.database.motor.motor_asyncio.AsyncIOMotorClient', return_value=mock_motor_client), \
             patch('core.database.settings') as mock_settings, \
             patch('core.database.create_indexes', new_callable=AsyncMock) as mock_create_indexes:
            mock_settings.DATABASE_URL = "mongodb://localhost:27017/test"
            
            await init_database()
            
            mock_motor_client.admin.command.assert_called_once_with('ping')
            mock_create_indexes.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_init_database_failure(self, mock_motor_client):
        """Test init_database con error de conexión"""
        mock_motor_client.admin.command = AsyncMock(side_effect=Exception("Connection error"))
        
        with patch('core.database.motor.motor_asyncio.AsyncIOMotorClient', return_value=mock_motor_client), \
             patch('core.database.settings') as mock_settings:
            mock_settings.DATABASE_URL = "mongodb://localhost:27017/test"
            
            with pytest.raises(Exception):
                await init_database()
    
    @pytest.mark.asyncio
    async def test_create_indexes_success(self):
        """Test create_indexes exitoso"""
        mock_database = MagicMock()
        mock_collection1 = AsyncMock()
        mock_collection2 = AsyncMock()
        mock_collection3 = AsyncMock()
        
        mock_database.medical_histories = mock_collection1
        mock_database.symptoms = mock_collection2
        mock_database.ai_results = mock_collection3
        
        with patch('core.database.database', mock_database):
            await create_indexes()
            
            # Verificar que se crearon los índices
            assert mock_collection1.create_index.call_count == 3
            assert mock_collection2.create_index.call_count == 3
            assert mock_collection3.create_index.call_count == 3
    
    @pytest.mark.asyncio
    async def test_create_indexes_with_exception(self):
        """Test create_indexes con excepción"""
        mock_database = MagicMock()
        mock_collection = AsyncMock()
        mock_collection.create_index = AsyncMock(side_effect=Exception("Index error"))
        
        mock_database.medical_histories = mock_collection
        mock_database.symptoms = mock_collection
        mock_database.ai_results = mock_collection
        
        with patch('core.database.database', mock_database):
            # No debe lanzar excepción, solo loguear el error
            await create_indexes()
    
    @pytest.mark.asyncio
    async def test_get_database_success(self):
        """Test get_database cuando database está inicializado"""
        mock_database = MagicMock()
        
        with patch('core.database.database', mock_database):
            result = await get_database()
            assert result == mock_database
    
    @pytest.mark.asyncio
    async def test_get_database_not_initialized(self):
        """Test get_database cuando database no está inicializado"""
        with patch('core.database.database', None):
            with pytest.raises(HTTPException) as exc_info:
                await get_database()
            assert exc_info.value.status_code == 500
            assert "Database not initialized" in str(exc_info.value.detail)
    
    @pytest.mark.asyncio
    async def test_close_database_success(self, mock_motor_client):
        """Test close_database exitoso"""
        with patch('core.database.client', mock_motor_client):
            await close_database()
            mock_motor_client.close.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_close_database_without_client(self):
        """Test close_database cuando no hay cliente"""
        with patch('core.database.client', None):
            # No debe lanzar excepción
            await close_database()

