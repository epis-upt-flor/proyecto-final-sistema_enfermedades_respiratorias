# 🏥 RespiCare - Sistema Integral de Enfermedades Respiratorias

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![React 18+](https://img.shields.io/badge/react-18+-61dafb.svg)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue.svg)](https://www.docker.com/)

## 📋 Descripción del Proyecto

**RespiCare** es un sistema integral de gestión y análisis de enfermedades respiratorias que combina tecnologías de vanguardia con patrones de arquitectura robustos para brindar una solución completa en el ámbito de la salud respiratoria.

### 🎯 Características Principales

- **🏗️ Arquitectura de Microservicios**: Sistema distribuido con servicios especializados
- **🤖 IA Avanzada**: Análisis inteligente de síntomas y historias médicas
- **📱 Aplicación Móvil**: App nativa para seguimiento de pacientes
- **🌐 Web Dashboard**: Interfaz web moderna para profesionales de salud
- **🔒 Seguridad Robusta**: Autenticación JWT, RBAC y encriptación de datos
- **📊 Observabilidad**: Logging estructurado, métricas y monitoreo completo
- **🔄 Patrones de Software**: Strategy, Factory, Circuit Breaker, Repository y más

## 🏛️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        RespiCare Ecosystem                     │
├─────────────────────────────────────────────────────────────────┤
│  📱 Mobile App (React Native)    │  🌐 Web App (React)         │
│  └─────────────────────────────┘  └─────────────────────────────┘
│                   │                           │
│                   └───────────┬───────────────┘
│                               │
│  🔄 API Gateway (Nginx)       │
│  └─────────────────────────────┘
│                   │
│  ┌─────────────────┼─────────────────┐
│  │                 │                 │
│  ▼                 ▼                 ▼
│  🖥️  Backend API    │  🤖 AI Services  │  📊 Analytics
│  (Node.js/TS)      │  (Python/FastAPI)│  (Dashboard)
│  └─────────────────┘                 │
│                   │                 │
│  ┌─────────────────┼─────────────────┼─────────────────┐
│  │                 │                 │                 │
│  ▼                 ▼                 ▼                 ▼
│  🗄️  MongoDB        │  ⚡ Redis Cache  │  📁 File Storage │  📧 Notifications
│  (Primary DB)      │  (Session/Cache) │  (Medical Files) │  (Email/SMS)
└─────────────────────────────────────────────────────────────────┘
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
- **OpenAI GPT** para análisis avanzado
- **spaCy** para procesamiento de lenguaje natural
- **scikit-learn** para clasificación de síntomas
- **Transformers** para modelos locales

### DevOps e Infraestructura
- **Docker & Docker Compose** para containerización
- **Nginx** como reverse proxy
- **Structlog** para logging estructurado
- **Health checks** y métricas avanzadas

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker & Docker Compose
- Node.js 18+ (para desarrollo local)
- Python 3.11+ (para desarrollo local)
- Git

### Instalación y Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/Zod0808/respicare-tacna.git respicare-tacna
cd respicare-tacna

# 2. Configuración inicial
make setup

# 3. Construir y ejecutar todos los servicios
make build
make up

# 4. Verificar que todos los servicios funcionan
make health

# 5. Ver logs en tiempo real (opcional)
make dev
```

### Verificación del Sistema

```bash
# Health check general
curl http://localhost/api/v1/health

# Health check detallado con patrones
curl http://localhost:8000/api/v1/health/detailed

# Verificar servicios específicos
curl http://localhost:3001/api/v1/health  # Backend API
curl http://localhost:8000/api/v1/health  # AI Services
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
- **[Documentación](mobile/README.md)**
- **[Configuración](mobile/RespiCare-Mobile/README.md)**

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
- 💬 **Discord**: [Canal de Soporte](https://discord.gg/respicare)

## 🔄 Changelog

### v2.0.0 - Arquitectura con Patrones (Actual)
- ✅ Implementación completa de patrones de software
- ✅ Arquitectura de microservicios robusta
- ✅ IA avanzada con múltiples estrategias
- ✅ Observabilidad y monitoreo completo
- ✅ Seguridad mejorada con RBAC
- ✅ Documentación técnica completa

### v1.0.0 - Versión Inicial
- ✅ Sistema básico de gestión médica
- ✅ APIs fundamentales
- ✅ Interfaz web básica
- ✅ Base de datos MongoDB

---

<div align="center">
  <strong>🏥 RespiCare - Cuidando tu salud respiratoria con tecnología avanzada</strong>
</div>