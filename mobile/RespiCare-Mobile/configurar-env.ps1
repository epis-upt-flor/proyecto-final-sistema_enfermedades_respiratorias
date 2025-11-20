# Script para configurar variables de entorno de RespiCare Mobile
# Este script detecta automáticamente tu entorno y configura las URLs correctas

Write-Host "🔧 Configurando variables de entorno para RespiCare Mobile..." -ForegroundColor Cyan

# Obtener la IP local de la máquina
function Get-LocalIP {
    $adapters = Get-NetAdapter | Where-Object { $_.Status -eq "Up" }
    foreach ($adapter in $adapters) {
        $ip = Get-NetIPAddress -InterfaceIndex $adapter.ifIndex -AddressFamily IPv4 | 
              Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
        if ($ip) {
            return $ip.IPAddress
        }
    }
    return "192.168.1.100" # IP por defecto si no se encuentra
}

$localIP = Get-LocalIP
Write-Host "📍 IP local detectada: $localIP" -ForegroundColor Green

# Menú de opciones
Write-Host "`nSelecciona tu entorno:" -ForegroundColor Yellow
Write-Host "1. Emulador Android (usa 10.0.2.2)" -ForegroundColor White
Write-Host "2. Dispositivo Físico Android (usa IP local: $localIP)" -ForegroundColor White
Write-Host "3. Simulador iOS (usa localhost)" -ForegroundColor White
Write-Host "4. Producción (ingresa URL manualmente)" -ForegroundColor White
Write-Host "5. Cancelar" -ForegroundColor Red

$opcion = Read-Host "`nOpción (1-5)"

$apiUrl = ""
$aiUrl = ""
$wsUrl = ""

switch ($opcion) {
    "1" {
        $apiUrl = "http://10.0.2.2:3001"
        $aiUrl = "http://10.0.2.2:8000"
        $wsUrl = "ws://10.0.2.2:3001"
        Write-Host "✅ Configurado para Emulador Android" -ForegroundColor Green
    }
    "2" {
        $apiUrl = "http://$localIP:3001"
        $aiUrl = "http://$localIP:8000"
        $wsUrl = "ws://$localIP:3001"
        Write-Host "✅ Configurado para Dispositivo Físico Android" -ForegroundColor Green
    }
    "3" {
        $apiUrl = "http://localhost:3001"
        $aiUrl = "http://localhost:8000"
        $wsUrl = "ws://localhost:3001"
        Write-Host "✅ Configurado para Simulador iOS" -ForegroundColor Green
    }
    "4" {
        $apiUrl = Read-Host "Ingresa la URL del Backend API (ej: https://api.tudominio.com)"
        $aiUrl = Read-Host "Ingresa la URL del AI Service (ej: https://ai.tudominio.com)"
        $wsUrl = Read-Host "Ingresa la URL del WebSocket (ej: wss://api.tudominio.com)"
        Write-Host "✅ Configurado para Producción" -ForegroundColor Green
    }
    "5" {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit
    }
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit
    }
}

# Crear contenido del archivo .env
$envContent = @"
# RespiCare Mobile - Variables de Entorno
# Generado automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# URL base del Backend API
EXPO_PUBLIC_API_BASE_URL=$apiUrl

# URL del servicio de IA
EXPO_PUBLIC_AI_SERVICE_URL=$aiUrl

# URL del WebSocket
EXPO_PUBLIC_WS_URL=$wsUrl

# Entorno
NODE_ENV=development
"@

# Escribir archivo .env
$envPath = Join-Path $PSScriptRoot ".env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "`n✅ Archivo .env creado exitosamente en: $envPath" -ForegroundColor Green
Write-Host "`n📋 Configuración:" -ForegroundColor Cyan
Write-Host "   API Base URL: $apiUrl" -ForegroundColor White
Write-Host "   AI Service URL: $aiUrl" -ForegroundColor White
Write-Host "   WebSocket URL: $wsUrl" -ForegroundColor White

Write-Host "`n🚀 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   1. Verifica que el backend esté corriendo: docker-compose ps" -ForegroundColor White
Write-Host "   2. Instala dependencias: npm install" -ForegroundColor White
Write-Host "   3. Ejecuta la app: npm start" -ForegroundColor White

