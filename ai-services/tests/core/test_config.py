"""
Unit tests for Configuration
"""

import pytest
import os
from unittest.mock import patch

from core.config import Settings, settings


class TestSettings:
    """Test Settings configuration"""
    
    def test_default_values(self):
        """Test default configuration values"""
        test_settings = Settings()
        
        assert test_settings.API_V1_STR == "/api/v1"
        assert test_settings.PROJECT_NAME == "RespiCare AI Services"
        assert test_settings.VERSION == "1.0.0"
    
    def test_allowed_origins(self):
        """Test CORS allowed origins"""
        test_settings = Settings()
        
        assert isinstance(test_settings.ALLOWED_ORIGINS, list)
        assert len(test_settings.ALLOWED_ORIGINS) > 0
    
    def test_database_url(self):
        """Test database URL"""
        test_settings = Settings()
        
        assert "mongodb" in test_settings.DATABASE_URL.lower()
    
    def test_redis_url(self):
        """Test Redis URL"""
        test_settings = Settings()
        
        assert "redis" in test_settings.REDIS_URL.lower()
    
    def test_ai_ml_configuration(self):
        """Test AI/ML configuration"""
        test_settings = Settings()
        
        assert isinstance(test_settings.ENABLE_BATCH_PROCESSING, bool)
        assert isinstance(test_settings.MAX_CONCURRENT_BATCH_JOBS, int)
        assert isinstance(test_settings.ENABLE_ASYNC_MODEL_LOADING, bool)
    
    def test_model_configuration(self):
        """Test model configuration"""
        test_settings = Settings()
        
        assert test_settings.MEDICAL_MODEL_NAME is not None
        assert test_settings.SYMPTOM_MODEL_NAME is not None
        assert test_settings.HISTORY_MODEL_NAME is not None
    
    def test_processing_configuration(self):
        """Test processing configuration"""
        test_settings = Settings()
        
        assert test_settings.MAX_TEXT_LENGTH > 0
        assert test_settings.BATCH_SIZE > 0
        assert test_settings.CACHE_TTL > 0
    
    def test_log_level(self):
        """Test log level"""
        test_settings = Settings()
        
        assert test_settings.LOG_LEVEL in ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
    
    @patch.dict(os.environ, {"OPENAI_API_KEY": "test_key"})
    def test_env_variable_loading(self):
        """Test loading from environment variables"""
        test_settings = Settings()
        
        assert test_settings.OPENAI_API_KEY == "test_key"
    
    @patch.dict(os.environ, {"REDIS_URL": "redis://custom:6379"})
    def test_custom_redis_url(self):
        """Test custom Redis URL from environment"""
        test_settings = Settings()
        
        assert test_settings.REDIS_URL == "redis://custom:6379"
    
    @patch.dict(os.environ, {"DATABASE_URL": "mongodb://custom:27017/db"})
    def test_custom_database_url(self):
        """Test custom database URL from environment"""
        test_settings = Settings()
        
        assert test_settings.DATABASE_URL == "mongodb://custom:27017/db"
    
    def test_global_settings_instance(self):
        """Test global settings instance"""
        assert settings is not None
        assert isinstance(settings, Settings)
    
    def test_settings_singleton(self):
        """Test that settings is a singleton"""
        from core.config import settings as settings1
        from core.config import settings as settings2
        
        assert settings1 is settings2

