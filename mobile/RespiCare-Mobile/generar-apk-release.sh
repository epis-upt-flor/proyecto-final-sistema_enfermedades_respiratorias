#!/bin/bash

# Script para generar APK Release en Linux/Mac
echo "🔨 Generando APK Release..."

# Navegar a la carpeta del proyecto
cd "$(dirname "$0")"

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de ejecutar este script desde la carpeta RespiCare-Mobile."
    exit 1
fi

# Verificar que existe la carpeta android
if [ ! -d "android" ]; then
    echo "📦 Ejecutando prebuild de Expo..."
    npx expo prebuild --platform android
fi

# Verificar keystore
KEYSTORE_PATH="android/app/my-release-key.keystore"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "⚠️  No se encontró keystore. Generando uno nuevo..."
    echo "📝 Necesitarás ingresar información para el keystore:"
    
    cd android/app
    keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
    
    if [ $? -ne 0 ]; then
        echo "❌ Error al generar keystore"
        exit 1
    fi
    
    echo "✅ Keystore generado. Ahora configura las contraseñas en android/gradle.properties"
    echo "   MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña"
    echo "   MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña"
    echo ""
    echo "⚠️  IMPORTANTE: Guarda estas contraseñas en un lugar seguro!"
    exit 0
fi

# Verificar gradle.properties
GRADLE_PROPS="android/gradle.properties"
if ! grep -q "MYAPP_RELEASE_STORE_PASSWORD" "$GRADLE_PROPS" || ! grep -q "MYAPP_RELEASE_KEY_PASSWORD" "$GRADLE_PROPS"; then
    echo "⚠️  No se encontraron las contraseñas del keystore en gradle.properties"
    echo "   Agrega las siguientes líneas a android/gradle.properties:"
    echo "   MYAPP_RELEASE_STORE_FILE=my-release-key.keystore"
    echo "   MYAPP_RELEASE_KEY_ALIAS=my-key-alias"
    echo "   MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña"
    echo "   MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña"
    exit 1
fi

# Navegar a android
cd android

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
./gradlew clean

# Generar APK Release
echo "🔨 Generando APK Release..."
./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo "✅ APK Release generado exitosamente!"
    echo "📍 Ubicación: android/app/build/outputs/apk/release/app-release.apk"
    
    # Verificar si existe el archivo
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "📦 Tamaño: $SIZE"
        echo ""
        echo "💡 Para instalar en un dispositivo:"
        echo "   adb install $APK_PATH"
        echo ""
        echo "⚠️  IMPORTANTE: Este APK está firmado y listo para distribución."
    fi
else
    echo "❌ Error al generar APK Release"
    exit 1
fi

# Volver a la carpeta raíz
cd ..

