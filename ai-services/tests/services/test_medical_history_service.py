"""
Unit tests for MedicalHistoryService
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any

from services.medical_history_service import MedicalHistoryService


class TestMedicalHistoryService:
    """Test MedicalHistoryService implementation"""
    
    @pytest.fixture
    def service_manager_mock(self):
        """Create mock service manager"""
        mock = AsyncMock()
        mock.process_medical_history.return_value = {
            "symptoms": ["tos", "fiebre"],
            "entities": ["medication", "diagnosis"],
            "summary": "Patient history processed"
        }
        return mock
    
    @pytest.fixture
    def medical_history_service(self, service_manager_mock):
        """Create medical history service instance"""
        return MedicalHistoryService(service_manager=service_manager_mock)
    
    @pytest.fixture
    def sample_text(self):
        """Sample medical history text"""
        return "Paciente de 45 años con tos persistente y fiebre de 3 días. Historial de asma."
    
    @pytest.mark.asyncio
    async def test_process_medical_history_comprehensive_basic(self, medical_history_service, sample_text):
        """Test comprehensive processing with basic options"""
        result = await medical_history_service.process_medical_history_comprehensive(
            text=sample_text,
            patient_id="patient_123",
            include_entity_extraction=False,
            include_diagnosis_suggestions=False,
            include_risk_assessment=False
        )
        
        assert result is not None
        assert "symptoms" in result or "summary" in result
    
    @pytest.mark.asyncio
    async def test_process_medical_history_with_entities(self, medical_history_service, sample_text):
        """Test processing with entity extraction"""
        with patch.object(medical_history_service, '_extract_medical_entities', new_callable=AsyncMock) as mock_entities:
            mock_entities.return_value = {"medications": [], "diagnoses": ["asma"]}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123",
                include_entity_extraction=True
            )
            
            assert "entity_analysis" in result
            mock_entities.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_with_diagnosis(self, medical_history_service, sample_text):
        """Test processing with diagnosis suggestions"""
        with patch.object(medical_history_service, '_generate_diagnosis_suggestions', new_callable=AsyncMock) as mock_diag:
            mock_diag.return_value = {"suggestions": ["Bronquitis", "Asma"]}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123",
                include_diagnosis_suggestions=True
            )
            
            assert "diagnosis_analysis" in result
            mock_diag.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_with_risk(self, medical_history_service, sample_text):
        """Test processing with risk assessment"""
        with patch.object(medical_history_service, '_assess_medical_risks', new_callable=AsyncMock) as mock_risk:
            mock_risk.return_value = {"risk_level": "moderate"}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123",
                include_risk_assessment=True
            )
            
            assert "risk_assessment" in result
            mock_risk.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_summary(self, medical_history_service, sample_text):
        """Test medical summary generation"""
        with patch.object(medical_history_service, '_generate_medical_summary', new_callable=AsyncMock) as mock_summary:
            mock_summary.return_value = {"summary": "45-year-old with persistent cough"}
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )
            
            assert "medical_summary" in result
            mock_summary.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_care_recommendations(self, medical_history_service, sample_text):
        """Test care recommendations generation"""
        with patch.object(medical_history_service, '_generate_care_recommendations', new_callable=AsyncMock) as mock_care:
            mock_care.return_value = ["Monitor symptoms", "Follow-up in 3 days"]
            
            result = await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )
            
            assert "care_recommendations" in result
            mock_care.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_process_medical_history_batch(self, medical_history_service):
        """Test batch medical history processing"""
        batch_requests = [
            {"text": "Patient 1 history", "patient_id": "p1"},
            {"text": "Patient 2 history", "patient_id": "p2"}
        ]
        
        result = await medical_history_service.process_medical_history_batch(batch_requests)
        
        assert isinstance(result, list)
        assert len(result) == 2
    
    @pytest.mark.asyncio
    async def test_perform_basic_processing_with_manager(self, medical_history_service, sample_text):
        """Test basic processing using service manager"""
        result = await medical_history_service._perform_basic_processing(
            text=sample_text,
            patient_id="patient_123",
            context=None
        )
        
        assert result is not None
        medical_history_service.service_manager.process_medical_history.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_extract_medical_entities(self, medical_history_service, sample_text):
        """Test medical entity extraction"""
        result = await medical_history_service._extract_medical_entities(sample_text)
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_generate_diagnosis_suggestions(self, medical_history_service, sample_text):
        """Test diagnosis suggestions generation"""
        processing_result = {"symptoms": ["tos", "fiebre"], "entities": []}
        
        result = await medical_history_service._generate_diagnosis_suggestions(processing_result)
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_assess_medical_risks(self, medical_history_service, sample_text):
        """Test medical risk assessment"""
        processing_result = {"symptoms": ["tos"], "entities": []}
        context = {"age": 45}
        
        result = await medical_history_service._assess_medical_risks(processing_result, context)
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_generate_medical_summary(self, medical_history_service, sample_text):
        """Test medical summary generation"""
        processing_result = {"symptoms": ["tos"], "entities": []}
        
        result = await medical_history_service._generate_medical_summary(
            processing_result=processing_result,
            patient_id="patient_123"
        )
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_generate_care_recommendations(self, medical_history_service, sample_text):
        """Test care recommendations generation"""
        processing_result = {"symptoms": ["tos"], "diagnosis": "Bronquitis"}
        
        result = await medical_history_service._generate_care_recommendations(processing_result)
        
        assert isinstance(result, list)
    
    @pytest.mark.asyncio
    async def test_error_handling(self, medical_history_service, sample_text):
        """Test error handling in comprehensive processing"""
        medical_history_service.service_manager.process_medical_history.side_effect = Exception("Service error")
        
        with pytest.raises(Exception):
            await medical_history_service.process_medical_history_comprehensive(
                text=sample_text,
                patient_id="patient_123"
            )

