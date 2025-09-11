# RespiCare AI Services

Servicios de inteligencia artificial para el procesamiento de historias médicas y análisis de síntomas en el sistema RespiCare.

## 🏗️ Arquitectura

```
ai-services/
├── main.py                          # Aplicación principal FastAPI
├── requirements.txt                 # Dependencias Python
├── dockerfile                       # Configuración Docker
├── env.example                      # Variables de entorno
├── core/                           # Módulos centrales
│   ├── config.py                   # Configuración de la aplicación
│   ├── database.py                 # Conexión a MongoDB
│   └── cache.py                    # Cache Redis
├── models/                         # Modelos de IA/ML
│   └── model_manager.py            # Gestor de modelos
├── api/                           # API REST
│   └── routes/
│       ├── health.py              # Endpoints de salud
│       ├── medical_history.py     # Procesamiento de historias médicas
│       └── symptom_analyzer.py    # Análisis de síntomas
├── medical-history-processor/      # Procesador de historias médicas
│   └── processor.py               # Lógica de procesamiento
├── symptom-analyzer/              # Analizador de síntomas
│   └── analyzer.py                # Lógica de análisis
└── data/                          # Datos y utilidades
    ├── medical_data.py            # Procesamiento de datos médicos
    └── samples/                   # Datos de muestra
        ├── medical_histories.json
        └── symptoms.json
```

## 🚀 Características

### Procesamiento de Historias Médicas
- Extracción de entidades médicas (medicamentos, signos vitales, fechas)
- Identificación de síntomas y categorización
- Detección de factores de riesgo
- Sugerencias de diagnóstico
- Generación de recomendaciones médicas

### Análisis de Síntomas
- Clasificación de síntomas por categorías
- Cálculo de puntuaciones de severidad
- Determinación de niveles de urgencia
- Identificación de signos de alarma
- Recomendaciones de tratamiento

### API REST
- Endpoints para procesamiento de historias médicas
- Análisis de síntomas en tiempo real
- Búsqueda y filtrado de datos
- Análisis de tendencias temporales
- Health checks y monitoreo

## 🛠️ Tecnologías

- **FastAPI**: Framework web moderno y rápido
- **Python 3.11**: Lenguaje de programación
- **spaCy**: Procesamiento de lenguaje natural
- **scikit-learn**: Machine learning
- **MongoDB**: Base de datos NoSQL
- **Redis**: Cache en memoria
- **Docker**: Containerización

## 📋 Requisitos

- Python 3.11+
- MongoDB 4.4+
- Redis 6.0+
- Docker (opcional)

## 🚀 Instalación

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/Zod0808/respicare-tacna.git
cd respicare-tacna/ai-services
```

2. **Crear entorno virtual**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate     # Windows
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

5. **Ejecutar la aplicación**
```bash
uvicorn main:app --reload
```

### Docker

1. **Construir la imagen**
```bash
docker build -t respicare-ai .
```

2. **Ejecutar el contenedor**
```bash
docker run -p 8000:8000 respicare-ai
```

### Docker Compose

```bash
# Desde el directorio raíz del proyecto
docker-compose up ai-services
```

## 📚 Uso de la API

### Health Check
```bash
curl http://localhost:8000/api/v1/health
```

### Procesar Historia Médica
```bash
curl -X POST "http://localhost:8000/api/v1/medical-history/process" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P001",
    "text": "Paciente de 45 años con tos seca persistente de 2 semanas...",
    "language": "es"
  }'
```

### Analizar Síntomas
```bash
curl -X POST "http://localhost:8000/api/v1/symptom-analyzer/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "P001",
    "symptoms": [
      {"symptom": "tos seca", "severity": "moderate", "duration": "2 semanas"},
      {"symptom": "fiebre", "severity": "mild", "duration": "3 días"}
    ],
    "context": "Síntomas respiratorios"
  }'
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de conexión a MongoDB | `mongodb://admin:password@mongodb:27017/respicare?authSource=admin` |
| `REDIS_URL` | URL de conexión a Redis | `redis://redis:6379` |
| `OPENAI_API_KEY` | Clave API de OpenAI | - |
| `MODEL_PATH` | Ruta de modelos ML | `/app/models` |
| `CACHE_TTL` | TTL del cache (segundos) | `3600` |
| `LOG_LEVEL` | Nivel de logging | `INFO` |

### Modelos de IA

El sistema utiliza varios modelos para el procesamiento:

1. **spaCy Medical Model**: Procesamiento de texto médico
2. **Symptom Classifier**: Clasificación de síntomas
3. **Medical History Processor**: Procesamiento de historias médicas

## 📊 Monitoreo

### Health Checks

- `/api/v1/health` - Health check básico
- `/api/v1/health/detailed` - Health check detallado con dependencias
- `/api/v1/health/ready` - Kubernetes readiness probe
- `/api/v1/health/live` - Kubernetes liveness probe

### Logs

Los logs se generan en formato JSON estructurado con los siguientes niveles:
- `INFO`: Información general
- `WARNING`: Advertencias
- `ERROR`: Errores
- `DEBUG`: Información de depuración

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
pytest tests/

# Tests de integración
pytest tests/integration/

# Tests con cobertura
pytest --cov=. tests/
```

### Datos de Prueba

El directorio `data/samples/` contiene datos de prueba para desarrollo y testing.

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de la API en `/docs`

## 🔄 Changelog

### v1.0.0
- Implementación inicial del sistema de IA
- Procesamiento de historias médicas
- Análisis de síntomas
- API REST completa
- Integración con MongoDB y Redis
- Dockerización completa
