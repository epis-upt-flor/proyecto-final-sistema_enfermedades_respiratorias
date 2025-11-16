# 🧰 Roadmap Backend (Node.js/TypeScript) - RespiCare Tacna

## Fase B1: Integraciones Externas (3-4 semanas)
- FHIR/HL7 completo: endpoints FHIR-restful, sync bidireccional, OAuth2 + MTLS, validación estándares
- APIs de medicamentos: FDA, RxNorm, DrugBank (interacciones y dosificación)
- Laboratorios (LIMS): importación de resultados, alertas por valores anormales
- Emergencias: integración servicios, alertas automáticas, GPS

## Fase B2: Seguridad Avanzada (2-3 semanas)
- Encriptación end-to-end, audit logs HIPAA, RBAC granular avanzado
- Anonimización de datos, backups encriptados
- WAF, DDoS protection, pentesting, cumplimiento GDPR/HIPAA

Estado:
- ✅ Encriptación en tránsito (HTTPS/HSTS) y reposo; auditoría HIPAA-like
- ✅ RBAC granular (middleware y aplicado en reportes)
- ✅ Anonimización/pseudonimización central
- ✅ Backups encriptados (CronJob Restic a S3)
- ✅ WAF/CRS en Ingress (ModSecurity + límites RPS)
- ✅ Pentesting baseline (OWASP ZAP workflow)
- ✅ Cumplimiento GDPR/HIPAA ampliado (DSR endpoints formales y políticas detalladas para devs)

## Fase B3: DevOps y Escalabilidad (3-4 semanas)
- CI/CD staging/producción, despliegue automático, rollback, blue-green
- Observabilidad: APM (Datadog/New Relic), ELK, Grafana, alertas, tracing distribuido
- Infra: Terraform, Kubernetes, auto-scaling, load balancing, CDN

## Fase B4: ML Avanzado (4-6 semanas)
- Modelos avanzados: BERT médico, CV imágenes, series LSTM, RL (orquestación con AI Services)
- AutoML: selección de modelos, hyperparam tuning, feature selection, drift
- NLP Avanzado: NER, resumen, traducción, sentimiento (expuestos vía AI Services)

Estado:
- ✅ Orquestación backend → AI Services vía `aiIntegrationService` (`backend/src/services/aiIntegration.ts`)
- ✅ Modelos avanzados y AutoML implementados en `ai-services` y expuestos por API (BERT, CV, time series, RL, FL, AutoML, NLP avanzado)
- ✅ Backend preparado para consumir endpoints avanzados según necesidades de UI (sin lógica de modelo propia)

## Calidad
- Cobertura >90%, tests de seguridad/performance, contratos OpenAPI estrictos
- ✅ Contratos OpenAPI definidos (archivo `backend/openapi/openapi.yaml`) y rutas alineadas

# 🧰 Roadmap Backend - RespiCare Tacna

## Fase 1: Base y Arquitectura
- ✅ Clean Architecture (layers), configuración, logging
- ✅ Autenticación/Autorización (JWT, RBAC)
- ✅ Modelos y repositorios (MongoDB)

## Fase 2: Dominios Core
- ✅ Historias médicas (CRUD, filtros)
- ✅ Citas médicas (CRUD, recordatorios)
- ✅ Prescripciones (validaciones, interacciones)
- ✅ Alertas y notificaciones (jobs, prioridades)

## Fase 3: Analytics/ML
- ✅ Integración con AI Services (endpoints ML/analytics)
- ✅ Métricas operativas y endpoints de monitoreo

## Fase 4: Seguridad
- ✅ Encriptación en reposo (AES-256-GCM) para campos sensibles en `MedicalHistory`
- ✅ Enforce HTTPS en producción + HSTS (`helmet` + `enforceHttps`, `trust proxy`)
- ✅ Audit logs (HIPAA-like) con redacción de PII y hash de payload
- ✅ Políticas de anonimización ampliadas y cifrado de más entidades
- ✅ TLS en Ingress (K8s) con cert-manager y red interna segura (manifiestos agregados)
- ✅ Extender cifrado a entidades: `User` (name, avatar), `Prescription` (diagnosis, observations, validationNotes), `Appointment` (reason, notes, location.address/meetingLink, cancellationReason)
- ✅ ClusterIssuer de cert-manager (`infrastructure/k8s/cert-issuer.yaml`) y secreto ejemplo (`backend-secrets.example.yaml`)
- ✅ Purga automática de AuditLog con CronJob (`infrastructure/k8s/backend-auditlog-cronjob.yaml`)
- ✅ NetworkPolicies para restringir acceso (`infrastructure/k8s/backend-networkpolicies.yaml`)
- ✅ Utilidad de anonimización/pseudonimización (`backend/src/utils/anonymization.ts`) y documentación en README
- ✅ Cifrado nested en `AIAnalysis.possibleDiagnoses[].recommendations[]` (arrays/subdocumentos)

## Fase 5: Calidad y Escalabilidad
- ✅ Tests (unit/integration/performance/security)
- ✅ Hardening APIs (rate limiting inteligente, headers, sanitización) — WAF pendiente (Ingress)
- ✅ Observabilidad (métricas Prometheus, logs estructurados y tracing OpenTelemetry opcional por entorno)
  - Manifiestos añadidos: `infrastructure/k8s/otel-collector.yaml`, `infrastructure/k8s/jaeger.yaml`

## Hitos
- ✅ Backend v1 (APIs core + Auth + Historias + Citas + Alertas)
- ✅ Backend v2 (Prescripciones + Analytics + Seguridad avanzada)
- [ ] Backend v3 (Escalabilidad + Observabilidad completa)


