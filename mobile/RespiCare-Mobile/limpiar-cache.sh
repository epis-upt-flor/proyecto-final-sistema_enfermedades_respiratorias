#!/bin/bash
# Script para limpiar caché de Expo/React Native

echo "🧹 Limpiando caché de Expo..."

# Limpiar caché de npm
echo "📦 Limpiando caché de npm..."
npm cache clean --force

# Limpiar caché de Metro
echo "🚇 Limpiando caché de Metro..."
npx expo start --clear

echo "✅ Caché limpiada! Ahora ejecuta: npm run web"

