"""
Tests for api/routes/model_cache.py
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import time

from main import app


class TestModelCacheEndpoints:
    """Tests for model cache endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def mock_cache(self):
        """Create mock model cache"""
        mock = MagicMock()
        mock.get_stats.return_value = {
            "hits": 100,
            "misses": 50,
            "evictions": 5,
            "loads": 150,
            "hit_rate": 0.67,
            "cache_size": 3,
            "memory_usage_mb": 512.5,
            "max_size": 10,
            "max_memory_mb": 2048
        }
        mock.list_cached_models.return_value = [
            {
                "key": "model_1",
                "model_name": "xgboost_model",
                "model_type": "classification",
                "memory_mb": 256.0,
                "loaded_at": time.time() - 3600,
                "last_access": time.time() - 100
            },
            {
                "key": "model_2",
                "model_name": "bert_model",
                "model_type": "nlp",
                "memory_mb": 128.0,
                "loaded_at": time.time() - 1800,
                "last_access": time.time() - 50
            }
        ]
        mock.remove.return_value = True
        mock.clear.return_value = None
        return mock
    
    def test_get_cache_stats_success(self, client, mock_cache):
        """Test successful cache stats retrieval"""
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.get("/api/v1/ml/cache/stats")
            
            assert response.status_code == 200
            data = response.json()
            assert "hits" in data
            assert "misses" in data
            assert "evictions" in data
            assert "loads" in data
            assert "hit_rate" in data
            assert "cache_size" in data
            assert "memory_usage_mb" in data
            assert "max_size" in data
            assert "max_memory_mb" in data
            assert data["hits"] == 100
            assert data["misses"] == 50
            assert 0.0 <= data["hit_rate"] <= 1.0
    
    def test_get_cache_stats_error(self, client):
        """Test cache stats retrieval with error"""
        with patch('api.routes.model_cache.get_model_cache', side_effect=Exception("Cache error")):
            response = client.get("/api/v1/ml/cache/stats")
            
            assert response.status_code == 500
            assert "error" in response.json()["detail"].lower()
    
    def test_list_cached_models_success(self, client, mock_cache):
        """Test successful listing of cached models"""
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.get("/api/v1/ml/cache/models")
            
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 2
            assert all("key" in model for model in data)
            assert all("model_name" in model for model in data)
            assert all("model_type" in model for model in data)
            assert all("memory_mb" in model for model in data)
            assert all("loaded_at" in model for model in data)
            assert all("last_access" in model for model in data)
    
    def test_list_cached_models_empty(self, client):
        """Test listing cached models when cache is empty"""
        mock_cache = MagicMock()
        mock_cache.list_cached_models.return_value = []
        
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.get("/api/v1/ml/cache/models")
            
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            assert len(data) == 0
    
    def test_list_cached_models_error(self, client):
        """Test listing cached models with error"""
        with patch('api.routes.model_cache.get_model_cache', side_effect=Exception("List error")):
            response = client.get("/api/v1/ml/cache/models")
            
            assert response.status_code == 500
    
    def test_remove_cached_model_success(self, client, mock_cache):
        """Test successful removal of cached model"""
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.delete("/api/v1/ml/cache/models/xgboost_model?model_type=classification")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "removed" in data["message"].lower() or "xgboost_model" in data["message"]
    
    def test_remove_cached_model_all_types(self, client, mock_cache):
        """Test removal of cached model with all types"""
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.delete("/api/v1/ml/cache/models/xgboost_model?model_type=all")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_remove_cached_model_not_found(self, client):
        """Test removal of non-existent cached model"""
        mock_cache = MagicMock()
        mock_cache.list_cached_models.return_value = []
        mock_cache.remove.return_value = False
        
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.delete("/api/v1/ml/cache/models/nonexistent_model?model_type=classification")
            
            assert response.status_code == 404
            assert "not found" in response.json()["detail"].lower()
    
    def test_remove_cached_model_all_types_not_found(self, client):
        """Test removal with all types when model not found"""
        mock_cache = MagicMock()
        mock_cache.list_cached_models.return_value = []
        
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.delete("/api/v1/ml/cache/models/nonexistent_model?model_type=all")
            
            assert response.status_code == 404
    
    def test_remove_cached_model_error(self, client):
        """Test removal of cached model with error"""
        with patch('api.routes.model_cache.get_model_cache', side_effect=Exception("Remove error")):
            response = client.delete("/api/v1/ml/cache/models/test_model?model_type=classification")
            
            assert response.status_code == 500
    
    def test_clear_cache_success(self, client, mock_cache):
        """Test successful cache clearing"""
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.post("/api/v1/ml/cache/clear")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "cleared" in data["message"].lower()
            mock_cache.clear.assert_called_once()
    
    def test_clear_cache_error(self, client):
        """Test cache clearing with error"""
        with patch('api.routes.model_cache.get_model_cache', side_effect=Exception("Clear error")):
            response = client.post("/api/v1/ml/cache/clear")
            
            assert response.status_code == 500
            assert "error" in response.json()["detail"].lower()
    
    def test_cache_stats_response_structure(self, client, mock_cache):
        """Test cache stats response structure"""
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.get("/api/v1/ml/cache/stats")
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify all required fields are present and have correct types
            assert isinstance(data["hits"], int)
            assert isinstance(data["misses"], int)
            assert isinstance(data["evictions"], int)
            assert isinstance(data["loads"], int)
            assert isinstance(data["hit_rate"], float)
            assert isinstance(data["cache_size"], int)
            assert isinstance(data["memory_usage_mb"], float)
            assert isinstance(data["max_size"], int)
            assert isinstance(data["max_memory_mb"], int)
    
    def test_cached_model_info_structure(self, client, mock_cache):
        """Test cached model info structure"""
        with patch('api.routes.model_cache.get_model_cache', return_value=mock_cache):
            response = client.get("/api/v1/ml/cache/models")
            
            assert response.status_code == 200
            data = response.json()
            
            if len(data) > 0:
                model = data[0]
                assert isinstance(model["key"], str)
                assert isinstance(model["model_name"], str)
                assert isinstance(model["model_type"], str)
                assert isinstance(model["memory_mb"], float)
                assert isinstance(model["loaded_at"], (int, float))
                assert isinstance(model["last_access"], (int, float))

