# Script para limpiar y reinstalar dependencias de RespiCare-Mobile
Write-Host "🧹 Limpiando proyecto RespiCare-Mobile..." -ForegroundColor Cyan

# Navegar al directorio del proyecto
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectDir

Write-Host "📂 Directorio: $projectDir" -ForegroundColor Yellow

# 1. Limpiar caché de Metro
Write-Host "`n1️⃣ Limpiando caché de Metro..." -ForegroundColor Green
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo"
    Write-Host "   ✅ .expo eliminado" -ForegroundColor Gray
}
if (Test-Path ".metro") {
    Remove-Item -Recurse -Force ".metro"
    Write-Host "   ✅ .metro eliminado" -ForegroundColor Gray
}

# 2. Limpiar node_modules y package-lock.json
Write-Host "`n2️⃣ Limpiando node_modules..." -ForegroundColor Green
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "   ✅ node_modules eliminado" -ForegroundColor Gray
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
    Write-Host "   ✅ package-lock.json eliminado" -ForegroundColor Gray
}

# 3. Limpiar caché de npm
Write-Host "`n3️⃣ Limpiando caché de npm..." -ForegroundColor Green
npm cache clean --force
Write-Host "   ✅ Caché de npm limpiado" -ForegroundColor Gray

# 4. Reinstalar dependencias
Write-Host "`n4️⃣ Reinstalando dependencias..." -ForegroundColor Green
npm install
Write-Host "   ✅ Dependencias reinstaladas" -ForegroundColor Gray

# 5. Verificar configuración
Write-Host "`n5️⃣ Verificando archivos de configuración..." -ForegroundColor Green
$files = @("metro.config.js", "babel.config.js", "package.json", "tsconfig.json")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file existe" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ $file NO existe" -ForegroundColor Red
    }
}

Write-Host "`n✅ Limpieza completada!" -ForegroundColor Green
Write-Host "`n🚀 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Ejecuta: npm start -- --reset-cache" -ForegroundColor White
Write-Host "   2. O ejecuta: npm run web" -ForegroundColor White

