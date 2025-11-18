# 📱 RespiCare-Mobile - Guía de Configuración

## ✅ Proyecto Principal: Expo

Este es el proyecto principal de la aplicación móvil RespiCare, construido con **Expo SDK 53**.

## 🚀 Inicio Rápido

### 1. Navegar al Directorio del Proyecto

```bash
cd mobile/RespiCare-Mobile
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Iniciar el Proyecto

```bash
# Desarrollo
npm start

# Android
npm run android

# iOS (solo macOS)
npm run ios

# Web
npm run web
```

## 📋 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo Expo |
| `npm run android` | Compila y ejecuta en Android |
| `npm run ios` | Compila y ejecuta en iOS (solo macOS) |
| `npm run web` | Ejecuta en navegador web |
| `npm run lint` | Ejecuta ESLint para análisis estático |
| `npm run reset-project` | Resetea la configuración del proyecto |

## 🔧 Configuración

### Versiones Utilizadas

- **Expo SDK:** 53.0.22
- **React:** 19.0.0
- **React Native:** 0.79.5
- **TypeScript:** 5.8.3
- **Node.js:** >= 16

### Archivos de Configuración

- `app.json` - Configuración de Expo
- `tsconfig.json` - Configuración de TypeScript
- `eslint.config.js` - Configuración de ESLint
- `package.json` - Dependencias y scripts

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm test -- --coverage
```

## 📦 Estructura del Proyecto

```
RespiCare-Mobile/
├── app/                    # Rutas de Expo Router
├── components/             # Componentes reutilizables
├── services/               # Servicios (API, storage, etc.)
├── stores/                 # Estado global (Zustand)
├── hooks/                  # Custom hooks
├── utils/                  # Utilidades
├── constants/              # Constantes
├── assets/                 # Imágenes, fuentes, etc.
├── android/                # Código nativo Android
└── scripts/               # Scripts de utilidad
```

## 🔍 Análisis Estático

### Ejecutar Linting

```bash
npm run lint
```

### Desde el Makefile Principal

```bash
# Desde la raíz del proyecto
make lint
```

## ⚠️ Notas Importantes

1. **Este es el proyecto principal** - El proyecto React Native puro en `../` es un proyecto legacy/backup
2. **Expo SDK 53** - Asegúrate de usar las versiones compatibles
3. **Node.js 16+** - Requerido para Expo SDK 53

## 🐛 Solución de Problemas

### Error: "expo: command not found"

```bash
npm install -g expo-cli
# o
npx expo start
```

### Error: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Metro bundler error"

```bash
npm start -- --reset-cache
```

## 📚 Recursos

- [Documentación de Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)

---

**Última actualización:** Noviembre 2025

