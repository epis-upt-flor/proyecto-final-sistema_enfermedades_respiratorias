# 📱 Guía para Generar APK de Android - RespiCare Mobile

Esta guía te ayudará a generar un archivo APK para instalar la aplicación RespiCare en dispositivos Android.

---

## 🎯 Opciones Disponibles

### Opción 1: EAS Build (Recomendado) ⭐
**Ventajas:**
- ✅ Más fácil y rápido
- ✅ No requiere configuración local de Android SDK
- ✅ Genera APK en la nube
- ✅ Soporte oficial de Expo

### Opción 2: Build Local con Gradle
**Ventajas:**
- ✅ No requiere cuenta de Expo
- ✅ Control total del proceso
- ✅ Útil para desarrollo

---

## 🚀 Opción 1: EAS Build (Recomendado)

### Paso 1: Instalar EAS CLI

```bash
npm install -g eas-cli
```

### Paso 2: Iniciar sesión en Expo

```bash
eas login
```

Si no tienes cuenta, créala en: https://expo.dev/signup

### Paso 3: Configurar EAS Build

Desde la carpeta `mobile/RespiCare-Mobile`, ejecuta:

```bash
eas build:configure
```

Esto creará un archivo `eas.json` con la configuración.

### Paso 4: Configurar app.json

Asegúrate de que `app.json` tenga la configuración de Android correcta:

```json
{
  "expo": {
    "android": {
      "package": "com.respicare.mobile",
      "versionCode": 1,
      "permissions": [
        "android.permission.ACTIVITY_RECOGNITION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.RECORD_AUDIO",
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### Paso 5: Generar APK

#### APK para Testing (Debug)

```bash
eas build --platform android --profile preview
```

#### APK para Producción (Release)

```bash
eas build --platform android --profile production
```

### Paso 6: Descargar APK

Una vez completado el build, EAS te proporcionará un enlace para descargar el APK. También puedes verlo en: https://expo.dev/accounts/[tu-usuario]/builds

---

## 🔧 Opción 2: Build Local con Gradle

### Prerrequisitos

1. **Android Studio** instalado
2. **Android SDK** configurado
3. **JAVA_HOME** configurado (JDK 17 o superior)
4. **ANDROID_HOME** configurado

### Verificar Instalación

```bash
# Verificar Java
java -version

# Verificar Android SDK
echo $ANDROID_HOME  # Linux/Mac
echo %ANDROID_HOME% # Windows
```

### Paso 1: Pre-build de Expo

Desde `mobile/RespiCare-Mobile`:

```bash
npx expo prebuild --platform android
```

Esto generará los archivos nativos de Android si no existen.

### Paso 2: Generar Keystore (Solo para Release)

Si es la primera vez, genera un keystore:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**Guarda la contraseña del keystore en un lugar seguro.**

### Paso 3: Configurar Gradle para Release

Edita `android/gradle.properties` y agrega:

```properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña
MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña
```

**⚠️ IMPORTANTE:** Agrega `gradle.properties` a `.gitignore` para no subir las contraseñas.

### Paso 4: Generar APK

#### APK Debug (Para Testing)

```bash
cd android
./gradlew assembleDebug
```

El APK estará en: `android/app/build/outputs/apk/debug/app-debug.apk`

#### APK Release (Para Producción)

```bash
cd android
./gradlew assembleRelease
```

El APK estará en: `android/app/build/outputs/apk/release/app-release.apk`

### Paso 5: Firmar APK (Solo Release)

Si el APK release no está firmado automáticamente:

```bash
cd android/app
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk my-key-alias
```

---

## 📋 Scripts Automatizados

He creado scripts para facilitar el proceso:

### Script para Windows (PowerShell)

```powershell
# Generar APK Debug
.\generar-apk-debug.ps1

# Generar APK Release
.\generar-apk-release.ps1
```

### Script para Linux/Mac

```bash
# Generar APK Debug
chmod +x generar-apk-debug.sh
./generar-apk-debug.sh

# Generar APK Release
chmod +x generar-apk-release.sh
./generar-apk-release.sh
```

---

## 🔍 Verificar APK Generado

### Verificar Información del APK

```bash
# Instalar aapt2 (Android Asset Packaging Tool)
# Viene con Android SDK

# Ver información del APK
aapt2 dump badging app-release.apk
```

### Verificar Firma

```bash
jarsigner -verify -verbose -certs app-release.apk
```

---

## 📦 Instalar APK en Dispositivo

### Opción 1: USB Debugging

1. Habilita "Opciones de desarrollador" en tu Android
2. Habilita "Depuración USB"
3. Conecta el dispositivo por USB
4. Ejecuta:

```bash
adb install app-release.apk
```

### Opción 2: Transferencia Manual

1. Copia el APK al dispositivo (USB, email, etc.)
2. Abre el archivo en el dispositivo
3. Permite "Instalar desde fuentes desconocidas" si es necesario
4. Instala el APK

---

## ⚙️ Configuración Adicional

### Variables de Entorno

Asegúrate de configurar las variables de entorno en `.env`:

```env
EXPO_PUBLIC_API_URL=http://tu-servidor-backend:3001
EXPO_PUBLIC_AI_SERVICE_URL=http://tu-servidor-ai:8000
```

### Permisos Android

Verifica que `android/app/src/main/AndroidManifest.xml` tenga todos los permisos necesarios:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

## 🐛 Solución de Problemas

### Error: "SDK location not found"

```bash
# Crear archivo local.properties en android/
echo "sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk" > android/local.properties
```

### Error: "Gradle sync failed"

```bash
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

### Error: "Keystore not found"

Asegúrate de que el keystore esté en `android/app/` y que las rutas en `gradle.properties` sean correctas.

### APK muy grande

```bash
# Habilitar ProGuard para reducir tamaño
# En android/app/build.gradle, descomenta:
minifyEnabled true
shrinkResources true
```

---

## 📝 Notas Importantes

1. **Versión del APK**: Actualiza `versionCode` en `app.json` cada vez que generes un nuevo APK para producción.

2. **Keystore**: **NUNCA** pierdas el keystore. Sin él, no podrás actualizar la app en Google Play Store.

3. **Testing**: Siempre prueba el APK en un dispositivo real antes de distribuirlo.

4. **Tamaño**: El APK puede ser grande (50-100MB) debido a las dependencias nativas. Considera usar App Bundle (AAB) para Google Play Store.

---

## 🚀 Generar App Bundle (AAB) para Google Play

Si planeas publicar en Google Play Store, usa AAB en lugar de APK:

```bash
# Con EAS
eas build --platform android --profile production --type app-bundle

# Localmente
cd android
./gradlew bundleRelease
```

El AAB estará en: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `android/app/build/outputs/logs/`
2. Verifica la configuración en `app.json`
3. Consulta la documentación de Expo: https://docs.expo.dev/build/introduction/

---

**Última actualización:** Noviembre 2025

