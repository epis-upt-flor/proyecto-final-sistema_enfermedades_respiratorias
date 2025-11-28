# 🔄 Guía de Migración de Tests a medical-app

## 📋 Mapeo de Servicios y Componentes

### Servicios API

| Antiguo (`src/services/`) | Nuevo (`medical-app/lib/api/`) |
|---------------------------|--------------------------------|
| `api.ts` → `apiService` | `client.ts` → `apiClient` |
| `localStorage.ts` → `localStorageService` | `services/offlineQueue.ts` → `offlineQueue` |
| `aiService.ts` | `api/services/symptomAnalyzerService.ts` |
| `analyticsService.ts` | `api/services/dashboardService.ts` |
| `telemedicineService.ts` | `api/services/appointmentService.ts` (parcial) |

### Servicios Específicos

| Antiguo | Nuevo |
|---------|-------|
| `batteryOptimizationService.ts` | ❌ No existe (puede estar en `lib/utils/performance.ts`) |
| `errorTrackingService.ts` | ❌ No existe |
| `hapticsService.ts` | ❌ No existe |
| `i18nService.ts` | `lib/translations.ts` |
| `wearablesService.ts` | `api/services/wearableService.ts` |

### Store y Hooks

| Antiguo | Nuevo |
|---------|-------|
| `src/store/useAppStore.ts` | `store/useAppStore.ts` |
| `src/hooks/useTheme.ts` | `hooks/use-mobile.ts` (puede tener tema) |
| `src/hooks/useTutorial.ts` | ❌ Verificar si existe |

### Componentes

| Antiguo | Nuevo |
|---------|-------|
| `src/components/AI/AIAnalysisScreen.tsx` | `components/tabs/symptom-analyzer.tsx` |
| `src/components/ChatBot/MedicalChatbot.tsx` | `components/tabs/chatbot.tsx` |
| `src/screens/LoginScreen.tsx` | `components/views/login-view.tsx` |
| `src/screens/MedicalHistoryScreen.tsx` | `components/tabs/index.tsx` (puede tener historias) |

## 🔧 Cambios en Imports

### Antes (src/):
```typescript
import { apiService } from '../../src/services/api';
import { localStorageService } from '../../src/services/localStorage';
import { useAppStore } from '../../src/store/useAppStore';
```

### Después (medical-app/):
```typescript
import { apiClient } from '../../medical-app/lib/api/client';
import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import { useAppStore } from '../../medical-app/store/useAppStore';
```

## 📝 Ejemplo de Migración

### Test Antiguo:
```typescript
import { apiService } from '../../src/services/api';

describe('API Service', () => {
  it('should login', async () => {
    const result = await apiService.login('email', 'password');
    expect(result.success).toBe(true);
  });
});
```

### Test Migrado:
```typescript
import { apiClient } from '../../medical-app/lib/api/client';
import { authService } from '../../medical-app/lib/api/services/authService';

describe('Auth Service', () => {
  it('should login', async () => {
    const result = await authService.login('email', 'password');
    expect(result).toBeDefined();
  });
});
```

## ⚠️ Servicios que NO Existen en medical-app

Estos servicios pueden necesitar:
1. **Ser implementados** en `medical-app`
2. **Ser mockeados** en los tests
3. **Ser eliminados** si no son necesarios

- `batteryOptimizationService`
- `errorTrackingService`
- `hapticsService`
- `arService` (ya era stub)

## ✅ Tests Ya Migrados

- ✅ `offline/offline-sync-integration.test.ts`

## 📋 Checklist de Migración

Para cada test:
- [ ] Identificar servicios/componentes usados
- [ ] Verificar si existen en `medical-app`
- [ ] Actualizar imports
- [ ] Adaptar mocks si es necesario
- [ ] Actualizar assertions según nueva API
- [ ] Verificar que el test pasa

## 🚀 Próximos Pasos

1. Actualizar `jest.config.js` ✅ (hecho)
2. Migrar tests de servicios críticos
3. Migrar tests de componentes
4. Migrar tests de integración
5. Actualizar documentación

---

**Última actualización**: Diciembre 2024

