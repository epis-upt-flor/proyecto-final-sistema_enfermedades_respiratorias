# 🪟 RespiCare - Guía de Configuración para Windows

Esta guía te ayudará a configurar y ejecutar RespiCare en Windows.

## 📋 Requisitos Previos

### 1. Instalar Docker Desktop

1. Descargar [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/)
2. Ejecutar el instalador
3. Reiniciar el sistema
4. Abrir Docker Desktop y esperar que inicie

**Verificar instalación:**
```powershell
docker --version
docker-compose --version
```

### 2. Instalar Git (si no lo tienes)

1. Descargar [Git para Windows](https://git-scm.com/download/win)
2. Ejecutar el instalador
3. Usar las opciones por defecto

### 3. (Opcional) Instalar Windows Terminal

Recomendado para mejor experiencia:
- [Windows Terminal desde Microsoft Store](https://www.microsoft.com/store/productId/9N0DX20HK701)

## 🚀 Inicio Rápido

### Opción 1: Usando PowerShell (Recomendado)

```powershell
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/respicare.git
cd respicare

# 2. Copiar configuración
copy env.example .env

# 3. Iniciar servicios de desarrollo
docker-compose -f docker-compose.dev.yml up -d

# 4. Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# 5. Verificar salud de servicios
docker-compose -f docker-compose.dev.yml ps
```

### Opción 2: Usando Git Bash

Si prefieres usar comandos tipo Linux:

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/respicare.git
cd respicare

# 2. Copiar configuración
cp env.example .env

# 3. Usar scripts bash
./scripts/start-dev.sh

# 4. Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Opción 3: Usando WSL2 (Windows Subsystem for Linux)

```bash
# En WSL2 (Ubuntu)
# Los comandos son iguales que en Linux
make -f Makefile.docker quick-start-dev
```

## 📝 Configuración del Archivo .env

### 1. Crear archivo .env

En PowerShell:
```powershell
copy env.example .env
notepad .env
```

O usando el Explorador de Archivos:
1. Abrir la carpeta del proyecto
2. Copiar `env.example`
3. Renombrar a `.env`
4. Editar con Notepad++ o VS Code

### 2. Configuraciones Básicas (Desarrollo)

```env
# Dejar valores por defecto para desarrollo
MONGO_USERNAME=admin
MONGO_PASSWORD=password123
JWT_SECRET=dev-secret-key-change-in-production
```

## 🔧 Comandos PowerShell

### Gestión de Servicios

```powershell
# Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# Ver servicios en ejecución
docker-compose -f docker-compose.dev.yml ps

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs -f backend

# Detener servicios
docker-compose -f docker-compose.dev.yml down

# Reiniciar un servicio
docker-compose -f docker-compose.dev.yml restart backend

# Eliminar todo (incluyendo datos)
docker-compose -f docker-compose.dev.yml down -v
```

### Monitoreo

```powershell
# Ver uso de recursos
docker stats

# Ver estado de contenedores
docker ps

# Acceder a shell de un contenedor
docker exec -it respicare-backend sh
docker exec -it respicare-ai bash
```

### Limpieza

```powershell
# Limpiar recursos no utilizados
docker system prune -f

# Ver espacio usado
docker system df

# Limpiar imágenes
docker image prune -a
```

## 🌐 Acceso a Servicios en Windows

Después de iniciar, accede a:

- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api-docs
- **AI Services**: http://localhost:8000
- **AI Docs**: http://localhost:8000/docs
- **MongoDB Express**: http://localhost:8081 (admin/admin123)
- **Redis Commander**: http://localhost:8082

## 🐛 Problemas Comunes en Windows

### Docker Desktop no inicia

**Solución:**
1. Verificar que WSL2 esté instalado
2. Abrir PowerShell como Administrador:
   ```powershell
   wsl --install
   wsl --set-default-version 2
   ```
3. Reiniciar el sistema

### Puerto ya en uso

**Encontrar qué usa el puerto:**
```powershell
netstat -ano | findstr :3001
```

**Detener el proceso:**
```powershell
# Reemplazar PID con el número que aparece
taskkill /PID numero_pid /F
```

### Problema con permisos

**Ejecutar PowerShell como Administrador:**
1. Buscar "PowerShell" en el menú Inicio
2. Click derecho → "Ejecutar como administrador"
3. Navegar a la carpeta del proyecto
4. Ejecutar comandos

### Firewall bloquea Docker

**Permitir Docker en el Firewall:**
1. Panel de Control → Windows Defender Firewall
2. "Permitir una aplicación a través del firewall"
3. Buscar "Docker Desktop" y permitir

### Errores de "Drive not shared"

**Compartir unidad con Docker:**
1. Click derecho en Docker Desktop (systray)
2. Settings → Resources → File Sharing
3. Agregar la unidad donde está el proyecto (C:, D:, etc.)
4. Apply & Restart

### Scripts .sh no funcionan

**Usar PowerShell o Git Bash:**

En PowerShell, usar comandos Docker Compose directamente:
```powershell
docker-compose -f docker-compose.dev.yml up -d
```

En Git Bash, los scripts funcionarán:
```bash
./scripts/start-dev.sh
```

## 🔐 Variables de Entorno en Windows

### Generar secretos seguros

```powershell
# En PowerShell
# Generar string aleatorio para JWT_SECRET
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

## 📦 Backup en Windows

### Crear Backup Manual

```powershell
# Ejecutar script de backup
docker exec respicare-mongodb mongodump --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --out /backups/manual_backup
```

### Ver Backups

```powershell
# Listar backups
docker exec respicare-mongodb ls -lh /backups
```

## 🎯 Atajos de PowerShell

Crear un archivo `scripts.ps1` en la raíz:

```powershell
# scripts.ps1 - Atajos para RespiCare

function Start-RespiCare {
    docker-compose -f docker-compose.dev.yml up -d
    Write-Host "✓ RespiCare iniciado" -ForegroundColor Green
}

function Stop-RespiCare {
    docker-compose -f docker-compose.dev.yml down
    Write-Host "✓ RespiCare detenido" -ForegroundColor Green
}

function Show-RespiCareLogs {
    docker-compose -f docker-compose.dev.yml logs -f
}

function Show-RespiCareStatus {
    docker-compose -f docker-compose.dev.yml ps
    docker stats --no-stream
}

# Usar:
# . .\scripts.ps1
# Start-RespiCare
# Stop-RespiCare
# Show-RespiCareLogs
# Show-RespiCareStatus
```

## 🖥️ Recomendaciones para Windows

### 1. Usar WSL2 para mejor rendimiento

WSL2 ofrece mejor rendimiento que Hyper-V:
```powershell
# Instalar WSL2
wsl --install

# Configurar Docker para usar WSL2
# Docker Desktop → Settings → General → Use WSL 2 based engine
```

### 2. Aumentar recursos de Docker

1. Docker Desktop → Settings → Resources
2. Aumentar CPU: Mínimo 2, recomendado 4
3. Aumentar Memory: Mínimo 4GB, recomendado 8GB
4. Apply & Restart

### 3. Usar Visual Studio Code

VS Code tiene excelente soporte para Docker:
1. Instalar [VS Code](https://code.visualstudio.com/)
2. Instalar extensión "Docker"
3. Instalar extensión "Remote - Containers"

### 4. Configurar Git para line endings

```powershell
git config --global core.autocrlf true
```

## 📊 Monitoreo en Windows

### Docker Desktop Dashboard

Docker Desktop incluye un dashboard visual:
1. Click en icono de Docker en systray
2. "Dashboard" para ver contenedores
3. Ver logs, stats, y gestionar contenedores

### Usar Docker Desktop Extensions

Instalar extensiones útiles:
- Resource Usage
- Logs Explorer
- Disk Usage

## 🆘 Soporte

### Si tienes problemas:

1. **Verificar Docker Desktop está ejecutándose**
   - Buscar icono en systray
   - Debe estar en verde

2. **Ver logs de Docker Desktop**
   - Click derecho en icono → Troubleshoot
   - "Get support" para logs

3. **Reiniciar Docker Desktop**
   - Click derecho en icono → Restart

4. **Reinstalar Docker Desktop**
   - Si nada funciona, desinstalar y reinstalar

## 📚 Recursos para Windows

- [Docker Desktop Documentation](https://docs.docker.com/desktop/windows/)
- [WSL2 Installation](https://docs.microsoft.com/en-us/windows/wsl/install)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [Git Bash for Windows](https://gitforwindows.org/)

## ✅ Checklist para Windows

- [ ] Docker Desktop instalado y ejecutándose
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] Archivo .env creado
- [ ] Unidad compartida con Docker
- [ ] Firewall configurado
- [ ] Recursos de Docker aumentados (4GB+ RAM)
- [ ] WSL2 instalado (opcional pero recomendado)
- [ ] Servicios iniciados
- [ ] Navegador abierto en http://localhost:3001

---

**¡Listo para Windows!** 🪟

Para comenzar:
```powershell
docker-compose -f docker-compose.dev.yml up -d
```

**¿Preguntas?** Consulta la documentación o abre un issue en GitHub.

