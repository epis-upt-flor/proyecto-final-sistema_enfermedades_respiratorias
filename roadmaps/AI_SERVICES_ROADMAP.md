# 🤖 Roadmap AI Services (FastAPI) - RespiCare Tacna

## Fase A1: Infra y Core
- FastAPI, CORS, logging estructurado, cache Redis
- Rutas base: health, analyzer, monitoring

## Fase A2: Modelos y Analítica
- Analizador de síntomas (rules/local/remote)
- SHAP/fairness/drift (monitoring)
- Tendencias y recomendaciones

## Fase A3: Avances ML/NLP/AutoML
- Advanced ML: BERT (texto), Visión, Series (stubs + endpoints)
- Advanced NLP: procesamiento, NER, resumen, traducción, sentimiento (stubs + endpoints)
- AutoML: selección, tuning, features, drift, auto-retraining (stubs + endpoints)
- RL/FL: agentes y coordinador federado (stubs + endpoints)

## Fase A4: Calidad y Rendimiento
- Tests smoke (Advanced ML/NLP/AutoML/RL/FL), integración
- CI con cobertura (Codecov) y artefactos
- Optimización p95/p99, profiling

## Hitos
- AI v1: Analyzer + Monitoring listos
- AI v2: Advanced ML/NLP/AutoML expuestos y documentados
- AI v3: Rendimiento y modelos reales (transformers/torch) en producción

# 🤖 Roadmap AI Services - RespiCare Tacna

## Fase 1: Infra y Bases
- ✅ FastAPI app, CORS, logging estructurado
- ✅ Cache Redis (aioredis) y configuración
- ✅ Estructura de rutas y servicios

## Fase 2: Analítica y Modelos Clásicos
- ✅ Análisis de síntomas (estrategias: reglas/local/remoto)
- ✅ Monitoreo ML (latencia, fairness, drift)
- ✅ Predicción de tendencias y recomendación

## Fase 3: Avances ML/NLP
- ✅ Advanced ML: BERT (texto), Visión (imágenes), Series temporales (stubs + endpoints)
- ✅ Advanced NLP: procesamiento, NER, resumen, traducción, sentimiento (stubs + endpoints)
- ✅ AutoML: selección de modelos, tuning, features, drift, auto-retraining (stubs + endpoints)
- ⏳ Integración con modelos reales (transformers/torch/timm) cuando se habilite el entorno

## Fase 4: Calidad y Rendimiento
- ✅ Tests (smoke de endpoints, integración básica)
- ✅ CI con cobertura y artefactos (junit/coverage)
- ⏳ Benchmarks y profiling (p95/p99 objetivos)

## Hitos
- [x] AI v1 (servicios core + analizador + monitoring)
- [x] AI v2 (Advanced ML/NLP/AutoML integrados a pipelines reales)
- [ ] AI v3 (optimización rendimiento + escalado + seguridad avanzada)


