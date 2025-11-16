from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from ml_models.medical_bert import MedicalBERTModel
from ml_models.image_classifier import MedicalImageClassifier
from ml_models.time_series_predictor import TimeSeriesPredictor

router = APIRouter(
    prefix="/v1/ml/advanced",
    tags=["Advanced ML"],
)


# ===== Text (Transformer/BERT) =====
class TextInferenceRequest(BaseModel):
    texts: List[str] = Field(..., min_items=1, description="Lista de textos médicos a analizar")
    model_name: Optional[str] = Field("bert-base-uncased", description="Nombre del modelo BERT a utilizar")

    class Config:
        schema_extra = {
            "example": {
                "texts": [
                    "Paciente con tos seca y disnea desde hace 3 días.",
                    "Dolor torácico y fiebre alta, sospecha de neumonía."
                ],
                "model_name": "bert-base-uncased"
            }
        }


class TextPrediction(BaseModel):
    text: str
    labels: List[str]
    scores: List[float]
    top_label: str


class TextInferenceResponse(BaseModel):
    status: str = Field("success")
    count: int
    predictions: List[TextPrediction]


@router.post(
    "/text",
    response_model=TextInferenceResponse,
    summary="Inferencia con modelo BERT (texto médico)",
    description="Clasifica textos médicos con un modelo tipo BERT y devuelve etiquetas y puntajes.",
)
async def advanced_text_inference(req: TextInferenceRequest) -> Dict[str, Any]:
    try:
        model = MedicalBERTModel(model_name=req.model_name)
        model.load()
        preds = model.predict(req.texts)
        return {"status": "success", "count": len(preds), "predictions": preds}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Image (Computer Vision) =====
class ImageInferenceRequest(BaseModel):
    images: List[str] = Field(..., description="Rutas o URIs de imágenes", min_items=1)
    model_name: Optional[str] = Field("resnet50", description="Nombre del modelo de visión a utilizar")

    class Config:
        schema_extra = {
            "example": {
                "images": [
                    "s3://bucket/imagenes/rx_001.png",
                    "/data/studies/ct_abc123.jpg"
                ],
                "model_name": "resnet50"
            }
        }


class ImagePrediction(BaseModel):
    image: str
    labels: List[str]
    scores: List[float]
    top_label: str


class ImageInferenceResponse(BaseModel):
    status: str = Field("success")
    count: int
    predictions: List[ImagePrediction]


@router.post(
    "/image",
    response_model=ImageInferenceResponse,
    summary="Clasificación de imágenes médicas (visión por computador)",
    description="Clasifica imágenes médicas y devuelve etiquetas y puntajes.",
)
async def advanced_image_inference(req: ImageInferenceRequest) -> Dict[str, Any]:
    try:
        clf = MedicalImageClassifier(model_name=req.model_name)
        clf.load()
        preds = clf.predict(req.images)
        return {"status": "success", "count": len(preds), "predictions": preds}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== Time Series (Forecast) =====
class TimeSeriesPoint(BaseModel):
    date: str = Field(..., description="Fecha ISO 8601, p.ej. 2025-11-16T00:00:00Z")
    value: float = Field(..., description="Valor observado")


class ForecastRequest(BaseModel):
    series: List[TimeSeriesPoint] = Field(default_factory=list, description="Serie temporal histórica (opcional)")
    model_type: Optional[str] = Field("simple-linear", description="Tipo de modelo de predicción")
    horizon_days: Optional[int] = Field(7, ge=1, le=365, description="Días a pronosticar (1-365)")

    class Config:
        schema_extra = {
            "example": {
                "series": [
                    {"date": "2025-11-01T00:00:00Z", "value": 2.1},
                    {"date": "2025-11-02T00:00:00Z", "value": 2.4},
                    {"date": "2025-11-03T00:00:00Z", "value": 2.3}
                ],
                "model_type": "simple-linear",
                "horizon_days": 7
            }
        }


class ForecastPoint(BaseModel):
    date: str
    predicted: float
    confidence: float


class ForecastResponse(BaseModel):
    status: str = Field("success")
    horizon_days: int
    forecast: List[ForecastPoint]


@router.post(
    "/timeseries",
    response_model=ForecastResponse,
    summary="Pronóstico de series temporales (tendencias)",
    description="Genera un pronóstico simple de tendencias para un horizonte de días especificado.",
)
async def advanced_timeseries_forecast(req: ForecastRequest) -> Dict[str, Any]:
    try:
        ts = TimeSeriesPredictor(model_type=req.model_type)
        if req.series:
            ts.fit([p.dict() for p in req.series])
        fc = ts.forecast(horizon_days=req.horizon_days or 7)
        return {"status": "success", "horizon_days": req.horizon_days, "forecast": fc}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


