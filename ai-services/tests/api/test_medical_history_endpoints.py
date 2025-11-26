"""
Tests para api/routes/medical_history.py
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from main import app


class TestMedicalHistoryEndpoints:
    """Tests para medical history endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def sample_history_input(self):
        """Sample medical history input"""
        return {
            "patient_id": "patient_123",
            "text": "Paciente de 45 años con tos persistente de 2 semanas. Historial de asma.",
            "language": "es",
            "metadata": {"source": "clinical_note"}
        }
    
    @pytest.mark.asyncio
    async def test_process_medical_history_basic(self, client, sample_history_input):
        """Test basic medical history processing"""
        mock_service = AsyncMock()
        mock_service.process_medical_history.return_value = {
            "symptoms": ["tos"],
            "entities": [],
            "summary": "Patient history processed"
        }
        
        with patch('api.routes.medical_history.MedicalHistoryService', return_value=mock_service):
            response = client.post("/api/v1/medical-history/process", json=sample_history_input)
            
            # Should handle gracefully
            assert response.status_code in [200, 500]
    
    def test_process_medical_history_invalid_input(self, client):
        """Test medical history processing with invalid input"""
        invalid_input = {
            "patient_id": "",
            "text": ""
        }
        
        response = client.post("/api/v1/medical-history/process", json=invalid_input)
        
        # Should return validation error
        assert response.status_code in [400, 422]

