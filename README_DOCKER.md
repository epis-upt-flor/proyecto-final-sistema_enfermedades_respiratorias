# 🐳 RespiCare - Sistema de Despliegue con Docker

<div align="center">

![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-3.8-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Production Ready](https://img.shields.io/badge/Production-Ready-success?style=for-the-badge)

</div>

## 📖 Índice de Documentación

### 🚀 Para Empezar

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[QUICKSTART.md](./QUICKSTART.md)** | Inicio rápido en 5 minutos | Todos |
| **[DOCKER_README.md](./DOCKER_README.md)** | Guía rápida de Docker | Desarrolladores |
| **[DOCKER_DEPLOYMENT_SUMMARY.md](./DOCKER_DEPLOYMENT_SUMMARY.md)** | Resumen de todo lo implementado | PM/DevOps |

### 📚 Documentación Completa

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Guía completa de despliegue | DevOps/SysAdmin |
| **[README.md](./README.md)** | Documentación general del proyecto | Todos |

## ⚡ Inicio Ultra Rápido

```bash
# 1. Copiar configuración
cp env.example .env

# 2. Iniciar todo
make -f Makefile.docker quick-start-dev

# 3. Abrir navegador
# http://localhost:3001 - Backend API
# http://localhost:8000 - AI Services
```

## 🎯 ¿Qué tengo que leer?

### Si eres Desarrollador 👨‍💻

1. Empieza con [QUICKSTART.md](./QUICKSTART.md)
2. Luego lee [DOCKER_README.md](./DOCKER_README.md)
3. Usa `make -f Makefile.docker help` para comandos

### Si vas a Desplegar en Producción 🚀

1. Lee [DEPLOYMENT.md](./DEPLOYMENT.md) completo
2. Revisa [DOCKER_DEPLOYMENT_SUMMARY.md](./DOCKER_DEPLOYMENT_SUMMARY.md)
3. Sigue el checklist de producción

### Si eres Project Manager 📊

1. Lee [DOCKER_DEPLOYMENT_SUMMARY.md](./DOCKER_DEPLOYMENT_SUMMARY.md)
2. Revisa la sección de arquitectura
3. Verifica los checklists

## 📦 ¿Qué incluye este sistema?

### Servicios

- ✅ **Backend API** (Node.js/TypeScript)
- ✅ **AI Services** (Python/FastAPI)
- ✅ **MongoDB** (Base de datos)
- ✅ **Redis** (Caché)
- ✅ **Nginx** (Reverse proxy)

### Herramientas

- ✅ **MongoDB Express** (Admin UI)
- ✅ **Redis Commander** (Cache UI)
- ✅ **Health Checks** (Monitoreo)
- ✅ **Backups Automáticos** (MongoDB)

### Scripts

```bash
scripts/
├── start-dev.sh       # Iniciar desarrollo
├── start-prod.sh      # Iniciar producción
├── stop.sh            # Detener servicios
├── healthcheck.sh     # Verificar salud
├── backup.sh          # Crear backup
├── restore.sh         # Restaurar backup
└── init-db.sh         # Inicializar BD
```

### Configuración

```bash
# Docker
├── docker-compose.yml           # Por defecto
├── docker-compose.dev.yml       # Desarrollo
├── docker-compose.prod.yml      # Producción
├── .dockerignore                # Optimización

# Backend
├── backend/
│   ├── Dockerfile               # Producción
│   └── dockerfile.dev           # Desarrollo

# AI Services
├── ai-services/
│   ├── Dockerfile               # Desarrollo
│   └── Dockerfile.prod          # Producción

# Nginx
└── nginx/
    ├── Dockerfile
    └── nginx.conf
```

## 🔧 Comandos Esenciales

### Con Makefile (Recomendado)

```bash
# Ver todos los comandos
make -f Makefile.docker help

# Desarrollo
make -f Makefile.docker dev-up
make -f Makefile.docker dev-logs
make -f Makefile.docker dev-down

# Producción
make -f Makefile.docker prod-up
make -f Makefile.docker prod-logs
make -f Makefile.docker prod-down

# Utilidades
make -f Makefile.docker health
make -f Makefile.docker status
make -f Makefile.docker db-backup
```

### Con Scripts

```bash
# Iniciar
./scripts/start-dev.sh
./scripts/start-prod.sh

# Detener
./scripts/stop.sh dev
./scripts/stop.sh prod

# Verificar
./scripts/healthcheck.sh

# Backup
./scripts/backup.sh
```

### Con Docker Compose

```bash
# Desarrollo
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml down

# Producción
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
docker-compose -f docker-compose.prod.yml down
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
| API | https://tu-dominio.com/api |

## 📊 Características Implementadas

### Desarrollo
- ✅ Hot-reload automático
- ✅ Debugger configurado
- ✅ MongoDB Express
- ✅ Redis Commander
- ✅ Volúmenes montados
- ✅ Logs en tiempo real

### Producción
- ✅ Multi-stage builds
- ✅ SSL/TLS (Let's Encrypt)
- ✅ Nginx reverse proxy
- ✅ Health checks
- ✅ Backups automáticos
- ✅ Resource limits
- ✅ Security headers
- ✅ Rate limiting

### DevOps
- ✅ GitHub Actions CI/CD
- ✅ Automated testing
- ✅ Security scanning
- ✅ Image optimization
- ✅ Rollback capability

## 🔒 Seguridad

```bash
# Generar secretos seguros
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 24  # Passwords

# Configurar en .env
JWT_SECRET=tu-secreto-aqui
MONGO_PASSWORD=password-seguro
REDIS_PASSWORD=password-seguro
```

## 📈 Monitoreo

```bash
# Health check completo
make -f Makefile.docker health

# Ver estado de servicios
docker-compose ps

# Ver uso de recursos
docker stats

# Ver logs
docker-compose logs -f
```

## 🐛 Troubleshooting

```bash
# Problema: Servicios no inician
docker-compose logs

# Problema: Puerto en uso
sudo lsof -i :3001

# Problema: Sin espacio
docker system prune -f

# Problema: Necesito reiniciar
docker-compose restart backend
```

## 📞 Soporte

### Orden de consulta:

1. ✅ [QUICKSTART.md](./QUICKSTART.md) - Problemas básicos
2. ✅ [DOCKER_README.md](./DOCKER_README.md) - Problemas de Docker
3. ✅ [DEPLOYMENT.md](./DEPLOYMENT.md) - Problemas de despliegue
4. ✅ `make -f Makefile.docker health` - Diagnóstico
5. ✅ GitHub Issues - Reportar bugs

## 🎓 Mejores Prácticas

- ✅ Usa `make -f Makefile.docker` para comandos consistentes
- ✅ Nunca commitas `.env` al repositorio
- ✅ Ejecuta backups antes de actualizaciones importantes
- ✅ Prueba en desarrollo antes de producción
- ✅ Monitorea los health checks regularmente
- ✅ Revisa logs periódicamente
- ✅ Mantén Docker y Docker Compose actualizados

## 📋 Checklist Rápido

### Primera vez (Desarrollo)
- [ ] Instalar Docker y Docker Compose
- [ ] Clonar repositorio
- [ ] Copiar `env.example` a `.env`
- [ ] Ejecutar `make -f Makefile.docker quick-start-dev`
- [ ] Verificar con `make -f Makefile.docker health`
- [ ] Abrir http://localhost:3001

### Primera vez (Producción)
- [ ] Servidor configurado (Ubuntu/Debian)
- [ ] Docker y Docker Compose instalados
- [ ] Archivo `.env` con valores de producción
- [ ] SSL/TLS configurado
- [ ] Firewall configurado
- [ ] Ejecutar `make -f Makefile.docker quick-start-prod`
- [ ] Verificar con `make -f Makefile.docker health`
- [ ] Configurar backups automáticos

## 🚀 Próximos Pasos

1. **Desarrollo Local**
   ```bash
   make -f Makefile.docker quick-start-dev
   ```

2. **Despliegue Producción**
   - Leer [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Configurar servidor
   - Desplegar

3. **Monitoreo**
   - Configurar alertas
   - Revisar métricas
   - Optimizar

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

<div align="center">

**¿Listo para comenzar?**

```bash
make -f Makefile.docker quick-start-dev
```

**¡Happy Coding!** 🎉

---

Creado con ❤️ por el equipo RespiCare  
Última actualización: Octubre 2024

</div>

