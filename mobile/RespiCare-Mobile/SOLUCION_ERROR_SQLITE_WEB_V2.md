# 🔧 Solución: Error de expo-sqlite en Web (Versión 2)

## ❌ Problema

Error persistente al ejecutar la app en web:

```
Unable to resolve module ./wa-sqlite/wa-sqlite.wasm from 
node_modules/expo-sqlite/web/worker.ts
```

**Causa:** Metro está intentando procesar `expo-sqlite` incluso cuando estamos en web, y los archivos WASM no se pueden resolver correctamente.

## ✅ Solución Aplicada

### 1. Creación de Mock de SQLite

Se creó `services/sqliteMock.ts` que reemplaza `expo-sqlite` en web:

```typescript
class MockSQLiteDatabase {
  async execAsync(sql: string): Promise<void> {}
  async getAllAsync<T>(sql: string, params?: any[]): Promise<T[]> { return []; }
  async getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null> { return null; }
  async runAsync(sql: string, params?: any[]): Promise<void> {}
  async closeAsync(): Promise<void> {}
}

export const openDatabaseAsync = async (name: string): Promise<MockSQLiteDatabase> => {
  console.warn('⚠️ SQLite no disponible en web, usando AsyncStorage como fallback');
  return new MockSQLiteDatabase();
};
```

### 2. Configuración de Metro Resolver

Se configuró Metro para resolver `expo-sqlite` al mock en web:

```javascript
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Si estamos en web y se intenta importar expo-sqlite, usar el mock
    if (platform === 'web' && moduleName === 'expo-sqlite') {
      return {
        filePath: path.resolve(__dirname, 'services/sqliteMock.ts'),
        type: 'sourceFile',
      };
    }
    // Para otras plataformas, usar la resolución por defecto
    return context.resolveRequest(context, moduleName, platform);
  },
  // Excluir archivos WASM del bundle
  assetExts: [...config.resolver.assetExts, 'wasm'],
};
```

### 3. Importación Simplificada

Se simplificó la importación en `databaseService.ts`:

```typescript
// Metro resolverá automáticamente al mock en web
let SQLite: any = null;
try {
  SQLite = require('expo-sqlite');
} catch (error) {
  console.warn('expo-sqlite no disponible:', error);
}
```

## 🔄 Próximos Pasos

### 1. Limpiar Caché de Metro

```bash
# Detener el servidor si está corriendo (Ctrl+C)
# Luego limpiar caché
npx expo start --clear
```

### 2. Reiniciar el Servidor

```bash
npm start
```

### 3. Probar en Web

```bash
npm run web
```

## 📝 Notas Importantes

- **Metro Resolver:** El resolver de Metro intercepta las importaciones de `expo-sqlite` en web y las redirige al mock
- **Fallback Automático:** El servicio `databaseService` ya tiene fallback a AsyncStorage en web
- **Sin Cambios en Código:** No necesitas cambiar cómo usas el servicio, todo es transparente

## ⚠️ Si el Error Persiste

Si después de limpiar el caché el error continúa:

1. **Eliminar node_modules y reinstalar:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Limpiar caché de Expo:**
   ```bash
   npx expo start --clear
   ```

3. **Verificar que el mock existe:**
   ```bash
   ls services/sqliteMock.ts
   ```

---

**Última actualización:** Noviembre 2025

