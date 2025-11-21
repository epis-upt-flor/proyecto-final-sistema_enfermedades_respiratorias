# Script para generar APK Debug en Windows
Write-Host "🔨 Generando APK Debug..." -ForegroundColor Cyan

# Navegar a la carpeta del proyecto
Set-Location $PSScriptRoot

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de ejecutar este script desde la carpeta RespiCare-Mobile." -ForegroundColor Red
    exit 1
}

# Verificar que existe la carpeta android
if (-not (Test-Path "android")) {
    Write-Host "📦 Ejecutando prebuild de Expo..." -ForegroundColor Yellow
    npx expo prebuild --platform android
}

# Navegar a android
Set-Location android

# Limpiar builds anteriores
Write-Host "🧹 Limpiando builds anteriores..." -ForegroundColor Yellow
.\gradlew clean

# Generar APK Debug
Write-Host "🔨 Generando APK Debug..." -ForegroundColor Cyan
.\gradlew assembleDebug

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK Debug generado exitosamente!" -ForegroundColor Green
    Write-Host "📍 Ubicación: android\app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor Cyan
    
    # Verificar si existe el archivo
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $fileInfo = Get-Item $apkPath
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        Write-Host "📦 Tamaño: $sizeMB MB" -ForegroundColor Cyan
        Write-Host "`n💡 Para instalar en un dispositivo:" -ForegroundColor Yellow
        Write-Host "   adb install $apkPath" -ForegroundColor White
    }
} else {
    Write-Host "❌ Error al generar APK Debug" -ForegroundColor Red
    exit 1
}

# Volver a la carpeta raíz
Set-Location ..

