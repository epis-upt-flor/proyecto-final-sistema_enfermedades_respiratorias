# 🔧 Instrucciones para Aplicar los Cambios

## ✅ Cambios Realizados

1. **Corregido warning de Babel**: Removido `expo-router/babel` del `babel.config.js` (ya está incluido en `babel-preset-expo` en SDK 50)
2. **Sistema de traducciones**: Creado en `lib/translations.ts`
3. **Componente BottomNav**: Creado en `components/layout/BottomNav.tsx`
4. **Pantallas mejoradas**: Dashboard y Appointments

## 🚀 Pasos para Aplicar los Cambios

### 1. Limpiar el Cache

**Opción A - PowerShell (Windows):**
```powershell
cd mobile/RespiCare-Mobile
.\limpiar-cache.ps1
```

**Opción B - Manual:**
```bash
# Detener el servidor actual (Ctrl+C)

# Limpiar cache de Metro
npx expo start --clear

# O si eso no funciona:
npm start -- --reset-cache
```

**Opción C - Limpieza completa:**
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules
npm install

# Limpiar cache de Expo
npx expo start --clear
```

### 2. Reiniciar el Servidor de Desarrollo

```bash
# Detener el servidor actual (Ctrl+C)
# Luego iniciar de nuevo:
npx expo start
```

### 3. Verificar que los Cambios se Apliquen

1. **Verifica el babel.config.js** - Debe estar sin `expo-router/babel`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
```

2. **Verifica que los archivos existan:**
   - ✅ `lib/translations.ts`
   - ✅ `components/layout/BottomNav.tsx`
   - ✅ `app/(tabs)/index.tsx` (modificado)
   - ✅ `app/(tabs)/appointments.tsx` (modificado)

3. **Verifica las importaciones:**
   - En `index.tsx` debe tener: `import { useTranslation } from '@/lib/translations';`
   - En `appointments.tsx` debe tener: `import { useTranslation } from '@/lib/translations';`

### 4. Si los Cambios No se Aplican

**Problema: Los cambios no se ven en la app**

**Solución:**
1. Cierra completamente la app (no solo el servidor)
2. Limpia el cache completamente:
   ```bash
   npx expo start --clear
   ```
3. Si estás en web, limpia el cache del navegador (Ctrl+Shift+R)
4. Si estás en dispositivo físico, desinstala y reinstala la app

**Problema: Error de importación de `@/lib/translations`**

**Solución:**
1. Verifica que `tsconfig.json` tenga:
   ```json
   "paths": {
     "@/*": ["./*"]
   }
   ```
2. Reinicia el servidor TypeScript en tu IDE
3. Verifica que el archivo `lib/translations.ts` exista

**Problema: Warning de Babel persiste**

**Solución:**
1. Verifica que `babel.config.js` NO tenga `expo-router/babel`
2. Reinicia el servidor completamente
3. Si persiste, elimina `.expo` y `node_modules/.cache`

## 📋 Checklist de Verificación

- [ ] `babel.config.js` no tiene `expo-router/babel`
- [ ] `lib/translations.ts` existe
- [ ] `components/layout/BottomNav.tsx` existe
- [ ] Cache limpiado con `npx expo start --clear`
- [ ] Servidor reiniciado
- [ ] App recargada completamente
- [ ] No hay errores en la consola

## 🔍 Verificar que Funciona

1. **Dashboard (index.tsx):**
   - Debe mostrar "¡Hola, [Nombre]!" usando traducciones
   - Debe mostrar "Acciones Rápidas" en lugar de texto hardcodeado
   - Los cards deben tener el nuevo diseño glassmorphism

2. **Appointments:**
   - Debe mostrar "Historial Médico" en el título
   - Debe tener barra de búsqueda
   - Los cards deben tener el nuevo diseño tipo calendario

## 🆘 Si Nada Funciona

1. **Limpieza completa:**
   ```bash
   # Eliminar cache y node_modules
   rm -rf node_modules .expo .expo-shared
   npm install
   npx expo start --clear
   ```

2. **Verificar versiones:**
   ```bash
   npx expo --version
   # Debe ser SDK 50 o superior
   ```

3. **Revisar errores en consola:**
   - Abre la consola del navegador (F12) si estás en web
   - Revisa los logs de Metro bundler
   - Busca errores de importación o sintaxis

## 📝 Notas Importantes

- El warning de `expo-router/babel` es solo un aviso, no afecta la funcionalidad
- Los cambios de diseño pueden no verse inmediatamente si el cache no se limpia
- En web, puede ser necesario limpiar el cache del navegador también
- Los cambios en `babel.config.js` requieren reiniciar el servidor

---

**Última actualización**: $(date)
**Versión**: 1.0.0

