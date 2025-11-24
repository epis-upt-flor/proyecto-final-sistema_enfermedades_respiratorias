# Script para instalar y configurar Capacitor
# Uso: .\instalar-capacitor.ps1

Write-Host "📱 Instalando y configurando Capacitor para RespiCare Medical App..." -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Ejecuta este script desde mobile/medical-app" -ForegroundColor Red
    exit 1
}

# Paso 1: Instalar dependencias de npm
Write-Host "`n📦 Instalando dependencias de npm..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# Paso 2: Instalar Capacitor
Write-Host "`n📱 Instalando Capacitor y plugins..." -ForegroundColor Cyan
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/camera @capacitor/filesystem
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar Capacitor" -ForegroundColor Red
    exit 1
}

# Paso 3: Verificar configuración de Capacitor
Write-Host "`n🔧 Verificando configuración de Capacitor..." -ForegroundColor Cyan
if (-not (Test-Path "capacitor.config.ts")) {
    Write-Host "⚠️  capacitor.config.ts no encontrado, pero debería existir" -ForegroundColor Yellow
} else {
    Write-Host "✅ capacitor.config.ts encontrado" -ForegroundColor Green
}

# Paso 4: Agregar plataforma Android (si no existe)
Write-Host "`n🤖 Verificando plataforma Android..." -ForegroundColor Cyan
if (-not (Test-Path "android")) {
    Write-Host "Agregando plataforma Android..." -ForegroundColor Yellow
    npx cap add android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al agregar plataforma Android" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Plataforma Android ya existe" -ForegroundColor Green
}

# Paso 5: Construir la aplicación
Write-Host "`n🔨 Construyendo aplicación Next.js..." -ForegroundColor Cyan
npm run build:static
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la aplicación" -ForegroundColor Red
    exit 1
}

# Paso 6: Sincronizar con Capacitor
Write-Host "`n🔄 Sincronizando con Capacitor..." -ForegroundColor Cyan
npx cap sync
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al sincronizar con Capacitor" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ ¡Capacitor instalado y configurado correctamente!" -ForegroundColor Green
Write-Host "`n📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Configura ANDROID_HOME si aún no lo has hecho" -ForegroundColor Yellow
Write-Host "2. Ejecuta: .\generar-apk.ps1 para generar el APK" -ForegroundColor Yellow
Write-Host "3. Ver GUIA_GENERAR_APK.md para más detalles" -ForegroundColor Yellow

