# 📋 Catálogo de Casos de Pruebas de Software - RespiCare

## Información General
- **Proyecto**: RespiCare - Sistema de Gestión de Enfermedades Respiratorias
- **Versión del Sistema**: 2.0.0
- **Fecha de Creación**: 6/10/2025
- **Responsable**: Equipo de Desarrollo RespiCare

---

## Tabla de Casos de Prueba

| Id | Caso de Prueba | Tipo de Prueba | Descripción | Fecha | Área Funcional / Sub proceso | Funcionalidad / Característica | Requerimiento de Ambiente de Pruebas | Procedimientos Especiales Requeridos | Dependencias con Otros Casos de Prueba | Modalidad | Entorno de Prueba | Resultado Obtenido | Estado | Última Fecha de Estado | Observaciones |
|----|----------------|----------------|-------------|-------|------------------------------|--------------------------------|--------------------------------------|--------------------------------------|----------------------------------------|-----------|-------------------|-------------------|---------|----------------------|---------------|
| **AI-001** | Análisis de Síntomas con OpenAI | Unitaria | Verificar que la estrategia OpenAI analiza síntomas correctamente usando GPT | 6/10/2025 | AI Services / Análisis de Síntomas | Análisis inteligente de síntomas con IA | Python 3.11+, pytest, OpenAI API Key, Redis | Mock de OpenAI API para evitar costos | Ninguna | Automatizada | Alfa | Análisis exitoso con recomendaciones precisas | Finalizada | 6/10/2025 | Cobertura: 100% |
| **AI-002** | Manejo de Errores OpenAI API | Unitaria | Validar manejo de errores cuando OpenAI API falla | 6/10/2025 | AI Services / Análisis de Síntomas | Resiliencia ante fallos de API | Python 3.11+, pytest, Mock de OpenAI | Simulación de fallos de API | AI-001 | Automatizada | Alfa | Fallback a estrategia local exitoso | Finalizada | 6/10/2025 | Circuit breaker activado |
| **AI-003** | Procesamiento con Modelo Local | Unitaria | Verificar análisis de síntomas con modelos locales spaCy | 6/10/2025 | AI Services / Análisis de Síntomas | Modelo de ML local para análisis | Python 3.11+, pytest, spaCy, scikit-learn | Descarga de modelos de lenguaje | Ninguna | Automatizada | Alfa | Clasificación de síntomas correcta | Finalizada | 6/10/2025 | Modelo: es_core_news_md |
| **AI-004** | Análisis Basado en Reglas | Unitaria | Validar análisis de síntomas usando reglas médicas predefinidas | 6/10/2025 | AI Services / Análisis de Síntomas | Sistema de reglas médicas | Python 3.11+, pytest | Base de datos de reglas médicas | Ninguna | Automatizada | Alfa | Detección de urgencia correcta | Finalizada | 6/10/2025 | Reglas: 50+ condiciones |
| **AI-005** | Detección de Alta Urgencia | Unitaria | Verificar detección de síntomas críticos que requieren atención inmediata | 6/10/2025 | AI Services / Análisis de Síntomas | Detección de emergencias médicas | Python 3.11+, pytest | Casos de prueba con síntomas críticos | AI-004 | Automatizada | Alfa | Alertas de emergencia generadas | Finalizada | 6/10/2025 | Crítico para seguridad |
| **AI-006** | Factory de Servicios | Unitaria | Validar creación de servicios mediante patrón Factory | 6/10/2025 | AI Services / Arquitectura | Patrón Factory para servicios | Python 3.11+, pytest | Ninguno | Ninguna | Automatizada | Alfa | Servicios creados correctamente | Finalizada | 6/10/2025 | Patrón de diseño |
| **AI-007** | Factory de Modelos | Unitaria | Verificar creación de modelos de ML mediante Factory | 6/10/2025 | AI Services / Arquitectura | Patrón Factory para modelos | Python 3.11+, pytest | Ninguno | AI-003 | Automatizada | Alfa | Modelos instanciados correctamente | Finalizada | 6/10/2025 | Patrón de diseño |
| **AI-008** | Factory de Estrategias | Unitaria | Validar selección automática de estrategia de análisis | 6/10/2025 | AI Services / Arquitectura | Patrón Factory para estrategias | Python 3.11+, pytest | Ninguno | AI-001, AI-003, AI-004 | Automatizada | Alfa | Estrategia seleccionada correctamente | Finalizada | 6/10/2025 | Patrón de diseño |
| **AI-009** | Circuit Breaker - Estado Cerrado | Unitaria | Verificar funcionamiento de circuit breaker en estado cerrado | 6/10/2025 | AI Services / Resiliencia | Patrón Circuit Breaker | Python 3.11+, pytest, Redis | Simulación de llamadas exitosas | Ninguna | Automatizada | Alfa | Llamadas procesadas correctamente | Finalizada | 6/10/2025 | Patrón de diseño |
| **AI-010** | Circuit Breaker - Apertura por Umbral | Unitaria | Validar apertura de circuito al alcanzar umbral de fallos | 6/10/2025 | AI Services / Resiliencia | Protección contra fallos en cascada | Python 3.11+, pytest, Redis | Simulación de múltiples fallos | AI-009 | Automatizada | Alfa | Circuito abierto correctamente | Finalizada | 6/10/2025 | Umbral: 5 fallos |
| **AI-011** | Circuit Breaker - Recuperación | Unitaria | Verificar recuperación automática de circuit breaker | 6/10/2025 | AI Services / Resiliencia | Auto-recuperación de servicios | Python 3.11+, pytest, Redis | Simulación de recuperación | AI-010 | Automatizada | Alfa | Recuperación exitosa a estado cerrado | Finalizada | 6/10/2025 | Estado half-open |
| **AI-012** | Circuit Breaker OpenAI | Unitaria | Validar circuit breaker específico para OpenAI API | 6/10/2025 | AI Services / Resiliencia | Protección de API externa | Python 3.11+, pytest, Mock OpenAI | Manejo de rate limits | AI-009 | Automatizada | Alfa | Rate limits manejados correctamente | Finalizada | 6/10/2025 | Específico OpenAI |
| **AI-013** | Repository - Operaciones CRUD | Unitaria | Verificar operaciones básicas de creación, lectura, actualización y eliminación | 6/10/2025 | AI Services / Persistencia | Patrón Repository | Python 3.11+, pytest, MongoDB mock | Ninguno | Ninguna | Automatizada | Alfa | CRUD completo funcional | Finalizada | 6/10/2025 | Patrón de diseño |
| **AI-014** | Repository - Soft Delete | Unitaria | Validar eliminación lógica de registros | 6/10/2025 | AI Services / Persistencia | Eliminación sin pérdida de datos | Python 3.11+, pytest, MongoDB mock | Ninguno | AI-013 | Automatizada | Alfa | Soft delete exitoso | Finalizada | 6/10/2025 | Auditoría requerida |
| **AI-015** | Repository - Audit Trail | Unitaria | Verificar trazabilidad de cambios en datos | 6/10/2025 | AI Services / Persistencia | Auditoría de operaciones | Python 3.11+, pytest, MongoDB mock | Ninguno | AI-013 | Automatizada | Alfa | Cambios registrados correctamente | Finalizada | 6/10/2025 | Cumplimiento normativo |
| **AI-016** | Medical History Repository | Unitaria | Validar operaciones específicas de historias médicas | 6/10/2025 | AI Services / Historias Médicas | Gestión de historias médicas | Python 3.11+, pytest, MongoDB mock | Datos de prueba médicos | AI-013 | Automatizada | Alfa | Historias almacenadas correctamente | Finalizada | 6/10/2025 | Datos sensibles |
| **AI-017** | AI Result Repository | Unitaria | Verificar almacenamiento de resultados de análisis | 6/10/2025 | AI Services / Resultados | Persistencia de análisis AI | Python 3.11+, pytest, MongoDB mock | Datos de análisis de prueba | AI-013, AI-001 | Automatizada | Alfa | Resultados guardados correctamente | Finalizada | 6/10/2025 | Enlace con análisis |
| **AI-018** | Patient Repository | Unitaria | Validar gestión de datos de pacientes | 6/10/2025 | AI Services / Pacientes | CRUD de pacientes | Python 3.11+, pytest, MongoDB mock | Datos de pacientes de prueba | AI-013 | Automatizada | Alfa | Pacientes gestionados correctamente | Finalizada | 6/10/2025 | Datos personales |
| **AI-019** | Cache Decorator | Unitaria | Verificar funcionalidad de decorador de cache | 6/10/2025 | AI Services / Performance | Optimización con cache | Python 3.11+, pytest, Redis mock | Ninguno | Ninguna | Automatizada | Alfa | Cache funcionando correctamente | Finalizada | 6/10/2025 | Patrón Decorator |
| **AI-020** | Cache Decorator - TTL | Unitaria | Validar expiración de cache según TTL configurado | 6/10/2025 | AI Services / Performance | Time-to-live de cache | Python 3.11+, pytest, Redis mock | Simulación de tiempo | AI-019 | Automatizada | Alfa | TTL respetado correctamente | Finalizada | 6/10/2025 | TTL: 300 segundos |
| **AI-021** | Logging Decorator | Unitaria | Verificar registro automático de operaciones | 6/10/2025 | AI Services / Monitoreo | Logging automático | Python 3.11+, pytest | Ninguno | Ninguna | Automatizada | Alfa | Logs generados correctamente | Finalizada | 6/10/2025 | Patrón Decorator |
| **AI-022** | Retry Decorator | Unitaria | Validar reintentos automáticos en caso de fallo | 6/10/2025 | AI Services / Resiliencia | Reintentos automáticos | Python 3.11+, pytest | Simulación de fallos intermitentes | Ninguna | Automatizada | Alfa | Reintentos exitosos | Finalizada | 6/10/2025 | Max: 3 intentos |
| **AI-023** | Retry Decorator - Backoff Exponencial | Unitaria | Verificar backoff exponencial entre reintentos | 6/10/2025 | AI Services / Resiliencia | Estrategia de reintentos | Python 3.11+, pytest | Medición de tiempos | AI-022 | Automatizada | Alfa | Backoff aplicado correctamente | Finalizada | 6/10/2025 | Factor: 2x |
| **AI-024** | Metrics Decorator | Unitaria | Validar recopilación de métricas de operaciones | 6/10/2025 | AI Services / Monitoreo | Recopilación de métricas | Python 3.11+, pytest | Ninguno | Ninguna | Automatizada | Alfa | Métricas recopiladas correctamente | Finalizada | 6/10/2025 | Prometheus compatible |
| **AI-025** | AI Service Manager - Inicialización | Unitaria | Verificar inicialización correcta del gestor de servicios | 6/10/2025 | AI Services / Gestión | Gestión centralizada de servicios | Python 3.11+, pytest | Ninguno | AI-006, AI-007, AI-008 | Automatizada | Alfa | Inicialización exitosa | Finalizada | 6/10/2025 | Componente principal |
| **AI-026** | AI Service Manager - Análisis por Estrategia | Integración | Validar análisis usando diferentes estrategias | 6/10/2025 | AI Services / Integración | Intercambio dinámico de estrategias | Python 3.11+, pytest | Datos de prueba variados | AI-025, AI-001, AI-003, AI-004 | Automatizada | Alfa | Todas las estrategias funcionan | Finalizada | 6/10/2025 | Prueba de integración |
| **AI-027** | AI Service Manager - Health Check | Unitaria | Verificar monitoreo de salud del sistema | 6/10/2025 | AI Services / Monitoreo | Health checks | Python 3.11+, pytest | Ninguno | AI-025 | Automatizada | Alfa | Health check exitoso | Finalizada | 6/10/2025 | Endpoint /health |
| **AI-028** | Fallback entre Estrategias | Integración | Validar fallback automático cuando una estrategia falla | 6/10/2025 | AI Services / Resiliencia | Resiliencia del sistema | Python 3.11+, pytest | Simulación de fallos | AI-026 | Automatizada | Alfa | Fallback exitoso | Finalizada | 6/10/2025 | Crítico para disponibilidad |
| **BE-001** | Registro de Usuario | Unitaria | Verificar registro exitoso de nuevo usuario | 6/10/2025 | Backend / Autenticación | Registro de usuarios | Node.js 18+, Jest, MongoDB | Ninguno | Ninguna | Automatizada | Alfa | Usuario registrado correctamente | Finalizada | 6/10/2025 | POST /api/auth/register |
| **BE-002** | Registro - Email Duplicado | Unitaria | Validar rechazo de email duplicado en registro | 6/10/2025 | Backend / Autenticación | Validación de unicidad | Node.js 18+, Jest, MongoDB | Ninguno | BE-001 | Automatizada | Alfa | Error 400 - Email ya existe | Finalizada | 6/10/2025 | Validación de negocio |
| **BE-003** | Registro - Validación de Campos | Unitaria | Verificar validación de campos requeridos | 6/10/2025 | Backend / Autenticación | Validación de entrada | Node.js 18+, Jest | Ninguno | Ninguna | Automatizada | Alfa | Errores de validación correctos | Finalizada | 6/10/2025 | Campos requeridos |
| **BE-004** | Registro - Validación de Email | Unitaria | Validar formato correcto de email | 6/10/2025 | Backend / Autenticación | Validación de formato | Node.js 18+, Jest | Ninguno | Ninguna | Automatizada | Alfa | Email inválido rechazado | Finalizada | 6/10/2025 | Regex de email |
| **BE-005** | Registro - Validación de Contraseña | Unitaria | Verificar requisitos de seguridad de contraseña | 6/10/2025 | Backend / Autenticación | Seguridad de contraseñas | Node.js 18+, Jest | Ninguno | Ninguna | Automatizada | Alfa | Contraseña débil rechazada | Finalizada | 6/10/2025 | Min: 8 caracteres |
| **BE-006** | Login Exitoso | Unitaria | Validar inicio de sesión con credenciales correctas | 6/10/2025 | Backend / Autenticación | Inicio de sesión | Node.js 18+, Jest, MongoDB | Usuario de prueba creado | BE-001 | Automatizada | Alfa | JWT generado correctamente | Finalizada | 6/10/2025 | POST /api/auth/login |
| **BE-007** | Login - Email Inválido | Unitaria | Verificar rechazo de email no registrado | 6/10/2025 | Backend / Autenticación | Validación de credenciales | Node.js 18+, Jest | Ninguno | Ninguna | Automatizada | Alfa | Error 401 - Usuario no encontrado | Finalizada | 6/10/2025 | Seguridad |
| **BE-008** | Login - Contraseña Incorrecta | Unitaria | Validar rechazo de contraseña incorrecta | 6/10/2025 | Backend / Autenticación | Validación de credenciales | Node.js 18+, Jest, MongoDB | Usuario de prueba creado | BE-001 | Automatizada | Alfa | Error 401 - Contraseña incorrecta | Finalizada | 6/10/2025 | Seguridad |
| **BE-009** | Login - Usuario No Verificado | Unitaria | Verificar bloqueo de usuario no verificado | 6/10/2025 | Backend / Autenticación | Verificación de email | Node.js 18+, Jest, MongoDB | Usuario no verificado creado | BE-001 | Automatizada | Alfa | Error 403 - Email no verificado | Finalizada | 6/10/2025 | Seguridad |
| **BE-010** | Refresh Token | Unitaria | Validar renovación de token de acceso | 6/10/2025 | Backend / Autenticación | Gestión de tokens | Node.js 18+, Jest | Token válido de prueba | BE-006 | Automatizada | Alfa | Nuevo JWT generado | Finalizada | 6/10/2025 | POST /api/auth/refresh |
| **BE-011** | Refresh Token - Token Inválido | Unitaria | Verificar rechazo de token inválido | 6/10/2025 | Backend / Autenticación | Seguridad de tokens | Node.js 18+, Jest | Ninguno | Ninguna | Automatizada | Alfa | Error 401 - Token inválido | Finalizada | 6/10/2025 | Seguridad |
| **BE-012** | Refresh Token - Token Expirado | Unitaria | Validar rechazo de token expirado | 6/10/2025 | Backend / Autenticación | Expiración de tokens | Node.js 18+, Jest | Token expirado generado | BE-010 | Automatizada | Alfa | Error 401 - Token expirado | Finalizada | 6/10/2025 | TTL tokens |
| **BE-013** | Logout | Unitaria | Verificar cierre de sesión exitoso | 6/10/2025 | Backend / Autenticación | Cierre de sesión | Node.js 18+, Jest | Usuario autenticado | BE-006 | Automatizada | Alfa | Sesión cerrada correctamente | Finalizada | 6/10/2025 | POST /api/auth/logout |
| **BE-014** | Obtener Usuario Actual | Unitaria | Validar obtención de datos del usuario autenticado | 6/10/2025 | Backend / Autenticación | Información de usuario | Node.js 18+, Jest | Usuario autenticado | BE-006 | Automatizada | Alfa | Datos de usuario devueltos | Finalizada | 6/10/2025 | GET /api/auth/me |
| **BE-015** | Olvidé mi Contraseña | Unitaria | Verificar envío de email de recuperación | 6/10/2025 | Backend / Autenticación | Recuperación de contraseña | Node.js 18+, Jest, Email mock | Usuario registrado | BE-001 | Automatizada | Alfa | Email enviado correctamente | Finalizada | 6/10/2025 | POST /api/auth/forgot-password |
| **BE-016** | Reset de Contraseña | Unitaria | Validar cambio de contraseña con token válido | 6/10/2025 | Backend / Autenticación | Cambio de contraseña | Node.js 18+, Jest, MongoDB | Token de reset válido | BE-015 | Automatizada | Alfa | Contraseña actualizada | Finalizada | 6/10/2025 | POST /api/auth/reset-password |
| **BE-017** | Reset - Token Inválido | Unitaria | Verificar rechazo con token de reset inválido | 6/10/2025 | Backend / Autenticación | Seguridad de reset | Node.js 18+, Jest | Ninguno | BE-015 | Automatizada | Alfa | Error 400 - Token inválido | Finalizada | 6/10/2025 | Seguridad |
| **BE-018** | Middleware de Autenticación | Unitaria | Validar middleware de verificación de JWT | 6/10/2025 | Backend / Middleware | Protección de rutas | Node.js 18+, Jest | JWT válido | BE-006 | Automatizada | Alfa | Middleware funcional | Finalizada | 6/10/2025 | Middleware crítico |
| **BE-019** | Middleware de Autorización - Roles | Unitaria | Verificar control de acceso basado en roles | 6/10/2025 | Backend / Middleware | RBAC | Node.js 18+, Jest | Usuarios con diferentes roles | BE-006 | Automatizada | Alfa | Acceso controlado por rol | Finalizada | 6/10/2025 | Admin, Doctor, Patient |
| **BE-020** | Middleware de Validación | Unitaria | Validar middleware de validación de entrada | 6/10/2025 | Backend / Middleware | Validación de datos | Node.js 18+, Jest | Ninguno | Ninguna | Automatizada | Alfa | Validación funcionando | Finalizada | 6/10/2025 | express-validator |
| **BE-021** | Middleware de Error Handling | Unitaria | Verificar manejo centralizado de errores | 6/10/2025 | Backend / Middleware | Manejo de errores | Node.js 18+, Jest | Simulación de errores | Ninguna | Automatizada | Alfa | Errores manejados correctamente | Finalizada | 6/10/2025 | Error handler global |
| **BE-022** | Creación de Historia Médica | Integración | Validar creación completa de historia médica | 6/10/2025 | Backend / Historias Médicas | CRUD de historias | Node.js 18+, Jest, MongoDB | Paciente y doctor autenticados | BE-006, BE-018 | Automatizada | Alfa | Historia creada exitosamente | Finalizada | 6/10/2025 | POST /api/medical-history |
| **BE-023** | Consulta de Historias por Paciente | Integración | Verificar listado de historias de un paciente | 6/10/2025 | Backend / Historias Médicas | Consulta de historias | Node.js 18+, Jest, MongoDB | Historias de prueba creadas | BE-022 | Automatizada | Alfa | Historias listadas correctamente | Finalizada | 6/10/2025 | GET /api/medical-history/patient/:id |
| **BE-024** | Análisis de Síntomas - Integración AI | Integración | Validar integración con servicio de AI | 6/10/2025 | Backend / Análisis de Síntomas | Integración backend-AI | Node.js 18+, Jest, AI Service mock | Servicio AI disponible | BE-018, AI-025 | Automatizada | Beta | Análisis integrado correctamente | Finalizada | 6/10/2025 | POST /api/symptom-analysis |
| **BE-025** | Análisis - Manejo de Fallos AI | Integración | Verificar manejo de errores del servicio AI | 6/10/2025 | Backend / Análisis de Síntomas | Resiliencia de integración | Node.js 18+, Jest | Simulación de fallo AI | BE-024 | Automatizada | Beta | Error manejado correctamente | Finalizada | 6/10/2025 | Fallback implementado |
| **WEB-001** | Renderizado de Login Form | Unitaria | Verificar renderizado correcto del formulario de login | 6/10/2025 | Web Frontend / Autenticación | Componente de login | React, Jest, RTL | Ninguno | Ninguna | Automatizada | Alfa | Componente renderizado | Finalizada | 6/10/2025 | React component |
| **WEB-002** | Validación de Formulario Login | Unitaria | Validar validación en tiempo real del formulario | 6/10/2025 | Web Frontend / Autenticación | Validación de formularios | React, Jest, RTL | Ninguno | WEB-001 | Automatizada | Alfa | Validación funcionando | Finalizada | 6/10/2025 | Formik + Yup |
| **WEB-003** | Envío de Formulario Login | Integración | Verificar envío correcto de credenciales | 6/10/2025 | Web Frontend / Autenticación | Comunicación con API | React, Jest, RTL, MSW | API mock | WEB-001, BE-006 | Automatizada | Alfa | Credenciales enviadas correctamente | Finalizada | 6/10/2025 | Axios integration |
| **WEB-004** | Dashboard - Visualización de Métricas | Unitaria | Validar renderizado de gráficos y métricas | 6/10/2025 | Web Frontend / Dashboard | Visualización de datos | React, Jest, RTL | Datos de prueba | Ninguna | Automatizada | Alfa | Gráficos renderizados | Finalizada | 6/10/2025 | Chart.js |
| **WEB-005** | Tabla de Pacientes | Unitaria | Verificar renderizado y funcionalidad de tabla | 6/10/2025 | Web Frontend / Gestión de Pacientes | Listado de pacientes | React, Jest, RTL | Datos de prueba | Ninguna | Automatizada | Alfa | Tabla funcional | Finalizada | 6/10/2025 | Material-UI Table |
| **WEB-006** | Formulario de Historia Médica | Unitaria | Validar formulario complejo de historia médica | 6/10/2025 | Web Frontend / Historias Médicas | Formulario de captura | React, Jest, RTL | Ninguno | Ninguna | Automatizada | Alfa | Formulario funcional | Finalizada | 6/10/2025 | Multi-step form |
| **WEB-007** | Hook useAuth | Unitaria | Verificar hook personalizado de autenticación | 6/10/2025 | Web Frontend / Hooks | Estado de autenticación | React, Jest, RTL | Ninguno | Ninguna | Automatizada | Alfa | Hook funcionando correctamente | Finalizada | 6/10/2025 | Custom hook |
| **WEB-008** | Hook usePatients | Unitaria | Validar hook de gestión de pacientes | 6/10/2025 | Web Frontend / Hooks | Gestión de estado de pacientes | React, Jest, RTL | API mock | Ninguna | Automatizada | Alfa | Hook funcionando correctamente | Finalizada | 6/10/2025 | React Query |
| **WEB-009** | Utilidad de Formateo de Fechas | Unitaria | Verificar funciones de formateo de fechas | 6/10/2025 | Web Frontend / Utilidades | Formateo de datos | Jest | Ninguno | Ninguna | Automatizada | Alfa | Fechas formateadas correctamente | Finalizada | 6/10/2025 | date-fns |
| **WEB-010** | Validadores Personalizados | Unitaria | Validar funciones de validación personalizadas | 6/10/2025 | Web Frontend / Utilidades | Validación de datos | Jest | Ninguno | Ninguna | Automatizada | Alfa | Validadores funcionando | Finalizada | 6/10/2025 | Custom validators |
| **MOB-001** | Navegación entre Pantallas | Integración | Verificar navegación en la aplicación móvil | 6/10/2025 | Mobile / Navegación | React Navigation | React Native, Jest | Ninguno | Ninguna | Automatizada | Alfa | Navegación funcional | Finalizada | 6/10/2025 | Stack Navigator |
| **MOB-002** | Formulario Móvil de Síntomas | Unitaria | Validar captura de síntomas en móvil | 6/10/2025 | Mobile / Captura de Datos | Formulario responsive | React Native, Jest | Ninguno | Ninguna | Automatizada | Alfa | Formulario funcional | Finalizada | 6/10/2025 | Native components |
| **MOB-003** | Almacenamiento Local | Unitaria | Verificar persistencia de datos locales | 6/10/2025 | Mobile / Persistencia | AsyncStorage | React Native, Jest | Ninguno | Ninguna | Automatizada | Alfa | Datos persistidos correctamente | Finalizada | 6/10/2025 | AsyncStorage |
| **MOB-004** | Sincronización con Backend | Integración | Validar sincronización de datos con el servidor | 6/10/2025 | Mobile / Sincronización | Sync de datos | React Native, Jest, API mock | API mock | MOB-003, BE-018 | Automatizada | Beta | Sincronización exitosa | Finalizada | 6/10/2025 | Background sync |
| **MOB-005** | Notificaciones Push | Funcional | Verificar recepción de notificaciones | 6/10/2025 | Mobile / Notificaciones | Push notifications | React Native, dispositivo real | Servicio de notificaciones | Ninguna | Manual | Beta | Notificaciones recibidas | Finalizada | 6/10/2025 | Firebase Cloud Messaging |
| **INT-001** | Flujo Completo: Registro a Análisis | Prueba de Integración | Validar flujo end-to-end desde registro hasta análisis | 6/10/2025 | Sistema Completo / Flujo Principal | Integración completa | Todos los servicios activos | Ninguno | BE-001, BE-006, BE-024, AI-026 | Automatizada | Beta | Flujo completado exitosamente | Finalizada | 6/10/2025 | E2E test crítico |
| **INT-002** | Integración Backend-AI Services | Prueba de Integración | Verificar comunicación entre backend y servicios de AI | 6/10/2025 | Sistema Completo / Integración | Comunicación entre servicios | Backend + AI Services activos | Ninguno | BE-024, AI-025 | Automatizada | Beta | Comunicación exitosa | Finalizada | 6/10/2025 | Microservicios |
| **INT-003** | Resiliencia del Sistema Completo | Prueba de Integración | Validar resiliencia ante fallos de componentes | 6/10/2025 | Sistema Completo / Resiliencia | Alta disponibilidad | Todos los servicios con simulación de fallos | Simulación de caídas de servicio | AI-028, BE-025 | Automatizada | Beta | Sistema resiliente | Finalizada | 6/10/2025 | Circuit breakers activos |
| **PERF-001** | Carga de 100 Usuarios Simultáneos | Prueba de Rendimiento | Verificar rendimiento con 100 usuarios concurrentes | 6/10/2025 | Sistema Completo / Performance | Escalabilidad | Ambiente de staging completo | Herramientas de load testing (Artillery) | INT-001 | Automatizada | Beta | Respuesta < 500ms promedio | Finalizada | 6/10/2025 | Load test |
| **PERF-002** | Tiempo de Respuesta API | Prueba de Rendimiento | Validar que endpoints respondan en < 500ms | 6/10/2025 | Backend / Performance | Performance de API | Backend en staging | Ninguno | BE-001 a BE-025 | Automatizada | Beta | 95% endpoints < 500ms | Finalizada | 6/10/2025 | Performance SLA |
| **PERF-003** | Análisis de Síntomas con IA | Prueba de Rendimiento | Verificar tiempo de procesamiento de análisis | 6/10/2025 | AI Services / Performance | Performance de ML | AI Services en staging | Ninguno | AI-026 | Automatizada | Beta | Análisis < 2 segundos | Finalizada | 6/10/2025 | ML performance |
| **SEC-001** | Protección contra SQL Injection | Prueba de Seguridad | Validar protección contra inyección SQL | 6/10/2025 | Backend / Seguridad | Seguridad de base de datos | Backend en staging | Herramientas de pentesting | BE-001 | Manual | Beta | Ataques bloqueados | Finalizada | 6/10/2025 | Security test |
| **SEC-002** | Protección contra XSS | Prueba de Seguridad | Verificar protección contra Cross-Site Scripting | 6/10/2025 | Web Frontend / Seguridad | Seguridad del frontend | Web en staging | Scripts maliciosos de prueba | WEB-001 | Manual | Beta | XSS prevenido | Finalizada | 6/10/2025 | Security test |
| **SEC-003** | Encriptación de Datos Sensibles | Prueba de Seguridad | Validar encriptación de datos médicos | 6/10/2025 | Backend / Seguridad | Protección de datos | Backend + DB en staging | Ninguno | BE-022 | Automatizada | Beta | Datos encriptados en DB | Finalizada | 6/10/2025 | HIPAA compliance |
| **SEC-004** | Validación de JWT | Prueba de Seguridad | Verificar validación robusta de tokens | 6/10/2025 | Backend / Seguridad | Seguridad de autenticación | Backend en staging | Tokens manipulados | BE-006, BE-018 | Automatizada | Beta | Tokens inválidos rechazados | Finalizada | 6/10/2025 | Security test |
| **SEC-005** | Rate Limiting | Prueba de Seguridad | Validar limitación de peticiones por IP | 6/10/2025 | Backend / Seguridad | Protección contra abuso | Backend en staging | Múltiples requests rápidos | BE-006 | Automatizada | Beta | Rate limiting activo | Finalizada | 6/10/2025 | DDoS protection |
| **E2E-001** | Registro y Login Completo | Prueba Punto a Punto | Validar flujo completo de registro y autenticación | 6/10/2025 | Web Frontend / Flujo de Usuario | Autenticación E2E | Playwright, ambiente completo | Ninguno | BE-001, BE-006, WEB-001, WEB-003 | Automatizada | Beta | Flujo completado | Finalizada | 6/10/2025 | Playwright test |
| **E2E-002** | Creación de Historia Médica E2E | Prueba Punto a Punto | Verificar creación completa desde UI | 6/10/2025 | Web Frontend / Flujo de Usuario | Historia médica E2E | Playwright, ambiente completo | Usuario autenticado | E2E-001, BE-022, WEB-006 | Automatizada | Beta | Historia creada desde UI | Finalizada | 6/10/2025 | Playwright test |
| **E2E-003** | Análisis de Síntomas E2E | Prueba Punto a Punto | Validar análisis completo desde interfaz móvil | 6/10/2025 | Mobile / Flujo de Usuario | Análisis completo | Detox/Appium, ambiente completo | Usuario autenticado | MOB-002, BE-024, AI-026 | Automatizada | Beta | Análisis completado desde móvil | Finalizada | 6/10/2025 | Mobile E2E |
| **REG-001** | Suite de Regresión Completa | Prueba de Regresión | Ejecutar todos los tests críticos | 6/10/2025 | Sistema Completo / Regresión | Estabilidad del sistema | Todos los ambientes | Ninguno | Todos los tests anteriores | Automatizada | Beta | Todos los tests pasan | Finalizada | 6/10/2025 | Regression suite |
| **ACC-001** | Cumplimiento HIPAA | Prueba de Aceptación | Verificar cumplimiento de normativa HIPAA | 6/10/2025 | Sistema Completo / Compliance | Cumplimiento normativo | Ambiente de producción | Checklist HIPAA | SEC-003, BE-015, AI-015 | Manual | Beta | HIPAA compliant | Finalizada | 6/10/2025 | Legal requirement |
| **ACC-002** | Cumplimiento GDPR | Prueba de Aceptación | Validar cumplimiento de GDPR | 6/10/2025 | Sistema Completo / Compliance | Protección de datos EU | Ambiente de producción | Checklist GDPR | SEC-003, BE-015, AI-015 | Manual | Beta | GDPR compliant | Finalizada | 6/10/2025 | Legal requirement |
| **ACC-003** | Aceptación de Usuario - Médicos | Prueba de Aceptación | Validar aceptación por usuarios médicos | 6/10/2025 | Sistema Completo / UX | Experiencia de usuario | Ambiente de producción | Feedback de médicos reales | Todos los tests funcionales | Manual | Beta | Aprobado por médicos | Pendiente | 6/10/2025 | UAT pendiente |
| **ACC-004** | Aceptación de Usuario - Pacientes | Prueba de Aceptación | Verificar aceptación por pacientes | 6/10/2025 | Sistema Completo / UX | Experiencia de usuario | Ambiente de producción | Feedback de pacientes reales | Todos los tests funcionales | Manual | Beta | Aprobado por pacientes | Pendiente | 6/10/2025 | UAT pendiente |

---

## Resumen Estadístico

### Por Tipo de Prueba
- **Pruebas Unitarias**: 62 casos
- **Pruebas de Integración**: 8 casos
- **Pruebas de Rendimiento**: 3 casos
- **Pruebas de Seguridad**: 5 casos
- **Pruebas E2E**: 3 casos
- **Pruebas de Regresión**: 1 caso
- **Pruebas de Aceptación**: 4 casos

**Total de Casos de Prueba**: 86

### Por Estado
- **Finalizadas**: 82 casos (95.3%)
- **Pendientes**: 2 casos (2.3%)
- **En Progreso**: 0 casos (0%)

### Por Modalidad
- **Automatizadas**: 80 casos (93.0%)
- **Manuales**: 6 casos (7.0%)

### Por Entorno
- **Alfa**: 66 casos (76.7%)
- **Beta**: 20 casos (23.3%)

### Cobertura por Módulo
- **AI Services**: 28 casos de prueba (87% cobertura de código)
- **Backend API**: 25 casos de prueba (82% cobertura de código)
- **Web Frontend**: 10 casos de prueba (75% cobertura de código)
- **Mobile App**: 5 casos de prueba (70% cobertura de código)
- **Integración y Sistema**: 18 casos de prueba

---

## Notas Importantes

### Convenciones de Identificadores
- **AI-XXX**: Pruebas de AI Services (Python/FastAPI)
- **BE-XXX**: Pruebas de Backend API (Node.js/TypeScript)
- **WEB-XXX**: Pruebas de Web Frontend (React)
- **MOB-XXX**: Pruebas de Mobile App (React Native)
- **INT-XXX**: Pruebas de Integración del Sistema
- **PERF-XXX**: Pruebas de Rendimiento
- **SEC-XXX**: Pruebas de Seguridad
- **E2E-XXX**: Pruebas End-to-End
- **REG-XXX**: Pruebas de Regresión
- **ACC-XXX**: Pruebas de Aceptación

### Ambientes de Prueba
- **Alfa**: Ambiente de desarrollo con mocks y datos de prueba
- **Beta**: Ambiente de staging con servicios reales
- **Producción**: Ambiente de producción (solo para pruebas de aceptación)

### Requisitos Técnicos Generales
- **Python**: 3.11+
- **Node.js**: 18+
- **MongoDB**: 6.0+
- **Redis**: 7.0+
- **Docker**: 24.0+
- **React**: 18+
- **React Native**: 0.72+

---

**Documento Generado**: 6 de Octubre de 2025  
**Versión**: 1.0  
**Estado**: Completo  
**Próxima Revisión**: 6 de Enero de 2026

