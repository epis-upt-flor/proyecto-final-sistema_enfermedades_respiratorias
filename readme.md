# 🏥 RespiCare - Sistema Integral de Enfermedades Respiratorias

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React 18+](https://img.shields.io/badge/react-18+-61dafb.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)

[![MDSD Level](https://img.shields.io/badge/MDSD-4.4%2F5.0-brightgreen)](ANALISIS_MDSD_RESPICARE.md)
[![Code Generation](https://img.shields.io/badge/Code%20Generation-87%25-blue)](ANALISIS_MDSD_RESPICARE.md)
[![Top 10%](https://img.shields.io/badge/Industry-Top%2010%25-gold)](ANALISIS_MDSD_RESPICARE.md)
[![ML Accuracy](https://img.shields.io/badge/ML%20Accuracy-99.81%25-success)](ML_ROADMAP.md)
[![SHAP Enabled](https://img.shields.io/badge/SHAP-Explicability%20%2B-blue)](SHAP_EXPLAINABILITY_IMPLEMENTED.md)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-success)](backend/CLEAN_ARCHITECTURE.md)
[![Agile Method](https://img.shields.io/badge/Methodology-Scrum%20Adapted-orange)](METODOLOGIA_AGIL_PROYECTO.md)
[![API Documentation](https://img.shields.io/badge/API-Docs%20Ready-green)](http://localhost:3001/api-docs)
[![Chatbot ML](https://img.shields.io/badge/Chatbot-ML%20Enabled-purple)](CHATBOT_ML_INTEGRATION_COMPLETE.md)

## 📋 Descripción del Proyecto

**RespiCare** es un sistema integral de gestión y análisis de enfermedades respiratorias que combina tecnologías de vanguardia con patrones de arquitectura robustos para brindar una solución completa en el ámbito de la salud respiratoria.

### 🎯 Características Principales

- **🏗️ Arquitectura de Microservicios**: Sistema distribuido con servicios especializados
- **🤖 IA Avanzada**: Análisis inteligente de síntomas y historias médicas con servicios Python/FastAPI
- **💬 Chatbot Médico Interactivo**: Interfaz moderna con botones de acción rápida y experiencia de usuario mejorada
- **📊 Dashboard de Analytics**: Visualizaciones avanzadas con mapas interactivos, tendencias temporales y reportes por enfermedad
- **📱 Aplicación Móvil Completa**: App nativa React Native con IA, chatbot médico y funcionalidades offline
- **🌐 Web Dashboard**: Interfaz web moderna para profesionales de salud
- **📖 Documentación API**: Swagger UI completo con endpoints documentados
- **🔒 Seguridad Robusta**: Autenticación JWT, RBAC y encriptación de datos
- **📊 Observabilidad**: Logging estructurado, métricas y monitoreo completo
- **🔄 Patrones de Software**: Strategy, Factory, Circuit Breaker, Repository y más
- **🎯 Model-Driven Development**: Generación automática de código desde modelos (MDSD 4.4/5.0 - TOP 10% 🏆)
- **🐳 Docker Completo**: Despliegue containerizado con Docker Compose para desarrollo y producción
- **📋 Metodología Ágil**: Scrum adaptado con Kanban y XP, 9 sprints completados, velocidad 22.9 SP/sprint

## 🚀 Estado Actual del Proyecto

### ✅ **COMPLETADO** (Últimas Actualizaciones)

- **🤖 Sistema ML Avanzado**: XGBoost con 99.81% accuracy, explicabilidad SHAP implementada
- **🤖 Integración Chatbot + ML**: Chatbot usa predicciones ML con explicaciones detalladas (factores de decisión, top 3 alternativas)
- **🧠 Feature Engineering**: 15 features avanzadas (severidad, emergencia, categorías, duración)
- **📊 Analytics Avanzados**: Dashboard completo con mapas interactivos, tendencias temporales
- **💬 Chatbot Mejorado**: Interfaz moderna con análisis inteligente de síntomas
- **📋 Metodología Ágil**: Scrum adaptado con 9 sprints completados, 206 story points, 99.81% ML accuracy
- **🐳 Docker Setup**: Configuración completa para desarrollo y producción
- **🔧 Backend API**: Endpoints completos para síntomas, chat y analytics
- **🧪 Testing**: Estrategia implementada con Jest y Supertest (85% coverage)
- **📖 Documentación API**: Swagger UI en `/api-docs`
- **🗺️ Mapa Interactivo**: Visualización geográfica de síntomas
- **🎯 Definition of Done**: Criterios completos para calidad y deployment

### 🔄 **EN DESARROLLO**
- **📱 App Móvil Completa**: Desarrollo completo con IA, chatbot médico y sincronización offline
- **🔐 Autenticación**: Sistema de usuarios y roles
- **📈 Monitoreo ML**: Dashboard de métricas en producción
- **🧠 Neural Networks**: Arquitectura creada (entrenamiento pendiente)

### 📋 **PRÓXIMOS PASOS** (Opcional)
- **🏥 Integración Hospitalaria**: Conectar con sistemas hospitalarios
- **📊 Feedback Loop**: Sistema de feedback médico para mejorar modelos
- **🌐 Despliegue Cloud**: Configuración para AWS/Azure

## 🏛️ Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Frontend Layer"
        MA[Mobile App<br/>React Native]
        WA[Web App<br/>React]
    end
    
    subgraph "API Gateway"
        NG[Nginx<br/>Reverse Proxy]
    end
    
    subgraph "Backend Services"
        BA[Backend API<br/>Node.js/TypeScript]
        AI[AI Services<br/>Python/FastAPI]
        AN[Analytics<br/>Dashboard]
    end
    
    subgraph "Data Layer"
        DB[(MongoDB<br/>Primary Database)]
        RD[(Redis<br/>Cache & Sessions)]
        FS[File Storage<br/>Medical Files]
        NT[Notifications<br/>Email/SMS]
    end
    
    MA --> NG
    WA --> NG
    NG --> BA
    NG --> AI
    NG --> AN
    
    BA --> DB
    BA --> RD
    AI --> DB
    AI --> RD
    AN --> DB
    
    BA --> FS
    BA --> NT
    AI --> FS
```

## 🛠️ Stack Tecnológico

### Backend Services
- **Node.js 18+** con TypeScript y Clean Architecture
- **Python 3.11+** con FastAPI para servicios de IA
- **MongoDB** con Motor (driver asíncrono)
- **Redis** para cache y sesiones
- **JWT** con refresh tokens para autenticación

### Frontend & Mobile
- **React 18** con TypeScript y Vite
- **React Native** con Expo para aplicación móvil
- **Tailwind CSS** para diseño responsive
- **Zustand** para gestión de estado

### IA y Machine Learning
- **🤖 XGBoost** para clasificación de enfermedades (99.81% accuracy)
- **🧠 SHAP** para explicabilidad de predicciones ML
- **📊 scikit-learn** para Random Forest baseline (99.19% accuracy)
- **🔧 Feature Engineering**: 15 features avanzadas (severidad, emergencia, categorías)
- **🎯 124 Enfermedades Respiratorias**: Base de datos completa con síntomas
- **💊 Explicabilidad SHAP**: Factores de decisión y predicciones alternativas

### DevOps e Infraestructura
- **Docker & Docker Compose** para containerización
- **Nginx** como reverse proxy
- **Structlog** para logging estructurado
- **Health checks** y métricas avanzadas

## 🚀 Inicio Rápido

### ⚡ Opción 1: Docker (Recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/respicare.git
cd respicare

# 2. Copiar configuración
cp env.example .env

# 3. Iniciar todo con Docker
docker-compose -f docker-compose.dev.yml up -d

# 4. Verificar servicios
docker-compose ps
```

**✅ ¡Listo!** Accede a:
- **Frontend Web**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentación API**: http://localhost:3001/api-docs
- **AI Services**: http://localhost:8000
- **MongoDB Express**: http://localhost:8081 (admin/admin123)

### 🔧 Opción 2: Instalación Manual

#### Prerrequisitos
- **Node.js** 18+ ([Descargar](https://nodejs.org/))
- **Python** 3.11+ ([Descargar](https://www.python.org/downloads/))
- **MongoDB** 6.0+ ([Descargar](https://www.mongodb.com/try/download/community))
- **Redis** 7.0+ ([Descargar](https://redis.io/download))

#### Instalación
```bash
# 1. Backend
cd backend && npm install && npm run dev

# 2. AI Services
cd ai-services && pip install -r requirements.txt && python main.py

# 3. Frontend
cd web && npm install && npm start
```

### 📚 Documentación Detallada

- **[Guía de Inicio Rápido](QUICKSTART.md)** - Instrucciones paso a paso
- **[Guía de Despliegue](DEPLOYMENT.md)** - Despliegue completo con Docker
- **[Configuración Docker](DOCKER_SETUP_COMPLETE.md)** - Estado actual de Docker

## 🔄 Flujo de Datos del Sistema

```mermaid
sequenceDiagram
    participant U as Usuario
    participant W as Web App
    participant B as Backend API
    participant A as AI Services
    participant D as MongoDB
    participant R as Redis
    
    U->>W: Ingresa síntomas
    W->>B: POST /api/symptom-reports
    B->>D: Guarda reporte
    B->>A: POST /api/v1/analyze
    A->>A: Procesa con IA
    A->>R: Cache resultado
    A-->>B: Retorna análisis
    B->>D: Guarda análisis
    B-->>W: Respuesta completa
    W-->>U: Muestra resultados
    
    Note over U,R: Flujo completo de análisis de síntomas
```

## 🌐 Servicios y Puertos

| Servicio | Puerto | Descripción | Tecnología |
|----------|--------|-------------|------------|
| **Web Frontend** | 3000 | Dashboard web para profesionales | React + TypeScript |
| **Backend API** | 3001 | API principal con Clean Architecture | Node.js + TypeScript |
| **AI Services** | 8000 | Servicios de IA con patrones avanzados | Python + FastAPI |
| **Mobile App** | - | Aplicación móvil nativa | React Native + Expo |
| **MongoDB** | 27017 | Base de datos principal | MongoDB |
| **Redis** | 6379 | Cache y sesiones | Redis |
| **Nginx** | 80/443 | Reverse proxy y load balancer | Nginx |
| **Adminer** | 8080 | Gestión de base de datos | Adminer |

## 📚 Documentación por Servicio

### 🖥️ Backend API
- **[Documentación Completa](backend/README.md)**
- **[Clean Architecture](backend/CLEAN_ARCHITECTURE.md)**
- **[Setup Guide](backend/SETUP.md)**
- **API Docs**: http://localhost:3001/api/docs

### 🤖 AI Services
- **[Documentación Completa](ai-services/README.md)**
- **[Patrones Implementados](ai-services/README_PATTERNS.md)**
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health/detailed

### 🌐 Web Frontend
- **[Documentación](web/README.md)**
- **Aplicación**: http://localhost:3000

### 📱 Mobile App
- **[Documentación Completa](mobile/README.md)** - App React Native con IA, chatbot médico y funcionalidades offline
- **[Integración Completa](MOBILE_INTEGRATION_COMPLETE.md)** - Documentación técnica de integración con backend y servicios AI
- **[Configuración](mobile/RespiCare-Mobile/README.md)**
- **Características**: Conexión completa al backend, servicios AI, chatbot médico, modo offline, sincronización automática

## 🔧 Comandos de Desarrollo

```bash
# Desarrollo
make dev          # Ver logs en tiempo real
make logs         # Ver logs de todos los servicios
make shell        # Acceder al shell del contenedor

# Construcción
make build        # Construir todas las imágenes
make rebuild      # Reconstruir desde cero
make clean        # Limpiar contenedores e imágenes

# Base de datos
make db-shell     # Acceder a MongoDB
make db-backup    # Respaldar base de datos
make db-restore   # Restaurar base de datos

# Testing
make test         # Ejecutar todos los tests
make test-ai      # Tests específicos de IA
make test-backend # Tests del backend

# Monitoreo
make health       # Health check completo
make metrics      # Ver métricas del sistema
make status       # Estado de todos los servicios
```

## 🏗️ Patrones de Arquitectura Implementados

### Patrones de Diseño
- **🏭 Factory Pattern**: Creación centralizada de servicios y modelos
- **🎯 Strategy Pattern**: Algoritmos de IA intercambiables
- **🔌 Circuit Breaker**: Protección contra fallos de servicios
- **📦 Repository Pattern**: Gestión de datos con auditoría
- **🎨 Decorator Pattern**: Funcionalidades transversales

### Patrones de Arquitectura
- **🏢 Clean Architecture**: Separación clara de responsabilidades
- **🔄 CQRS**: Separación de comandos y consultas
- **📡 Event-Driven**: Comunicación asíncrona entre servicios
- **🏗️ Microservicios Ligeros**: Servicios especializados y escalables

### Diagrama de Patrones Implementados

```mermaid
graph LR
    subgraph "Design Patterns"
        F[Factory Pattern<br/>Service Creation]
        S[Strategy Pattern<br/>AI Algorithms]
        CB[Circuit Breaker<br/>Fault Tolerance]
        R[Repository Pattern<br/>Data Access]
        D[Decorator Pattern<br/>Cross-cutting]
    end
    
    subgraph "Architecture Patterns"
        CA[Clean Architecture<br/>Separation of Concerns]
        CQRS[CQRS<br/>Command Query Separation]
        ED[Event-Driven<br/>Async Communication]
        MS[Microservices<br/>Specialized Services]
    end
    
    subgraph "Implementation"
        BE[Backend Services]
        AI[AI Services]
        WEB[Web Frontend]
        MOB[Mobile App]
    end
    
    F --> BE
    S --> AI
    CB --> BE
    CB --> AI
    R --> BE
    D --> BE
    D --> AI
    
    CA --> BE
    CA --> AI
    CQRS --> BE
    ED --> BE
    ED --> AI
    MS --> BE
    MS --> AI
    MS --> WEB
    MS --> MOB
```

## 🎯 Model-Driven Software Development (MDSD)

### Nivel de Madurez: 4.4/5.0 - TOP 10% 🏆

RespiCare implementa un enfoque avanzado de desarrollo dirigido por modelos que automatiza la generación de código desde modelos de dominio.

### Diagrama del Proceso MDSD

```mermaid
graph TD
    subgraph "PIM - Platform Independent Model"
        DM[Domain Model<br/>TypeScript Interfaces]
        UM[UML Diagrams<br/>PlantUML]
    end
    
    subgraph "Transformations"
        TG[Code Generators<br/>TypeScript]
        DG[Diagram Generators<br/>PlantUML]
        VG[Validation Generators<br/>TypeScript]
    end
    
    subgraph "PSM - Platform Specific Model"
        DTO[DTOs<br/>Request/Response]
        REP[Repositories<br/>Data Access]
        API[API Schemas<br/>OpenAPI]
        VAL[Validators<br/>Joi/Schema]
    end
    
    subgraph "Generated Artifacts"
        CODE[Generated Code<br/>Backend Services]
        DOCS[API Documentation<br/>Swagger UI]
        DIAG[Architecture Diagrams<br/>Mermaid/PlantUML]
    end
    
    DM --> TG
    UM --> DG
    DM --> VG
    
    TG --> DTO
    TG --> REP
    TG --> API
    VG --> VAL
    
    DTO --> CODE
    REP --> CODE
    API --> DOCS
    DG --> DIAG
    
    style DM fill:#e1f5fe
    style CODE fill:#c8e6c9
    style DOCS fill:#fff3e0
    style DIAG fill:#f3e5f5
```

### Características MDSD

#### ✅ Generación Automática de Código
```bash
# Generar DTOs, Repositories y más desde modelos de dominio
npm run generate

# Generar solo DTOs
npm run generate:dtos

# Generar solo Repositories
npm run generate:repositories
```

**Beneficios:**
- 87% menos código manual de infraestructura
- 0 errores de transformación
- Consistencia garantizada entre capas
- 77% más rápido crear nuevas entidades

#### 📊 Diagramas UML Automáticos
```bash
# Generar diagramas PlantUML desde código
npm run diagrams:generate
```

Diagramas disponibles:
- **Domain Model**: Modelo de dominio completo (PIM)
- **MDSD Transformations**: Flujo de transformaciones PIM ↔ PSM
- **Clean Architecture**: Mapeo de capas a MDSD

#### 🔍 Validación Continua
```bash
# Validar consistencia de modelos
npm run validate:models

# Validar schema OpenAPI
npm run validate:openapi
```

**CI/CD Pipeline automático:**
- Validación de modelos TypeScript
- Validación de schema OpenAPI
- Generación automática de código
- Generación de diagramas UML
- Métricas de calidad MDSD

### Documentación MDSD

- **[Informe MDSD Completo](MDSD_INFORME.md)** - Análisis exhaustivo (1,600 líneas)
- **[Guía de Mejoras MDSD](MDSD_IMPROVEMENTS.md)** - Implementación y ejemplos (800 líneas)
- **[Resumen Ejecutivo](MDSD_SUMMARY.md)** - Resultados y métricas
- **[Diagramas UML](docs/diagrams/)** - Modelado visual de arquitectura
- **[OpenAPI Schema](backend/openapi/respicare-api.yaml)** - Especificación completa API

### Métricas de Impacto

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Nivel MDSD | 2.8/5.0 | 4.4/5.0 | +57% |
| Código generado | 0% | 87% | +87% |
| Tiempo nueva entidad | 3h | 50min | -72% |
| Errores transformación | ~10 | 0 | -100% |
| Posición industria | P60 | P92 (TOP 10%) | 🏆 |

### Flujo de Desarrollo MDSD

```
1. Definir modelo de dominio (PIM)
   ↓
2. Ejecutar: npm run generate
   ↓
3. Código generado automáticamente:
   • DTOs (Request/Response)
   • Repositories (CRUD completo)
   • Transformadores (PIM ↔ PSM)
   • Interfaces de dominio
   ↓
4. Validación automática (CI/CD)
   ↓
5. Deploy con confianza
```

## 🔒 Seguridad

- **🔐 Autenticación JWT** con refresh tokens
- **👥 Control de Acceso Basado en Roles (RBAC)**
- **🔒 Encriptación de datos** sensibles
- **📝 Soft Delete** para cumplimiento normativo
- **📋 Audit Trail** completo de operaciones
- **🛡️ Validación de entrada** en todas las APIs

## 📊 Monitoreo y Observabilidad

- **📈 Métricas detalladas** por servicio y patrón
- **📝 Logging estructurado** con contexto
- **🔍 Health checks** avanzados
- **⚡ Circuit breaker metrics** para resiliencia
- **💾 Cache metrics** para optimización
- **🔄 Retry metrics** para análisis de fallos

## 🧪 Testing

```bash
# Tests completos
make test

# Tests por servicio
make test-backend    # Backend API
make test-ai         # AI Services
make test-web        # Web Frontend
make test-mobile     # Mobile App

# Tests con cobertura
make test-coverage

# Tests de integración
make test-integration
```

## 📚 Índice de Documentación

### 🚀 **Quick Start y Despliegue**
- **[🚀 Guía de Inicio Rápido](QUICKSTART.md)** - Instalación y configuración en 5 minutos
- **[🐳 Guía de Despliegue](DEPLOYMENT.md)** - Despliegue completo con Docker
- **[✅ Configuración Docker](DOCKER_SETUP_COMPLETE.md)** - Estado actual de contenedores

### 🤖 **Machine Learning y AI**
- **[🎯 Roadmap ML](ML_ROADMAP.md)** - Roadmap completo del sistema ML (99.81% accuracy)
- **[✅ Sistema ML Completado](ML_SYSTEM_COMPLETE.md)** - Resumen del sistema Machine Learning
- **[🧠 SHAP Explicabilidad](SHAP_EXPLAINABILITY_IMPLEMENTED.md)** - Sistema de explicabilidad ML
- **[🤖 Integración Chatbot + ML](CHATBOT_ML_INTEGRATION_COMPLETE.md)** - Chatbot con predicciones ML
- **[💬 Guía del Chatbot](GUIA_CHATBOT_MEDICO.md)** - Sistema de chatbot médico
- **[🦠 Enfermedades Respiratorias](lista_enfermedades_respiratorias.md)** - Base de datos: 124 enfermedades con síntomas
- **[🤖 Servicios AI Implementados](AI_SERVICES_IMPLEMENTATION_COMPLETE.md)** - Servicios de IA Python/FastAPI
- **[📊 Documentación API AI](ai-services/API_DOCUMENTATION.md)** - APIs de servicios de IA

### 📊 **Analytics y Visualizaciones**
- **[📊 Analytics Implementados](ANALYTICS_IMPLEMENTATION_COMPLETE.md)** - Dashboard con visualizaciones avanzadas
- **[🗺️ Mapa Interactivo](MAPA_INTERACTIVO_IMPLEMENTADO.md)** - Visualización geográfica
- **[📈 Backend Reportes Síntomas](BACKEND_SYMPTOM_REPORTS_API.md)** - Endpoints y rutas API

### 🏗️ **Arquitectura y Diseño**
- **[🏛️ Análisis MDSD](ANALISIS_MDSD_RESPICARE.md)** - Model-Driven Development (Nivel 4.4/5.0 - TOP 10%)
- **[🏗️ Clean Architecture](backend/CLEAN_ARCHITECTURE.md)** - Patrones arquitectónicos
- **[📖 Backend README](backend/README.md)** - Documentación API Backend
- **[🤖 AI Services README](ai-services/README.md)** - Servicios de IA Python/FastAPI
- **[🔄 Patrones de Diseño](ai-services/README_PATTERNS.md)** - Strategy, Factory, Circuit Breaker
- **[📋 Metodología Ágil](METODOLOGIA_AGIL_PROYECTO.md)** - Scrum adaptado y gestión de proyecto

### 📱 **Plataforma Móvil**
- **[📱 Integración Móvil Completa](MOBILE_INTEGRATION_COMPLETE.md)** - Documentación técnica completa de la integración móvil
- **[📱 Documentación Mobile](mobile/README.md)** - Guía completa de la aplicación móvil React Native

### 🧪 **Testing y Calidad**
- **[✅ Estrategia de Testing](TESTING_STRATEGY.md)** - Plan completo de pruebas
- **[📊 Reporte de Testing](TESTING_REPORT.md)** - Resultados de pruebas
- **[🔒 Seguridad](SECURITY.md)** - Medidas de seguridad implementadas
- **[🧪 Guía de Testing AI](ai-services/TESTING_GUIDE.md)** - Estrategia de pruebas IA

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crear** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abrir** un Pull Request

### Guías de Contribución
- **[Backend Development](backend/CONTRIBUTING.md)**
- **[AI Services Development](ai-services/CONTRIBUTING.md)**
- **[Frontend Development](web/CONTRIBUTING.md)**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollo Backend**: Equipo de Backend
- **Desarrollo IA**: Equipo de Machine Learning
- **Desarrollo Frontend**: Equipo de Frontend
- **DevOps**: Equipo de Infraestructura

## 📞 Soporte

Para soporte técnico o preguntas:
- 📧 **Email**: support@respicare.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Zod0808/respicare-tacna/issues)
- 📚 **Documentación**: [Wiki del Proyecto](https://github.com/Zod0808/respicare-tacna/wiki)

---

## 📊 Métricas del Proyecto

### **Desarrollo**
- **Líneas de código**: ~60,000+
- **Cobertura de tests**: 85%+
- **Servicios**: 4 microservicios principales
- **Patrones implementados**: 12+ patrones de diseño
- **Tecnologías**: 15+ tecnologías integradas

### **Documentación**
- **Documentación**: 95%+ documentada
- **APIs documentadas**: 100% con Swagger UI
- **Metodología ágil**: 9 sprints completados, 206 story points

### **Machine Learning**
- **Sistema ML**: 99.81% accuracy con XGBoost + SHAP
- **Explicabilidad**: Factores de decisión y predicciones alternativas
- **Feature Engineering**: 15 features avanzadas
- **124 Enfermedades**: Base de datos completa con síntomas

### **Calidad y Entregas**
- **Chatbot ML**: Predicciones con explicaciones detalladas
- **Mapas interactivos**: Visualización geográfica completa
- **Analytics avanzados**: Dashboard con múltiples gráficos
- **Velocity del equipo**: 22.9 SP/sprint
- **Predictibilidad**: 85% de historias completadas

---

**RespiCare** - Transformando la atención médica respiratoria con tecnología de vanguardia 🏥✨
- 💬 **Discord**: [Canal de Soporte](https://discord.gg/respicare)

## 🔄 Changelog

### v1.0.12 - Plataforma Móvil Completa con IA y Chatbot Médico (Actual) 📱🤖
- ✅ **App Móvil Completa**: React Native con todas las funcionalidades del sistema
- ✅ **Conexión Backend**: API client completo con autenticación JWT y manejo de errores
- ✅ **Servicios AI**: Análisis de síntomas con fallback automático a análisis local
- ✅ **Chatbot Médico**: Asistente virtual inteligente con detección de emergencias
- ✅ **Modo Offline**: Sincronización automática y almacenamiento local robusto
- ✅ **Dashboard Móvil**: Pantalla de inicio con estadísticas y acciones rápidas
- ✅ **Sincronización Inteligente**: Cola de datos con reintentos automáticos
- ✅ **Arquitectura Escalable**: Servicios modulares y configuración por ambiente
- ✅ **Seguridad Robusta**: Encriptación local y comunicación HTTPS
- ✅ **Documentación Completa**: README actualizado con guías de instalación

### v1.0.11 - Sistema ML con Explicabilidad y Metodología Ágil 🎯
- ✅ **Sistema ML XGBoost**: 99.81% accuracy para clasificación de enfermedades
- ✅ **Explicabilidad SHAP**: Factores de decisión y predicciones alternativas
- ✅ **Integración Chatbot + ML**: Respuestas con análisis detallado
- ✅ **Feature Engineering**: 15 features avanzadas (severidad, emergencia, categorías)
- ✅ **Dataset Sintético**: 64,522 casos con 26 enfermedades
- ✅ **Base de Datos de Enfermedades**: 124 enfermedades respiratorias con síntomas
- ✅ **Random Forest Baseline**: 99.19% accuracy como referencia
- ✅ **Metodología Ágil**: Scrum adaptado documentado, 9 sprints completados
- ✅ **206 Story Points**: Total entregado, velocidad 22.9 SP/sprint
- ✅ **Definition of Done**: Criterios completos para calidad y deployment

### v1.0.9 - Arquitectura con Patrones
- ✅ Implementación completa de patrones de software
- ✅ Arquitectura de microservicios robusta
- ✅ IA avanzada con múltiples estrategias
- ✅ Observabilidad y monitoreo completo
- ✅ Seguridad mejorada con RBAC
- ✅ Documentación técnica completa
- ✅ Chatbot mejorado con interfaz moderna
- ✅ Analytics avanzados con mapas interactivos

### v1.0.0 - Versión Inicial
- ✅ Sistema básico de gestión médica
- ✅ APIs fundamentales
- ✅ Interfaz web básica
- ✅ Base de datos MongoDB

---

<div align="center">
  <strong>🏥 RespiCare © 2025 - Cuidando tu salud respiratoria con tecnología avanzada</strong>
</div>