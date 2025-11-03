# Script para ejecutar Android con verificaciones
Write-Host "=== Verificando entorno Android ===" -ForegroundColor Cyan

# Verificar ADB
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adbPath)) {
    $adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"
}

if (-not (Test-Path $adbPath)) {
    Write-Host "⚠️  ADB no encontrado. Por favor agrega Android SDK platform-tools a tu PATH" -ForegroundColor Yellow
    Write-Host "   Ubicación típica: C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\platform-tools" -ForegroundColor Yellow
} else {
    Write-Host "✓ ADB encontrado: $adbPath" -ForegroundColor Green
    
    # Verificar dispositivos conectados
    Write-Host "`n=== Dispositivos disponibles ===" -ForegroundColor Cyan
    & $adbPath devices
}

# Verificar emuladores
Write-Host "`n=== Emuladores disponibles ===" -ForegroundColor Cyan
if (Test-Path $adbPath) {
    $emulators = & $adbPath emulator -list-avds
    if ($emulators.Count -eq 0) {
        Write-Host "⚠️  No se encontraron emuladores. Por favor crea uno en Android Studio" -ForegroundColor Yellow
        Write-Host "   Tools → Device Manager → Create Device" -ForegroundColor Yellow
    } else {
        Write-Host "Emuladores encontrados:" -ForegroundColor Green
        $emulators | ForEach-Object { Write-Host "  - $_" -ForegroundColor Green }
    }
}

# Verificar si Metro está corriendo
Write-Host "`n=== Verificando Metro Bundler ===" -ForegroundColor Cyan
$metroProcess = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" }
if (-not $metroProcess) {
    Write-Host "⚠️  Metro Bundler no está corriendo. Iniciando..." -ForegroundColor Yellow
    Write-Host "   Ejecuta 'npm start' en otra terminal primero, o presiona Enter para continuar sin Metro" -ForegroundColor Yellow
    $response = Read-Host "Presiona Enter para continuar"
} else {
    Write-Host "✓ Metro Bundler está corriendo" -ForegroundColor Green
}

# Ejecutar build
Write-Host "`n=== Iniciando build Android ===" -ForegroundColor Cyan
npm run android

