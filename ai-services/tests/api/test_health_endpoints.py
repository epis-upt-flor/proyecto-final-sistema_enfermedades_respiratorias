"""
Tests para api/routes/health.py
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from main import app


class TestHealthEndpoints:
    """Tests para health check endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_health_check_basic(self, client):
        """Test basic health check endpoint"""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert data["service"] == "RespiCare AI Services"
        assert data["version"] == "1.0.0"
    
    @pytest.mark.asyncio
    async def test_detailed_health_check_success(self, client):
        """Test detailed health check with all services healthy"""
        mock_db = AsyncMock()
        mock_db.command = AsyncMock(return_value={"ok": 1})
        
        mock_cache = AsyncMock()
        mock_cache.ping = AsyncMock(return_value=True)
        
        mock_model_manager = MagicMock()
        mock_model_manager.get_model = MagicMock(return_value=MagicMock())
        
        with patch('api.routes.health.get_database', return_value=mock_db), \
             patch('api.routes.health.get_cache', return_value=mock_cache), \
             patch('api.routes.health.model_manager', mock_model_manager):
            
            response = client.get("/api/v1/health/detailed")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert "dependencies" in data
            assert data["dependencies"]["database"]["status"] == "healthy"
            assert data["dependencies"]["cache"]["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_detailed_health_check_database_failure(self, client):
        """Test detailed health check with database failure"""
        mock_db = AsyncMock()
        mock_db.command = AsyncMock(side_effect=Exception("Database connection failed"))
        
        mock_cache = AsyncMock()
        mock_cache.ping = AsyncMock(return_value=True)
        
        mock_model_manager = MagicMock()
        mock_model_manager.get_model = MagicMock(return_value=MagicMock())
        
        with patch('api.routes.health.get_database', return_value=mock_db), \
             patch('api.routes.health.get_cache', return_value=mock_cache), \
             patch('api.routes.health.model_manager', mock_model_manager):
            
            response = client.get("/api/v1/health/detailed")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "degraded"
            assert data["dependencies"]["database"]["status"] == "unhealthy"
    
    @pytest.mark.asyncio
    async def test_detailed_health_check_cache_disabled(self, client):
        """Test detailed health check with cache disabled"""
        mock_db = AsyncMock()
        mock_db.command = AsyncMock(return_value={"ok": 1})
        
        mock_model_manager = MagicMock()
        mock_model_manager.get_model = MagicMock(return_value=MagicMock())
        
        with patch('api.routes.health.get_database', return_value=mock_db), \
             patch('api.routes.health.get_cache', return_value=None), \
             patch('api.routes.health.model_manager', mock_model_manager):
            
            response = client.get("/api/v1/health/detailed")
            
            assert response.status_code == 200
            data = response.json()
            assert data["dependencies"]["cache"]["status"] == "disabled"
    
    def test_readiness_check(self, client):
        """Test Kubernetes readiness probe"""
        response = client.get("/api/v1/health/ready")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ready"
        assert "timestamp" in data
    
    def test_liveness_check(self, client):
        """Test Kubernetes liveness probe"""
        response = client.get("/api/v1/health/live")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "alive"
        assert "timestamp" in data

