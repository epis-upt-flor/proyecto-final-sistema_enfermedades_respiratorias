"""
Unit tests for Factory Pattern implementation
"""

import pytest
from unittest.mock import patch, MagicMock

from factories.service_factory import ServiceFactory
from factories.model_factory import ModelFactory
from factories.strategy_factory import StrategyFactory
from services.symptom_analysis_service import SymptomAnalysisService
from services.medical_history_service import MedicalHistoryService
from strategies.openai_strategy import OpenAIStrategy
from strategies.local_model_strategy import LocalModelStrategy
from strategies.rule_based_strategy import RuleBasedStrategy


class TestServiceFactory:
    """Test service factory implementation"""
    
    def test_service_factory_initialization(self):
        """Test service factory initialization"""
        factory = ServiceFactory()
        assert factory is not None
    
    @pytest.mark.asyncio
    async def test_create_symptom_analysis_service(self):
        """Test creating symptom analysis service"""
        mock_ai_manager = MagicMock()
        service = await ServiceFactory.create_symptom_analysis_service(mock_ai_manager)
        
        assert service is not None
        assert isinstance(service, SymptomAnalysisService)
    
    @pytest.mark.asyncio
    async def test_create_medical_history_service(self):
        """Test creating medical history service"""
        mock_ai_manager = MagicMock()
        service = await ServiceFactory.create_medical_history_service(mock_ai_manager)
        
        assert service is not None
        assert isinstance(service, MedicalHistoryService)
    
    def test_create_service_with_invalid_manager(self):
        """Test creating service with invalid AI manager"""
        with pytest.raises(ValueError):
            ServiceFactory.create_symptom_analysis_service(None)
    
    @pytest.mark.asyncio
    async def test_create_multiple_services(self):
        """Test creating multiple service instances"""
        mock_ai_manager = MagicMock()
        
        service1 = await ServiceFactory.create_symptom_analysis_service(mock_ai_manager)
        service2 = await ServiceFactory.create_medical_history_service(mock_ai_manager)
        
        assert service1 != service2
        assert isinstance(service1, SymptomAnalysisService)
        assert isinstance(service2, MedicalHistoryService)


class TestModelFactory:
    """Test model factory implementation"""
    
    def test_model_factory_initialization(self):
        """Test model factory initialization"""
        factory = ModelFactory()
        assert factory is not None
    
    @pytest.mark.asyncio
    async def test_create_model_manager(self):
        """Test creating model manager"""
        model_manager = await ModelFactory.create_model_manager()
        
        assert model_manager is not None
        assert hasattr(model_manager, 'classify_symptoms')
        assert hasattr(model_manager, 'process_medical_history')
    
    @pytest.mark.asyncio
    async def test_create_model_manager_with_config(self):
        """Test creating model manager with configuration"""
        config = {
            "openai_api_key": "test-key",
            "model_path": "/test/models"
        }
        
        model_manager = await ModelFactory.create_model_manager(config)
        
        assert model_manager is not None
        assert hasattr(model_manager, 'classify_symptoms')
    
    @pytest.mark.asyncio
    async def test_create_multiple_model_managers(self):
        """Test creating multiple model manager instances"""
        manager1 = await ModelFactory.create_model_manager()
        manager2 = await ModelFactory.create_model_manager()
        
        # Should return different instances
        assert manager1 != manager2
    
    @pytest.mark.asyncio
    async def test_create_model_manager_error_handling(self):
        """Test model manager creation error handling"""
        invalid_config = {"invalid_key": "invalid_value"}
        
        # Should handle invalid configuration gracefully
        manager = await ModelFactory.create_model_manager(invalid_config)
        assert manager is not None


class TestStrategyFactory:
    """Test strategy factory implementation"""
    
    def test_strategy_factory_initialization(self):
        """Test strategy factory initialization"""
        factory = StrategyFactory()
        assert factory is not None
    
    def test_create_openai_strategy(self):
        """Test creating OpenAI strategy"""
        strategy = StrategyFactory.create_strategy("openai")
        
        assert strategy is not None
        assert isinstance(strategy, OpenAIStrategy)
    
    def test_create_local_model_strategy(self):
        """Test creating local model strategy"""
        strategy = StrategyFactory.create_strategy("local")
        
        assert strategy is not None
        assert isinstance(strategy, LocalModelStrategy)
    
    def test_create_rule_based_strategy(self):
        """Test creating rule-based strategy"""
        strategy = StrategyFactory.create_strategy("rule_based")
        
        assert strategy is not None
        assert isinstance(strategy, RuleBasedStrategy)
    
    def test_create_default_strategy(self):
        """Test creating default strategy"""
        strategy = StrategyFactory.create_strategy()
        
        assert strategy is not None
        # Default should be rule-based
        assert isinstance(strategy, RuleBasedStrategy)
    
    def test_create_strategy_with_invalid_type(self):
        """Test creating strategy with invalid type"""
        with pytest.raises(ValueError):
            StrategyFactory.create_strategy("invalid_strategy")
    
    def test_create_strategy_with_none_type(self):
        """Test creating strategy with None type"""
        with pytest.raises(ValueError):
            StrategyFactory.create_strategy(None)
    
    def test_create_multiple_strategies(self):
        """Test creating multiple strategy instances"""
        strategy1 = StrategyFactory.create_strategy("openai")
        strategy2 = StrategyFactory.create_strategy("local")
        strategy3 = StrategyFactory.create_strategy("rule_based")
        
        assert strategy1 != strategy2
        assert strategy2 != strategy3
        assert strategy1 != strategy3
    
    def test_get_available_strategies(self):
        """Test getting list of available strategies"""
        strategies = StrategyFactory.get_available_strategies()
        
        assert isinstance(strategies, list)
        assert "openai" in strategies
        assert "local" in strategies
        assert "rule_based" in strategies
        assert len(strategies) == 3
    
    def test_strategy_factory_singleton_behavior(self):
        """Test that factory returns consistent instances"""
        # Create same strategy multiple times
        strategy1 = StrategyFactory.create_strategy("openai")
        strategy2 = StrategyFactory.create_strategy("openai")
        
        # Should return different instances (not singleton)
        assert strategy1 != strategy2
        assert type(strategy1) == type(strategy2)


class TestFactoryIntegration:
    """Test factory pattern integration"""
    
    @pytest.mark.asyncio
    async def test_factory_integration_workflow(self):
        """Test complete factory integration workflow"""
        # Create AI manager using model factory
        ai_manager = await ModelFactory.create_model_manager()
        assert ai_manager is not None
        
        # Create service using service factory
        service = await ServiceFactory.create_symptom_analysis_service(ai_manager)
        assert service is not None
        
        # Create strategy using strategy factory
        strategy = StrategyFactory.create_strategy("rule_based")
        assert strategy is not None
        
        # All components should work together
        assert hasattr(service, 'ai_manager')
        assert service.ai_manager == ai_manager
    
    @pytest.mark.asyncio
    async def test_factory_error_propagation(self):
        """Test error propagation through factory chain"""
        # Test that errors in one factory don't break others
        try:
            invalid_strategy = StrategyFactory.create_strategy("invalid")
        except ValueError:
            pass
        
        # Other factories should still work
        ai_manager = await ModelFactory.create_model_manager()
        service = await ServiceFactory.create_symptom_analysis_service(ai_manager)
        
        assert ai_manager is not None
        assert service is not None
    
    def test_factory_configuration_consistency(self):
        """Test configuration consistency across factories"""
        # All factories should handle None configuration gracefully
        strategy = StrategyFactory.create_strategy()  # Default config
        
        # Model factory should work with empty config
        model_manager = await ModelFactory.create_model_manager({})
        
        # Service factory should work with valid AI manager
        service = await ServiceFactory.create_symptom_analysis_service(model_manager)
        
        assert strategy is not None
        assert model_manager is not None
        assert service is not None
