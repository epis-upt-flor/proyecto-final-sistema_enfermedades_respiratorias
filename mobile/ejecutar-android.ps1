# Script simplificado para ejecutar Android
# Asegúrate de tener Metro corriendo en otra terminal: npm start

Write-Host "=== Ejecutando React Native Android ===" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio mobile" -ForegroundColor Red
    exit 1
}

# Verificar dispositivos
Write-Host "`n=== Verificando dispositivos ===" -ForegroundColor Cyan
$devices = & adb devices | Select-String "device$" | Measure-Object
if ($devices.Count -eq 0) {
    Write-Host "⚠️  No hay dispositivos conectados. Inicia un emulador o conecta un dispositivo." -ForegroundColor Yellow
} else {
    Write-Host "✓ Dispositivos encontrados: $($devices.Count)" -ForegroundColor Green
    & adb devices
}

# Ejecutar
Write-Host "`n=== Compilando e instalando la app ===" -ForegroundColor Cyan
Write-Host "   Asegúrate de tener Metro Bundler corriendo en otra terminal (npm start)" -ForegroundColor Yellow
Write-Host ""

npm run android

