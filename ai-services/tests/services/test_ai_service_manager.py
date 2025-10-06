"""
Unit tests for AI Service Manager
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json

from services.ai_service_manager import AIServiceManager
from strategies.openai_strategy import OpenAIStrategy
from strategies.local_model_strategy import LocalModelStrategy
from strategies.rule_based_strategy import RuleBasedStrategy
from factories.strategy_factory import StrategyFactory
from factories.model_factory import ModelFactory


class TestAIServiceManager:
    """Test AI Service Manager implementation"""
    
    @pytest.fixture
    def ai_service_manager(self):
        """Create AI service manager instance"""
        return AIServiceManager()
    
    @pytest.fixture
    def mock_model_manager(self):
        """Create mock model manager"""
        mock_manager = AsyncMock()
        mock_manager.classify_symptoms.return_value = {
            "respiratory": 0.8,
            "general": 0.2
        }
        mock_manager.process_medical_history.return_value = {
            "symptoms": ["tos", "fiebre"],
            "age": 45,
            "gender": "M"
        }
        return mock_manager
    
    def test_ai_service_manager_initialization(self, ai_service_manager):
        """Test AI service manager initialization"""
        assert ai_service_manager._initialized is False
        assert ai_service_manager._model_manager is None
        assert ai_service_manager._current_strategy is None
        assert ai_service_manager._available_strategies == {}
    
    @pytest.mark.asyncio
    async def test_initialize_success(self, ai_service_manager):
        """Test successful initialization"""
        with patch.object(ModelFactory, 'create_model_manager', return_value=MagicMock()) as mock_factory:
            await ai_service_manager.initialize()
            
            assert ai_service_manager._initialized is True
            assert ai_service_manager._model_manager is not None
            assert len(ai_service_manager._available_strategies) > 0
            mock_factory.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_initialize_already_initialized(self, ai_service_manager):
        """Test initialization when already initialized"""
        ai_service_manager._initialized = True
        
        with patch.object(ModelFactory, 'create_model_manager') as mock_factory:
            await ai_service_manager.initialize()
            
            # Should not call factory again
            mock_factory.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_set_strategy_success(self, ai_service_manager):
        """Test setting strategy successfully"""
        await ai_service_manager.initialize()
        
        # Set OpenAI strategy
        await ai_service_manager.set_strategy("openai")
        
        assert ai_service_manager._current_strategy is not None
        assert isinstance(ai_service_manager._current_strategy, OpenAIStrategy)
    
    @pytest.mark.asyncio
    async def test_set_strategy_invalid(self, ai_service_manager):
        """Test setting invalid strategy"""
        await ai_service_manager.initialize()
        
        with pytest.raises(ValueError):
            await ai_service_manager.set_strategy("invalid_strategy")
    
    @pytest.mark.asyncio
    async def test_set_strategy_not_initialized(self, ai_service_manager):
        """Test setting strategy when not initialized"""
        with pytest.raises(RuntimeError):
            await ai_service_manager.set_strategy("openai")
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_openai_strategy(self, ai_service_manager, sample_symptoms):
        """Test symptom analysis with OpenAI strategy"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("openai")
        
        # Mock OpenAI strategy response
        mock_response = {
            "urgency_level": "moderate",
            "severity_score": 0.7,
            "classification": {"respiratory": 0.8},
            "recommendations": ["Consulta médica"],
            "confidence_score": 0.85
        }
        
        with patch.object(ai_service_manager._current_strategy, 'analyze_symptoms', return_value=mock_response):
            result = await ai_service_manager.analyze_symptoms(
                symptoms=sample_symptoms["symptoms"],
                context=sample_symptoms["context"]
            )
            
            assert result["urgency_level"] == "moderate"
            assert result["severity_score"] == 0.7
            assert "classification" in result
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_local_strategy(self, ai_service_manager, sample_symptoms):
        """Test symptom analysis with local strategy"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("local")
        
        # Mock local strategy response
        mock_response = {
            "urgency_level": "low",
            "severity_score": 0.5,
            "classification": {"respiratory": 0.6},
            "recommendations": ["Reposo"],
            "confidence_score": 0.7
        }
        
        with patch.object(ai_service_manager._current_strategy, 'analyze_symptoms', return_value=mock_response):
            result = await ai_service_manager.analyze_symptoms(
                symptoms=sample_symptoms["symptoms"],
                context=sample_symptoms["context"]
            )
            
            assert result["urgency_level"] == "low"
            assert result["severity_score"] == 0.5
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_rule_based_strategy(self, ai_service_manager, sample_symptoms):
        """Test symptom analysis with rule-based strategy"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("rule_based")
        
        result = await ai_service_manager.analyze_symptoms(
            symptoms=sample_symptoms["symptoms"],
            context=sample_symptoms["context"]
        )
        
        assert "urgency_level" in result
        assert "severity_score" in result
        assert "classification" in result
        assert isinstance(result["severity_score"], float)
        assert 0.0 <= result["severity_score"] <= 1.0
    
    @pytest.mark.asyncio
    async def test_process_medical_history_openai_strategy(self, ai_service_manager, sample_medical_history):
        """Test medical history processing with OpenAI strategy"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("openai")
        
        # Mock OpenAI strategy response
        mock_response = {
            "symptoms": ["tos seca", "fiebre"],
            "age": 45,
            "gender": "M",
            "risk_factors": ["tabaquismo"],
            "diagnosis_suggestions": ["Bronquitis aguda"],
            "confidence_score": 0.9
        }
        
        with patch.object(ai_service_manager._current_strategy, 'process_medical_history', return_value=mock_response):
            result = await ai_service_manager.process_medical_history(
                text=sample_medical_history["text"],
                language=sample_medical_history["language"]
            )
            
            assert result["age"] == 45
            assert result["gender"] == "M"
            assert "symptoms" in result
            assert "risk_factors" in result
    
    @pytest.mark.asyncio
    async def test_process_medical_history_rule_based_strategy(self, ai_service_manager, sample_medical_history):
        """Test medical history processing with rule-based strategy"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("rule_based")
        
        result = await ai_service_manager.process_medical_history(
            text=sample_medical_history["text"],
            language=sample_medical_history["language"]
        )
        
        assert "symptoms" in result
        assert "age" in result
        assert "gender" in result
        assert "risk_factors" in result
        assert isinstance(result["symptoms"], list)
    
    @pytest.mark.asyncio
    async def test_analyze_symptoms_strategy_fallback(self, ai_service_manager, sample_symptoms):
        """Test strategy fallback when primary strategy fails"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("openai")
        
        # Mock OpenAI strategy to fail
        with patch.object(ai_service_manager._current_strategy, 'analyze_symptoms', side_effect=Exception("API Error")):
            with pytest.raises(Exception):
                await ai_service_manager.analyze_symptoms(
                    symptoms=sample_symptoms["symptoms"],
                    context=sample_symptoms["context"]
                )
    
    @pytest.mark.asyncio
    async def test_auto_strategy_selection(self, ai_service_manager):
        """Test automatic strategy selection"""
        await ai_service_manager.initialize()
        
        # Test auto strategy selection
        await ai_service_manager.set_strategy("auto")
        
        # Should select a valid strategy
        assert ai_service_manager._current_strategy is not None
        assert ai_service_manager._current_strategy in ai_service_manager._available_strategies.values()
    
    @pytest.mark.asyncio
    async def test_get_available_strategies(self, ai_service_manager):
        """Test getting available strategies"""
        await ai_service_manager.initialize()
        
        strategies = ai_service_manager.get_available_strategies()
        
        assert isinstance(strategies, list)
        assert "openai" in strategies
        assert "local" in strategies
        assert "rule_based" in strategies
        assert "auto" in strategies
    
    @pytest.mark.asyncio
    async def test_get_current_strategy_info(self, ai_service_manager):
        """Test getting current strategy information"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("openai")
        
        strategy_info = ai_service_manager.get_current_strategy_info()
        
        assert "name" in strategy_info
        assert "type" in strategy_info
        assert "initialized_at" in strategy_info
        assert strategy_info["name"] == "openai"
    
    @pytest.mark.asyncio
    async def test_health_check_success(self, ai_service_manager):
        """Test health check when healthy"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("rule_based")
        
        health_status = await ai_service_manager.health_check()
        
        assert health_status["status"] == "healthy"
        assert health_status["initialized"] is True
        assert health_status["current_strategy"] == "rule_based"
        assert "available_strategies" in health_status
    
    @pytest.mark.asyncio
    async def test_health_check_not_initialized(self, ai_service_manager):
        """Test health check when not initialized"""
        health_status = await ai_service_manager.health_check()
        
        assert health_status["status"] == "unhealthy"
        assert health_status["initialized"] is False
        assert health_status["error"] == "Service not initialized"
    
    @pytest.mark.asyncio
    async def test_health_check_strategy_error(self, ai_service_manager):
        """Test health check when strategy has error"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("openai")
        
        # Mock strategy to fail health check
        with patch.object(ai_service_manager._current_strategy, 'health_check', return_value=False):
            health_status = await ai_service_manager.health_check()
            
            assert health_status["status"] == "degraded"
            assert health_status["current_strategy"] == "openai"
    
    @pytest.mark.asyncio
    async def test_reset_manager(self, ai_service_manager):
        """Test resetting the manager"""
        await ai_service_manager.initialize()
        await ai_service_manager.set_strategy("openai")
        
        # Verify initialized
        assert ai_service_manager._initialized is True
        assert ai_service_manager._current_strategy is not None
        
        # Reset manager
        ai_service_manager.reset()
        
        # Verify reset
        assert ai_service_manager._initialized is False
        assert ai_service_manager._current_strategy is None
        assert ai_service_manager._model_manager is None
    
    @pytest.mark.asyncio
    async def test_concurrent_initialization(self, ai_service_manager):
        """Test concurrent initialization"""
        # Start multiple initialization tasks
        tasks = [ai_service_manager.initialize() for _ in range(3)]
        
        # All should complete successfully
        await asyncio.gather(*tasks)
        
        assert ai_service_manager._initialized is True
        assert ai_service_manager._model_manager is not None


class TestAIServiceManagerIntegration:
    """Test AI Service Manager integration scenarios"""
    
    @pytest.mark.asyncio
    async def test_end_to_end_symptom_analysis(self):
        """Test end-to-end symptom analysis workflow"""
        manager = AIServiceManager()
        await manager.initialize()
        
        # Test with different strategies
        strategies = ["openai", "local", "rule_based"]
        
        for strategy in strategies:
            await manager.set_strategy(strategy)
            
            result = await manager.analyze_symptoms(
                symptoms=[{"symptom": "tos", "severity": "moderate"}],
                context="Test symptoms"
            )
            
            assert result is not None
            assert "urgency_level" in result
            assert "severity_score" in result
    
    @pytest.mark.asyncio
    async def test_end_to_end_medical_history_processing(self):
        """Test end-to-end medical history processing workflow"""
        manager = AIServiceManager()
        await manager.initialize()
        
        medical_text = "Paciente de 45 años con tos seca persistente de 2 semanas"
        
        result = await manager.process_medical_history(
            text=medical_text,
            language="es"
        )
        
        assert result is not None
        assert "symptoms" in result
        assert "age" in result
    
    @pytest.mark.asyncio
    async def test_strategy_switching_performance(self):
        """Test performance of strategy switching"""
        manager = AIServiceManager()
        await manager.initialize()
        
        strategies = ["rule_based", "local", "openai", "rule_based"]
        
        start_time = time.time()
        
        for strategy in strategies:
            await manager.set_strategy(strategy)
            await manager.analyze_symptoms(
                symptoms=[{"symptom": "tos"}],
                context="Performance test"
            )
        
        end_time = time.time()
        execution_time = end_time - start_time
        
        # Strategy switching should be reasonably fast
        assert execution_time < 5.0  # Less than 5 seconds for all strategies
    
    @pytest.mark.asyncio
    async def test_error_recovery_mechanisms(self):
        """Test error recovery mechanisms"""
        manager = AIServiceManager()
        await manager.initialize()
        
        # Test with failing strategy
        await manager.set_strategy("openai")
        
        # Mock strategy to fail
        with patch.object(manager._current_strategy, 'analyze_symptoms', side_effect=Exception("Service unavailable")):
            with pytest.raises(Exception):
                await manager.analyze_symptoms(
                    symptoms=[{"symptom": "tos"}],
                    context="Error test"
                )
        
        # Manager should still be functional
        health_status = await manager.health_check()
        assert health_status["initialized"] is True
        
        # Should be able to switch to working strategy
        await manager.set_strategy("rule_based")
        result = await manager.analyze_symptoms(
            symptoms=[{"symptom": "tos"}],
            context="Recovery test"
        )
        
        assert result is not None
