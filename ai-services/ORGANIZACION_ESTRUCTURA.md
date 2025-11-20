# 📁 Organización de la Estructura de ai-services

Este documento describe la estructura organizada del directorio `ai-services`.

## 📂 Estructura de Directorios

```
ai-services/
├── api/                    # API Routes (FastAPI)
│   └── routes/            # Endpoints de la API
│
├── core/                   # Núcleo del sistema
│   ├── cache.py          # Sistema de caché
│   ├── config.py         # Configuración
│   ├── database.py       # Conexión a base de datos
│   └── pattern_config.py # Configuración de patrones
│
├── data/                   # Datos y datasets
│   ├── datasets/         # Datasets CSV (sintéticos y reales)
│   ├── samples/          # Datos de ejemplo
│   ├── disease_parser.py
│   ├── medical_data.py
│   └── respiratory_diseases_comprehensive.py
│
├── ml_models/              # Modelos de Machine Learning
│   ├── __init__.py
│   ├── synthetic_dataset_generator.py
│   ├── synthetic_image_dataset_generator.py
│   ├── synthetic_cough_dataset_generator.py
│   ├── random_forest_model.py
│   ├── xgboost_model.py
│   ├── neural_network_model.py
│   ├── ensemble_predictor.py
│   ├── hybrid_system.py
│   ├── prediction_monitor.py
│   ├── medical_feedback_system.py
│   ├── risk_personalization.py
│   ├── auto_retraining.py
│   ├── trend_predictor.py
│   ├── anomaly_detector.py
│   ├── demand_forecasting.py
│   ├── medical_bert.py
│   ├── image_classifier.py
│   ├── medical_nlp.py
│   ├── nlp_advanced.py
│   ├── time_series_predictor.py
│   ├── reinforcement_learning.py
│   ├── rl_reminder_optimizer.py
│   ├── federated_learning.py
│   ├── fl_secure_aggregation.py
│   ├── automl_respiratory_risk.py
│   ├── automl_manager.py
│   ├── model_cache.py
│   ├── lazy_loader.py
│   └── neural_network_wrapper.py
│
├── services/                # Servicios de negocio
│   ├── ai_service_manager.py
│   ├── symptom_analysis_service.py
│   ├── medical_history_service.py
│   ├── conversational_ai_service.py
│   ├── enhanced_chatbot_service.py
│   ├── patient_friendly_explainer.py
│   ├── audio_transcription_service.py
│   └── cough_analysis_service.py
│
├── strategies/              # Estrategias de análisis
│   ├── analysis_strategy.py
│   ├── local_model_strategy.py
│   ├── openai_strategy.py
│   └── rule_based_strategy.py
│
├── repositories/            # Repositorios de datos
│   ├── base_repository.py
│   ├── patient_repository.py
│   ├── medical_history_repository.py
│   └── ai_result_repository.py
│
├── factories/               # Factories (patrón Factory)
│   ├── model_factory.py
│   ├── service_factory.py
│   └── strategy_factory.py
│
├── decorators/              # Decoradores
│   ├── cache_decorator.py
│   ├── circuit_breaker_decorator.py
│   ├── logging_decorator.py
│   ├── metrics_decorator.py
│   └── retry_decorator.py
│
├── circuit_breaker/         # Circuit Breaker
│   ├── circuit_breaker.py
│   ├── external_service_circuit_breaker.py
│   └── openai_circuit_breaker.py
│
├── utils/                   # Utilidades
│   ├── sentry_integration.py
│   └── urgency_calculator.py
│
├── medical-history-processor/ # Procesador de historias médicas
│   └── processor.py
│
├── symptom-analyzer/         # Analizador de síntomas
│   └── analyzer.py
│
├── scripts/                  # Scripts de utilidad
│   ├── training/            # Scripts de entrenamiento
│   ├── analysis/            # Scripts de análisis
│   ├── validation/          # Scripts de validación
│   └── seed_ml_predictions.py
│
├── tests/                    # Tests
│   ├── core/
│   ├── ml_models/
│   ├── services/
│   ├── utils/
│   ├── patterns/
│   ├── performance/
│   └── security/
│
├── ml_tests/                 # Tests específicos de ML
│   └── test_fairness_and_drift.py
│
├── models/                   # Modelos entrenados guardados
│   └── *.pkl
│
├── monitoring/               # Monitoreo y logs
│   └── *.jsonl, *.csv
│
├── logs/                     # Logs de la aplicación
│
├── cache/                    # Caché temporal
│
├── tmp/                      # Archivos temporales
│
├── docs/                     # Documentación adicional
│   └── MODELOS_INICIALES.md
│
├── main.py                   # Punto de entrada principal
├── shap_explainer.py         # Explicador SHAP
│
├── requirements.txt          # Dependencias principales
├── requirements-dev.txt      # Dependencias de desarrollo
├── requirements-test.txt     # Dependencias de testing
├── requirements-lite.txt     # Dependencias ligeras
├── requirements-full.txt     # Dependencias completas
├── requirements-lint.txt     # Dependencias de linting
│
├── dockerfile                # Dockerfile para desarrollo
├── Dockerfile.prod           # Dockerfile para producción
├── Makefile                  # Makefile con comandos útiles
├── pytest.ini                # Configuración de pytest
├── pyproject.toml           # Configuración del proyecto
│
├── README.md                 # Documentación principal
├── API_DOCUMENTATION.md      # Documentación de API
├── TESTING_GUIDE.md          # Guía de testing
├── README_PATTERNS.md        # Documentación de patrones
├── GUIA_CHATBOT_MEDICO.md    # Guía del chatbot
├── AUDIO_SERVICES_README.md  # Servicios de audio
└── MULTIMODAL_DATASETS_README.md # Datasets sintéticos
```

## 📋 Reglas de Organización

### Scripts
- **Scripts de entrenamiento**: `scripts/training/`
- **Scripts de análisis**: `scripts/analysis/`
- **Scripts de validación**: `scripts/validation/`

### Datasets
- **Todos los CSV**: `data/datasets/`
- **Samples/ejemplos**: `data/samples/`

### Modelos Entrenados
- **Todos los .pkl**: `models/`

### Documentación
- **README principal**: Raíz
- **Documentación específica**: Raíz (archivos .md)
- **Documentación adicional**: `docs/`

### Tests
- **Tests unitarios**: `tests/` organizados por módulo
- **Tests ML específicos**: `ml_tests/`

### Archivos Temporales
- **Logs**: `logs/`
- **Caché**: `cache/`
- **Temporales**: `tmp/`
- **Monitoreo**: `monitoring/`

## 🔄 Migración

Para reorganizar los archivos, ejecutar los scripts de migración o mover manualmente según esta estructura.

