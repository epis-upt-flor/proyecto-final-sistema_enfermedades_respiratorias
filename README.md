# 🏥 RespiCare Tacna - Sistema de Gestión de Enfermedades Respiratorias

Sistema completo de gestión y análisis de enfermedades respiratorias con inteligencia artificial, diseñado para el sistema de salud de Tacna, Perú.

## 📋 Descripción

RespiCare Tacna es una plataforma integral que combina:
- **Backend robusto** (Node.js/TypeScript)
- **Servicios de IA** con Machine Learning (Python/FastAPI)
- **Frontend Web** (React)
- **App Móvil** (React Native)

Con capacidades avanzadas de:
- Clasificación de enfermedades respiratorias con ML (99.64% accuracy)
- Chatbot médico inteligente con explicabilidad SHAP
- Análisis predictivo y monitoreo en tiempo real
- Gestión completa de historias médicas
- Analytics y reportes avanzados

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Python 3.9+
- MongoDB
- Redis (opcional, para caching)

### Instalación Rápida

```bash
# Clonar repositorio
git clone <repo-url>
cd proyecto-final-sistema_enfermedades_respiratorias

# Backend
cd backend
npm install
npm run dev

# AI Services
cd ../ai-services
pip install -r requirements.txt
python main.py

# Frontend Web
cd ../web
npm install
npm start

# Mobile (React Native)
cd ../mobile/RespiCare-Mobile
npm install
npx expo start
```

Para más detalles, consulta [QUICKSTART.md](QUICKSTART.md)

## 📚 Documentación

### 📖 Documentación Principal

- **[QUICKSTART.md](QUICKSTART.md)** - Guía de inicio rápido
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)** - Roadmap completo del proyecto
- **[ML_ROADMAP.md](ML_ROADMAP.md)** - Roadmap del sistema ML
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de deployment
- **[SECURITY.md](SECURITY.md)** - Políticas de seguridad

### 🏗️ Arquitectura y Diseño

- **[backend/CLEAN_ARCHITECTURE.md](backend/CLEAN_ARCHITECTURE.md)** - Arquitectura limpia del backend
- **[ANALISIS_MDSD_RESPICARE.md](ANALISIS_MDSD_RESPICARE.md)** - Análisis MDSD del proyecto
- **[METODOLOGIA_AGIL_PROYECTO.md](METODOLOGIA_AGIL_PROYECTO.md)** - Metodología ágil aplicada

### 📱 Componentes

#### Backend
- **[backend/README.md](backend/README.md)** - Documentación del backend
- **[backend/SETUP.md](backend/SETUP.md)** - Configuración del backend

#### AI Services
- **[ai-services/README.md](ai-services/README.md)** - Documentación de servicios de IA
- **[ai-services/API_DOCUMENTATION.md](ai-services/API_DOCUMENTATION.md)** - API de servicios de IA

#### Mobile
- **[mobile/README.md](mobile/README.md)** - Documentación de la app móvil

### 🧪 Testing

- **[TESTING_STRATEGY.md](TESTING_STRATEGY.md)** - Estrategia de testing
- **[ai-services/TESTING_GUIDE.md](ai-services/TESTING_GUIDE.md)** - Guía de testing de AI Services

### 📊 Reportes de Implementación

Los reportes de implementación de features completadas están en [`docs/implementation-reports/`](docs/implementation-reports/):
- Sistema ML completo
- Integración de chatbot
- Sistema de retraining automático
- Personalización por riesgo
- Y más...

**Ver índice completo:** [docs/DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)

## 🎯 Características Principales

### 🤖 Machine Learning
- ✅ **3 Modelos ML**: Random Forest (96.86%), XGBoost (97.28%), Neural Network (99.64%)
- ✅ **Ensemble System**: Combina 3 modelos para >99.8% precisión
- ✅ **Explicabilidad SHAP**: Factores clave explicados para cada predicción
- ✅ **Personalización**: Ajuste por edad y factores de riesgo
- ✅ **Retraining Automático**: Mejora continua con feedback médico
- ✅ **Monitoreo**: Tracking completo de predicciones

### 💬 Chatbot Médico
- ✅ Análisis inteligente de síntomas
- ✅ Explicaciones SHAP integradas
- ✅ Detección automática de emergencias
- ✅ Recomendaciones personalizadas

### 📊 Analytics
- ✅ Dashboard en tiempo real
- ✅ Tendencias temporales
- ✅ Reportes geográficos
- ✅ Analytics de síntomas

### 📱 Mobile
- ✅ App completa React Native
- ✅ Modo offline
- ✅ Sincronización automática
- ✅ Notificaciones push

## 📈 Estado del Proyecto

### ✅ Completado
- Backend API completo
- Sistema ML con 3 modelos entrenados
- Chatbot médico integrado
- Frontend web y móvil
- Sistema de monitoreo y feedback

### 🚧 En Progreso
- Testing completo (ver [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md))
- Optimizaciones de performance
- Nuevas funcionalidades (citas, prescripciones)

## 🤝 Contribución

Ver [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) para el plan de desarrollo y próximas fases.

## 📄 Licencia

[Especificar licencia]

## 👥 Equipo

[Información del equipo]

---

**Última actualización:** Noviembre 2024

