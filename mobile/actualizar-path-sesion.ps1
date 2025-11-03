# Script para actualizar PATH en la sesión actual de PowerShell
# Ejecuta este script en cada nueva sesión de PowerShell/CMD hasta que reinicies

Write-Host "=== Actualizando PATH en esta sesión ===" -ForegroundColor Cyan

$platformTools = "C:\Users\User\AppData\Local\Android\Sdk\platform-tools"

if (Test-Path $platformTools) {
    $env:Path += ";$platformTools"
    Write-Host "✓ PATH actualizado" -ForegroundColor Green
    
    # Verificar ADB
    Write-Host ""
    Write-Host "=== Verificando ADB ===" -ForegroundColor Cyan
    try {
        $adbVersion = & adb version
        Write-Host "✓ ADB funciona correctamente:" -ForegroundColor Green
        Write-Host $adbVersion
    } catch {
        Write-Host "❌ ADB todavía no funciona" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No se encontró platform-tools en: $platformTools" -ForegroundColor Red
}

Write-Host ""
Write-Host "⚠️  NOTA IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Este cambio solo afecta esta sesión de PowerShell." -ForegroundColor Yellow
Write-Host "   Cierra y abre una NUEVA ventana de CMD/PowerShell para que el PATH permanente funcione." -ForegroundColor Yellow
Write-Host "   O reinicia tu computadora para aplicar cambios permanentes del sistema." -ForegroundColor Yellow
