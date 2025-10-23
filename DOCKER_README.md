# 🐳 RespiCare - Guía Rápida de Docker

Esta es una guía rápida para comenzar a usar RespiCare con Docker.

## 🚀 Inicio Rápido

### Para Desarrollo

```bash
# 1. Copiar configuración de ejemplo
cp env.example .env

# 2. Editar variables de entorno (opcional para desarrollo)
nano .env

# 3. Iniciar servicios
make -f Makefile.docker quick-start-dev

# O usando script:
./scripts/start-dev.sh
```

### Para Producción

```bash
# 1. Crear configuración de producción
cp env.example .env

# 2. Configurar TODAS las variables (¡IMPORTANTE!)
nano .env

# 3. Iniciar servicios
make -f Makefile.docker quick-start-prod

# O usando script:
./scripts/start-prod.sh
```

## 📋 Comandos Esenciales

### Usando Makefile (Recomendado)

```bash
# Ver todos los comandos disponibles
make -f Makefile.docker help

# Desarrollo
make -f Makefile.docker dev-up      # Iniciar
make -f Makefile.docker dev-down    # Detener
make -f Makefile.docker dev-logs    # Ver logs

# Producción
make -f Makefile.docker prod-up     # Iniciar
make -f Makefile.docker prod-down   # Detener
make -f Makefile.docker prod-logs   # Ver logs

# Monitoreo
make -f Makefile.docker health      # Health check
make -f Makefile.docker status      # Estado de servicios
make -f Makefile.docker stats       # Uso de recursos

# Base de datos
make -f Makefile.docker db-backup   # Crear backup
make -f Makefile.docker db-restore  # Restaurar backup
```

### Usando Docker Compose Directamente

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml logs -f

# Producción
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml logs -f
```

### Usando Scripts

```bash
# Desarrollo
./scripts/start-dev.sh
./scripts/stop.sh dev

# Producción
./scripts/start-prod.sh
./scripts/stop.sh prod

# Utilidades
./scripts/healthcheck.sh
./scripts/backup.sh
```

## 🌐 Acceso a Servicios

### Desarrollo

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| Backend API | http://localhost:3001 | - |
| API Docs | http://localhost:3001/api-docs | - |
| AI Services | http://localhost:8000 | - |
| AI Docs | http://localhost:8000/docs | - |
| MongoDB Express | http://localhost:8081 | admin/admin123 |
| Redis Commander | http://localhost:8082 | - |

### Producción

| Servicio | URL |
|----------|-----|
| Aplicación | https://tu-dominio.com |
| Backend API | https://tu-dominio.com/api |

## 📊 Monitoreo

```bash
# Health check de todos los servicios
./scripts/healthcheck.sh

# Ver estado de contenedores
docker-compose ps

# Ver uso de recursos
docker stats

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de servicio específico
docker-compose logs -f backend
docker-compose logs -f ai-services
```

## 💾 Backup y Restauración

### Backup

```bash
# Backup automático (configurado para ejecutarse diariamente)
# Los backups se guardan en: backups/mongodb/

# Backup manual
./scripts/backup.sh

# O usando make
make -f Makefile.docker db-backup
```

### Restauración

```bash
# Listar backups disponibles
ls -lh backups/mongodb/

# Restaurar
./scripts/restore.sh backup_respicare_20240101_020000.tar.gz

# O usando make
make -f Makefile.docker db-restore
```

## 🔧 Gestión de Servicios

### Reiniciar Servicios

```bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar servicio específico
docker-compose restart backend
docker-compose restart ai-services
docker-compose restart mongodb
```

### Actualizar Servicios

```bash
# Obtener últimos cambios
git pull

# Reconstruir y reiniciar
docker-compose build --no-cache
docker-compose up -d

# O usar make
make -f Makefile.docker prod-update
```

### Escalar Servicios

```bash
# Múltiples instancias de backend
docker-compose up -d --scale backend=3

# Múltiples instancias de AI services
docker-compose up -d --scale ai-services=2
```

## 🐛 Solución de Problemas

### Ver Logs de Error

```bash
# Todos los servicios
docker-compose logs --tail=100

# Servicio específico con errores
docker-compose logs backend | grep ERROR
docker-compose logs ai-services | grep ERROR
```

### Verificar Configuración

```bash
# Validar docker-compose.yml
docker-compose config

# Ver variables de entorno de un contenedor
docker exec respicare-backend env
```

### Acceder a Shell de Contenedor

```bash
# Backend
docker exec -it respicare-backend sh

# AI Services
docker exec -it respicare-ai bash

# MongoDB
docker exec -it respicare-mongodb mongosh

# Redis
docker exec -it respicare-redis redis-cli
```

### Problemas Comunes

#### Puerto ya en uso

```bash
# Ver qué está usando el puerto
sudo lsof -i :3001
sudo lsof -i :8000

# O en Windows
netstat -ano | findstr :3001
```

#### Servicios no inician

```bash
# Ver logs detallados
docker-compose logs

# Recrear contenedores
docker-compose down
docker-compose up -d --force-recreate
```

#### Sin espacio en disco

```bash
# Limpiar recursos no utilizados
docker system prune -f

# Ver uso de espacio
docker system df

# Limpiar TODO (¡CUIDADO!)
docker system prune -a --volumes
```

## 🔒 Seguridad

### Variables de Entorno Importantes

```env
# Cambiar SIEMPRE en producción:
JWT_SECRET=genera-un-secreto-muy-seguro-aqui
MONGO_PASSWORD=contraseña-segura-mongodb
REDIS_PASSWORD=contraseña-segura-redis
OPENAI_API_KEY=tu-api-key-real
```

### Generar Secretos Seguros

```bash
# JWT Secret
openssl rand -base64 32

# Password seguro
openssl rand -base64 24
```

### Firewall (Producción)

```bash
# Permitir solo puertos necesarios
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## 📚 Documentación Completa

Para información detallada, consulta:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía completa de despliegue
- [README.md](./README.md) - Documentación general del proyecto

## 🆘 Soporte

Si tienes problemas:

1. ✅ Ejecuta health check: `./scripts/healthcheck.sh`
2. 📋 Revisa logs: `docker-compose logs -f`
3. 🔍 Consulta [DEPLOYMENT.md](./DEPLOYMENT.md)
4. 🐛 Abre un issue en GitHub

## 📝 Checklist de Despliegue

### Desarrollo
- [ ] Copiar `env.example` a `.env`
- [ ] Ejecutar `./scripts/start-dev.sh`
- [ ] Verificar servicios con `./scripts/healthcheck.sh`
- [ ] Acceder a http://localhost:3001

### Producción
- [ ] Configurar `.env` con valores de producción
- [ ] Generar secretos seguros (JWT, passwords)
- [ ] Configurar SSL/TLS
- [ ] Actualizar `nginx/nginx.conf` con tu dominio
- [ ] Configurar firewall
- [ ] Ejecutar `./scripts/start-prod.sh`
- [ ] Verificar servicios con `./scripts/healthcheck.sh`
- [ ] Configurar backups automáticos
- [ ] Probar restauración de backup
- [ ] Configurar monitoreo

---

**¿Listo para comenzar?** Ejecuta:

```bash
# Desarrollo
make -f Makefile.docker quick-start-dev

# Producción
make -f Makefile.docker quick-start-prod
```

