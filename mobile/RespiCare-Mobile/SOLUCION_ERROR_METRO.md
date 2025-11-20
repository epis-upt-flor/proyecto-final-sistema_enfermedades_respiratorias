# 🔧 Solución: Error de Metro "ENOENT: no such file or directory"

## 📋 Problema

Metro está buscando módulos en el directorio incorrecto (`mobile/node_modules` en lugar de `mobile/RespiCare-Mobile/node_modules`).

## ✅ Solución Rápida

### Opción 1: Script Automático (Recomendado)

```powershell
cd mobile/RespiCare-Mobile
.\limpiar-y-reinstalar.ps1
```

Luego ejecuta:
```bash
npm start -- --reset-cache
```

### Opción 2: Manual

#### Paso 1: Limpiar Caché y Archivos

```powershell
cd mobile/RespiCare-Mobile

# Limpiar caché de Expo
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue

# Limpiar caché de npm
npm cache clean --force

# Limpiar node_modules (opcional, si el problema persiste)
# Remove-Item -Recurse -Force node_modules
# npm install
```

#### Paso 2: Reiniciar Metro con Caché Limpio

```bash
npm start -- --reset-cache
```

O para web:
```bash
npm run web -- --reset-cache
```

## 🔍 Verificación

Asegúrate de que estos archivos existan en `mobile/RespiCare-Mobile/`:

- ✅ `metro.config.js` - Configuración de Metro
- ✅ `babel.config.js` - Configuración de Babel
- ✅ `package.json` - Dependencias
- ✅ `tsconfig.json` - Configuración de TypeScript
- ✅ `app.json` - Configuración de Expo

## 🐛 Si el Problema Persiste

### 1. Verificar que estás en el directorio correcto

```powershell
# Debe estar en mobile/RespiCare-Mobile
pwd
# Debe mostrar: ...\mobile\RespiCare-Mobile
```

### 2. Reinstalar dependencias completamente

```powershell
cd mobile/RespiCare-Mobile

# Eliminar todo
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Reinstalar
npm install
```

### 3. Verificar que no haya conflictos con el directorio padre

Asegúrate de que NO estés ejecutando desde `mobile/` sino desde `mobile/RespiCare-Mobile/`.

### 4. Limpiar caché global de npm

```bash
npm cache clean --force
```

### 5. Usar npx expo en lugar de npm

```bash
npx expo start --web --clear
```

## 📝 Notas Importantes

1. **Siempre ejecuta desde `mobile/RespiCare-Mobile/`**, no desde `mobile/`
2. El `metro.config.js` ahora está configurado para buscar módulos en el directorio correcto
3. Si usas `npm run web`, asegúrate de limpiar el caché primero

## 🚀 Comandos Útiles

```bash
# Iniciar con caché limpio
npm start -- --reset-cache

# Solo web con caché limpio
npm run web -- --clear

# Verificar configuración de Metro
npx expo config --type introspect

# Verificar que Expo detecta el proyecto
npx expo-doctor
```

---

**Después de seguir estos pasos, el error debería estar resuelto.** ✅

