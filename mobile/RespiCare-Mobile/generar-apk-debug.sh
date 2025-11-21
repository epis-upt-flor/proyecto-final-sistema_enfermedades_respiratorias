#!/bin/bash

# Script para generar APK Debug en Linux/Mac
echo "🔨 Generando APK Debug..."

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

# Navegar a android
cd android

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
./gradlew clean

# Generar APK Debug
echo "🔨 Generando APK Debug..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ APK Debug generado exitosamente!"
    echo "📍 Ubicación: android/app/build/outputs/apk/debug/app-debug.apk"
    
    # Verificar si existe el archivo
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "📦 Tamaño: $SIZE"
        echo ""
        echo "💡 Para instalar en un dispositivo:"
        echo "   adb install $APK_PATH"
    fi
else
    echo "❌ Error al generar APK Debug"
    exit 1
fi

# Volver a la carpeta raíz
cd ..

