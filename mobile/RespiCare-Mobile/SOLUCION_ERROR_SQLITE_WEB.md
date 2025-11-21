# 🔧 Solución: Error de expo-sqlite en Web

## ❌ Problema

Error al ejecutar la app en web:

```
Unable to resolve module ./wa-sqlite/wa-sqlite.wasm from 
node_modules/expo-sqlite/web/worker.ts
```

**Causa:** `expo-sqlite` requiere archivos WASM para funcionar en web, pero Metro no está configurado para manejar estos archivos correctamente.

## ✅ Solución Aplicada

### 1. Importación Condicional de SQLite

Se modificó `databaseService.ts` para importar SQLite solo en plataformas nativas:

```typescript
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar SQLite solo en plataformas nativas
let SQLite: any = null;
if (Platform.OS !== 'web') {
  try {
    SQLite = require('expo-sqlite');
  } catch (error) {
    console.warn('expo-sqlite no disponible:', error);
  }
}
```

### 2. Detección de Plataforma Web

Se agregó detección de plataforma web en el servicio:

```typescript
class DatabaseService {
  private isWeb: boolean = Platform.OS === 'web';
  
  async initialize(): Promise<void> {
    // En web, SQLite no está disponible, usar AsyncStorage como fallback
    if (this.isWeb) {
      console.log('⚠️ Web detectado: SQLite no disponible, usando AsyncStorage como fallback');
      this.isInitialized = true;
      return;
    }
    // ... resto del código
  }
}
```

### 3. Fallback a AsyncStorage

Todos los métodos del servicio ahora tienen fallback a AsyncStorage cuando están en web:

```typescript
async getMedicalHistories(patientId?: string): Promise<MedicalHistoryRow[]> {
  if (this.isWeb || !this.db) {
    // Fallback a AsyncStorage en web
    const key = patientId ? `medical_histories_${patientId}` : 'medical_histories';
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  // ... usar SQLite en plataformas nativas
}
```

## 📝 Notas

- **En Web:** Se usa `AsyncStorage` como almacenamiento local (funcionalidad limitada pero suficiente para desarrollo)
- **En Android/iOS:** Se usa `expo-sqlite` con todas sus capacidades
- **Compatibilidad:** La API del servicio permanece igual, solo cambia la implementación interna

## 🔄 Próximos Pasos

1. **Reiniciar el servidor de desarrollo:**
   ```bash
   npm start
   ```

2. **Probar en web:**
   ```bash
   npm run web
   ```

3. **Verificar que funciona:**
   - La app debería cargar sin errores
   - Los datos se guardarán en AsyncStorage (visible en DevTools > Application > Local Storage)

## ⚠️ Limitaciones en Web

- **AsyncStorage** tiene límites de tamaño (~5-10MB dependiendo del navegador)
- **No hay soporte SQL completo** (solo almacenamiento clave-valor)
- **Rendimiento** puede ser menor que SQLite en grandes volúmenes de datos

Para producción web, considera usar IndexedDB o una solución más robusta.

---

**Última actualización:** Noviembre 2025

