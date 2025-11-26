"""
Tests para api/routes/symptom_analyzer.py
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from main import app


class TestSymptomAnalyzerEndpoints:
    """Tests para symptom analyzer endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def sample_symptom_input(self):
        """Sample symptom input"""
        return {
            "patient_id": "patient_123",
            "symptoms": [
                {"name": "tos", "severity": "moderate", "duration": "3 días"},
                {"name": "fiebre", "severity": "mild", "duration": "1 día"}
            ],
            "severity": "medium",
            "context": "Paciente con síntomas respiratorios",
            "metadata": {"age": 45, "gender": "M"}
        }
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_basic(self, client, sample_symptom_input):
        """Test basic symptom analysis endpoint"""
        mock_service = AsyncMock()
        mock_service.analyze_symptoms.return_value = {
            "urgency_level": "medium",
            "severity_score": 0.6,
            "classification": {"category": "respiratory"},
            "recommendations": ["Descansar", "Tomar líquidos"],
            "warning_signs": [],
            "follow_up_required": False,
            "confidence_score": 0.85
        }
        
        with patch('api.routes.symptom_analyzer.SymptomAnalysisService', return_value=mock_service):
            response = client.post("/api/v1/symptoms/analyze", json=sample_symptom_input)
            
            assert response.status_code == 200
            data = response.json()
            assert "urgency_level" in data
            assert "severity_score" in data
            assert "recommendations" in data
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_with_cache(self, client, sample_symptom_input):
        """Test symptom analysis with cache"""
        mock_service = AsyncMock()
        mock_service.analyze_symptoms.return_value = {
            "urgency_level": "medium",
            "severity_score": 0.6,
            "classification": {"category": "respiratory"},
            "recommendations": ["Descansar"],
            "warning_signs": [],
            "follow_up_required": False,
            "confidence_score": 0.85
        }
        
        mock_cache = AsyncMock()
        mock_cache.get = AsyncMock(return_value=None)
        mock_cache.set = AsyncMock(return_value=True)
        
        with patch('api.routes.symptom_analyzer.SymptomAnalysisService', return_value=mock_service), \
             patch('api.routes.symptom_analyzer.get_cache', return_value=mock_cache), \
             patch('api.routes.symptom_analyzer.set_cache', return_value=True):
            
            response = client.post("/api/v1/symptoms/analyze", json=sample_symptom_input)
            
            assert response.status_code == 200
    
    def test_analyze_symptoms_invalid_input(self, client):
        """Test symptom analysis with invalid input"""
        invalid_input = {
            "patient_id": "",  # Invalid empty patient_id
            "symptoms": []  # Empty symptoms
        }
        
        response = client.post("/api/v1/symptoms/analyze", json=invalid_input)
        
        # Should return validation error
        assert response.status_code in [400, 422]
    
    @pytest.mark.asyncio
    async def test_get_symptom_history(self, client):
        """Test get symptom history endpoint"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_collection.find = AsyncMock()
        mock_collection.find.sort = AsyncMock(return_value=mock_collection)
        mock_collection.find.sort.limit = AsyncMock(return_value=mock_collection)
        mock_collection.find.sort.limit.to_list = AsyncMock(return_value=[])
        mock_db.symptoms = mock_collection
        
        with patch('api.routes.symptom_analyzer.get_database', return_value=mock_db):
            response = client.get("/api/v1/symptoms/history/patient_123")
            
            # Should handle gracefully even if no history
            assert response.status_code in [200, 404]
    
    @pytest.mark.asyncio
    async def test_get_symptom_trends(self, client):
        """Test get symptom trends endpoint"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_collection.aggregate = AsyncMock(return_value=[])
        mock_db.symptoms = mock_collection
        
        with patch('api.routes.symptom_analyzer.get_database', return_value=mock_db):
            response = client.get("/api/v1/symptoms/trends/patient_123?period=7d")
            
            # Should handle gracefully
            assert response.status_code in [200, 404]

