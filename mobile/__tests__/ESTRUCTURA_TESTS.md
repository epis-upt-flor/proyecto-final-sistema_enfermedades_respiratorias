# 📋 Estructura de Tests - Mobile

## ⚠️ Situación Actual

Actualmente hay **DOS proyectos** en la carpeta `mobile/`:

### 1. Proyecto Legacy (React Native)
- **Ubicación**: `mobile/src/`
- **Tecnología**: React Native
- **Estado**: ⚠️ Legacy (según `CONFIGURACION_PROYECTO.md`)
- **Tests**: La mayoría de los tests en `mobile/__tests__/` apuntan aquí

### 2. Proyecto Activo (Next.js/Capacitor)
- **Ubicación**: `mobile/medical-app/`
- **Tecnología**: Next.js + Capacitor
- **Estado**: ✅ Activo
- **Tests**: Solo `offline-sync-integration.test.ts` apunta aquí

## 📊 Mapeo de Servicios

| Servicio Legacy (`src/`) | Servicio Activo (`medical-app/`) |
|-------------------------|----------------------------------|
| `src/services/api.ts` | `lib/api/client.ts` |
| `src/services/localStorage.ts` | `lib/services/offlineQueue.ts` |
| `src/services/aiService.ts` | `lib/api/services/symptomAnalyzerService.ts` |
| `src/store/useAppStore.ts` | `store/useAppStore.ts` |

## 🔄 Tests que Apuntan a `medical-app`

✅ **Completado:**
- `offline/offline-sync-integration.test.ts` → `../../medical-app/lib/services/...`

## 📝 Tests que Apuntan a `src/` (Legacy)

❌ **Pendientes de migración:**
- Todos los demás tests en `mobile/__tests__/` (49 archivos)

## 🎯 Recomendación

**Opción 1: Migrar todos los tests a `medical-app`** (Recomendado si `src/` es legacy)
- Actualizar imports en todos los tests
- Adaptar estructura de servicios
- Actualizar mocks

**Opción 2: Mantener ambos proyectos**
- Tests para `src/` en `mobile/__tests__/`
- Tests para `medical-app` en `mobile/medical-app/__tests__/`

**Opción 3: Verificar qué proyecto está activo**
- Si `src/` sigue siendo usado, mantener tests actuales
- Si solo `medical-app` está activo, migrar todos los tests

## 📍 Próximos Pasos

1. Confirmar qué proyecto está activo
2. Decidir estrategia de migración
3. Actualizar imports en tests según decisión

---

**Última actualización**: Diciembre 2024

