# Script para configurar el entorno Android en PowerShell
Write-Host "=== Configurando variables de entorno Android ===" -ForegroundColor Cyan

# Buscar Android SDK
$sdkPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:ProgramFiles\Android\Android Studio\sdk",
    "$env:ANDROID_HOME"
)

$androidSdk = $null
foreach ($path in $sdkPaths) {
    if (Test-Path $path) {
        $androidSdk = $path
        break
    }
}

if (-not $androidSdk) {
    Write-Host "❌ Android SDK no encontrado. Por favor instala Android Studio" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Android SDK encontrado: $androidSdk" -ForegroundColor Green

# Agregar a PATH para esta sesión
$platformTools = Join-Path $androidSdk "platform-tools"
$tools = Join-Path $androidSdk "tools"
$toolsBin = Join-Path $androidSdk "tools\bin"

$env:Path = "$platformTools;$tools;$toolsBin;$env:Path"
$env:ANDROID_HOME = $androidSdk

Write-Host "✓ Variables de entorno configuradas para esta sesión" -ForegroundColor Green
Write-Host "`nPara hacerlo permanente:" -ForegroundColor Yellow
Write-Host "  1. Abre 'Variables de entorno' en Windows" -ForegroundColor Yellow
Write-Host "  2. Edita la variable 'Path'" -ForegroundColor Yellow
Write-Host "  3. Agrega: $platformTools" -ForegroundColor Yellow
Write-Host "     Y también: $tools" -ForegroundColor Yellow
Write-Host "     Y también: $toolsBin" -ForegroundColor Yellow

# Verificar ADB
Write-Host "`n=== Verificando ADB ===" -ForegroundColor Cyan
$adbPath = Join-Path $platformTools "adb.exe"
if (Test-Path $adbPath) {
    Write-Host "✓ ADB encontrado: $adbPath" -ForegroundColor Green
    Write-Host "`nVersión de ADB:" -ForegroundColor Cyan
    & $adbPath version
} else {
    Write-Host "❌ ADB no encontrado" -ForegroundColor Red
}

