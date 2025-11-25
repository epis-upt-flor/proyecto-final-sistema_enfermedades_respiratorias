# 📋 Funcionalidades Pendientes de Implementación - RespiCare Tacna

**Última actualización:** Diciembre 2024

Este documento consolida todas las funcionalidades documentadas en roadmaps y documentación que aún no han sido implementadas.

---

## 📱 Mobile (medical-app)

### Fase M4: Experiencia y Funciones Avanzadas

#### ⏳ Tutoriales Interactivos (Prioridad: MEDIA)
- **Estado:** Pendiente
- **Descripción:** Tour guiado para nuevos usuarios (primera vez)
- **Requisitos:**
  - Pantalla de onboarding con 3 slides (síntomas, citas, alertas/recomendaciones)
  - Flag persistente `onboarding_completed` en AsyncStorage
  - Textos internacionalizados (ES/EN)
  - Hints contextuales con navegación entre pasos
- **Archivos a crear:**
  - `mobile/medical-app/components/tutorial/TutorialOverlay.tsx`
  - `mobile/medical-app/hooks/useTutorial.ts`
- **Referencia:** `docs/roadmaps/MOBILE_ROADMAP.md` - Fase M4

#### ⏳ Compartir Reportes (Prioridad: BAJA)
- **Estado:** Pendiente
- **Descripción:** Share sheet con enlaces a reportes PDF firmados
- **Requisitos:**
  - Compartir reportes desde vista de médicos
  - Enlaces a reportes PDF firmados
  - Compatible con WhatsApp/Email
- **Referencia:** `docs/roadmaps/MOBILE_ROADMAP.md` - Fase M4

#### ⏳ AR Ejercicios (Prioridad: BAJA)
- **Estado:** Pendiente
- **Descripción:** Realidad aumentada para ejercicios respiratorios
- **Requisitos:**
  - Pantalla `ARTrainingScreen` con overlay AR real
  - Modos: respiración, inhalador
  - Rutina guiada con progreso
- **Nota:** Actualmente hay un stub/placeholder
- **Referencia:** `docs/roadmaps/MOBILE_ROADMAP.md` - Fase M4

### Fase M5: Funcionalidades Adicionales Médico-Paciente

#### ⏳ Telemedicina Completa (Prioridad: MEDIA)
- **Estado:** Parcial (botón implementado, falta integración completa)
- **Descripción:** Integración completa con proveedor de video (Jitsi, Zoom, etc.)
- **Requisitos:**
  - Integración real con proveedor de video
  - Sala de espera virtual
  - Compartir pantalla
  - Grabación de sesiones (opcional)
- **Archivos a modificar:**
  - `mobile/medical-app/components/views/appointment-detail.tsx`
  - `mobile/medical-app/lib/services/telemedicineService.ts` (actualmente stub)
- **Referencia:** `docs/roadmaps/MOBILE_ROADMAP.md` - Fase M5

### Fase M3: Offline/Sync y Calidad

#### ⏳ Tests de Integración Offline/Sync (Prioridad: MEDIA)
- **Estado:** Pendiente
- **Descripción:** Tests completos de sincronización offline
- **Requisitos:**
  - Tests de uso en modo offline (lectura de datos cacheados)
  - Tests de reconexión y sincronización automática
  - Tests de manejo de errores de red recurrentes
- **Archivos a crear:**
  - `mobile/medical-app/__tests__/offline/offline-sync.test.ts`
- **Referencia:** `docs/roadmaps/MOBILE_ROADMAP.md` - Fase M3

#### ⏳ Optimización de Rendimiento Avanzada (Prioridad: MEDIA)
- **Estado:** Pendiente (optimización básica implementada)
- **Descripción:** Optimizaciones adicionales de rendimiento
- **Requisitos:**
  - Análisis de dependencias y bundle size
  - Configuración avanzada de bundler
  - Mediciones reales en dispositivos
  - Optimización de consumo de batería
- **Referencia:** `docs/roadmaps/MOBILE_ROADMAP.md` - Fase M3

---

## 🌐 Web (React)

### Fase 2: Funcionalidad Core

#### ⏳ Accesibilidad Base (a11y) y i18n (Prioridad: MEDIA)
- **Estado:** En progreso
- **Descripción:** Soporte completo de accesibilidad y internacionalización
- **Requisitos:**
  - Accesibilidad WCAG 2.1 AA completa
  - i18n completo (ES/EN/QU)
  - Traducciones y formatos locales
- **Referencia:** `docs/roadmaps/WEB_ROADMAP.md` - Fase 2

### Fase 3: UX/UI

#### ⏳ Rediseño de Componentes (Design System) (Prioridad: MEDIA)
- **Estado:** En progreso
- **Descripción:** Design system unificado y componentes reutilizables
- **Requisitos:**
  - Design system completo
  - Componentes reutilizables
  - Theming (light/dark) completo
  - Animaciones/transiciones clave
- **Referencia:** `docs/roadmaps/WEB_ROADMAP.md` - Fase 3

### Fase 4: Integraciones

#### ⏳ HL7/FHIR Viewers (Prioridad: MEDIA)
- **Estado:** Pendiente
- **Descripción:** Visualizadores para recursos FHIR/HL7
- **Requisitos:**
  - Visualización estructurada de recursos FHIR
  - Parser y visualización de mensajes HL7
  - Interoperabilidad con sistemas hospitalarios
- **Archivos a crear:**
  - `web/src/components/FhirResourceViewer.js` (puede existir parcialmente)
  - `web/src/pages/FhirPage.js` (puede existir parcialmente)
- **Referencia:** `docs/roadmaps/WEB_ROADMAP.md` - Fase 4

#### ⏳ Gráficos Avanzados de Tendencias y Fairness (Prioridad: MEDIA)
- **Estado:** Pendiente
- **Descripción:** Visualizaciones avanzadas de analytics y fairness ML
- **Requisitos:**
  - Gráficos interactivos de tendencias (D3.js)
  - Visualizaciones de fairness por cohortes
  - Heatmaps y clusters epidemiológicos
- **Referencia:** `docs/roadmaps/WEB_ROADMAP.md` - Fase 4

---

## 🔧 Backend (Node.js/TypeScript)

### Fase B3: DevOps y Escalabilidad

#### ⏳ CI/CD Completo (Prioridad: ALTA)
- **Estado:** Parcial (tests automatizados configurados, workflows pendientes)
- **Descripción:** Pipeline completo de CI/CD con deployment automático
- **Requisitos:**
  - Workflows de CI/CD en GitHub Actions
  - Deployment automático a staging
  - Deployment automático a producción
  - Rollback automático
  - Blue-green deployment
- **Archivos a crear/modificar:**
  - `.github/workflows/backend-ci.yml`
  - `.github/workflows/backend-deploy-staging.yml`
  - `.github/workflows/backend-deploy-production.yml`
- **Referencia:** `docs/roadmaps/BACKEND_ROADMAP.md` - Fase B3

#### ⏳ Observabilidad Completa (Prioridad: MEDIA)
- **Estado:** Parcial (Prometheus, OpenTelemetry configurados, ELK pendiente)
- **Descripción:** Stack completo de observabilidad
- **Requisitos:**
  - ELK stack desplegado (Elasticsearch, Logstash, Kibana)
  - Dashboards Grafana configurados
  - Alertas automatizadas (AlertManager)
- **Archivos a crear/modificar:**
  - `infrastructure/k8s/elasticsearch-deployment.yaml` (puede existir)
  - `infrastructure/k8s/logstash-deployment.yaml` (puede existir)
  - `infrastructure/k8s/kibana-deployment.yaml` (puede existir)
  - `infrastructure/k8s/grafana-dashboards.yaml`
- **Referencia:** `docs/roadmaps/BACKEND_ROADMAP.md` - Fase B3

#### ⏳ Infraestructura Completa (Prioridad: MEDIA)
- **Estado:** Parcial (K8s mencionado, Terraform pendiente verificación)
- **Descripción:** Infraestructura como código completa
- **Requisitos:**
  - Terraform para infraestructura base
  - Auto-scaling verificado y funcionando
  - Load balancing configurado
  - CDN para assets estáticos
- **Archivos a verificar/crear:**
  - `infrastructure/terraform/main.tf` (verificar si existe)
  - `infrastructure/terraform/variables.tf` (verificar si existe)
  - `infrastructure/k8s/load-balancer.yaml`
- **Referencia:** `docs/roadmaps/BACKEND_ROADMAP.md` - Fase B3

---

## 🤖 AI Services (Python/FastAPI)

### Pendientes Menores

#### ⏳ Integración con Modelos Reales (Prioridad: BAJA)
- **Estado:** Parcial (flag `AI_USE_REAL_MODELS` implementado, modelos reales pendientes)
- **Descripción:** Integración completa con modelos reales (transformers, torch, timm)
- **Requisitos:**
  - Carga real de modelos BERT, CV, etc.
  - Fallback robusto a stubs si falla
  - Documentación de requisitos de GPU
- **Referencia:** `docs/roadmaps/AI_SERVICES_ROADMAP.md` - Fase A3

---

## 📊 Resumen por Prioridad

### 🔴 Prioridad ALTA (Crítico)
1. **Backend - CI/CD Completo** - Pipeline de deployment automático

### 🟡 Prioridad MEDIA (Importante)
1. **Mobile - Tutoriales Interactivos** - Onboarding para nuevos usuarios
2. **Mobile - Telemedicina Completa** - Integración con proveedor de video
3. **Mobile - Tests de Integración Offline/Sync** - Calidad y confiabilidad
4. **Mobile - Optimización de Rendimiento Avanzada** - Performance y batería
5. **Web - Accesibilidad Base (a11y) y i18n** - Inclusividad y localización
6. **Web - Rediseño de Componentes (Design System)** - Consistencia visual
7. **Web - HL7/FHIR Viewers** - Interoperabilidad
8. **Web - Gráficos Avanzados** - Analytics avanzado
9. **Backend - Observabilidad Completa** - Monitoreo y debugging
10. **Backend - Infraestructura Completa** - Escalabilidad

### 🟢 Prioridad BAJA (Mejoras)
1. **Mobile - Compartir Reportes** - Funcionalidad adicional
2. **Mobile - AR Ejercicios** - Funcionalidad avanzada
3. **AI Services - Integración con Modelos Reales** - Optimización

---

## 📝 Notas Importantes

1. **Mobile (medical-app)**: La mayoría de funcionalidades críticas están implementadas. Las pendientes son principalmente mejoras de UX y funcionalidades avanzadas.

2. **Web**: Funcionalidades core implementadas. Pendientes son principalmente mejoras de UX/UI, accesibilidad e integraciones avanzadas.

3. **Backend**: Funcionalidades core completas. Pendientes son principalmente DevOps, observabilidad e infraestructura.

4. **AI Services**: Funcionalidades core completas. Pendientes son principalmente optimizaciones y mejoras.

---

## 🔄 Proceso de Actualización

Este documento debe actualizarse cuando:
- Se complete una funcionalidad pendiente
- Se agregue una nueva funcionalidad al roadmap
- Cambie la prioridad de una funcionalidad

**Mantenedor:** Equipo de Desarrollo RespiCare Tacna

