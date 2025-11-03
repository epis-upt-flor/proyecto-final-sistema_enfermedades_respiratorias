"""
Pytest configuration and shared fixtures for AI Services tests
"""

import asyncio
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock
from typing import AsyncGenerator, Generator
import os
import tempfile
import json

# Set test environment variables
os.environ["TESTING"] = "true"
os.environ["LOG_LEVEL"] = "DEBUG"
os.environ["CACHE_ENABLED"] = "false"
os.environ["CIRCUIT_BREAKER_ENABLED"] = "false"

from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
from redis import Redis
import fakeredis
import mongomock

from main import app
from core.config import settings
from core.database import get_database, get_cache
from core.pattern_config import PatternConfig


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_db():
    """Mock MongoDB database for testing"""
    client = mongomock.MongoClient()
    db = client.respicare_test
    return db


@pytest.fixture
def test_redis():
    """Mock Redis cache for testing"""
    return fakeredis.FakeRedis()


@pytest.fixture
async def mock_database(test_db):
    """Async mock database dependency"""
    async def get_test_database():
        return test_db
    return get_test_database


@pytest.fixture
async def mock_cache(test_redis):
    """Async mock cache dependency"""
    async def get_test_cache():
        return test_redis
    return get_test_cache


@pytest.fixture
def client(mock_database, mock_cache):
    """Test client with mocked dependencies"""
    app.dependency_overrides[get_database] = mock_database
    app.dependency_overrides[get_cache] = mock_cache
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_medical_history():
    """Sample medical history data for testing"""
    return {
        "patient_id": "P001",
        "text": "Paciente de 45 años con tos seca persistente de 2 semanas, dificultad respiratoria leve, fiebre intermitente de 38°C. Antecedentes de tabaquismo por 20 años. No alergias conocidas.",
        "language": "es",
        "metadata": {
            "source": "emergency_room",
            "doctor": "Dr. García",
            "age": 45,
            "gender": "M"
        }
    }


@pytest.fixture
def sample_symptoms():
    """Sample symptoms data for testing"""
    return {
        "patient_id": "P001",
        "symptoms": [
            {"symptom": "tos seca", "severity": "moderate", "duration": "2 semanas"},
            {"symptom": "dificultad respiratoria", "severity": "mild", "duration": "1 semana"},
            {"symptom": "fiebre", "severity": "moderate", "duration": "3 días"}
        ],
        "context": "Síntomas respiratorios persistentes con antecedentes de tabaquismo",
        "metadata": {
            "age": 45,
            "gender": "M",
            "diabetes": False,
            "hypertension": True
        }
    }


@pytest.fixture
def mock_openai_response():
    """Mock OpenAI API response"""
    return {
        "choices": [
            {
                "message": {
                    "content": json.dumps({
                        "symptoms": ["tos seca", "dificultad respiratoria"],
                        "urgency_level": "moderate",
                        "severity_score": 0.7,
                        "recommendations": ["Consulta médica", "Reposo"],
                        "confidence_score": 0.85
                    })
                }
            }
        ]
    }


@pytest.fixture
def mock_model_manager():
    """Mock model manager for testing"""
    mock = AsyncMock()
    mock.classify_symptoms.return_value = {
        "respiratory": 0.8,
        "general": 0.2
    }
    mock.process_medical_history.return_value = {
        "symptoms": ["tos", "fiebre"],
        "age": 45,
        "gender": "M",
        "diagnosis_suggestions": ["Bronquitis", "Neumonía"]
    }
    return mock


@pytest.fixture
def pattern_config():
    """Pattern configuration for testing"""
    return PatternConfig(
        strategy_default="rule_based",
        circuit_breaker_enabled=False,
        cache_enabled=False,
        retry_enabled=False,
        logging_enabled=False,
        metrics_enabled=False,
        audit_logging_enabled=False
    )


@pytest.fixture
def temp_file():
    """Temporary file for testing file operations"""
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
        yield f.name
    os.unlink(f.name)


# Pytest markers
def pytest_configure(config):
    """Configure pytest markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "ai: mark test as AI/ML specific"
    )
