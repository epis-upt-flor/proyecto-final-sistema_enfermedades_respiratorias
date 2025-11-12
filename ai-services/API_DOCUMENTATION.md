# RespiCare AI Services - API Documentation

## 🚀 Base URL
```
http://localhost:8000
```

---

## 📋 Endpoints

### 1. Health Check
**GET** `/api/v1/health`

Verifica el estado del servicio.

**Response:**
```json
{
  "status": "healthy",
  "service": "ai-services",
  "version": "1.0.0",
  "timestamp": "2025-10-24T02:00:00.000000"
}
```

---

### 2. Analyze Medical Query (Principal)
**POST** `/api/v1/analyze`

Analiza consultas médicas sobre enfermedades respiratorias y proporciona respuestas inteligentes.

#### Request Body:
```json
{
  "query": "¿Qué es el asma?",
  "context": "respiratory_diseases",
  "patient_id": "P001",
  "include_recommendations": true
}
```

**Parámetros:**
- `query` (string, requerido): Pregunta o consulta médica
- `context` (string, opcional): Contexto de la consulta (default: "respiratory_diseases")
- `patient_id` (string, opcional): ID del paciente
- `include_recommendations` (boolean, opcional): Incluir recomendaciones (default: true)

#### Response:
```json
{
  "status": "success",
  "message": "🫁 **ASMA**\n\nEl asma es una enfermedad crónica...",
  "analysis": {
    "detected_diseases": ["asma"],
    "detected_symptoms": ["tos", "dificultad respiratoria"],
    "question_type": "definition",
    "detailed_info": {
      "disease": "asma"
    }
  },
  "recommendations": [
    "Usar inhalador de rescate según necesidad",
    "Mantener inhalador de control diario",
    "Evitar desencadenantes conocidos"
  ],
  "urgency_level": "medium",
  "confidence": 0.85,
  "timestamp": "2025-10-24T02:00:00.000000"
}
```

**Niveles de Urgencia:**
- `critical` 🚨 - Atención médica inmediata
- `high` ⚠️ - Atención urgente (2 horas)
- `medium` ⚡ - Atención prioritaria (24 horas)
- `low` ✅ - Monitoreo regular
- `very_low` ✅ - Información general

---

### 3. Get Supported Diseases
**GET** `/api/v1/diseases`

Obtiene la lista de enfermedades respiratorias soportadas.

**Response:**
```json
{
  "status": "success",
  "count": 7,
  "diseases": [
    {
      "id": "asma",
      "name": "Asma",
      "description": "El asma es una enfermedad crónica que afecta las vías respiratorias...",
      "urgency": "medium"
    }
  ]
}
```

---

### 4. Get Symptom Categories
**GET** `/api/v1/symptoms`

Obtiene las categorías de síntomas disponibles.

**Response:**
```json
{
  "status": "success",
  "categories": {
    "respiratory": ["tos", "tos seca", "dificultad respiratoria", ...],
    "fever": ["fiebre", "temperatura alta", "escalofríos", ...],
    "pain": ["dolor de cabeza", "dolor de garganta", ...],
    ...
  }
}
```

---

## 🏥 Enfermedades Soportadas

### 1. **Asma**
- **Aliases:** asma, asmático
- **Urgencia:** Medium
- **Síntomas:** dificultad para respirar, sibilancias, opresión en el pecho, tos

### 2. **Neumonía**
- **Aliases:** neumonia, neumonía, pulmonía
- **Urgencia:** High
- **Síntomas:** fiebre alta, tos con flema, dolor en el pecho, dificultad respiratoria

### 3. **Bronquitis**
- **Aliases:** bronquitis
- **Urgencia:** Low
- **Síntomas:** tos persistente, producción de mucosidad, fatiga

### 4. **COVID-19**
- **Aliases:** covid, covid-19, covid19, coronavirus, sars-cov-2
- **Urgencia:** Medium
- **Síntomas:** fiebre, tos seca, fatiga, pérdida de olfato o gusto

### 5. **Gripe (Influenza)**
- **Aliases:** gripe, influenza, flu
- **Urgencia:** Low
- **Síntomas:** fiebre súbita, dolores musculares, dolor de cabeza, fatiga extrema

### 6. **EPOC**
- **Aliases:** epoc, enfermedad pulmonar obstructiva
- **Urgencia:** Medium
- **Síntomas:** falta de aire, sibilancias, opresión en el pecho, tos crónica

### 7. **Resfriado Común**
- **Aliases:** resfriado, resfrío, catarro
- **Urgencia:** Very Low
- **Síntomas:** congestión nasal, estornudos, dolor de garganta, tos leve

---

## 🔍 Tipos de Consultas Soportadas

### 1. **Definición** (`definition`)
Preguntas sobre qué es una enfermedad.

**Ejemplos:**
- "¿Qué es el asma?"
- "Define la neumonía"
- "Explícame qué es la bronquitis"

### 2. **Síntomas** (`symptoms`)
Preguntas sobre síntomas de enfermedades.

**Ejemplos:**
- "¿Cuáles son los síntomas del COVID-19?"
- "Señales de neumonía"
- "Síntomas de la gripe"

### 3. **Tratamiento** (`treatment`)
Preguntas sobre cómo tratar enfermedades.

**Ejemplos:**
- "¿Cómo se trata el asma?"
- "Tratamiento para la bronquitis"
- "Qué medicina tomar para la gripe"

### 4. **Prevención** (`prevention`)
Preguntas sobre cómo prevenir enfermedades.

**Ejemplos:**
- "¿Cómo prevenir la neumonía?"
- "Prevención del COVID-19"
- "Cómo evitar el asma"

### 5. **Acción** (`action`)
Preguntas sobre qué hacer en situaciones específicas.

**Ejemplos:**
- "Tengo fiebre y tos, ¿qué hago?"
- "¿Debo ir al médico?"
- "Qué hacer si tengo dificultad para respirar"

### 6. **General** (`general`)
Consultas generales o múltiples temas.

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Consulta sobre Asma
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Qué es el asma?",
    "context": "respiratory_diseases"
  }'
```

**Respuesta:**
- Detecta: `asma`
- Tipo: `definition`
- Urgencia: `medium`
- Confianza: `0.85`

---

### Ejemplo 2: Síntomas de Neumonía
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Cuáles son los síntomas de neumonía?"
  }'
```

**Respuesta:**
- Detecta: `neumonia`
- Tipo: `symptoms`
- Urgencia: `high` ⚠️
- Confianza: `0.85`
- Incluye signos de alarma

---

### Ejemplo 3: Análisis de Síntomas
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tengo tos, fiebre y dificultad para respirar",
    "include_recommendations": true
  }'
```

**Respuesta:**
- Detecta síntomas: `tos`, `fiebre`, `dificultad respiratoria`
- Urgencia: `medium`
- Confianza: `0.7`
- Proporciona 5 recomendaciones
- Sugiere posibles condiciones

---

### Ejemplo 4: Tratamiento COVID-19
```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Cómo tratar el COVID-19?",
    "context": "respiratory_diseases"
  }'
```

**Respuesta:**
- Detecta: `covid19`
- Tipo: `treatment`
- Urgencia: `medium`
- Incluye protocolo de aislamiento
- Lista signos de alarma

---

## 🔐 Seguridad y Consideraciones

### ⚠️ Disclaimer Médico
Todas las respuestas incluyen automáticamente el siguiente aviso:

> ⚠️ **Importante:** Esta es información general. Para un diagnóstico preciso y tratamiento personalizado, consulta con un profesional de la salud.

### 🛡️ CORS
El servicio está configurado con CORS abierto (`allow_origins=["*"]`) para desarrollo.

**⚠️ En producción:** Especificar orígenes permitidos:
```python
allow_origins=["https://tudominio.com", "https://app.tudominio.com"]
```

### 📝 Logging
Todas las peticiones son registradas con:
- Query original
- Enfermedades detectadas
- Nivel de urgencia
- Confianza del análisis
- Timestamp

---

## 🎯 Integración con Frontend (React)

### Ejemplo de uso en ChatBot:

```javascript
import axios from 'axios';

const analyzeQuery = async (userQuery) => {
  try {
    const response = await axios.post('http://localhost:8000/api/v1/analyze', {
      query: userQuery,
      context: 'respiratory_diseases',
      include_recommendations: true
    });

    return {
      message: response.data.message,
      urgency: response.data.urgency_level,
      confidence: response.data.confidence,
      recommendations: response.data.recommendations
    };
  } catch (error) {
    console.error('Error analyzing query:', error);
    throw error;
  }
};
```

---

## 📈 Métricas y Rendimiento

### Confianza del Análisis:
- **0.85+**: Enfermedad específica detectada
- **0.70-0.84**: Síntomas detectados
- **< 0.70**: Consulta general

### Tiempo de Respuesta:
- Promedio: < 100ms
- Máximo: < 500ms

---

## 🐛 Manejo de Errores

### Error 400 - Bad Request
```json
{
  "detail": "Query must be at least 3 characters long"
}
```

### Error 500 - Internal Server Error
```json
{
  "detail": "Analysis failed: [error message]"
}
```

---

## 🚀 Próximas Mejoras

- [ ] Integración con modelos de ML (spaCy, transformers)
- [ ] Análisis de sentimiento
- [ ] Detección de urgencia basada en ML
- [ ] Soporte multiidioma (inglés, quechua)
- [ ] Historial de conversaciones
- [ ] Análisis de imágenes médicas
- [ ] Integración con bases de datos de pacientes
- [ ] Sistema de recomendaciones personalizadas

---

## 📞 Soporte

Para problemas o preguntas:
- Revisar logs: `docker-compose -f docker-compose.dev.yml logs ai-services`
- Verificar salud: `GET /api/v1/health`
- Documentación interactiva: `http://localhost:8000/docs`

---

## 📚 Referencias

- FastAPI Documentation: https://fastapi.tiangolo.com
- Medical Data Standards: https://www.hl7.org
- RespiCare Project: https://github.com/tu-usuario/respicare

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2024  
**Autor:** RespiCare Development Team

