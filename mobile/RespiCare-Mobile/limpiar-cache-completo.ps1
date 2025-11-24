# Script para limpiar completamente el cache de Expo/Metro
Write-Host "🧹 Limpiando cache completo..." -ForegroundColor Cyan

# Limpiar cache de Metro
Write-Host "📦 Limpiando cache de Metro..." -ForegroundColor Yellow
npx expo start --clear

# Si el comando anterior no funciona, usar estos comandos manuales:
Write-Host ""
Write-Host "Si el comando anterior falla, ejecuta manualmente:" -ForegroundColor Yellow
Write-Host "1. npx expo start -c" -ForegroundColor White
Write-Host "2. O reinicia el servidor con: npm start -- --reset-cache" -ForegroundColor White
Write-Host ""
Write-Host "✅ Cache limpiado. Reinicia el servidor de desarrollo." -ForegroundColor Green

