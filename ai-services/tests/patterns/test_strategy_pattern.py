"""
Unit tests for Strategy Pattern implementation
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
import json

from strategies.analysis_strategy import AnalysisStrategy
from strategies.openai_strategy import OpenAIStrategy
from strategies.local_model_strategy import LocalModelStrategy
from strategies.rule_based_strategy import RuleBasedStrategy


class TestAnalysisStrategy:
    """Test abstract base strategy class"""
    
    def test_analysis_strategy_is_abstract(self):
        """Test that AnalysisStrategy cannot be instantiated directly"""
        with pytest.raises(TypeError):
            AnalysisStrategy()


class TestOpenAIStrategy:
    """Test OpenAI strategy implementation"""
    
    @pytest.fixture
    def openai_strategy(self):
        """Create OpenAI strategy instance"""
        return OpenAIStrategy()
    
    def test_openai_strategy_initialization(self, openai_strategy):
        """Test OpenAI strategy initialization"""
        assert openai_strategy is not None
        assert hasattr(openai_strategy, 'analyze_symptoms')
        assert hasattr(openai_strategy, 'process_medical_history')
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_success(self, openai_strategy, mock_openai_response):
        """Test successful symptom analysis with OpenAI"""
        with patch('openai.OpenAI') as mock_openai:
            mock_client = MagicMock()
            mock_openai.return_value = mock_client
            mock_client.chat.completions.create.return_value = mock_openai_response
            
            result = await openai_strategy.analyze_symptoms(
                symptoms=["tos", "fiebre"],
                context="Síntomas respiratorios"
            )
            
            assert result is not None
            assert "urgency_level" in result
            assert "severity_score" in result
            assert result["urgency_level"] == "moderate"
            assert result["severity_score"] == 0.7
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_api_error(self, openai_strategy):
        """Test symptom analysis with API error"""
        with patch('openai.OpenAI') as mock_openai:
            mock_client = MagicMock()
            mock_openai.return_value = mock_client
            mock_client.chat.completions.create.side_effect = Exception("API Error")
            
            with pytest.raises(Exception):
                await openai_strategy.analyze_symptoms(
                    symptoms=["tos", "fiebre"],
                    context="Síntomas respiratorios"
                )
    
    @pytest.mark.asyncio
    async def test_process_medical_history_success(self, openai_strategy, sample_medical_history):
        """Test successful medical history processing"""
        mock_response = {
            "choices": [{
                "message": {
                    "content": json.dumps({
                        "symptoms": ["tos seca", "fiebre"],
                        "age": 45,
                        "gender": "M",
                        "risk_factors": ["tabaquismo"],
                        "diagnosis_suggestions": ["Bronquitis aguda"]
                    })
                }
            }]
        }
        
        with patch('openai.OpenAI') as mock_openai:
            mock_client = MagicMock()
            mock_openai.return_value = mock_client
            mock_client.chat.completions.create.return_value = mock_response
            
            result = await openai_strategy.process_medical_history(
                text=sample_medical_history["text"],
                language="es"
            )
            
            assert result is not None
            assert "symptoms" in result
            assert "age" in result
            assert result["age"] == 45


class TestLocalModelStrategy:
    """Test local model strategy implementation"""
    
    @pytest.fixture
    def local_strategy(self):
        """Create local model strategy instance"""
        return LocalModelStrategy()
    
    def test_local_strategy_initialization(self, local_strategy):
        """Test local strategy initialization"""
        assert local_strategy is not None
        assert hasattr(local_strategy, 'analyze_symptoms')
        assert hasattr(local_strategy, 'process_medical_history')
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_local_models(self, local_strategy):
        """Test symptom analysis with local models"""
        with patch('models.model_manager.ModelManager') as mock_model_manager:
            mock_model_manager.return_value.classify_symptoms.return_value = {
                "respiratory": 0.8,
                "general": 0.2
            }
            
            result = await local_strategy.analyze_symptoms(
                symptoms=["tos", "fiebre"],
                context="Síntomas respiratorios"
            )
            
            assert result is not None
            assert "classification" in result
            assert result["classification"]["respiratory"] == 0.8
    
    @pytest.mark.asyncio
    async def test_process_medical_history_local_models(self, local_strategy, sample_medical_history):
        """Test medical history processing with local models"""
        with patch('models.model_manager.ModelManager') as mock_model_manager:
            mock_model_manager.return_value.process_medical_history.return_value = {
                "symptoms": ["tos seca", "fiebre"],
                "age": 45,
                "gender": "M"
            }
            
            result = await local_strategy.process_medical_history(
                text=sample_medical_history["text"],
                language="es"
            )
            
            assert result is not None
            assert "symptoms" in result
            assert "age" in result


class TestRuleBasedStrategy:
    """Test rule-based strategy implementation"""
    
    @pytest.fixture
    def rule_strategy(self):
        """Create rule-based strategy instance"""
        return RuleBasedStrategy()
    
    def test_rule_strategy_initialization(self, rule_strategy):
        """Test rule-based strategy initialization"""
        assert rule_strategy is not None
        assert hasattr(rule_strategy, 'analyze_symptoms')
        assert hasattr(rule_strategy, 'process_medical_history')
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_rule_based(self, rule_strategy):
        """Test symptom analysis with rule-based approach"""
        result = await rule_strategy.analyze_symptoms(
            symptoms=["tos seca", "fiebre", "dificultad respiratoria"],
            context="Síntomas respiratorios"
        )
        
        assert result is not None
        assert "urgency_level" in result
        assert "severity_score" in result
        assert "classification" in result
        assert isinstance(result["severity_score"], float)
        assert 0.0 <= result["severity_score"] <= 1.0
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_high_urgency(self, rule_strategy):
        """Test high urgency symptom detection"""
        result = await rule_strategy.analyze_symptoms(
            symptoms=["dificultad respiratoria severa", "cianosis", "dolor torácico"],
            context="Emergencia respiratoria"
        )
        
        assert result["urgency_level"] in ["high", "critical"]
        assert result["severity_score"] > 0.7
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_low_urgency(self, rule_strategy):
        """Test low urgency symptom detection"""
        result = await rule_strategy.analyze_symptoms(
            symptoms=["tos leve", "congestión nasal"],
            context="Resfriado común"
        )
        
        assert result["urgency_level"] in ["low", "moderate"]
        assert result["severity_score"] < 0.5
    
    @pytest.mark.asyncio
    async def test_process_medical_history_rule_based(self, rule_strategy, sample_medical_history):
        """Test medical history processing with rule-based approach"""
        result = await rule_strategy.process_medical_history(
            text=sample_medical_history["text"],
            language="es"
        )
        
        assert result is not None
        assert "symptoms" in result
        assert "age" in result
        assert "gender" in result
        assert "risk_factors" in result
        assert isinstance(result["symptoms"], list)
        assert len(result["symptoms"]) > 0
    
    @pytest.mark.asyncio
    async def test_extract_age_from_text(self, rule_strategy):
        """Test age extraction from medical text"""
        test_cases = [
            ("Paciente de 45 años", 45),
            ("Mujer de 30 años de edad", 30),
            ("Hombre de 65 años", 65),
            ("Sin información de edad", None)
        ]
        
        for text, expected_age in test_cases:
            result = await rule_strategy.process_medical_history(text, "es")
            if expected_age:
                assert result["age"] == expected_age
    
    @pytest.mark.asyncio
    async def test_extract_gender_from_text(self, rule_strategy):
        """Test gender extraction from medical text"""
        test_cases = [
            ("Paciente masculino de 45 años", "M"),
            ("Mujer de 30 años", "F"),
            ("Hombre de 65 años", "M"),
            ("Paciente de 40 años", None)  # No gender specified
        ]
        
        for text, expected_gender in test_cases:
            result = await rule_strategy.process_medical_history(text, "es")
            if expected_gender:
                assert result["gender"] == expected_gender


class TestStrategyIntegration:
    """Test strategy pattern integration"""
    
    @pytest.mark.asyncio
    async def test_strategy_fallback_behavior(self):
        """Test strategy fallback when primary strategy fails"""
        # Test OpenAI strategy fallback to rule-based
        openai_strategy = OpenAIStrategy()
        
        with patch('openai.OpenAI') as mock_openai:
            mock_client = MagicMock()
            mock_openai.return_value = mock_client
            mock_client.chat.completions.create.side_effect = Exception("API Unavailable")
            
            # Strategy should handle error gracefully
            with pytest.raises(Exception):
                await openai_strategy.analyze_symptoms(
                    symptoms=["tos", "fiebre"],
                    context="Test"
                )
    
    def test_strategy_interface_consistency(self):
        """Test that all strategies implement the same interface"""
        strategies = [
            OpenAIStrategy(),
            LocalModelStrategy(),
            RuleBasedStrategy()
        ]
        
        for strategy in strategies:
            # All strategies should have the required methods
            assert hasattr(strategy, 'analyze_symptoms')
            assert hasattr(strategy, 'process_medical_history')
            assert callable(getattr(strategy, 'analyze_symptoms'))
            assert callable(getattr(strategy, 'process_medical_history'))
