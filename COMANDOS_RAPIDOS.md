# ⚡ RespiCare - Comandos Rápidos

Guía de referencia rápida con los comandos más usados.

---

## 🚀 Inicio Rápido (3 comandos)

```powershell
# 1. Navegar al proyecto
cd C:\Users\User\Desktop\construccionI\proyecto-final-sistema_enfermedades_respiratorias

# 2. Crear archivo .env (solo primera vez)
Copy-Item env.example .env

# 3. Iniciar todo
docker-compose -f docker-compose.dev.yml up -d
```

**¡Listo!** Abre http://localhost:3001

---

## 📦 Construcción (Build)

```powershell
# Build de todo
docker-compose -f docker-compose.dev.yml build

# Build de un servicio específico
docker-compose -f docker-compose.dev.yml build ai-services
docker-compose -f docker-compose.dev.yml build backend

# Build desde cero (sin caché)
docker-compose -f docker-compose.dev.yml build --no-cache
```

---

## ▶️ Iniciar Servicios

```powershell
# Iniciar todos los servicios (en segundo plano)
docker-compose -f docker-compose.dev.yml up -d

# Iniciar con logs visibles
docker-compose -f docker-compose.dev.yml up

# Iniciar un servicio específico
docker-compose -f docker-compose.dev.yml up -d backend
docker-compose -f docker-compose.dev.yml up -d ai-services
```

---

## 🛑 Detener Servicios

```powershell
# Detener todos los servicios
docker-compose -f docker-compose.dev.yml down

# Detener Y eliminar volúmenes (¡BORRA DATOS!)
docker-compose -f docker-compose.dev.yml down -v

# Detener un servicio específico
docker-compose -f docker-compose.dev.yml stop backend
```

---

## 🔄 Reiniciar Servicios

```powershell
# Reiniciar todos
docker-compose -f docker-compose.dev.yml restart

# Reiniciar uno específico
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml restart ai-services
docker-compose -f docker-compose.dev.yml restart mongodb
```

---

## 📊 Ver Estado

```powershell
# Ver servicios corriendo
docker-compose -f docker-compose.dev.yml ps

# Ver todos los contenedores Docker
docker ps

# Ver uso de recursos
docker stats

# Ver espacio usado
docker system df
```

---

## 📝 Ver Logs

```powershell
# Logs de todos los servicios (en vivo)
docker-compose -f docker-compose.dev.yml logs -f

# Logs de un servicio específico
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f ai-services
docker-compose -f docker-compose.dev.yml logs -f mongodb

# Últimas 100 líneas
docker-compose -f docker-compose.dev.yml logs --tail=100

# Sin seguir (no -f)
docker-compose -f docker-compose.dev.yml logs backend
```

---

## 🖥️ Acceder a Shells

```powershell
# Backend (Node.js)
docker exec -it respicare-backend-dev sh

# AI Services (Python)
docker exec -it respicare-ai-dev bash

# MongoDB Shell
docker exec -it respicare-mongodb-dev mongosh -u admin -p password123 --authenticationDatabase admin

# Redis CLI
docker exec -it respicare-redis-dev redis-cli
```

---

## 🗄️ MongoDB (Base de Datos)

```powershell
# Acceder a MongoDB
docker exec -it respicare-mongodb-dev mongosh -u admin -p password123 --authenticationDatabase admin

# Dentro de MongoDB Shell:
show dbs                          # Ver bases de datos
use respicare_dev                # Usar base de datos
show collections                 # Ver colecciones
db.users.find().pretty()         # Ver usuarios
db.patients.countDocuments()     # Contar pacientes
db.medicalHistories.find().limit(5)  # Ver 5 historias
exit                             # Salir
```

---

## 🔴 Redis (Caché)

```powershell
# Acceder a Redis
docker exec -it respicare-redis-dev redis-cli

# Dentro de Redis CLI:
KEYS *                  # Ver todas las keys
GET key_name           # Ver valor de una key
FLUSHALL               # Limpiar toda la caché (¡CUIDADO!)
exit                   # Salir
```

---

## 🧹 Limpieza

```powershell
# Limpiar contenedores detenidos, redes, etc
docker system prune -f

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpiar TODO (¡CUIDADO!)
docker system prune -a --volumes
```

---

## 🌐 URLs de Servicios

```
Backend API:        http://localhost:3001
API Docs:          http://localhost:3001/api-docs
AI Services:       http://localhost:8000
AI Docs:           http://localhost:8000/docs
MongoDB Express:   http://localhost:8081  (admin/admin123)
Redis Commander:   http://localhost:8082
```

---

## 🔍 Diagnóstico

```powershell
# Verificar Docker
docker version
docker info

# Verificar servicios
docker-compose -f docker-compose.dev.yml ps

# Health checks
curl http://localhost:3001/api/health
curl http://localhost:8000/api/v1/health

# Ver qué usa un puerto
netstat -ano | findstr :3001
```

---

## 🐛 Troubleshooting Rápido

### Docker no funciona
```powershell
# Abrir Docker Desktop y esperar a que esté verde
```

### Puerto en uso
```powershell
netstat -ano | findstr :3001
taskkill /PID numero_pid /F
```

### Servicio no inicia
```powershell
docker-compose -f docker-compose.dev.yml logs servicio
docker-compose -f docker-compose.dev.yml restart servicio
```

### Rebuild completo
```powershell
docker-compose -f docker-compose.dev.yml down
docker system prune -f
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

---

## 📦 Workflow Típico

```powershell
# Día 1 (Setup inicial)
cd C:\Users\User\Desktop\construccionI\proyecto-final-sistema_enfermedades_respiratorias
Copy-Item env.example .env
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d

# Día 2+ (Uso normal)
docker-compose -f docker-compose.dev.yml up -d      # Iniciar
# ... desarrollar ...
docker-compose -f docker-compose.dev.yml logs -f    # Ver logs si hay problemas
docker-compose -f docker-compose.dev.yml down       # Detener al terminar
```

---

## 🎯 Comandos por Tarea

### Quiero iniciar el proyecto
```powershell
docker-compose -f docker-compose.dev.yml up -d
```

### Quiero ver si hay errores
```powershell
docker-compose -f docker-compose.dev.yml logs -f
```

### Quiero reiniciar porque cambié algo
```powershell
docker-compose -f docker-compose.dev.yml restart backend
```

### Quiero ver la base de datos
```
Abrir: http://localhost:8081 (admin/admin123)
```

### Quiero ver la API
```
Abrir: http://localhost:3001/api-docs
```

### Quiero detener todo
```powershell
docker-compose -f docker-compose.dev.yml down
```

---

## 💾 Backup Rápido

```powershell
# Backup de MongoDB
docker exec respicare-mongodb-dev mongodump --out /data/backup

# Copiar backup a tu máquina
docker cp respicare-mongodb-dev:/data/backup ./backup
```

---

## 🔧 Alias Útiles (PowerShell Profile)

Agrega estos a tu perfil de PowerShell para atajos:

```powershell
# Abrir perfil
notepad $PROFILE

# Agregar estos alias:
function dc-up { docker-compose -f docker-compose.dev.yml up -d }
function dc-down { docker-compose -f docker-compose.dev.yml down }
function dc-logs { docker-compose -f docker-compose.dev.yml logs -f }
function dc-ps { docker-compose -f docker-compose.dev.yml ps }
function dc-restart { docker-compose -f docker-compose.dev.yml restart $args }

# Guardar y recargar
. $PROFILE

# Ahora puedes usar:
dc-up        # En lugar de docker-compose -f docker-compose.dev.yml up -d
dc-logs      # En lugar de docker-compose -f docker-compose.dev.yml logs -f
```

---

**Guarda este archivo como referencia!** 📌

