# 🚀 Guía Rápida: Usar RespiCare Mobile con Backend Desplegado

## ⚡ Inicio Rápido (3 pasos)

### 1️⃣ Configurar Variables de Entorno

**Opción A: Script Automático (Recomendado)**
```powershell
cd mobile/RespiCare-Mobile
.\configurar-env.ps1
```

**Opción B: Manual**
```powershell
# Crear archivo .env
cd mobile/RespiCare-Mobile

# Para Emulador Android
echo "EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001" > .env
echo "EXPO_PUBLIC_AI_SERVICE_URL=http://10.0.2.2:8000" >> .env
echo "EXPO_PUBLIC_WS_URL=ws://10.0.2.2:3001" >> .env

# Para Dispositivo Físico (reemplaza 192.168.1.100 con tu IP)
echo "EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001" > .env
echo "EXPO_PUBLIC_AI_SERVICE_URL=http://192.168.1.100:8000" >> .env
echo "EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3001" >> .env
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

### 3️⃣ Ejecutar la App

```bash
# Android
npm run android

# iOS (solo macOS)
npm run ios

# Web (pruebas)
npm run web
```

## 📋 Checklist Pre-Ejecución

- [ ] Backend desplegado (`docker-compose ps`)
- [ ] Backend responde: `curl http://localhost:3001/api/health`
- [ ] Archivo `.env` configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Emulador/dispositivo listo

## 🔍 Verificar Conexión

Una vez que la app se abra:
1. Intenta iniciar sesión o crear una cuenta
2. Revisa los logs en Metro Bundler
3. Verifica que no haya errores de conexión

## 🐛 Problemas Comunes

### "Network request failed"
- Verifica que el backend esté corriendo: `docker-compose ps`
- Verifica las URLs en `.env` (debe usar `10.0.2.2` para emulador Android)
- Verifica el firewall de Windows

### "Metro bundler failed"
```bash
npm start -- --reset-cache
```

## 📚 Documentación Completa

Para más detalles, consulta:
- [Guía Completa de Uso](./GUIA_USO_BACKEND_DESPLEGADO.md)
- [Guía de Inicio Rápido](./GUIA_INICIO_RAPIDO.md)
- [Configuración del Proyecto](./CONFIGURACION_PROYECTO.md)

---

**¡Listo!** 🎉 Tu app móvil debería estar conectada al backend.

