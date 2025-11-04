# 🚀 Instalación Rápida de Wearables

## Pasos para completar la instalación

### 1. Instalar dependencias

```bash
cd mobile/RespiCare-Mobile
npm install
```

Esto instalará `expo-health` que ya está agregado en `package.json`.

### 2. Regenerar builds nativos

**Importante**: Después de agregar `expo-health`, necesitas regenerar los builds nativos:

```bash
# Limpiar builds anteriores
npx expo prebuild --clean

# iOS
cd ios && pod install && cd ..
npx expo run:ios

# Android
npx expo run:android
```

### 3. Verificar configuración

Los permisos ya están configurados en `app.json`:
- ✅ iOS: Permisos de HealthKit configurados
- ✅ Android: Permisos de Google Fit configurados
- ✅ Plugin de expo-health configurado

### 4. Probar en dispositivo físico

**Nota**: Los datos de salud solo funcionan en dispositivos físicos, no en simuladores.

```bash
# Conectar dispositivo iOS/Android
npx expo run:ios --device
npx expo run:android --device
```

## ⚠️ Notas Importantes

1. **Expo Go no soporta módulos nativos**: Debes usar un build de desarrollo nativo
2. **iOS requiere HealthKit habilitado**: En Xcode, agrega la capacidad HealthKit
3. **Android requiere Google Fit**: Asegúrate de tener Google Fit instalado y configurado

## 📚 Documentación Completa

Ver `WEARABLES_SETUP.md` para documentación detallada.

