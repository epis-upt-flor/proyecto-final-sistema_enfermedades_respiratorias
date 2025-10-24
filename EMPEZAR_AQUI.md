# 🎯 RespiCare - EMPIEZA AQUÍ

**¿Primera vez con el proyecto?** Esta es tu guía de inicio.

---

## ⚡ Inicio Ultra Rápido (Para Impacientes)

```powershell
# 1. Abrir PowerShell en la carpeta del proyecto
cd C:\Users\User\Desktop\construccionI\proyecto-final-sistema_enfermedades_respiratorias

# 2. Copiar configuración (solo primera vez)
Copy-Item env.example .env

# 3. Construir (solo primera vez, tarda 5-10 min)
docker-compose -f docker-compose.dev.yml build

# 4. Iniciar todo
docker-compose -f docker-compose.dev.yml up -d

# 5. Abrir en el navegador
start http://localhost:3001/api-docs
```

**✅ Listo!** Ya tienes todo funcionando.

---

## 📚 Documentación Completa

### 🆕 Nuevo en el Proyecto

1. **[INICIO_RAPIDO_LOCAL.md](./INICIO_RAPIDO_LOCAL.md)** ← **EMPIEZA AQUÍ**
   - Guía paso a paso completa
   - Explicaciones detalladas
   - Troubleshooting
   - **⏱️ Tiempo:** 20 minutos

### ⚡ Ya Sé lo Básico

2. **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** ← **REFERENCIA RÁPIDA**
   - Cheat sheet de comandos
   - Copy & paste directo
   - Organizado por tarea
   - **⏱️ Tiempo:** 5 minutos

### 🐳 Quiero Saber Más de Docker

3. **[DOCKER_README.md](./DOCKER_README.md)** ← **GUÍA DE DOCKER**
   - Entender la arquitectura
   - Comandos avanzados
   - Mejores prácticas
   - **⏱️ Tiempo:** 15 minutos

4. **[WINDOWS_SETUP.md](./WINDOWS_SETUP.md)** ← **PROBLEMAS EN WINDOWS**
   - Específico para Windows
   - Solución de problemas
   - Configuración avanzada

### 🚀 Despliegue en Producción

5. **[DEPLOYMENT.md](./DEPLOYMENT.md)** ← **PRODUCCIÓN**
   - Despliegue completo
   - SSL/TLS
   - Backups
   - Seguridad

---

## 🎯 Elige tu Camino

### Soy Desarrollador Frontend
```
1. Leer: INICIO_RAPIDO_LOCAL.md (Pasos 1-6)
2. Usar: http://localhost:3001/api-docs
3. Referencia: COMANDOS_RAPIDOS.md
```

### Soy Desarrollador Backend
```
1. Leer: INICIO_RAPIDO_LOCAL.md (completo)
2. Leer: COMANDOS_RAPIDOS.md
3. Desarrollar y usar hot-reload
```

### Soy DevOps/SysAdmin
```
1. Leer: DOCKER_README.md
2. Leer: DEPLOYMENT.md
3. Configurar producción
```

### Tengo un Problema
```
1. Ver: INICIO_RAPIDO_LOCAL.md (Sección "Solución de Problemas")
2. Ver: WINDOWS_SETUP.md (Si estás en Windows)
3. Ver: COMANDOS_RAPIDOS.md (Troubleshooting Rápido)
```

---

## 🌐 URLs Importantes

Una vez iniciado, accede a:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| **Backend API** | http://localhost:3001 | - |
| **API Docs** | http://localhost:3001/api-docs | - |
| **AI Services** | http://localhost:8000 | - |
| **AI Docs** | http://localhost:8000/docs | - |
| **MongoDB Admin** | http://localhost:8081 | admin / admin123 |
| **Redis Admin** | http://localhost:8082 | - |

---

## ✅ Checklist Rápido

Antes de empezar, verifica:

- [ ] Docker Desktop instalado
- [ ] Docker Desktop ejecutándose (icono verde)
- [ ] PowerShell abierto
- [ ] En la carpeta del proyecto

Después de iniciar, verifica:

- [ ] `docker-compose ps` muestra todos los servicios como `Up`
- [ ] http://localhost:3001 responde
- [ ] http://localhost:8000 responde
- [ ] No hay errores en los logs

---

## 🆘 Problemas Comunes

### "Docker no está corriendo"
```powershell
# Abrir Docker Desktop desde el menú de Windows
# Esperar a que el icono esté verde
```

### "Puerto ya en uso"
```powershell
netstat -ano | findstr :3001
taskkill /PID numero_del_proceso /F
```

### "Error al construir"
```powershell
docker-compose -f docker-compose.dev.yml down
docker system prune -f
docker-compose -f docker-compose.dev.yml build --no-cache
```

### "No funciona nada"
```powershell
# Ver logs para diagnosticar
docker-compose -f docker-compose.dev.yml logs -f
```

---

## 📋 Workflow Diario

### Primera vez (Setup)
```powershell
Copy-Item env.example .env
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

### Día a día
```powershell
# Al empezar
docker-compose -f docker-compose.dev.yml up -d

# Al terminar (opcional)
docker-compose -f docker-compose.dev.yml down
```

### Si cambias código
- ✅ Backend: Se recarga automáticamente
- ✅ AI Services: Se recarga automáticamente
- ❌ Docker config: Necesitas rebuild

---

## 🎓 Recursos Adicionales

### Documentación del Proyecto
- [README.md](./README.md) - Información general del proyecto
- [DOCKER_DEPLOYMENT_SUMMARY.md](./DOCKER_DEPLOYMENT_SUMMARY.md) - Resumen completo

### Documentación Externa
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

---

## 💡 Tips Útiles

### Hot Reload
Los cambios en el código se reflejan automáticamente:
- Backend (Node.js): nodemon detecta cambios
- AI Services (Python): uvicorn --reload detecta cambios

### Ver Logs en Tiempo Real
```powershell
docker-compose -f docker-compose.dev.yml logs -f
```

### Verificar Base de Datos
Abre http://localhost:8081 (admin/admin123)

### API Testing
Usa http://localhost:3001/api-docs para probar endpoints

---

## 🚀 Próximos Pasos

1. ✅ Iniciar servicios (usando comandos de arriba)
2. 📖 Explorar API en http://localhost:3001/api-docs
3. 🧪 Hacer requests de prueba
4. 💻 Empezar a desarrollar
5. 📊 Ver logs si hay problemas

---

## 📞 ¿Necesitas Ayuda?

1. **Revisa los logs**: `docker-compose -f docker-compose.dev.yml logs -f`
2. **Consulta troubleshooting**: [INICIO_RAPIDO_LOCAL.md](./INICIO_RAPIDO_LOCAL.md)
3. **Problemas de Windows**: [WINDOWS_SETUP.md](./WINDOWS_SETUP.md)
4. **Comandos útiles**: [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)

---

## 🎉 ¡Todo Listo!

Si llegaste hasta aquí y todo funciona:

- ✅ Tienes todos los servicios corriendo
- ✅ Puedes acceder a las URLs
- ✅ Los logs no muestran errores
- ✅ Estás listo para desarrollar

**¡A codear!** 💻✨

---

**Última actualización:** Octubre 2024  
**Versión:** 1.0.0  
**Mantenido por:** RespiCare Team

