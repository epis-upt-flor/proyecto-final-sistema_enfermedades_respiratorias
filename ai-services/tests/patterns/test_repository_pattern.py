"""
Unit tests for Repository Pattern implementation
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from typing import Dict, Any

from repositories.base_repository import BaseRepository
from repositories.medical_history_repository import MedicalHistoryRepository
from repositories.ai_result_repository import AIResultRepository
from repositories.patient_repository import PatientRepository


class TestBaseRepository:
    """Test base repository implementation"""
    
    @pytest.fixture
    def mock_database(self):
        """Create mock database"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.get_collection.return_value = mock_collection
        return mock_db
    
    @pytest.fixture
    def base_repository(self, mock_database):
        """Create base repository instance"""
        return BaseRepository(mock_database, "test_collection")
    
    def test_base_repository_initialization(self, base_repository):
        """Test base repository initialization"""
        assert base_repository.database is not None
        assert base_repository.collection_name == "test_collection"
    
    @pytest.mark.asyncio
    async def test_create_document(self, base_repository):
        """Test creating a document"""
        document = {"name": "test", "value": 123}
        
        mock_result = AsyncMock()
        mock_result.inserted_id = "test_id"
        base_repository.collection.insert_one.return_value = mock_result
        
        result = await base_repository.create(document)
        
        assert result == "test_id"
        base_repository.collection.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_find_by_id(self, base_repository):
        """Test finding document by ID"""
        document = {"_id": "test_id", "name": "test"}
        base_repository.collection.find_one.return_value = document
        
        result = await base_repository.find_by_id("test_id")
        
        assert result == document
        base_repository.collection.find_one.assert_called_once_with({"_id": "test_id"})
    
    @pytest.mark.asyncio
    async def test_find_all(self, base_repository):
        """Test finding all documents"""
        documents = [
            {"_id": "id1", "name": "test1"},
            {"_id": "id2", "name": "test2"}
        ]
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = documents
        base_repository.collection.find.return_value = mock_cursor
        
        result = await base_repository.find_all()
        
        assert result == documents
        base_repository.collection.find.assert_called_once_with({})
    
    @pytest.mark.asyncio
    async def test_update_document(self, base_repository):
        """Test updating a document"""
        update_data = {"name": "updated", "modified_at": datetime.utcnow()}
        
        mock_result = AsyncMock()
        mock_result.modified_count = 1
        base_repository.collection.update_one.return_value = mock_result
        
        result = await base_repository.update("test_id", update_data)
        
        assert result is True
        base_repository.collection.update_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_soft_delete(self, base_repository):
        """Test soft delete functionality"""
        mock_result = AsyncMock()
        mock_result.modified_count = 1
        base_repository.collection.update_one.return_value = mock_result
        
        result = await base_repository.soft_delete("test_id")
        
        assert result is True
        # Verify soft delete sets deleted flag and timestamp
        call_args = base_repository.collection.update_one.call_args
        assert call_args[0][0] == {"_id": "test_id"}
        update_data = call_args[0][1]
        assert "$set" in update_data
        assert "deleted" in update_data["$set"]
        assert "deleted_at" in update_data["$set"]
        assert update_data["$set"]["deleted"] is True
    
    @pytest.mark.asyncio
    async def test_audit_log_creation(self, base_repository):
        """Test audit log creation"""
        document = {"name": "test", "value": 123}
        operation = "create"
        
        await base_repository.create_with_audit(document, operation, "user123")
        
        # Verify audit log was created
        base_repository.collection.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_versioning_support(self, base_repository):
        """Test document versioning"""
        document = {"name": "test", "version": 1}
        
        await base_repository.create_with_versioning(document)
        
        # Verify versioning fields were added
        call_args = base_repository.collection.insert_one.call_args
        inserted_doc = call_args[0][0]
        assert "version" in inserted_doc
        assert "created_at" in inserted_doc
        assert "updated_at" in inserted_doc


class TestMedicalHistoryRepository:
    """Test medical history repository implementation"""
    
    @pytest.fixture
    def mock_database(self):
        """Create mock database"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.get_collection.return_value = mock_collection
        return mock_db
    
    @pytest.fixture
    def medical_history_repo(self, mock_database):
        """Create medical history repository instance"""
        return MedicalHistoryRepository(mock_database)
    
    @pytest.mark.asyncio
    async def test_create_medical_history(self, medical_history_repo):
        """Test creating medical history"""
        medical_data = {
            "patient_id": "P001",
            "text": "Test medical history",
            "symptoms": ["tos", "fiebre"],
            "doctor_id": "D001"
        }
        
        mock_result = AsyncMock()
        mock_result.inserted_id = "history_id"
        medical_history_repo.collection.insert_one.return_value = mock_result
        
        result = await medical_history_repo.create_medical_history(medical_data)
        
        assert result == "history_id"
        medical_history_repo.collection.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_find_by_patient_id(self, medical_history_repo):
        """Test finding medical histories by patient ID"""
        patient_id = "P001"
        histories = [
            {"_id": "h1", "patient_id": patient_id, "text": "History 1"},
            {"_id": "h2", "patient_id": patient_id, "text": "History 2"}
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = histories
        medical_history_repo.collection.find.return_value = mock_cursor
        
        result = await medical_history_repo.find_by_patient_id(patient_id)
        
        assert result == histories
        medical_history_repo.collection.find.assert_called_once_with(
            {"patient_id": patient_id, "deleted": {"$ne": True}}
        )
    
    @pytest.mark.asyncio
    async def test_search_histories(self, medical_history_repo):
        """Test searching medical histories"""
        search_criteria = {
            "patient_id": "P001",
            "date_from": datetime(2024, 1, 1),
            "date_to": datetime(2024, 12, 31),
            "symptoms": ["tos"]
        }
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = []
        medical_history_repo.collection.find.return_value = mock_cursor
        
        result = await medical_history_repo.search_histories(search_criteria)
        
        assert result == []
        medical_history_repo.collection.find.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_patient_statistics(self, medical_history_repo):
        """Test getting patient statistics"""
        patient_id = "P001"
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = [
            {"_id": "h1", "symptoms": ["tos", "fiebre"]},
            {"_id": "h2", "symptoms": ["tos"]}
        ]
        medical_history_repo.collection.find.return_value = mock_cursor
        
        result = await medical_history_repo.get_patient_statistics(patient_id)
        
        assert "total_histories" in result
        assert "common_symptoms" in result
        assert result["total_histories"] == 2
    
    @pytest.mark.asyncio
    async def test_update_medical_history(self, medical_history_repo):
        """Test updating medical history"""
        history_id = "h1"
        update_data = {
            "text": "Updated medical history",
            "updated_at": datetime.utcnow()
        }
        
        mock_result = AsyncMock()
        mock_result.modified_count = 1
        medical_history_repo.collection.update_one.return_value = mock_result
        
        result = await medical_history_repo.update_medical_history(history_id, update_data)
        
        assert result is True
        medical_history_repo.collection.update_one.assert_called_once()


class TestAIResultRepository:
    """Test AI result repository implementation"""
    
    @pytest.fixture
    def mock_database(self):
        """Create mock database"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.get_collection.return_value = mock_collection
        return mock_db
    
    @pytest.fixture
    def ai_result_repo(self, mock_database):
        """Create AI result repository instance"""
        return AIResultRepository(mock_database)
    
    @pytest.mark.asyncio
    async def test_save_analysis_result(self, ai_result_repo):
        """Test saving AI analysis result"""
        analysis_data = {
            "patient_id": "P001",
            "analysis_type": "symptom_analysis",
            "result": {"urgency": "high", "confidence": 0.9},
            "model_used": "gpt-3.5-turbo",
            "processing_time": 1.5
        }
        
        mock_result = AsyncMock()
        mock_result.inserted_id = "result_id"
        ai_result_repo.collection.insert_one.return_value = mock_result
        
        result = await ai_result_repo.save_analysis_result(analysis_data)
        
        assert result == "result_id"
        ai_result_repo.collection.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_find_results_by_patient(self, ai_result_repo):
        """Test finding AI results by patient"""
        patient_id = "P001"
        analysis_type = "symptom_analysis"
        
        results = [
            {"_id": "r1", "patient_id": patient_id, "analysis_type": analysis_type},
            {"_id": "r2", "patient_id": patient_id, "analysis_type": analysis_type}
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = results
        ai_result_repo.collection.find.return_value = mock_cursor
        
        result = await ai_result_repo.find_results_by_patient(patient_id, analysis_type)
        
        assert result == results
        ai_result_repo.collection.find.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_analysis_trends(self, ai_result_repo):
        """Test getting analysis trends"""
        patient_id = "P001"
        period_days = 30
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = [
            {"date": "2024-01-01", "urgency": "high", "confidence": 0.9},
            {"date": "2024-01-02", "urgency": "medium", "confidence": 0.8}
        ]
        ai_result_repo.collection.find.return_value = mock_cursor
        
        result = await ai_result_repo.get_analysis_trends(patient_id, period_days)
        
        assert isinstance(result, list)
        assert len(result) == 2
    
    @pytest.mark.asyncio
    async def test_get_model_performance_metrics(self, ai_result_repo):
        """Test getting model performance metrics"""
        model_name = "gpt-3.5-turbo"
        period_days = 7
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = [
            {"processing_time": 1.5, "confidence": 0.9},
            {"processing_time": 1.2, "confidence": 0.8}
        ]
        ai_result_repo.collection.find.return_value = mock_cursor
        
        result = await ai_result_repo.get_model_performance_metrics(model_name, period_days)
        
        assert "avg_processing_time" in result
        assert "avg_confidence" in result
        assert "total_analyses" in result


class TestPatientRepository:
    """Test patient repository implementation"""
    
    @pytest.fixture
    def mock_database(self):
        """Create mock database"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.get_collection.return_value = mock_collection
        return mock_db
    
    @pytest.fixture
    def patient_repo(self, mock_database):
        """Create patient repository instance"""
        return PatientRepository(mock_database)
    
    @pytest.mark.asyncio
    async def test_create_patient(self, patient_repo):
        """Test creating a patient"""
        patient_data = {
            "patient_id": "P001",
            "name": "Juan Pérez",
            "age": 45,
            "gender": "M",
            "contact_info": {"email": "juan@example.com"}
        }
        
        mock_result = AsyncMock()
        mock_result.inserted_id = "patient_id"
        patient_repo.collection.insert_one.return_value = mock_result
        
        result = await patient_repo.create_patient(patient_data)
        
        assert result == "patient_id"
        patient_repo.collection.insert_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_find_patient_by_id(self, patient_repo):
        """Test finding patient by ID"""
        patient_id = "P001"
        patient_data = {
            "_id": patient_id,
            "name": "Juan Pérez",
            "age": 45,
            "gender": "M"
        }
        
        patient_repo.collection.find_one.return_value = patient_data
        
        result = await patient_repo.find_patient_by_id(patient_id)
        
        assert result == patient_data
        patient_repo.collection.find_one.assert_called_once_with(
            {"_id": patient_id, "deleted": {"$ne": True}}
        )
    
    @pytest.mark.asyncio
    async def test_search_patients(self, patient_repo):
        """Test searching patients"""
        search_criteria = {
            "age_range": {"min": 30, "max": 50},
            "gender": "M"
        }
        
        patients = [
            {"_id": "P001", "name": "Juan Pérez", "age": 45, "gender": "M"},
            {"_id": "P002", "name": "Carlos López", "age": 35, "gender": "M"}
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list.return_value = patients
        patient_repo.collection.find.return_value = mock_cursor
        
        result = await patient_repo.search_patients(search_criteria)
        
        assert result == patients
        patient_repo.collection.find.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_update_patient_info(self, patient_repo):
        """Test updating patient information"""
        patient_id = "P001"
        update_data = {
            "age": 46,
            "updated_at": datetime.utcnow()
        }
        
        mock_result = AsyncMock()
        mock_result.modified_count = 1
        patient_repo.collection.update_one.return_value = mock_result
        
        result = await patient_repo.update_patient_info(patient_id, update_data)
        
        assert result is True
        patient_repo.collection.update_one.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_patient_risk_factors(self, patient_repo):
        """Test getting patient risk factors"""
        patient_id = "P001"
        
        patient_data = {
            "_id": patient_id,
            "risk_factors": ["diabetes", "hypertension", "smoking"]
        }
        
        patient_repo.collection.find_one.return_value = patient_data
        
        result = await patient_repo.get_patient_risk_factors(patient_id)
        
        assert result == ["diabetes", "hypertension", "smoking"]
        patient_repo.collection.find_one.assert_called_once()


class TestRepositoryIntegration:
    """Test repository pattern integration"""
    
    @pytest.mark.asyncio
    async def test_repository_transaction_support(self):
        """Test repository transaction support"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.get_collection.return_value = mock_collection
        
        # Create multiple repositories
        medical_repo = MedicalHistoryRepository(mock_db)
        ai_repo = AIResultRepository(mock_db)
        patient_repo = PatientRepository(mock_db)
        
        # Test that all repositories use the same database
        assert medical_repo.database == mock_db
        assert ai_repo.database == mock_db
        assert patient_repo.database == mock_db
    
    @pytest.mark.asyncio
    async def test_repository_audit_trail_consistency(self):
        """Test audit trail consistency across repositories"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.get_collection.return_value = mock_collection
        
        repo = BaseRepository(mock_db, "test_collection")
        
        # Test audit log creation
        document = {"test": "data"}
        await repo.create_with_audit(document, "create", "user123")
        
        # Verify audit log was created with proper structure
        call_args = mock_collection.insert_one.call_args
        inserted_doc = call_args[0][0]
        assert "audit_log" in inserted_doc
        assert inserted_doc["audit_log"]["operation"] == "create"
        assert inserted_doc["audit_log"]["user_id"] == "user123"
    
    @pytest.mark.asyncio
    async def test_repository_soft_delete_consistency(self):
        """Test soft delete consistency across repositories"""
        mock_db = AsyncMock()
        mock_collection = AsyncMock()
        mock_db.get_collection.return_value = mock_collection
        
        repo = BaseRepository(mock_db, "test_collection")
        
        # Test soft delete
        mock_result = AsyncMock()
        mock_result.modified_count = 1
        mock_collection.update_one.return_value = mock_result
        
        result = await repo.soft_delete("test_id")
        
        assert result is True
        
        # Verify soft delete fields were set
        call_args = mock_collection.update_one.call_args
        update_data = call_args[0][1]
        assert update_data["$set"]["deleted"] is True
        assert "deleted_at" in update_data["$set"]
