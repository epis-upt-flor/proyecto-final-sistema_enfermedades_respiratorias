# 🏥 RespiCare Tacna - Sistema de Gestión de Enfermedades Respiratorias

Sistema completo de gestión y análisis de enfermedades respiratorias con inteligencia artificial, diseñado para el sistema de salud de Tacna, Perú.

## 📊 Estado del Proyecto

### 🔧 Tecnologías y Herramientas

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![Docker](https://img.shields.io/badge/docker-supported-blue.svg)

### 📈 Métricas y Calidad

![MDSD](https://img.shields.io/badge/MDSD-4.4%2F5.0-brightgreen.svg)
![Code Generation](https://img.shields.io/badge/Code%20Generation-87%25-blue.svg)
![Industry](https://img.shields.io/badge/Industry-Top%2010%25-yellow.svg)
![ML Accuracy](https://img.shields.io/badge/ML%20Accuracy-99.64%25-brightgreen.svg)
![SHAP](https://img.shields.io/badge/SHAP-Explicability+-blue.svg)
![Architecture](https://img.shields.io/badge/Architecture-Clean-brightgreen.svg)
![Tests](https://img.shields.io/badge/Tests-98.0%25%20Passing-brightgreen.svg)
![Code Quality](https://img.shields.io/badge/Code%20Quality-A%20(9.1%2F10)-brightgreen.svg)
![Static Analysis](https://img.shields.io/badge/Static%20Analysis-Passing-brightgreen.svg)

### 🚀 Funcionalidades

![Methodology](https://img.shields.io/badge/Methodology-Scrum%20Adapted-orange.svg)
![API](https://img.shields.io/badge/API-Docs%20Ready-brightgreen.svg)
![Chatbot](https://img.shields.io/badge/Chatbot-ML%20Enabled-purple.svg)


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
- **[backend/src/config/redisClient.ts](backend/src/config/redisClient.ts)** - Cliente Redis centralizado y manejo del cache
- **Healthcheck backend**: `GET http://localhost:3001/health` (incluye estado de MongoDB y Redis)

#### AI Services
- **[ai-services/README.md](ai-services/README.md)** - Documentación de servicios de IA
- **[ai-services/API_DOCUMENTATION.md](ai-services/API_DOCUMENTATION.md)** - API de servicios de IA
- **[ai-services/core/cache.py](ai-services/core/cache.py)** - Utilidades Redis async y helpers de cache
- **[ai-services/api/routes/health.py](ai-services/api/routes/health.py)** - Endpoints de health/detailed health con métricas de dependencias
- **Healthcheck IA**: `GET http://localhost:8000/api/v1/health` (estado y latencia de Redis)

#### Mobile
- **[mobile/README.md](mobile/README.md)** - Documentación de la app móvil
- **[mobile/__tests__/README.md](mobile/__tests__/README.md)** - Guía completa de tests móviles

### 🧪 Testing

- **[TESTING_STRATEGY.md](TESTING_STRATEGY.md)** - Estrategia de testing
- **[docs/STATIC_CODE_ANALYSIS.md](docs/STATIC_CODE_ANALYSIS.md)** - Análisis de código estático
- **[docs/SHAP_DASHBOARD_TROUBLESHOOTING.md](docs/SHAP_DASHBOARD_TROUBLESHOOTING.md)** - Solución de problemas del dashboard SHAP
- **[docs/testing/backend-coverage-2025-11.md](docs/testing/backend-coverage-2025-11.md)** - 🛡️ Resumen de cobertura backend (98 % global)
- **[backend/tests/README.md](backend/tests/README.md)** - 📊 **Resultados de pruebas del backend** (380+ tests, 98 % cobertura)
- **[web/tests/README.md](web/tests/README.md)** - 📊 **Resultados de pruebas del frontend web** (40+ tests implementados)
- **[mobile/__tests__/README.md](mobile/__tests__/README.md)** - 📊 **Tests de la aplicación móvil** (50+ tests: unitarios, integración, E2E, offline, sincronización)
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

### 📊 Dashboard de Explicabilidad SHAP
- ✅ Visualización de contribuciones SHAP principales
- ✅ Métricas de confianza del modelo
- ✅ Distribución de enfermedades y urgencias
- ✅ Análisis de equidad por grupos demográficos
- ✅ Factores explicativos frecuentes
- ⚠️ **Nota:** Requiere datos de predicciones ML. Ver [docs/SHAP_DASHBOARD_TROUBLESHOOTING.md](docs/SHAP_DASHBOARD_TROUBLESHOOTING.md) para poblar datos de prueba

### 📊 Analytics
- ✅ Dashboard en tiempo real
- ✅ Tendencias temporales
- ✅ Reportes geográficos
- ✅ Analytics de síntomas
- ✅ Predicción de tendencias, detección de anomalías y forecast de demanda (Analytics ML suite)
- ✅ Dashboard ejecutivo avanzado con KPIs, brotes y demanda proyectada
- ✅ Dashboard de explicabilidad SHAP (contribuciones, confianza y fairness por cohorte)
- ✅ **Reportes Automáticos**: Generación automática de reportes diarios, semanales y mensuales
- ✅ **Alertas de Métricas Anormales**: Detección automática de anomalías en métricas del sistema
- ✅ **Exportación Automática**: Exportación automática de reportes en PDF, CSV y JSON
- ✅ **Dashboard Personalizable**: Visualización y gestión de reportes automáticos desde el frontend

### 📱 Mobile
- ✅ App completa React Native
- ✅ Modo offline
- ✅ Sincronización automática
- ✅ Notificaciones push
- ✅ **Suite completa de tests** (50+ tests: unitarios, integración, E2E, offline, sincronización) - Ver [mobile/__tests__/README.md](mobile/__tests__/README.md)

## ✅ Módulos Clínicos Avanzados (Fase 7 Completada)

- **Alertas y notificaciones**  
  - Alertas automáticas por síntomas críticos, recordatorios de medicamentos, notificaciones push programadas y dashboard global.
  - Endpoints REST: `/api/v1/alerts` (filtros, resumen, monitorización) + consola web de administración.

- **Citas médicas**  
  - CRUD completo, disponibilidad de doctores, cancelación/reprogramación y recordatorios automáticos.
  - Implementación clave: `AppointmentModel`, `appointmentService`, rutas REST y jobs periódicos (`appointmentJobs`).

- **Prescripciones**  
  - Generación y validación médica con dosificación inteligente, chequeo de interacciones externas y recordatorios de toma.
  - Endpoints: `/api/v1/prescriptions` (historial, estados, anexado de medicamentos) + integración con `drugInteractionService`.

- **Reportes médicos (PDF)**  
  - Plantillas personalizables, exportación profesional, historial con firma digital y compartición entre médicos.
  - Utilidades: `reportService.ts`, `pdfGenerator.ts` y consola web `MedicalReport`.

## ✅ Analytics y Business Intelligence (Fase 9 Completada)

- **Reportes Automáticos**  
  - Generación automática de reportes diarios (23:59), semanales (domingos 23:59) y mensuales (día 1, 00:00).
  - Detección automática de anomalías en métricas usando z-score y análisis de tendencias históricas.
  - Exportación automática de reportes en formatos PDF, CSV y JSON.
  - Dashboard personalizable con filtros por tipo, visualización de métricas y anomalías.
  - Sistema completo de alertas de métricas anormales con niveles de severidad (low, medium, high, critical).
  - Métricas incluidas: pacientes, doctores, administradores, historias médicas, alertas, citas, análisis IA, top diagnósticos, distribución geográfica.
  - Endpoints REST: `/api/v1/reports/automatic` + dashboard web `AutomaticReportsDashboard`.
  - Jobs programados: `reportJobs.ts` con node-cron para ejecución automática.

## 📈 Estado del Proyecto

### ✅ Completado
- Backend API completo
- Sistema ML con 3 modelos entrenados
- Chatbot médico integrado
- Frontend web y móvil
- Sistema de monitoreo y feedback
- Sistema de alertas avanzadas, citas médicas, prescripciones y reportes PDF profesionales
- **Sistema de Reportes Automáticos**: Generación automática diaria, semanal y mensual con detección de anomalías
- **Testing Backend**: 380+ tests automatizados, cobertura global 98 % - Ver [docs/testing/backend-coverage-2025-11.md](docs/testing/backend-coverage-2025-11.md)
- **Testing Frontend Web**: 40+ tests implementados - Ver [web/tests/README.md](web/tests/README.md)
- **Testing Mobile**: 50+ tests implementados (unitarios, integración, E2E, offline, sincronización) - Ver [mobile/__tests__/README.md](mobile/__tests__/README.md)
- **Testing AI Services**: Cobertura ~83 % en monitoreo/fairness/drift con `ml_tests/test_fairness_and_drift.py`, `tests/ml_models/test_analytics_models.py` y endpoints REST de monitoreo (`api/routes/ml_monitoring.py`)

### 🚧 En Progreso
- Incrementar cobertura de tests front/mobile >80 % (nuevas suites web para `AlertConsole`, `TemporalTrends`, `Analytics`)
- Optimizaciones de performance y seguridad avanzada
- Integraciones externas: cliente FHIR + parser HL7 listos; próximos pasos publicados en Fase 8 (endpoints, interoperabilidad hospitalaria)

## 🤝 Contribución

Ver [PROJECT_ROADMAP.md](PROJECT_ROADMAP.md) para el plan de desarrollo y próximas fases.

## 📄 Licencia

### Licencia del Proyecto

Este proyecto está bajo la licencia **MIT License**.

```
MIT License

Copyright (c) 2024 RespiCare Tacna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Tecnologías y Licencias de Dependencias

Este proyecto utiliza múltiples tecnologías de código abierto. A continuación se listan las tecnologías principales y sus licencias:

#### Backend (Node.js/TypeScript)
- **Express.js** - MIT License
- **MongoDB** - Server Side Public License (SSPL)
- **Mongoose** - MIT License
- **TypeScript** - Apache License 2.0
- **JWT (jsonwebtoken)** - MIT License
- **Winston** - MIT License

#### AI Services (Python)
- **FastAPI** - MIT License
- **scikit-learn** - BSD License
- **XGBoost** - Apache License 2.0
- **SHAP** - MIT License
- **NumPy** - BSD License
- **Pandas** - BSD License
- **spaCy** - MIT License

#### Frontend Web (React)
- **React** - MIT License
- **Chart.js** - MIT License
- **Leaflet** - BSD 2-Clause License
- **React Router** - MIT License

#### Mobile (React Native)
- **React Native** - MIT License
- **Expo** - MIT License
- **React Navigation** - MIT License

#### Base de Datos y Caching
- **MongoDB** - Server Side Public License (SSPL)
- **Redis** - BSD 3-Clause License

### Nota sobre Licencias de Dependencias

Las dependencias del proyecto tienen sus propias licencias. Para ver las licencias completas de todas las dependencias:

```bash
# Backend
cd backend
npm list --depth=0

# AI Services
cd ai-services
pip-licenses

# Frontend Web
cd web
npm list --depth=0
```

**Importante**: Este proyecto utiliza tecnologías con diferentes tipos de licencias (MIT, BSD, Apache 2.0, SSPL). Asegúrate de cumplir con todos los requisitos de licencia si planeas distribuir o comercializar el software.

Para más detalles sobre licencias específicas, consulta los archivos `LICENSE` o `package.json` en cada componente del proyecto.

## 👥 Equipo

- Cesar Fabian Chávez Linares

---

**Última actualización:** Diciembre 2024

