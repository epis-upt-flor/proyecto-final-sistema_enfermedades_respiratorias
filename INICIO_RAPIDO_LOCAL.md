# 🚀 RespiCare - Guía Paso a Paso para Desarrollo Local

Esta guía te llevará desde cero hasta tener todos los servicios funcionando en tu máquina.

---

## 📋 Prerrequisitos

Antes de empezar, asegúrate de tener:

- ✅ **Docker Desktop** instalado y funcionando
- ✅ **Git** instalado
- ✅ Windows 10/11

---

## 🎯 Paso 1: Verificar Docker Desktop

### 1.1 Abrir Docker Desktop

- Presiona **Windows + S**
- Busca **"Docker Desktop"**
- Click en la aplicación
- Espera a que aparezca el icono de Docker (ballena) en la bandeja del sistema

### 1.2 Verificar que Docker está funcionando

Abre **PowerShell** y ejecuta:

```powershell
docker version
```

**✅ Resultado esperado:** Debes ver información de **Client** Y **Server**

```
Client:
 Version: ...
 
Server:
 Version: ...    ← ¡Esto debe aparecer!
```

**❌ Si sale error:** Docker Desktop no está corriendo. Vuelve al paso 1.1

---

## 📂 Paso 2: Preparar el Proyecto

### 2.1 Abrir PowerShell en la carpeta del proyecto

```powershell
# Navegar a la carpeta del proyecto
cd C:\Users\User\Desktop\construccionI\proyecto-final-sistema_enfermedades_respiratorias
```

### 2.2 Verificar que estás en la carpeta correcta

```powershell
dir
```

**✅ Debes ver:** Carpetas como `backend`, `ai-services`, `docker-compose.dev.yml`, etc.

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### 3.1 Crear archivo .env

```powershell
# Copiar el archivo de ejemplo
Copy-Item env.example .env
```

### 3.2 Verificar que se creó

```powershell
dir .env
```

**✅ Resultado:** Debe aparecer el archivo `.env`

### 3.3 (Opcional) Editar configuración

Para desarrollo, los valores por defecto funcionan bien. Si quieres personalizarlo:

```powershell
notepad .env
```

**Configuraciones importantes:**
- `MONGO_PASSWORD`: Contraseña de MongoDB (default: `password123`)
- `JWT_SECRET`: Secreto para tokens (default: `dev-secret-key-change-in-production`)
- `OPENAI_API_KEY`: Si tienes una API key de OpenAI (opcional)

**💡 Tip:** Para desarrollo local, puedes dejar los valores por defecto.

---

## 🏗️ Paso 4: Construir las Imágenes Docker

Este paso puede tardar **5-10 minutos** la primera vez (solo se hace una vez).

### 4.1 Construir AI Services

```powershell
docker-compose -f docker-compose.dev.yml build ai-services
```

**⏱️ Tiempo:** ~2-3 minutos

**✅ Resultado esperado:** Debe terminar sin errores con mensaje como `Successfully built...`

### 4.2 Construir Backend

```powershell
docker-compose -f docker-compose.dev.yml build backend
```

**⏱️ Tiempo:** ~2-3 minutos

**✅ Resultado esperado:** Debe terminar sin errores

---

## 🚀 Paso 5: Iniciar Todos los Servicios

### 5.1 Levantar todos los contenedores

```powershell
docker-compose -f docker-compose.dev.yml up -d
```

**El flag `-d`** significa "detached" (en segundo plano)

**⏱️ Tiempo:** ~30-60 segundos

**✅ Resultado esperado:**

```
Creating respicare-mongodb-dev ... done
Creating respicare-redis-dev ... done
Creating respicare-ai-dev ... done
Creating respicare-backend-dev ... done
Creating mongo-express ... done
Creating redis-commander ... done
```

### 5.2 Verificar que los contenedores están corriendo

```powershell
docker-compose -f docker-compose.dev.yml ps
```

**✅ Resultado esperado:** Todos los servicios deben estar en estado `Up`

```
NAME                      STATUS
respicare-mongodb-dev     Up
respicare-redis-dev       Up
respicare-ai-dev          Up
respicare-backend-dev     Up
mongo-express             Up
redis-commander           Up
```

---

## ✅ Paso 6: Verificar que Todo Funciona

### 6.1 Abrir tu navegador

Abre las siguientes URLs en tu navegador:

#### Backend API
- **URL**: http://localhost:3001
- **Debe mostrar:** Mensaje de bienvenida o información de la API

#### API Documentation (Swagger)
- **URL**: http://localhost:3001/api-docs
- **Debe mostrar:** Interfaz de Swagger con todos los endpoints

#### AI Services
- **URL**: http://localhost:8000
- **Debe mostrar:** Mensaje de FastAPI

#### AI Documentation
- **URL**: http://localhost:8000/docs
- **Debe mostrar:** Interfaz de FastAPI con documentación

#### MongoDB Express (Admin UI)
- **URL**: http://localhost:8081
- **Usuario**: `admin`
- **Password**: `admin123`
- **Debe mostrar:** Interfaz de administración de MongoDB

#### Redis Commander (Cache UI)
- **URL**: http://localhost:8082
- **Debe mostrar:** Interfaz de Redis Commander

### 6.2 Verificar health checks

```powershell
# Verificar Backend
curl http://localhost:3001/api/health

# Verificar AI Services
curl http://localhost:8000/api/v1/health
```

**✅ Resultado esperado:** Respuestas JSON indicando que los servicios están saludables

---

## 📊 Paso 7: Ver Logs (Monitoreo)

### 7.1 Ver logs de todos los servicios

```powershell
docker-compose -f docker-compose.dev.yml logs -f
```

**Para salir:** Presiona `Ctrl + C`

### 7.2 Ver logs de un servicio específico

```powershell
# Ver logs del backend
docker-compose -f docker-compose.dev.yml logs -f backend

# Ver logs de AI services
docker-compose -f docker-compose.dev.yml logs -f ai-services

# Ver logs de MongoDB
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

---

## 🛠️ Comandos Útiles Durante Desarrollo

### Reiniciar un servicio

```powershell
# Reiniciar backend
docker-compose -f docker-compose.dev.yml restart backend

# Reiniciar AI services
docker-compose -f docker-compose.dev.yml restart ai-services
```

### Ver estado de recursos

```powershell
docker stats
```

### Acceder a shell de un contenedor

```powershell
# Backend (Node.js)
docker exec -it respicare-backend-dev sh

# AI Services (Python)
docker exec -it respicare-ai-dev bash

# MongoDB
docker exec -it respicare-mongodb-dev mongosh -u admin -p password123
```

### Ver bases de datos en MongoDB

```powershell
# Acceder a MongoDB shell
docker exec -it respicare-mongodb-dev mongosh -u admin -p password123 --authenticationDatabase admin

# Dentro del shell de MongoDB:
show dbs                    # Ver todas las bases de datos
use respicare_dev          # Cambiar a base de datos respicare
show collections           # Ver colecciones
db.users.find().pretty()   # Ver usuarios
```

---

## 🛑 Detener los Servicios

### Detener todos los servicios

```powershell
docker-compose -f docker-compose.dev.yml down
```

**Esto:**
- ✅ Detiene todos los contenedores
- ✅ Elimina los contenedores
- ✅ Mantiene los datos (volúmenes)

### Detener y eliminar TODO (incluyendo datos)

```powershell
docker-compose -f docker-compose.dev.yml down -v
```

**⚠️ CUIDADO:** Esto elimina TODOS los datos de las bases de datos

---

## 🔄 Workflow Diario

### Al empezar a trabajar:

```powershell
# 1. Asegurarse de que Docker Desktop está corriendo
# 2. Navegar a la carpeta del proyecto
cd C:\Users\User\Desktop\construccionI\proyecto-final-sistema_enfermedades_respiratorias

# 3. Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# 4. Ver logs (opcional)
docker-compose -f docker-compose.dev.yml logs -f
```

### Durante el desarrollo:

- Los cambios en el código se reflejan automáticamente (hot-reload)
- Backend: nodemon reinicia automáticamente
- AI Services: uvicorn --reload reinicia automáticamente

### Al terminar de trabajar:

```powershell
# Detener servicios
docker-compose -f docker-compose.dev.yml down
```

---

## 🐛 Solución de Problemas

### Problema: "Puerto ya en uso"

**Error:** `Bind for 0.0.0.0:3001 failed: port is already allocated`

**Solución:**

```powershell
# Ver qué está usando el puerto
netstat -ano | findstr :3001

# Detener el proceso (reemplazar PID con el número que aparece)
taskkill /PID numero_pid /F
```

### Problema: "Docker Desktop no está corriendo"

**Error:** `error during connect: open //./pipe/dockerDesktopLinuxEngine`

**Solución:**
1. Abrir Docker Desktop desde el menú de Windows
2. Esperar a que el icono esté verde
3. Intentar de nuevo

### Problema: "Cannot connect to MongoDB"

**Solución:**

```powershell
# Ver logs de MongoDB
docker-compose -f docker-compose.dev.yml logs mongodb

# Reiniciar MongoDB
docker-compose -f docker-compose.dev.yml restart mongodb
```

### Problema: "Build failed" o errores al construir

**Solución:**

```powershell
# Limpiar todo y reconstruir
docker-compose -f docker-compose.dev.yml down
docker system prune -f
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### Problema: Sin espacio en disco

**Solución:**

```powershell
# Ver uso de espacio
docker system df

# Limpiar recursos no utilizados
docker system prune -f

# Limpiar imágenes antiguas
docker image prune -a
```

---

## 📝 Checklist de Verificación

Usa este checklist para asegurarte de que todo está funcionando:

- [ ] Docker Desktop está ejecutándose (icono verde)
- [ ] `docker version` muestra Client Y Server
- [ ] Archivo `.env` existe
- [ ] Build de ai-services completado sin errores
- [ ] Build de backend completado sin errores
- [ ] `docker-compose ps` muestra todos los servicios como `Up`
- [ ] http://localhost:3001 responde
- [ ] http://localhost:8000 responde
- [ ] http://localhost:8081 muestra MongoDB Express
- [ ] http://localhost:8082 muestra Redis Commander
- [ ] Logs no muestran errores críticos

---

## 🎉 ¡Listo!

Si completaste todos los pasos, ahora tienes:

- ✅ Backend API funcionando en el puerto 3001
- ✅ AI Services funcionando en el puerto 8000
- ✅ MongoDB con datos persistentes
- ✅ Redis para caché
- ✅ Interfaces de administración
- ✅ Hot-reload activado para desarrollo

## 🚀 Próximos Pasos

1. **Explorar la API**: http://localhost:3001/api-docs
2. **Hacer requests**: Usar Postman o curl
3. **Ver logs**: `docker-compose -f docker-compose.dev.yml logs -f`
4. **Desarrollar**: Los cambios se reflejan automáticamente

## 📚 Documentación Adicional

- **Guía completa de despliegue**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Guía de Docker**: [DOCKER_README.md](./DOCKER_README.md)
- **Troubleshooting Windows**: [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)

---

**¿Problemas?** Revisa la sección de Solución de Problemas o consulta la documentación completa.

**¡Happy Coding!** 💻

