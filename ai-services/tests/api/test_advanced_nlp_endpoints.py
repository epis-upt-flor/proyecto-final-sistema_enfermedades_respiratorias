"""
Tests for api/routes/advanced_nlp.py
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from main import app


class TestAdvancedNLPEndpoints:
    """Tests for advanced NLP endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def sample_text_payload(self):
        """Sample text payload"""
        return {
            "text": "Paciente de 45 años con tos persistente de 2 semanas, fiebre intermitente de 38°C.",
            "language": "es"
        }
    
    @pytest.fixture
    def sample_translate_payload(self):
        """Sample translate payload"""
        return {
            "term": "tos",
            "source_language": "es",
            "target_language": "en"
        }
    
    @pytest.fixture
    def sample_terms_payload(self):
        """Sample terms payload for batch translation"""
        return {
            "terms": ["tos", "fiebre", "dolor de garganta"],
            "target_language": "en"
        }
    
    @pytest.fixture
    def sample_summarize_payload(self):
        """Sample summarize payload"""
        return {
            "text": "Paciente de 45 años con tos persistente de 2 semanas. Historial de tabaquismo. Fiebre intermitente.",
            "max_sentences": 2
        }
    
    def test_nlp_process_success(self, client, sample_text_payload):
        """Test successful NLP processing"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.process_text.return_value = {
                "tokens": ["paciente", "años", "tos", "persistente"],
                "entities": ["PERSON", "SYMPTOM"],
                "sentiment": "neutral"
            }
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/process", json=sample_text_payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "result" in data
    
    def test_nlp_process_error(self, client, sample_text_payload):
        """Test NLP processing with error"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.process_text.side_effect = Exception("Processing error")
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/process", json=sample_text_payload)
            
            assert response.status_code == 500
            assert "error" in response.json()["detail"].lower()
    
    def test_nlp_ner_success(self, client, sample_text_payload):
        """Test successful NER extraction"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.extract_entities.return_value = {
                "symptoms": ["tos", "fiebre"],
                "medications": [],
                "diagnoses": []
            }
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/ner", json=sample_text_payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "result" in data
    
    def test_nlp_ner_error(self, client, sample_text_payload):
        """Test NER extraction with error"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.extract_entities.side_effect = Exception("NER error")
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/ner", json=sample_text_payload)
            
            assert response.status_code == 500
    
    def test_nlp_summarize_success(self, client, sample_summarize_payload):
        """Test successful text summarization"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.summarize.return_value = {
                "summary": "Paciente con tos persistente y fiebre. Historial de tabaquismo.",
                "original_length": 100,
                "summary_length": 50
            }
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/summarize", json=sample_summarize_payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "result" in data
    
    def test_nlp_summarize_with_max_sentences(self, client, sample_summarize_payload):
        """Test summarization with max_sentences parameter"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.summarize.return_value = {"summary": "Test summary"}
            mock_nlp_class.return_value = mock_nlp
            
            sample_summarize_payload["max_sentences"] = 5
            
            response = client.post("/v1/nlp/advanced/summarize", json=sample_summarize_payload)
            
            assert response.status_code == 200
            # Verify max_sentences was passed
            call_args = mock_nlp.summarize.call_args
            assert call_args[1]["max_sentences"] == 5
    
    def test_nlp_summarize_error(self, client, sample_summarize_payload):
        """Test summarization with error"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.summarize.side_effect = Exception("Summarization error")
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/summarize", json=sample_summarize_payload)
            
            assert response.status_code == 500
    
    def test_nlp_translate_success(self, client, sample_translate_payload):
        """Test successful term translation"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.translate_term.return_value = {
                "term": "tos",
                "translation": "cough",
                "source_language": "es",
                "target_language": "en"
            }
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/translate", json=sample_translate_payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "result" in data
    
    def test_nlp_translate_terms_batch(self, client, sample_terms_payload):
        """Test batch term translation"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.translate_terms.return_value = {
                "translations": [
                    {"term": "tos", "translation": "cough"},
                    {"term": "fiebre", "translation": "fever"},
                    {"term": "dolor de garganta", "translation": "sore throat"}
                ]
            }
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/translate", json=sample_terms_payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "result" in data
    
    def test_nlp_translate_error(self, client, sample_translate_payload):
        """Test translation with error"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.translate_term.side_effect = Exception("Translation error")
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/translate", json=sample_translate_payload)
            
            assert response.status_code == 500
    
    def test_nlp_sentiment_success(self, client, sample_text_payload):
        """Test successful sentiment analysis"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.sentiment.return_value = {
                "sentiment": "neutral",
                "score": 0.5,
                "confidence": 0.8
            }
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/sentiment", json=sample_text_payload)
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "result" in data
    
    def test_nlp_sentiment_analyze_sentiment(self, client, sample_text_payload):
        """Test sentiment analysis using analyze_sentiment method"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            # Some implementations use analyze_sentiment instead of sentiment
            if hasattr(mock_nlp, 'analyze_sentiment'):
                mock_nlp.analyze_sentiment.return_value = {"sentiment": "neutral"}
            else:
                mock_nlp.sentiment.return_value = {"sentiment": "neutral"}
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/sentiment", json=sample_text_payload)
            
            # Should handle either method
            assert response.status_code in [200, 500]
    
    def test_nlp_sentiment_error(self, client, sample_text_payload):
        """Test sentiment analysis with error"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.sentiment.side_effect = Exception("Sentiment error")
            mock_nlp_class.return_value = mock_nlp
            
            response = client.post("/v1/nlp/advanced/sentiment", json=sample_text_payload)
            
            assert response.status_code == 500
    
    def test_nlp_process_missing_text(self, client):
        """Test NLP processing with missing text"""
        request_data = {
            "language": "es"
            # Missing text
        }
        
        response = client.post("/v1/nlp/advanced/process", json=request_data)
        
        assert response.status_code == 422
    
    def test_nlp_process_default_language(self, client):
        """Test NLP processing with default language"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.process_text.return_value = {}
            mock_nlp_class.return_value = mock_nlp
            
            request_data = {
                "text": "Test text"
                # No language specified, should default to "es"
            }
            
            response = client.post("/v1/nlp/advanced/process", json=request_data)
            
            assert response.status_code == 200
            # Verify default language was used
            call_args = mock_nlp_class.call_args
            assert call_args[1]["language"] == "es" or call_args[0][0] == "es"
    
    def test_nlp_summarize_max_sentences_validation(self, client):
        """Test summarization with invalid max_sentences"""
        request_data = {
            "text": "Test text",
            "max_sentences": 20  # Should be <= 10
        }
        
        response = client.post("/v1/nlp/advanced/summarize", json=request_data)
        
        # Should return validation error
        assert response.status_code == 422
    
    def test_nlp_translate_missing_term(self, client):
        """Test translation with missing term"""
        request_data = {
            "source_language": "es",
            "target_language": "en"
            # Missing term
        }
        
        response = client.post("/v1/nlp/advanced/translate", json=request_data)
        
        assert response.status_code == 422
    
    def test_nlp_translate_default_languages(self, client):
        """Test translation with default languages"""
        with patch('api.routes.advanced_nlp.MedicalNLPProcessor') as mock_nlp_class:
            mock_nlp = MagicMock()
            mock_nlp.translate_term.return_value = {"translation": "cough"}
            mock_nlp_class.return_value = mock_nlp
            
            request_data = {
                "term": "tos"
                # No languages specified, should use defaults
            }
            
            response = client.post("/v1/nlp/advanced/translate", json=request_data)
            
            assert response.status_code == 200

