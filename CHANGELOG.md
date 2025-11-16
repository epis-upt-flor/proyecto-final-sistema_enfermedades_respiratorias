# 📦 Changelog - RespiCare

Todas las notas de cambios relevantes del proyecto.

## 2025-11-16

### Mobile
- Offline/Sync: banners/chips de estado, snackbars, retry, cola para citas/alertas/historias.
- Onboarding: 3 slides, i18n ES/EN, placeholders PT/FR/QU.
- Citas: creación, reprogramación, cancelación; Snackbar para acciones offline; indicador “Offline” en headers.
- Detalle de Cita: aviso desde error offline, botón Guardar (reintento), navegación de retorno al éxito.
- AR: respiración/inhalador, persistencia de modo, nota de restauración, microinteracciones.
- Voz: servicio y flujo de dictado en captura; comandos de navegación en Home.
- i18n: Home, DataCapture, Profile; claves de Onboarding; wearables y perfiles traducidos.
- Wearables: `wearablesService` (stub), resumen FC/pasos/SpO₂ en Home.
- Analytics: `analyticsService` (eventos y timings) con persistencia (`AsyncStorage`) y auto-flush (30s); exportación JSON.
- Error tracking: `errorTrackingService` con handler global; setUser en login/logout/rehidratación.
- CI Beta: workflow `mobile-beta.yml` (artefacto zip por tag `beta-*`/`mobile-beta-*`).

### Documentación
- Actualización de `mobile/MOBILE_ROADMAP.md` (Fases 5.3, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3).
- `docs/DOCUMENTATION_INDEX.md` reorganizado con resumen Mobile y fecha de actualización.
- `README.md` raíz actualizado (Mobile, roadmap, últimas capacidades).
- `mobile/README.md` actualizado (servicios, offline/sync, analytics/error tracking, tests de integración offline/citas).


