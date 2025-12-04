"""
Tests for api/routes/chat_analyzer.py
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from main import app


class TestChatAnalyzerEndpoints:
    """Tests for chat analyzer endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def sample_chat_message(self):
        """Sample chat message input"""
        return {
            "message": "Tengo fiebre, tos seca y dolor de garganta",
            "conversation_history": None,
            "context": {"location": "Lima, Perú"},
            "session_id": "session_123"
        }
    
    @pytest.fixture
    def sample_analysis_result(self):
        """Sample analysis result from enhanced chatbot service"""
        return {
            "success": True,
            "message": "He analizado tus síntomas. Basándome en lo que describes, podrías tener una infección respiratoria.",
            "tokenization": {
                "tokens": ["fiebre", "tos", "seca", "dolor", "garganta"],
                "token_count": 5
            },
            "symptom_extraction": {
                "symptoms": [
                    {"symptom": "fiebre", "confidence": 0.9},
                    {"symptom": "tos seca", "confidence": 0.85},
                    {"symptom": "dolor de garganta", "confidence": 0.8}
                ],
                "count": 3
            },
            "disease_classification": {
                "disease_name": "Influenza B",
                "disease_id": 42,
                "confidence": 0.75,
                "urgency": "media",
                "severity": "moderada",
                "matched_symptoms": ["fiebre", "tos seca", "dolor de garganta"]
            },
            "analysis": {
                "detected_symptoms": ["fiebre", "tos seca", "dolor de garganta"],
                "possible_disease": "Influenza B",
                "urgency_level": "media",
                "severity": "moderada",
                "confidence": 0.75
            }
        }
    
    def test_test_route(self, client):
        """Test the test endpoint"""
        response = client.get("/v1/test")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "Chat analyzer router is working" in data["message"]
        assert data["service"] == "enhanced_chatbot"
    
    def test_analyze_message_success(self, client, sample_chat_message, sample_analysis_result):
        """Test successful message analysis"""
        with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.process_user_message = AsyncMock(return_value=sample_analysis_result)
            mock_service_class.return_value = mock_service
            
            response = client.post("/v1/analyze", json=sample_chat_message)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "message" in data
            assert data["urgency_level"] == "media"
            assert data["symptom_count"] == 3
            assert data["needs_medical_attention"] is True
            assert "timestamp" in data
            assert "analysis" in data
    
    def test_analyze_message_missing_message(self, client):
        """Test message analysis with missing message"""
        request_data = {
            "conversation_history": None
        }
        
        response = client.post("/v1/analyze", json=request_data)
        
        # Should return validation error
        assert response.status_code == 422
    
    def test_analyze_message_empty_message(self, client):
        """Test message analysis with empty message"""
        request_data = {
            "message": ""
        }
        
        response = client.post("/v1/analyze", json=request_data)
        
        # Should return validation error (min_length=1)
        assert response.status_code == 422
    
    def test_analyze_message_with_conversation_history(self, client, sample_analysis_result):
        """Test message analysis with conversation history"""
        with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.process_user_message = AsyncMock(return_value=sample_analysis_result)
            mock_service_class.return_value = mock_service
            
            request_data = {
                "message": "¿Qué más debo hacer?",
                "conversation_history": [
                    {"role": "user", "content": "Tengo fiebre"},
                    {"role": "assistant", "content": "He analizado tus síntomas..."}
                ],
                "session_id": "session_123"
            }
            
            response = client.post("/v1/analyze", json=request_data)
            
            assert response.status_code == 200
            # Verify conversation history was passed
            call_args = mock_service.process_user_message.call_args
            assert call_args[1]["conversation_history"] is not None
    
    def test_analyze_message_with_context(self, client, sample_analysis_result):
        """Test message analysis with context"""
        with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.process_user_message = AsyncMock(return_value=sample_analysis_result)
            mock_service_class.return_value = mock_service
            
            request_data = {
                "message": "Tengo síntomas",
                "context": {
                    "age": 45,
                    "gender": "M",
                    "location": "Lima"
                }
            }
            
            response = client.post("/v1/analyze", json=request_data)
            
            assert response.status_code == 200
            # Verify context was passed
            call_args = mock_service.process_user_message.call_args
            assert call_args[1]["context"] is not None
    
    def test_analyze_message_service_initialization_error(self, client, sample_chat_message):
        """Test message analysis when service initialization fails"""
        with patch('api.routes.chat_analyzer.EnhancedChatbotService', side_effect=Exception("Init error")):
            response = client.post("/v1/analyze", json=sample_chat_message)
            
            assert response.status_code == 500
            assert "initialization" in response.json()["detail"].lower() or "error" in response.json()["detail"].lower()
    
    def test_analyze_message_processing_error(self, client, sample_chat_message):
        """Test message analysis when processing fails"""
        with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.process_user_message = AsyncMock(side_effect=Exception("Processing error"))
            mock_service_class.return_value = mock_service
            
            response = client.post("/v1/analyze", json=sample_chat_message)
            
            assert response.status_code == 500
            assert "error" in response.json()["detail"].lower()
    
    def test_analyze_message_urgency_levels(self, client, sample_chat_message):
        """Test message analysis with different urgency levels"""
        urgency_levels = ["critica", "alta", "media", "baja"]
        
        for urgency in urgency_levels:
            analysis_result = {
                "success": True,
                "message": "Test message",
                "disease_classification": {
                    "urgency": urgency,
                    "severity": "moderada"
                },
                "analysis": {
                    "urgency_level": urgency
                },
                "symptom_extraction": {
                    "symptoms": [],
                    "count": 0
                }
            }
            
            with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
                mock_service = MagicMock()
                mock_service.process_user_message = AsyncMock(return_value=analysis_result)
                mock_service_class.return_value = mock_service
                
                response = client.post("/v1/analyze", json=sample_chat_message)
                
                assert response.status_code == 200
                data = response.json()
                assert data["urgency_level"] == urgency
                assert data["needs_medical_attention"] == (urgency in ["critica", "alta", "media"])
    
    def test_analyze_message_symptom_categories(self, client, sample_chat_message):
        """Test message analysis with symptom categories"""
        analysis_result = {
            "success": True,
            "message": "Test message",
            "disease_classification": {
                "urgency": "media",
                "top_3_diseases": [
                    {"name": "Influenza B", "id": 1},
                    {"name": "Resfriado común", "id": 2}
                ]
            },
            "analysis": {},
            "symptom_extraction": {
                "symptoms": [],
                "count": 2
            }
        }
        
        with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.process_user_message = AsyncMock(return_value=analysis_result)
            mock_service_class.return_value = mock_service
            
            response = client.post("/v1/analyze", json=sample_chat_message)
            
            assert response.status_code == 200
            data = response.json()
            assert "symptom_categories" in data
            assert isinstance(data["symptom_categories"], list)
    
    def test_analyze_message_response_structure(self, client, sample_chat_message, sample_analysis_result):
        """Test message analysis response structure"""
        with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.process_user_message = AsyncMock(return_value=sample_analysis_result)
            mock_service_class.return_value = mock_service
            
            response = client.post("/v1/analyze", json=sample_chat_message)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify all required fields
            assert "success" in data
            assert "message" in data
            assert "urgency_level" in data
            assert "symptom_count" in data
            assert "symptom_categories" in data
            assert "needs_medical_attention" in data
            assert "analysis" in data
            assert "timestamp" in data
    
    def test_analyze_message_greeting(self, client):
        """Test message analysis with greeting"""
        greeting_result = {
            "success": True,
            "message": "¡Hola! ¿Cómo puedo ayudarte?",
            "analysis": {
                "message_type": "greeting",
                "needs_followup": True
            },
            "symptom_extraction": {
                "symptoms": [],
                "count": 0
            },
            "disease_classification": {
                "urgency": "baja"
            }
        }
        
        with patch('api.routes.chat_analyzer.EnhancedChatbotService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.process_user_message = AsyncMock(return_value=greeting_result)
            mock_service_class.return_value = mock_service
            
            request_data = {
                "message": "Hola"
            }
            
            response = client.post("/v1/analyze", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "Hola" in data["message"] or "hola" in data["message"].lower()

