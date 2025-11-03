@echo off
REM Script de inicio rápido para RespiCare Mobile en Windows
echo ========================================
echo RespiCare Mobile - Inicio Rapido
echo ========================================
echo.

REM Verificar si existe .env
if not exist .env (
    echo [INFO] Archivo .env no encontrado. Creando desde env.example...
    copy env.example .env
    echo.
    echo [IMPORTANTE] Por favor, edita el archivo .env antes de continuar.
    echo.
    echo Configuracion recomendada para Emulador Android:
    echo   API_BASE_URL=http://10.0.2.2:3001/api/v1
    echo   AI_SERVICE_URL=http://10.0.2.2:8000/api/v1
    echo.
    echo Configuracion para Dispositivo Fisico:
    echo   API_BASE_URL=http://TU_IP_LOCAL:3001/api/v1
    echo   AI_SERVICE_URL=http://TU_IP_LOCAL:8000/api/v1
    echo   (Usa ipconfig para encontrar tu IP local)
    echo.
    pause
    exit /b 1
)

REM Verificar si node_modules existe
if not exist node_modules (
    echo [INFO] Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Error al instalar dependencias
        pause
        exit /b 1
    )
    echo.
)

REM Verificar servicios
echo [INFO] Verificando servicios...
echo.
curl -s http://localhost:3001/api/health >nul 2>&1
if errorlevel 1 (
    echo [ADVERTENCIA] Backend no responde en http://localhost:3001
    echo Por favor, asegurate de que los servicios esten levantados
    echo Ejecuta: docker-compose up -d
    echo.
)

curl -s http://localhost:8000/api/v1/health >nul 2>&1
if errorlevel 1 (
    echo [ADVERTENCIA] AI Services no respond tonnes en http://localhost Es posible que los servicios no esten corriendo
    echo Ejecuta: docker-compose up -d
    echo.
)

echo [INFO] Iniciando Metro Bundler...
echo Presiona Ctrl+C para detener
echo.
call npm start

