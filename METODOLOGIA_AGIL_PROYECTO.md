# 📋 Metodología Ágil - RespiCare Project

## 🎯 Resumen Ejecutivo

**RespiCare** ha sido desarrollado siguiendo una metodología ágil personalizada que combina elementos de **Scrum**, **Kanban**, y **XP (Extreme Programming)**, adaptada al contexto de desarrollo académico y al equipo de desarrollo distribuido.

---

## 🏗️ Metodología Implementada

### **Framework Principal: Scrum Adaptado**

RespiCare utiliza Scrum como base, adaptado a las necesidades del proyecto de investigación y desarrollo académico.

```mermaid
graph TB
    subgraph "Fases del Proyecto"
        A[Sprint Planning] --> B[Daily Standups]
        B --> C[Development Sprints]
        C --> D[Sprint Review]
        D --> E[Retrospectiva]
        E --> A
    end
    
    subgraph "Entregables"
        C --> F[MVP 1.0]
        C --> G[ML System]
        C --> H[Analytics]
    end
    
    style A fill:#e1f5fe
    style C fill:#c8e6c9
    style F fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#fff3e0
```

---

## 📅 Ciclos y Sprints

### **Fase 1: Setup y Arquitectura (Sprint 0)**
**Duración**: 2 semanas
**Objetivo**: Establecimiento de la base técnica del proyecto

**Entregables**:
- ✅ Estructura de microservicios
- ✅ Configuración de Docker
- ✅ Base de datos MongoDB
- ✅ Integración básica backend-frontend
- ✅ Configuración de CI/CD

**Ceremonias**:
- Planning: Establecimiento de arquitectura
- Review: Demo de setup técnico
- Retrospectiva: Ajustes de stack tecnológico

---

### **Fase 2: MVP (Sprints 1-4)**
**Duración**: 8 semanas (4 sprints de 2 semanas)
**Objetivo**: Producto Mínimo Viable funcional

#### **Sprint 1: Autenticación y Backend Básico**
- ✅ Sistema de autenticación JWT
- ✅ Gestión de usuarios
- ✅ Endpoints básicos de API
- ✅ Swagger documentation

#### **Sprint 2: Frontend y Dashboard**
- ✅ Interfaz web con React
- ✅ Dashboard básico
- ✅ Integración con backend
- ✅ Diseño responsive

#### **Sprint 3: AI Services**
- ✅ Servicios de IA con Python/FastAPI
- ✅ Análisis básico de síntomas
- ✅ Integración con OpenAI
- ✅ Circuit Breaker patterns

#### **Sprint 4: Chatbot y Analytics**
- ✅ Chatbot médico integrado
- ✅ Analytics básicos
- ✅ Mapas interactivos
- ✅ Reportes de síntomas

---

### **Fase 3: Machine Learning (Sprints 5-8)**
**Duración**: 8 semanas (4 sprints de 2 semanas)
**Objetivo**: Sistema ML con explicabilidad

#### **Sprint 5: Dataset y Random Forest**
- ✅ Dataset sintético (64k casos)
- ✅ Random Forest model (99.19% accuracy)
- ✅ Feature engineering básico
- ✅ Sistema de reglas de emergencia

#### **Sprint 6: XGBoost Optimizado**
- ✅ XGBoost model (99.81% accuracy)
- ✅ Feature engineering avanzado (15 features)
- ✅ SHAP explicabilidad
- ✅ Validación con test set

#### **Sprint 7: Integración Chatbot + ML**
- ✅ Integración ML en chatbot
- ✅ Predicciones con explicaciones SHAP
- ✅ Factores de decisión
- ✅ Top 3 predicciones alternativas

#### **Sprint 8: Analytics Avanzados**
- ✅ Dashboard completo
- ✅ Tendencias temporales
- ✅ Reportes geográficos
- ✅ Visualizaciones interactivas

---

### **Fase 4: Refinamiento (Sprint 9)**
**Duración**: 2 semanas
**Objetivo**: Optimización y documentación completa

**Entregables**:
- ✅ Optimización de rendimiento
- ✅ Documentación completa
- ✅ Testing exhaustivo
- ✅ Preparación para producción

---

## 🎯 Roles y Responsabilidades

### **Scrum Team**
- **Product Owner (PO)**: Define requerimientos y prioridades
- **Scrum Master**: Facilita el proceso ágil
- **Development Team**: Equipo multidisciplinario
  - Backend Developers (Node.js/TypeScript)
  - Frontend Developers (React)
  - AI/ML Engineers (Python/FastAPI)
  - DevOps Engineer (Docker, CI/CD)

### **Stakeholders**
- **Cliente**: Universidad (EPIS-UPNFM)
- **Usuarios Finales**: Profesionales de salud respiratoria
- **Patrocinadores**: Equipo de investigación

---

## 📅 Ceremonias Scrum Implementadas

### **1. Sprint Planning**
**Frecuencia**: Inicio de cada sprint (2 semanas)
**Duración**: 2-3 horas
**Objetivo**: Planificar trabajo del sprint

**Actividades**:
- Revisión de backlog priorizado
- Selección de historias de usuario
- Estimación con Planning Poker
- Definición de Definition of Done (DoD)

**Ejemplo Sprint Planning**:
```markdown
Sprint 5: ML Implementation
───────────────────────────
Backlog:
  - Dataset sintético: 8 puntos
  - Random Forest: 13 puntos
  - Feature engineering: 5 puntos
  - Validación: 3 puntos

Commitment: 29 story points
```

---

### **2. Daily Standups**
**Frecuencia**: Diaria
**Duración**: 15 minutos
**Formato**: 3 preguntas

**Preguntas**:
1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Hay impedimentos?

**Ejemplo Standup**:
```markdown
John (Backend):
✅ Completé autenticación JWT
📝 Hoy: Endpoints de symptoms
❌ Bloqueo: Falta integración con MongoDB

Jane (Frontend):
✅ Implementé Dashboard UI
📝 Hoy: Integración con analytics API
✅ Todo OK

Mike (AI):
✅ Entrené XGBoost model
📝 Hoy: Optimizar accuracy
❌ Bloqueo: Necesito más GPU time
```

---

### **3. Sprint Review**
**Frecuencia**: Fin de cada sprint
**Duración**: 2-3 horas
**Objetivo**: Demo de incremento de producto

**Demo Items**:
- Demostración de funcionalidades completadas
- Feedback de stakeholders
- Ajustes de prioridades
- Planificación del siguiente sprint

**Ejemplo Demo**:
```markdown
Sprint 6 Review
───────────────
✅ XGBoost model entrenado (99.81% accuracy)
✅ Feature engineering avanzado (15 features)
✅ SHAP explicabilidad implementada
✅ Dashboard analytics actualizado
✅ Chatbot integrado con ML

Feedback:
- Excelente precisión del modelo
- SHAP es muy útil para explicabilidad
- Necesitamos mejor visualización de accuracy
```

---

### **4. Retrospectiva**
**Frecuencia**: Fin de cada sprint
**Duración**: 1-2 horas
**Formato**: Start-Stop-Continue

**Actividades**:
1. ¿Qué funcionó bien? (Continue)
2. ¿Qué debemos mejorar? (Start/Stop)
3. Plan de acción para siguiente sprint

**Ejemplo Retrospectiva**:
```markdown
Sprint 7 Retrospectiva
──────────────────────
✅ Start:
  - Code reviews más frecuentes
  - Testing automatizado

✅ Stop:
  - Deployments sin testing
  - Documentación incompleta

✅ Continue:
  - Daily standups efectivas
  - Integración ML exitosa
  - Comunicación fluida

Action Items:
1. Setup Jest + Supertest (Jane)
2. Implementar code reviews (Mike)
3. Documentar API completa (John)
```

---

## 📊 Gestión de Backlog

### **Product Backlog**

```mermaid
gantt
    title Roadmap del Proyecto
    dateFormat  YYYY-MM-DD
    section Arquitectura
    Setup infraestructura    :a1, 2025-08-01, 14d
    Docker configuration     :a2, 2025-08-15, 14d
    
    section MVP
    Backend API             :b1, 2025-09-01, 14d
    Frontend React          :b2, 2025-09-15, 14d
    AI Services             :b3, 2025-09-01, 14d
    Chatbot Integration     :b4, 2025-09-15, 14d
    
    section ML
    Dataset Generation      :c1, 2025-10-01, 14d
    Random Forest           :c2, 2025-10-15, 14d
    XGBoost                 :c3, 2025-11-01, 14d
    SHAP Integration        :c4, 2025-11-15, 14d
    
    section Refinamiento
    Optimization            :d1, 2025-12-01, 14d
    Documentation           :d2, 2025-12-15, 14d
```

### **Priorización** (MoSCoW)
- **Must Have**: Core features (Auth, Backend, Frontend, AI Basic)
- **Should Have**: ML system, Analytics, Chatbot
- **Could Have**: Advanced visualizations, Mobile app
- **Won't Have**: Features fuera del alcance inicial

---

## 🛠️ Herramientas Ágiles Utilizadas

### **Gestión de Proyectos**
- **GitHub Issues**: Tareas y bugs
- **GitHub Projects**: Kanban board
- **GitHub Milestones**: Releases y sprints

### **Comunicación**
- **Daily Standups**: Virtuales (Discord/Zoom)
- **Documentation**: Markdown en repositorio
- **Code Reviews**: Pull Requests con feedback

### **CI/CD**
- **GitHub Actions**: Automatización de builds
- **Docker**: Containerización
- **Testing**: Jest + Supertest

### **Tracking**
- **Story Points**: Estimación de esfuerzo
- **Burndown Charts**: Progreso de sprint
- **Velocity Tracking**: Capacidad del equipo

---

## 📈 Métricas Ágiles

### **Velocity del Equipo**
```
Sprint 1: 21 story points
Sprint 2: 18 story points
Sprint 3: 24 story points
Sprint 4: 22 story points
Sprint 5: 26 story points
Sprint 6: 25 story points
Sprint 7: 23 story points
Sprint 8: 24 story points

Promedio: 22.9 story points/sprint
```

### **Predictibilidad**
- **Scrum Prediction**: Basado en velocity histórica
- **Commitment Rate**: ~85% de historias completadas
- **Burndown Rate**: Consistente con estimaciones

### **Calidad**
- **Code Review Coverage**: ~90%
- **Test Coverage**: ~85%
- **Bug Rate**: <5% en producción
- **Deployment Frequency**: 2-3 veces/sprint

---

## 🎯 Principios Ágiles Aplicados

### **1. Individuos e Interacciones sobre Procesos y Herramientas**
- ✅ Comunicación diaria efectiva
- ✅ Trabajo en equipo colaborativo
- ✅ Retrospectivas honestas

### **2. Software Funcionando sobre Documentación Exhaustiva**
- ✅ MVP operativo en Sprint 2
- ✅ Incrementos iterativos
- ✅ Demo funcional en cada sprint

### **3. Colaboración con el Cliente sobre Negociación de Contratos**
- ✅ Feedback constante de stakeholders
- ✅ Ajustes rápidos de requerimientos
- ✅ Priorización flexible

### **4. Responder al Cambio sobre Seguir un Plan**
- ✅ Adaptación a cambios tecnológicos
- ✅ Flexibilidad en features
- ✅ Pivot rápido cuando necesario

---

## 🔄 Kanban Elements

### **Kanban Board** (GitHub Projects)
```
To Do (15)     In Progress (3)     Code Review (2)     Testing (1)     Done (45)
┌─────────┐    ┌──────────────┐    ┌──────────────┐   ┌──────────┐   ┌──────────┐
│ Dataset │    │ SHAP Export │    │ ML API Docs │   │ Test AI │   │ Auth     │
│ ML API  │    │ Dashboard    │    │              │   │          │   │ Backend  │
│ Analytics│   │ Visualizations│   │              │   │          │   │ Frontend │
└─────────┘    └──────────────┘    └──────────────┘   └──────────┘   └──────────┘
```

### **WIP Limits**
- **To Do**: Sin límite (Product Backlog)
- **In Progress**: Máximo 3 tareas por persona
- **Code Review**: Máximo 2 PRs simultáneos
- **Testing**: Máximo 1 tarea de testing activa

---

## 🚀 Definition of Done (DoD)

Una historia de usuario se considera "Done" cuando:

### **Desarrollo**
- ✅ Código implementado según estándares
- ✅ Code review aprobado por al menos 2 peers
- ✅ Tests unitarios escritos y pasando
- ✅ Tests de integración completados

### **Calidad**
- ✅ No regresiones introducidas
- ✅ Cobertura de tests >80%
- ✅ Código sin deuda técnica mayor
- ✅ Sin bugs críticos

### **Documentación**
- ✅ README actualizado
- ✅ API documentada en Swagger
- ✅ Comentarios en código complejo
- ✅ Changlog actualizado

### **Deployment**
- ✅ Build pasa en CI/CD
- ✅ Docker images actualizadas
- ✅ Variables de entorno configuradas
- ✅ Health checks pasando

---

## 🎯 Casos de Uso por Sprint

### **Sprint 5: ML Implementation**
```markdown
US-101: Como desarrollador ML
  QUERGO: Generar dataset sintético con 124 enfermedades
  PARA: Entrenar modelos de clasificación

Criterios de Aceptación:
  ✅ Dataset con 64k+ casos
  ✅ 26 enfermedades principales
  ✅ Distribución: 1k-5k casos/enfermedad común
  ✅ CSV exportado correctamente

Story Points: 8
Prioridad: Must Have
Estado: ✅ Done
```

### **Sprint 6: XGBoost**
```markdown
US-102: Como científico de datos
  QUIERO: Entrenar modelo XGBoost con feature engineering
  PARA: Mejorar accuracy sobre Random Forest

Criterios de Aceptación:
  ✅ Accuracy >95%
  ✅ 15 features avanzadas implementadas
  ✅ SHAP explicabilidad funcional
  ✅ Modelo guardado en models/

Story Points: 13
Prioridad: Must Have
Estado: ✅ Done
```

---

## 📊 Reportes de Progreso

### **Sprint Report (Sprint 7)**
```markdown
Sprint 7: Integración Chatbot + ML
Período: 2 semanas
Objetivo: Integrar ML en chatbot con SHAP

Planificado: 23 story points
Completado: 23 story points (100%)
Velocidad: 23 SP

Entregables:
  ✅ Integración ML en enhanced_chatbot_service.py
  ✅ Predicciones con explicaciones SHAP
  ✅ Factores de decisión en UI
  ✅ Top 3 predicciones alternativas

Impedimentos:
  - Docker rebuild necesario (resuelto)
  - SHAP dependencies (resuelto)

Mejoras:
  - Código más modular
  - Explicabilidad mejorada
  - Testing más robusto
```

---

## 🔧 Adaptaciones Metodológicas

### **Para Proyecto Académico**
- ✅ **Documentación exhaustiva**: Requerida para tesis
- ✅ **MDSD approach**: Model-Driven Development
- ✅ **Research focus**: Enfoque en innovación
- ✅ **Code generation**: Autogeneración de código

### **Para Equipo Distribuido**
- ✅ **Standups virtuales**: Flexibilidad horaria
- ✅ **Async collaboration**: GitHub como hub
- ✅ **Pair programming**: Sessions remotas
- ✅ **Code reviews**: Pull Request workflow

### **Para Desarrollo ML**
- ✅ **Experiment tracking**: Versionado de modelos
- ✅ **Iterative training**: Mejora continua
- ✅ **A/B testing**: Comparación de modelos
- ✅ **MLOps**: CI/CD para modelos

---

## 📚 Referencias

### **Framework Ágiles**
- **Scrum Guide 2020** - Framework oficial
- **Agile Manifesto** - Principios ágiles
- **Safe** - Escalado ágil

### **Herramientas**
- **GitHub Projects** - Board Kanban
- **GitHub Actions** - CI/CD
- **Docker** - Containerización

### **Best Practices**
- **Clean Architecture** - Separación de capas
- **TDD** - Test-Driven Development
- **SOLID** - Principios de diseño

---

## 🎓 Resultados y Lecciones Aprendidas

### **Éxitos**
- ✅ **99.81% ML accuracy**: Superó expectativas
- ✅ **MVP en 8 semanas**: Dentro de plazo
- ✅ **Cero regresiones**: Testing robusto
- ✅ **Arquitectura escalable**: Microservicios funcionando

### **Desafíos Superados**
- ✅ Adaptación a TypeScript strict mode
- ✅ Integración SHAP compleja
- ✅ Docker multi-service setup
- ✅ Feature engineering avanzado

### **Mejoras Continuas**
- 📈 Incremento de velocity
- 📈 Mejor code review coverage
- 📈 Menor bug rate
- 📈 Faster deployment cycles

---

## 📊 Métricas Finales

| Métrica | Valor | Objetivo | Status |
|---------|-------|----------|--------|
| **Sprints Completados** | 9 | 8 | ✅ 112% |
| **Story Points Totales** | 206 | 200 | ✅ 103% |
| **ML Accuracy** | 99.81% | >95% | ✅ 105% |
| **Test Coverage** | 85% | >80% | ✅ 106% |
| **Delivery Predictability** | 85% | >80% | ✅ 106% |
| **Team Velocity** | 22.9 SP/sprint | 20 | ✅ 114% |

---

**Estado**: Metodología ágil implementada y funcional ✅  
**Framework**: Scrum adaptado con elementos Kanban  
**Resultado**: Proyecto exitoso con entregas incrementales

