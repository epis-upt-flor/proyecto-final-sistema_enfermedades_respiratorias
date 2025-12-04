"""
Unit tests for SymptomAnalysisService
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Dict, Any, List

from services.symptom_analysis_service import SymptomAnalysisService


class TestSymptomAnalysisService:
    """Test SymptomAnalysisService implementation"""
    
    @pytest.fixture
    def service_manager_mock(self):
        """Create mock service manager"""
        mock = AsyncMock()
        mock.analyze_symptoms.return_value = {
            "disease": "Bronquitis",
            "confidence": 0.85,
            "urgency_level": "moderate",
            "symptoms": ["tos", "fiebre"]
        }
        return mock
    
    @pytest.fixture
    def symptom_service(self, service_manager_mock):
        """Create symptom analysis service instance"""
        return SymptomAnalysisService(service_manager=service_manager_mock)
    
    @pytest.fixture
    def sample_symptoms(self):
        """Sample symptoms for testing"""
        return [
            {"name": "tos", "severity": "moderate", "duration_days": 5},
            {"name": "fiebre", "severity": "mild", "duration_days": 2}
        ]
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_comprehensive_basic(self, symptom_service, sample_symptoms):
        """Test comprehensive symptom analysis with basic options"""
        result = await symptom_service.analyze_symptoms_comprehensive(
            symptoms=sample_symptoms,
            patient_id="patient_123",
            include_trends=False,
            include_recommendations=False
        )
        
        assert result is not None
        assert "disease" in result or "urgency_level" in result
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_comprehensive_with_trends(self, symptom_service, sample_symptoms):
        """Test comprehensive analysis with trends"""
        with patch.object(symptom_service, '_analyze_symptom_trends', new_callable=AsyncMock) as mock_trends:
            mock_trends.return_value = {"trend": "increasing", "days": 5}
            
            result = await symptom_service.analyze_symptoms_comprehensive(
                symptoms=sample_symptoms,
                patient_id="patient_123",
                include_trends=True
            )
            
            assert "trend_analysis" in result
            mock_trends.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_comprehensive_with_recommendations(self, symptom_service, sample_symptoms):
        """Test comprehensive analysis with recommendations"""
        with patch.object(symptom_service, '_generate_detailed_recommendations', new_callable=AsyncMock) as mock_recs:
            mock_recs.return_value = ["Rest", "Hydration"]
            
            result = await symptom_service.analyze_symptoms_comprehensive(
                symptoms=sample_symptoms,
                patient_id="patient_123",
                include_recommendations=True
            )
            
            assert "detailed_recommendations" in result
            mock_recs.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_comprehensive_risk_assessment(self, symptom_service, sample_symptoms):
        """Test risk assessment in comprehensive analysis"""
        with patch.object(symptom_service, '_assess_health_risks', new_callable=AsyncMock) as mock_risk:
            mock_risk.return_value = {"risk_level": "moderate", "factors": ["age", "symptoms"]}
            
            result = await symptom_service.analyze_symptoms_comprehensive(
                symptoms=sample_symptoms,
                patient_id="patient_123"
            )
            
            assert "risk_assessment" in result
            mock_risk.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_comprehensive_follow_up(self, symptom_service, sample_symptoms):
        """Test follow-up plan in comprehensive analysis"""
        with patch.object(symptom_service, '_create_follow_up_plan', new_callable=AsyncMock) as mock_follow:
            mock_follow.return_value = {"next_appointment": "2024-01-15", "monitoring": True}
            
            result = await symptom_service.analyze_symptoms_comprehensive(
                symptoms=sample_symptoms,
                patient_id="patient_123"
            )
            
            assert "follow_up_plan" in result
            mock_follow.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_batch(self, symptom_service):
        """Test batch symptom analysis"""
        batch_requests = [
            {"symptoms": [{"name": "tos"}], "patient_id": "p1"},
            {"symptoms": [{"name": "fiebre"}], "patient_id": "p2"}
        ]
        
        result = await symptom_service.analyze_symptoms_batch(batch_requests)
        
        assert isinstance(result, list)
        assert len(result) == 2
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_batch_with_strategy(self, symptom_service):
        """Test batch analysis with strategy preference"""
        batch_requests = [{"symptoms": [{"name": "tos"}], "patient_id": "p1"}]
        
        result = await symptom_service.analyze_symptoms_batch(
            batch_requests,
            strategy_preference="local"
        )
        
        assert isinstance(result, list)
    
    @pytest.mark.asyncio
    async def test_perform_basic_analysis_with_manager(self, symptom_service, sample_symptoms):
        """Test basic analysis using service manager"""
        result = await symptom_service._perform_basic_analysis(
            symptoms=sample_symptoms,
            patient_id="patient_123",
            context=None
        )
        
        assert result is not None
        symptom_service.service_manager.analyze_symptoms.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_perform_basic_analysis_fallback(self, sample_symptoms):
        """Test basic analysis fallback when no manager"""
        service = SymptomAnalysisService(service_manager=None)
        
        # Correct import path: from symptom_analyzer.analyzer import analyzer
        with patch('symptom_analyzer.analyzer.analyzer') as mock_analyzer:
            mock_analyzer.analyze_symptoms = AsyncMock(return_value={"disease": "Bronquitis"})
            
            result = await service._perform_basic_analysis(
                symptoms=sample_symptoms,
                patient_id="patient_123",
                context=None
            )
            
            assert result is not None
    
    @pytest.mark.asyncio
    async def test_analyze_symptom_trends(self, symptom_service):
        """Test symptom trend analysis"""
        result = await symptom_service._analyze_symptom_trends("patient_123")
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_generate_detailed_recommendations(self, symptom_service, sample_symptoms):
        """Test detailed recommendations generation"""
        analysis_result = {"disease": "Bronquitis", "urgency_level": "moderate"}
        
        result = await symptom_service._generate_detailed_recommendations(
            analysis_result=analysis_result,
            symptoms=sample_symptoms,
            context=None
        )
        
        # _generate_detailed_recommendations returns Dict, not list
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_assess_health_risks(self, symptom_service, sample_symptoms):
        """Test health risk assessment"""
        analysis_result = {"disease": "Bronquitis", "confidence": 0.85}
        context = {"age": 45, "gender": "M"}
        
        result = await symptom_service._assess_health_risks(analysis_result, context)
        
        assert isinstance(result, dict)
        assert "risk_level" in result or "factors" in result
    
    @pytest.mark.asyncio
    async def test_create_follow_up_plan(self, symptom_service, sample_symptoms):
        """Test follow-up plan creation"""
        analysis_result = {"disease": "Bronquitis", "urgency_level": "moderate"}
        
        result = await symptom_service._create_follow_up_plan(
            analysis_result=analysis_result,
            patient_id="patient_123"
        )
        
        assert isinstance(result, dict)
    
    @pytest.mark.asyncio
    async def test_error_handling(self, symptom_service, sample_symptoms):
        """Test error handling in comprehensive analysis"""
        symptom_service.service_manager.analyze_symptoms.side_effect = Exception("Service error")
        
        with pytest.raises(Exception):
            await symptom_service.analyze_symptoms_comprehensive(
                symptoms=sample_symptoms,
                patient_id="patient_123"
            )

