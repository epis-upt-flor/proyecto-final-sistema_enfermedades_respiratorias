# Script para limpiar caché de Expo/React Native
Write-Host "🧹 Limpiando caché de Expo..." -ForegroundColor Cyan

# Limpiar caché de npm
Write-Host "📦 Limpiando caché de npm..." -ForegroundColor Yellow
npm cache clean --force

# Limpiar caché de Metro
Write-Host "🚇 Limpiando caché de Metro..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "✅ Caché limpiada! Ahora ejecuta: npm run web" -ForegroundColor Green

