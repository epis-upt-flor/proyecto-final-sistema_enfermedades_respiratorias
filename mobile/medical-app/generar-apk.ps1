# Script para generar APK de RespiCare Medical App
# Uso: .\generar-apk.ps1 [debug|release]

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("debug", "release")]
    [string]$BuildType = "debug"
)

Write-Host "🚀 Generando APK de RespiCare Medical App..." -ForegroundColor Cyan
Write-Host "Tipo de build: $BuildType" -ForegroundColor Yellow

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde mobile/medical-app" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar y configurar Android SDK
$defaultAndroidHome = "$env:LOCALAPPDATA\Android\Sdk"
if (-not $env:ANDROID_HOME) {
    Write-Host "⚠️  ADVERTENCIA: ANDROID_HOME no está configurado" -ForegroundColor Yellow
    Write-Host "Intentando usar ubicación por defecto..." -ForegroundColor Yellow
    if (Test-Path $defaultAndroidHome) {
        $env:ANDROID_HOME = $defaultAndroidHome
        Write-Host "✅ Usando: $defaultAndroidHome" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: No se encontró Android SDK. Por favor configura ANDROID_HOME" -ForegroundColor Red
        Write-Host "Ver GUIA_GENERAR_APK.md para más información" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
}

# Crear/actualizar local.properties si es necesario
$localPropertiesPath = "android\local.properties"
$sdkPath = $env:ANDROID_HOME -replace '\\', '/'
if (-not (Test-Path $localPropertiesPath) -or (Get-Content $localPropertiesPath -Raw) -notmatch "sdk\.dir=") {
    Write-Host "`n📝 Creando/actualizando local.properties..." -ForegroundColor Cyan
    "sdk.dir=$sdkPath" | Out-File -FilePath $localPropertiesPath -Encoding utf8
    Write-Host "✅ local.properties configurado" -ForegroundColor Green
}

# Paso 1: Instalar dependencias si es necesario
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias de npm..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
}

# Verificar si Capacitor está instalado
if (-not (Test-Path "node_modules/@capacitor")) {
    Write-Host "Instalando Capacitor..." -ForegroundColor Yellow
    npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/camera @capacitor/filesystem
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar Capacitor" -ForegroundColor Red
        exit 1
    }
}

# Paso 2: Construir la aplicación Next.js
Write-Host "`n🔨 Construyendo aplicación Next.js..." -ForegroundColor Cyan
npm run build:static
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la aplicación" -ForegroundColor Red
    exit 1
}

# Verificar que se generó la carpeta out/
if (-not (Test-Path "out")) {
    Write-Host "❌ Error: No se generó la carpeta out/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build completado" -ForegroundColor Green

# Paso 3: Inicializar Capacitor si es necesario
if (-not (Test-Path "android")) {
    Write-Host "`n📱 Inicializando proyecto Android con Capacitor..." -ForegroundColor Cyan
    npx cap add android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al inicializar Android" -ForegroundColor Red
        exit 1
    }
}

# Paso 4: Sincronizar con Capacitor
Write-Host "`n🔄 Sincronizando con Capacitor..." -ForegroundColor Cyan
npm run capacitor:sync
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al sincronizar con Capacitor" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Sincronización completada" -ForegroundColor Green

# Paso 5: Generar APK
Write-Host "`n📱 Generando APK ($BuildType)..." -ForegroundColor Cyan

if ($BuildType -eq "debug") {
    Write-Host "Generando APK Debug..." -ForegroundColor Yellow
    Set-Location android
    .\gradlew.bat assembleDebug
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
} else {
    Write-Host "Generando APK Release..." -ForegroundColor Yellow
    Set-Location android
    .\gradlew.bat assembleRelease
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
}

Set-Location ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al generar el APK" -ForegroundColor Red
    exit 1
}

# Verificar que el APK existe
$fullApkPath = Join-Path "android" $apkPath
if (Test-Path $fullApkPath) {
    $apkSize = (Get-Item $fullApkPath).Length / 1MB
    Write-Host "`n✅ APK generado exitosamente!" -ForegroundColor Green
    Write-Host "📦 Ubicación: $fullApkPath" -ForegroundColor Cyan
    Write-Host "📏 Tamaño: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    
    # Abrir la carpeta en el explorador
    $apkFolder = Split-Path $fullApkPath -Parent
    Write-Host "`n📂 Abriendo carpeta del APK..." -ForegroundColor Yellow
    Start-Process explorer.exe -ArgumentList $apkFolder
    
    Write-Host "`n🎉 ¡Proceso completado!" -ForegroundColor Green
    Write-Host "Puedes instalar el APK en tu teléfono Android." -ForegroundColor Yellow
} else {
    Write-Host "❌ Error: El APK no se generó en la ubicación esperada" -ForegroundColor Red
    exit 1
}

