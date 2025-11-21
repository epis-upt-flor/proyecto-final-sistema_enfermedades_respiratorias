# 📱 Guía de Funcionalidad Offline con SQLite - RespiCare Mobile

Esta guía documenta la implementación completa de funcionalidad offline usando SQLite como base de datos local.

---

## 🎯 Objetivo

Permitir que la aplicación funcione completamente sin conexión a internet, almacenando todos los datos localmente en SQLite y sincronizándolos automáticamente cuando se restaura la conexión.

---

## 📦 Dependencias

### Instalación

```bash
cd mobile/RespiCare-Mobile
npm install expo-sqlite
```

La dependencia ya está agregada en `package.json`.

---

## 🗄️ Estructura de la Base de Datos

### Tablas Implementadas

1. **`medical_histories`** - Historias médicas
2. **`appointments`** - Citas médicas
3. **`chatbot_messages`** - Mensajes del chatbot
4. **`wearable_data`** - Datos de wearables

### Esquema de Tablas

#### `medical_histories`
```sql
CREATE TABLE medical_histories (
  id TEXT PRIMARY KEY,
  patientId TEXT NOT NULL,
  doctorId TEXT NOT NULL,
  patientName TEXT NOT NULL,
  age INTEGER NOT NULL,
  diagnosis TEXT NOT NULL,
  symptoms TEXT NOT NULL,        -- JSON string
  description TEXT,
  date TEXT NOT NULL,
  location TEXT,                  -- JSON string
  images TEXT,                    -- JSON string
  audioNotes TEXT,
  syncStatus TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

#### `appointments`
```sql
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  doctorId TEXT NOT NULL,
  patientId TEXT NOT NULL,
  scheduledAt TEXT NOT NULL,
  durationMinutes INTEGER NOT NULL,
  status TEXT NOT NULL,
  reason TEXT,
  syncStatus TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

#### `chatbot_messages`
```sql
CREATE TABLE chatbot_messages (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  text TEXT NOT NULL,
  type TEXT NOT NULL,
  urgencyLevel TEXT,
  symptomCount INTEGER,
  needsMedicalAttention INTEGER DEFAULT 0,
  imageUri TEXT,
  audioUri TEXT,
  timestamp TEXT NOT NULL
);
```

#### `wearable_data`
```sql
CREATE TABLE wearable_data (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  heartRate REAL,
  steps INTEGER,
  spo2 REAL,
  timestamp TEXT NOT NULL,
  source TEXT NOT NULL,
  syncStatus TEXT NOT NULL DEFAULT 'pending',
  createdAt TEXT NOT NULL
);
```

---

## 🔧 Servicios Implementados

### 1. `databaseService.ts`

Servicio principal para todas las operaciones de base de datos SQLite.

**Funcionalidades:**
- ✅ Inicialización automática de la base de datos
- ✅ Creación de tablas e índices
- ✅ CRUD completo para todas las entidades
- ✅ Consultas optimizadas con índices
- ✅ Estadísticas de sincronización

**Uso:**
```typescript
import { databaseService } from '@/services/databaseService';

// Inicializar (se hace automáticamente en _layout.tsx)
await databaseService.initialize();

// Guardar historia médica
await databaseService.saveMedicalHistory(historyRow);

// Obtener historias médicas
const histories = await databaseService.getMedicalHistories();

// Obtener pendientes de sincronización
const pending = await databaseService.getPendingMedicalHistories();
```

### 2. `syncService.ts`

Servicio de sincronización automática cuando se restaura la conexión.

**Funcionalidades:**
- ✅ Detección automática de conexión
- ✅ Sincronización de todas las entidades
- ✅ Manejo de errores y reintentos
- ✅ Actualización de estados de sincronización

**Uso:**
```typescript
import { syncService } from '@/services/syncService';

// Inicializar (se hace automáticamente en _layout.tsx)
await syncService.initialize();

// Sincronizar manualmente
await syncService.syncAll();
```

---

## 📱 Stores Actualizados

### 1. `medicalHistoryStore.ts`

Store completamente migrado a SQLite.

**Características:**
- ✅ Almacenamiento offline-first
- ✅ Sincronización automática
- ✅ Detección de conectividad
- ✅ Manejo de estados (pending/synced/error)

**Uso:**
```typescript
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore';

const { 
  medicalHistories, 
  isOffline,
  fetchMedicalHistories,
  createMedicalHistory,
  syncOfflineData,
  checkConnectivity 
} = useMedicalHistoryStore();

// Cargar historias (desde SQLite si offline, desde API si online)
await fetchMedicalHistories();

// Crear historia (se guarda en SQLite siempre)
await createMedicalHistory(historyData);

// Verificar conectividad y sincronizar
await checkConnectivity();
```

### 2. `appointmentStore.ts`

Nuevo store para citas médicas con soporte SQLite.

**Características:**
- ✅ Mismo patrón que medicalHistoryStore
- ✅ Sincronización automática
- ✅ Indicadores visuales de estado offline

**Uso:**
```typescript
import { useAppointmentStore } from '@/stores/appointmentStore';

const { 
  appointments, 
  isOffline,
  fetchAppointments,
  createAppointment 
} = useAppointmentStore();
```

---

## 🔄 Flujo de Sincronización

### 1. Modo Offline

```
Usuario crea/edita datos
    ↓
Guardar en SQLite (syncStatus: 'pending')
    ↓
Mostrar en UI con indicador "Pendiente"
    ↓
Cuando vuelve la conexión → Sincronización automática
```

### 2. Modo Online

```
Usuario crea/edita datos
    ↓
Intentar enviar a API
    ↓
Si éxito: Guardar en SQLite (syncStatus: 'synced')
Si falla: Guardar en SQLite (syncStatus: 'pending')
    ↓
Sincronizar pendientes automáticamente
```

### 3. Sincronización Automática

```
App detecta conexión restaurada
    ↓
syncService.syncAll()
    ↓
Para cada entidad pendiente:
    - Enviar a API
    - Si éxito: Actualizar syncStatus a 'synced'
    - Si falla: Mantener syncStatus como 'error'
    ↓
Actualizar UI con nuevos estados
```

---

## 🎨 Indicadores Visuales

### Estados de Sincronización

- **🟢 `synced`**: Datos sincronizados correctamente
- **🟡 `pending`**: Pendiente de sincronización
- **🔴 `error`**: Error al sincronizar

### Indicadores en la UI

- **Modo Offline**: Badge "📴 Modo Offline" en la parte superior
- **Pendiente**: Badge "⏳ Pendiente de sincronización" en cada item
- **Error**: Badge "❌ Error al sincronizar" en cada item

---

## 📋 Funcionalidades Offline Implementadas

### ✅ Historias Médicas
- Crear, editar, eliminar historias médicas
- Ver historias guardadas localmente
- Sincronización automática cuando hay conexión

### ✅ Citas Médicas
- Ver citas guardadas localmente
- Crear nuevas citas (se sincronizan cuando hay conexión)
- Indicadores de estado de sincronización

### ✅ Chatbot
- Mensajes guardados en SQLite
- Historial persistente entre sesiones
- Funciona offline (aunque sin análisis de IA)

### ✅ Datos de Wearables
- Almacenamiento local de métricas
- Sincronización automática cuando hay conexión

---

## 🔍 Verificación y Debugging

### Ver Datos en SQLite

```typescript
import { databaseService } from '@/services/databaseService';

// Obtener estadísticas
const stats = await databaseService.getSyncStats();
console.log('Estadísticas de sincronización:', stats);

// Obtener pendientes
const pending = await databaseService.getPendingMedicalHistories();
console.log('Historias pendientes:', pending);
```

### Logs de Sincronización

Los logs se muestran en la consola con prefijos:
- `🔄` - Sincronización iniciada
- `✅` - Sincronización exitosa
- `❌` - Error en sincronización
- `📋` - Sincronizando historias médicas
- `📅` - Sincronizando citas
- `⌚` - Sincronizando wearables

---

## 🚀 Inicialización

La base de datos y el servicio de sincronización se inicializan automáticamente en `app/_layout.tsx`:

```typescript
// 1. Inicializar base de datos SQLite
await databaseService.initialize();

// 2. Inicializar servicio de sincronización
await syncService.initialize();

// 3. Verificar conectividad (sincroniza automáticamente si hay conexión)
await checkConnectivity();
```

---

## ⚠️ Consideraciones Importantes

### 1. IDs Locales vs Servidor

- Los datos creados offline tienen IDs locales: `local_${timestamp}_${random}`
- Cuando se sincronizan, se actualizan con el ID del servidor
- Los IDs locales se mantienen hasta la sincronización exitosa

### 2. Conflictos de Sincronización

- Si un registro se modifica offline y luego en el servidor, la versión del servidor tiene prioridad
- Los datos offline se sobrescriben con los datos del servidor al sincronizar

### 3. Tamaño de la Base de Datos

- SQLite puede manejar grandes volúmenes de datos
- Se recomienda limpiar mensajes antiguos del chatbot periódicamente
- Los datos sincronizados se mantienen para referencia histórica

### 4. Migración desde AsyncStorage

- Los datos existentes en AsyncStorage se migran automáticamente a SQLite
- La primera vez que se usa SQLite, se crean las tablas automáticamente

---

## 🧪 Testing Offline

### Simular Modo Offline

1. **Android Emulator:**
   ```bash
   adb shell svc wifi disable
   adb shell svc data disable
   ```

2. **iOS Simulator:**
   - Settings → Developer → Network Link Conditioner → Enable
   - Seleccionar "100% Loss"

3. **Dispositivo Real:**
   - Activar "Modo Avión"
   - O desactivar WiFi y datos móviles

### Verificar Funcionalidad

1. Crear datos offline (historias, citas, mensajes)
2. Verificar que se guardan en SQLite
3. Verificar que aparecen con estado "pending"
4. Restaurar conexión
5. Verificar que se sincronizan automáticamente
6. Verificar que el estado cambia a "synced"

---

## 📊 Estadísticas de Sincronización

Puedes obtener estadísticas de sincronización:

```typescript
const stats = await databaseService.getSyncStats();
// {
//   medicalHistories: { pending: 5, synced: 120, error: 2 },
//   appointments: { pending: 1, synced: 45, error: 0 },
//   wearableData: { pending: 10, synced: 500, error: 1 }
// }
```

---

## 🔧 Mantenimiento

### Limpiar Datos Antiguos

```typescript
// Limpiar todos los datos (útil para testing)
await databaseService.clearAllData();

// Limpiar mensajes antiguos del chatbot (mantener últimos 100)
const messages = await databaseService.getChatbotMessages(sessionId);
if (messages.length > 100) {
  const toDelete = messages.slice(0, messages.length - 100);
  for (const msg of toDelete) {
    // Implementar método deleteChatbotMessage si es necesario
  }
}
```

---

## 📝 Notas de Implementación

1. **Offline-First**: Todos los datos se guardan primero en SQLite, luego se intenta sincronizar
2. **Sincronización Automática**: Se sincroniza automáticamente cuando se detecta conexión
3. **Estados Visuales**: Los usuarios ven claramente qué datos están pendientes
4. **Manejo de Errores**: Los errores de sincronización se manejan gracefully
5. **Persistencia**: Los datos persisten entre sesiones de la app

---

## 🆘 Solución de Problemas

### Error: "Base de datos no inicializada"

```typescript
// Asegúrate de inicializar antes de usar
await databaseService.initialize();
```

### Error: "SQLite no disponible"

- Verifica que `expo-sqlite` esté instalado
- En web, SQLite puede no estar disponible (usa AsyncStorage como fallback)

### Datos no se sincronizan

1. Verifica la conexión a internet
2. Verifica que el token de autenticación sea válido
3. Revisa los logs de la consola para errores específicos
4. Intenta sincronizar manualmente: `await syncService.syncAll()`

---

**Última actualización:** Noviembre 2025

