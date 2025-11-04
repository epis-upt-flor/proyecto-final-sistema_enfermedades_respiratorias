# 📱 Configuración de Wearables - RespiCare Mobile

Esta guía explica cómo configurar e instalar las librerías necesarias para la integración con wearables (HealthKit en iOS y Google Fit en Android).

## 📋 Prerrequisitos

- Node.js >= 18
- Expo CLI instalado globalmente: `npm install -g expo-cli`
- Para iOS: Xcode y CocoaPods
- Para Android: Android Studio

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd mobile/RespiCare-Mobile
npm install
```

Esto instalará `expo-health` que es la librería unificada para HealthKit (iOS) y Google Fit (Android).

### 2. Configurar permisos

Los permisos ya están configurados en `app.json`. Si necesitas ajustarlos:

#### iOS (Info.plist)
Los permisos se configuran automáticamente mediante `app.json`:
- `NSHealthShareUsageDescription`: Para leer datos de salud
- `NSHealthUpdateUsageDescription`: Para escribir datos de salud
- `NSMotionUsageDescription`: Para datos de movimiento
- `NSLocationWhenInUseUsageDescription`: Para ubicación

#### Android (AndroidManifest.xml)
Los permisos se configuran automáticamente mediante `app.json`:
- `ACTIVITY_RECOGNITION`: Para reconocer actividad física
- `ACCESS_FINE_LOCATION`: Para ubicación precisa
- `ACCESS_COARSE_LOCATION`: Para ubicación aproximada
- `INTERNET`: Para sincronización con backend

### 3. Configurar el plugin de expo-health

El plugin de `expo-health` está configurado en `app.json`:

```json
{
  "plugins": [
    [
      "expo-health",
      {
        "healthSharePermission": "RespiCare necesita acceder a tus datos de salud...",
        "healthUpdatePermission": "RespiCare necesita escribir datos de salud...",
        "isHealthDataAvailable": true
      }
    ]
  ]
}
```

## 🚀 Generar Builds Nativos

### Para desarrollo (Expo Go)

```bash
npm start
```

**Nota**: Expo Go no soporta módulos nativos como `expo-health`. Necesitas usar un build de desarrollo.

### Para desarrollo con build nativo

```bash
# iOS
npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios

# Android
npx expo prebuild --platform android
npx expo run:android
```

### Para producción (EAS Build)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar EAS
eas build:configure

# Generar build
eas build --platform ios
eas build --platform android
```

## 📱 Configuración Adicional

### iOS - Habilitar HealthKit en Xcode

1. Abre el proyecto en Xcode: `npx expo prebuild --platform ios`
2. Abre `ios/RespiCareMobile.xcworkspace` en Xcode
3. Selecciona el target de la app
4. Ve a "Signing & Capabilities"
5. Haz clic en "+ Capability"
6. Agrega "HealthKit"
7. Configura los tipos de datos que la app puede leer/escribir

### Android - Configurar Google Fit API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google Fit
4. Crea credenciales OAuth 2.0
5. Descarga el archivo `google-services.json`
6. Colócalo en `android/app/google-services.json`

**Nota**: Para desarrollo, `expo-health` funciona sin configuración adicional de Google Fit API. Solo necesitas configurarlo para producción.

## 🧪 Pruebas

### Probar en simulador/emulador

Los simuladores tienen soporte limitado para datos de salud. Para pruebas completas:

1. **iOS**: Usa un dispositivo físico con Apple Watch o iPhone con datos de salud
2. **Android**: Usa un dispositivo físico con Google Fit configurado

### Datos simulados

El servicio incluye datos simulados para desarrollo. Se activan automáticamente cuando:
- No hay permisos otorgados
- Health data no está disponible
- Hay errores al obtener datos reales

## 🔍 Verificar Instalación

1. Ejecuta la app en un dispositivo físico
2. Ve a la pantalla de Wearables
3. Toca "Conectar con HealthKit / Google Fit"
4. Otorga los permisos solicitados
5. Verifica que los datos se muestren correctamente

## ⚠️ Notas Importantes

### iOS
- HealthKit solo funciona en dispositivos físicos (no en simulador)
- Requiere iOS 9.0 o superior
- Los usuarios deben tener datos de salud en la app Health

### Android
- Google Fit requiere que el usuario tenga una cuenta de Google configurada
- Los datos pueden tardar en sincronizarse
- Algunos datos requieren dispositivos específicos (ej: SpO2 requiere un dispositivo compatible)

### Permisos
- Los permisos se solicitan en tiempo de ejecución
- Los usuarios pueden revocar permisos en cualquier momento
- La app maneja la falta de permisos gracefully

## 🐛 Solución de Problemas

### Error: "Health data is not available"
- **iOS**: Asegúrate de ejecutar en un dispositivo físico
- **Android**: Verifica que Google Fit esté instalado y configurado

### Error: "Permissions denied"
- Verifica que los permisos estén configurados en `app.json`
- Reinstala la app para reiniciar los permisos
- Verifica en Configuración del dispositivo que los permisos estén otorgados

### Error: "No data available"
- Verifica que tengas datos de salud en Health/Google Fit
- Algunos datos pueden requerir dispositivos específicos
- Los datos simulados se activan automáticamente en desarrollo

### Build errors
```bash
# Limpiar y reconstruir
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios
```

## 📚 Referencias

- [Expo Health Documentation](https://docs.expo.dev/versions/latest/sdk/health/)
- [Apple HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [Google Fit API Documentation](https://developers.google.com/fit)

## ✅ Checklist de Configuración

- [ ] `expo-health` instalado en `package.json`
- [ ] Permisos configurados en `app.json`
- [ ] Plugin de `expo-health` configurado en `app.json`
- [ ] Build nativo generado (no usar Expo Go)
- [ ] HealthKit habilitado en Xcode (iOS)
- [ ] Google Fit API configurada (Android - solo producción)
- [ ] Permisos otorgados en dispositivo físico
- [ ] Datos de salud disponibles en Health/Google Fit

