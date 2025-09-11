"""
AI Model Manager for loading and managing ML models
"""

import os
import structlog
from typing import Dict, Any, Optional
import asyncio
from pathlib import Path

from core.config import settings

logger = structlog.get_logger()


class ModelManager:
    """Manages AI model loading and inference"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.model_path = Path(settings.MODEL_PATH)
        self.model_path.mkdir(parents=True, exist_ok=True)
        
    async def load_models(self):
        """Load all required models"""
        logger.info("Loading AI models...")
        
        # Load medical text processing model
        await self._load_medical_model()
        
        # Load symptom classification model
        await self._load_symptom_model()
        
        # Load medical history processor
        await self._load_history_model()
        
        logger.info("All models loaded successfully")
    
    async def _load_medical_model(self):
        """Load medical text processing model (SciSpacy)"""
        try:
            import spacy
            from spacy import displacy
            
            # Try to load the medical model
            try:
                nlp = spacy.load(settings.MEDICAL_MODEL_NAME)
            except OSError:
                logger.warning(f"Medical model {settings.MEDICAL_MODEL_NAME} not found, downloading...")
                # Download the model
                os.system(f"python -m spacy download {settings.MEDICAL_MODEL_NAME}")
                nlp = spacy.load(settings.MEDICAL_MODEL_NAME)
            
            self.models["medical_nlp"] = nlp
            logger.info("Medical NLP model loaded")
            
        except Exception as e:
            logger.error("Failed to load medical model", error=str(e))
            # Fallback to basic English model
            import spacy
            self.models["medical_nlp"] = spacy.load("en_core_web_sm")
    
    async def _load_symptom_model(self):
        """Load symptom classification model"""
        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            import torch
            
            model_name = "microsoft/DialoGPT-medium"  # Placeholder for now
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSequenceClassification.from_pretrained(
                model_name,
                num_labels=10  # Number of symptom categories
            )
            
            self.models["symptom_tokenizer"] = tokenizer
            self.models["symptom_model"] = model
            logger.info("Symptom classification model loaded")
            
        except Exception as e:
            logger.error("Failed to load symptom model", error=str(e))
            # Use a simple rule-based approach as fallback
            self.models["symptom_model"] = "rule_based"
    
    async def _load_history_model(self):
        """Load medical history processing model"""
        try:
            # For now, use OpenAI API for medical history processing
            import openai
            openai.api_key = settings.OPENAI_API_KEY
            
            self.models["openai_client"] = openai
            logger.info("Medical history processing model loaded")
            
        except Exception as e:
            logger.error("Failed to load history model", error=str(e))
            self.models["openai_client"] = None
    
    def get_model(self, model_name: str) -> Optional[Any]:
        """Get a loaded model by name"""
        return self.models.get(model_name)
    
    async def process_medical_text(self, text: str) -> Dict[str, Any]:
        """Process medical text using loaded models"""
        try:
            nlp = self.get_model("medical_nlp")
            if not nlp:
                return {"error": "Medical NLP model not available"}
            
            # Process text
            doc = nlp(text)
            
            # Extract entities
            entities = []
            for ent in doc.ents:
                entities.append({
                    "text": ent.text,
                    "label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "confidence": 0.8  # Placeholder confidence
                })
            
            # Extract symptoms (simple keyword matching for now)
            symptoms = self._extract_symptoms(text)
            
            return {
                "entities": entities,
                "symptoms": symptoms,
                "processed_text": text,
                "confidence": 0.85
            }
            
        except Exception as e:
            logger.error("Error processing medical text", error=str(e))
            return {"error": str(e)}
    
    def _extract_symptoms(self, text: str) -> list:
        """Extract symptoms from text using keyword matching"""
        symptom_keywords = {
            "respiratory": ["tos", "tos seca", "tos con flema", "dificultad respiratoria", 
                          "falta de aire", "sibilancias", "opresión en el pecho"],
            "fever": ["fiebre", "temperatura alta", "escalofríos", "malestar general"],
            "pain": ["dolor de cabeza", "dolor de garganta", "dolor muscular", "dolor articular"],
            "digestive": ["náuseas", "vómitos", "diarrea", "dolor abdominal"],
            "fatigue": ["cansancio", "fatiga", "debilidad", "agotamiento"]
        }
        
        found_symptoms = []
        text_lower = text.lower()
        
        for category, keywords in symptom_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    found_symptoms.append({
                        "symptom": keyword,
                        "category": category,
                        "confidence": 0.7
                    })
        
        return found_symptoms
    
    async def classify_symptoms(self, symptoms: list) -> Dict[str, Any]:
        """Classify symptoms and provide recommendations"""
        try:
            # Simple rule-based classification for now
            severity_scores = {
                "respiratory": 0.8,
                "fever": 0.7,
                "pain": 0.5,
                "digestive": 0.4,
                "fatigue": 0.3
            }
            
            categories = [s.get("category", "unknown") for s in symptoms]
            max_severity = max([severity_scores.get(cat, 0.1) for cat in categories], default=0.1)
            
            # Determine urgency level
            if max_severity >= 0.8:
                urgency = "high"
                recommendation = "Se recomienda consulta médica inmediata"
            elif max_severity >= 0.6:
                urgency = "medium"
                recommendation = "Se recomienda consulta médica en las próximas 24 horas"
            else:
                urgency = "low"
                recommendation = "Monitorear síntomas y consultar si empeoran"
            
            return {
                "urgency": urgency,
                "severity_score": max_severity,
                "recommendation": recommendation,
                "categories": list(set(categories)),
                "confidence": 0.8
            }
            
        except Exception as e:
            logger.error("Error classifying symptoms", error=str(e))
            return {"error": str(e)}


# Global model manager instance
model_manager = ModelManager()
