"""
MedicalBERTModel - Stub de modelo Transformer (BERT) para texto médico.

Nota: Este archivo define una interfaz estable para integraciones futuras.
Las dependencias pesadas (transformers/torch) no son obligatorias en este stub.
"""
from typing import List, Dict, Any, Optional
import os
import structlog
from .model_cache import get_model_cache
from .lazy_loader import get_lazy_loader

logger = structlog.get_logger()


class MedicalBERTModel:
    def __init__(self, model_name: str = "bert-base-uncased", device: Optional[str] = None) -> None:
        self.model_name = model_name
        self.device = device or "cpu"
        self._loaded = False

    def _load_model_real(self) -> bool:
        """Carga real del modelo BERT"""
        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification  # type: ignore
            import torch  # type: ignore
            self._tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self._model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
            if self.device == "cuda" and torch.cuda.is_available():
                self._model.to("cuda")
            logger.info("medical_bert_loaded_real", model=self.model_name, device=self.device)
            return True
        except Exception as err:
            logger.warning("medical_bert_fallback_stub", error=str(err))
            return False
    
    def load(self) -> bool:
        """
        Carga (o simula) el modelo BERT usando caché y lazy loading.
        En producción, inicializaría tokenizer y modelo.
        """
        use_real = os.getenv("AI_USE_REAL_MODELS", "0") == "1"
        
        if use_real:
            # Usar caché y lazy loading
            cache = get_model_cache()
            lazy_loader = get_lazy_loader()
            
            # Intentar cargar desde caché o lazy loader
            try:
                import asyncio
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            async def _load_with_cache():
                def loader():
                    return self._load_model_real()
                
                model, was_cached = await cache.get_or_load(
                    model_name=self.model_name,
                    model_type="medical_bert",
                    loader_func=loader,
                    device=self.device
                )
                
                if model:
                    self._model = model
                    self._tokenizer = None  # Se carga por separado
                    self._loaded = True
                    return True
                return False
            
            try:
                result = loop.run_until_complete(_load_with_cache())
                if result:
                    return True
            except Exception as e:
                logger.warning("cache_load_failed", error=str(e))
        
        # Fallback a carga directa o stub
        if use_real:
            if self._load_model_real():
                return True
        
        # Stub
        self._tokenizer = None
        self._model = None
        self._loaded = True
        return self._loaded

    def predict(self, texts: List[str]) -> List[Dict[str, Any]]:
        """
        Realiza inferencia sobre una lista de textos médicos.
        Retorna una lista de dicts con scores y etiquetas estimadas.
        """
        if not self._loaded:
            self.load()
        # Si hay modelo real disponible y tokenizador, se podría implementar aquí
        if getattr(self, "_model", None) is not None and getattr(self, "_tokenizer", None) is not None:
            # Mantener stub de salida simple para no introducir dependencias duras
            logger.info("medical_bert_predict_real_used_stub_output")
        # Stub: puntuaciones simuladas
        outputs: List[Dict[str, Any]] = []
        for t in texts:
            outputs.append(
                {
                    "text": t,
                    "labels": ["asthma", "copd", "flu"],
                    "scores": [0.12, 0.78, 0.10],
                    "top_label": "copd",
                }
            )
        return outputs

    def train(self, train_data: List[Dict[str, Any]], epochs: int = 1) -> Dict[str, Any]:
        """
        Entrenamiento (stub). En la implementación real, ajustaría el modelo con train_data.
        """
        if not self._loaded:
            self.load()
        return {"status": "ok", "epochs": epochs, "samples": len(train_data)}


