# ✅ Roadmap de Pruebas

## Fase T1: Setup
- Configuración Jest (web/mobile), PyTest (AI), Mocha/Jest (backend)
- Tooling de cobertura y reporte (junit, coverage.xml)

## Fase T2: Tipos de Pruebas
- Unit: servicios, utilidades, reducers/stores
- Integration: endpoints REST (backend/ai), pantallas clave (web/mobile)
- E2E: Cypress (web), Detox (mobile)
- Performance: load/stress (backend)
- Security: OWASP Top 10 (backend)

## Fase T3: Casos Especiales
- Offline/Sync (mobile): colas, estados, reintentos
- ML endpoints (AI): Advanced ML/NLP/AutoML/RL/FL (smoke)

## Umbrales
- Cobertura mínima global: 80% (target)
- Módulos: backend 80%, web 70%, mobile 70%, ai-services 70%

# ✅ Roadmap de Pruebas - RespiCare Tacna

## Fase 1: Fundamentos
- ✅ Estructura de tests por componente (backend/web/mobile/ai-services)
- ✅ Configuración Jest (web/mobile) y PyTest (AI), tooling de cobertura

## Fase 2: Cobertura y Tipos
- ✅ Unit tests: servicios/utilidades/lógica de negocio
- ✅ Integration tests: endpoints (backend, ai-services), pantallas (web/mobile)
- ✅ E2E: Cypress (web), Detox (mobile)
- ✅ Performance: load/stress/spike/endurance (backend)
- ✅ Security: OWASP Top 10 (backend), mock auth flows (web)

## Fase 3: Offline/Sync (Mobile) y Analítica
- ✅ Offline/Sync: colas, reintentos, estados (mobile)
- ✅ Smoke ML/Advanced (AI Services): Advanced ML/NLP/AutoML/RL/FL
- ⏳ Analítica de cobertura por módulo y reportes de Codecov

## Umbrales y Política
- ⏳ Cobertura mínima global: 80% (CI fallará si <80%)
- ✅ Umbral AI Services: 70% (config actual)
- ✅ Reportes JUnit y cobertura publicados por workflow en todos los módulos


