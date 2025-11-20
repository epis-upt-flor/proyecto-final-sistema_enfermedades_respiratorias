# 📱 Guía: Usar RespiCare Mobile con Backend Desplegado

Esta guía te ayudará a configurar y ejecutar la aplicación móvil RespiCare conectada a tu backend desplegado.

## 📋 Prerrequisitos

1. ✅ **Backend desplegado y funcionando** (Docker Compose)
2. ✅ **Node.js** >= 16 instalado
3. ✅ **Expo CLI** instalado globalmente: `npm install -g expo-cli`
4. ✅ **Android Studio** (para Android) o **Xcode** (para iOS)

## 🚀 Paso 1: Verificar que el Backend Esté Desplegado

Primero, asegúrate de que todos los servicios estén corriendo:

```bash
# Desde la raíz del proyecto
docker-compose ps
```

Deberías ver servicios como:
- `backend` (puerto 3001)
- `ai-services` (puerto 8000)
- `mongodb` (puerto 27017)
- `redis` (puerto 6379)

Verifica que el backend responda:

```bash
# Health check del backend
curl http://localhost:3001/api/health

# Health check de AI Services
curl http://localhost:8000/api/v1/health
```

## 🔧 Paso 2: Configurar Variables de Entorno

### 2.1 Navegar al Directorio de la App Móvil

```bash
cd mobile/RespiCare-Mobile
```

### 2.2 Crear Archivo .env

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

### 2.3 Configurar URLs según tu Entorno

Abre el archivo `.env` y configura las URLs según dónde ejecutes la app:

#### **Opción A: Emulador Android** 🤖

En el emulador Android, `localhost` NO funciona. Debes usar `10.0.2.2`:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3001
EXPO_PUBLIC_AI_SERVICE_URL=http://10.0.2.2:8000
EXPO_PUBLIC_WS_URL=ws://10.0.2.2:3001
```

#### **Opción B: Dispositivo Físico Android** 📱

Para un dispositivo físico, necesitas la IP local de tu computadora:

1. **Encuentra tu IP local:**

   ```bash
   # Windows
   ipconfig
   # Busca "IPv4 Address" (ej: 192.168.1.100)
   
   # Linux/Mac
   ifconfig
   # o
   ip addr
   ```

2. **Configura el .env con tu IP:**

   ```env
   EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001
   EXPO_PUBLIC_AI_SERVICE_URL=http://192.168.1.100:8000
   EXPO_PUBLIC_WS_URL=ws://192.168.1.100:3001
   ```

   ⚠️ **IMPORTANTE**: Reemplaza `192.168.1.100` con tu IP real.

3. **Asegúrate de que:**
   - Tu dispositivo esté en la misma red WiFi que tu computadora
   - El firewall de Windows permita conexiones en los puertos 3001 y 8000

#### **Opción C: Simulador iOS (solo macOS)** 🍎

En el simulador iOS, `localhost` funciona directamente:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001
EXPO_PUBLIC_AI_SERVICE_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:3001
```

#### **Opción D: Backend en Producción** 🌐

Si tu backend está desplegado en un servidor (ej: `https://api.tudominio.com`):

```env
EXPO_PUBLIC_API_BASE_URL=https://api.tudominio.com
EXPO_PUBLIC_AI_SERVICE_URL=https://ai.tudominio.com
EXPO_PUBLIC_WS_URL=wss://api.tudominio.com
```

## 📦 Paso 3: Instalar Dependencias

```bash
cd mobile/RespiCare-Mobile
npm install
```

## 🚀 Paso 4: Ejecutar la Aplicación

### Para Android:

```bash
# Opción 1: Iniciar Metro Bundler y luego ejecutar Android
npm start
# En otra terminal:
npm run android

# Opción 2: Todo en uno
npm run android
```

### Para iOS (solo macOS):

```bash
# Primera vez: instalar pods
cd ios && pod install && cd ..

# Ejecutar
npm run ios
```

### Para Web (pruebas rápidas):

```bash
npm run web
```

## ✅ Paso 5: Verificar la Conexión

Una vez que la app se abra:

1. **Pantalla de Login**: Deberías ver la pantalla de inicio de sesión
2. **Crear cuenta o iniciar sesión**: Prueba registrarte o iniciar sesión
3. **Verificar logs**: Revisa la terminal de Metro Bundler para ver si hay errores de conexión

### Probar Endpoints Manualmente

Puedes probar que la conexión funcione desde la app o desde tu navegador:

```bash
# Backend health check
curl http://localhost:3001/api/health

# AI Services health check
curl http://localhost:8000/api/v1/health
```

## 🐛 Solución de Problemas

### Error: "Network request failed" o "Connection refused"

**Problema**: La app no puede conectarse al backend.

**Soluciones**:

1. **Verifica que los servicios estén corriendo:**
   ```bash
   docker-compose ps
   ```

2. **Verifica las URLs en `.env`:**
   - Emulador Android: debe usar `10.0.2.2`
   - Dispositivo físico: debe usar tu IP local (no `localhost`)
   - iOS Simulator: puede usar `localhost`

3. **Verifica el firewall (Windows):**
   ```powershell
   # Permitir Node.js en el firewall
   New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
   ```

4. **Verifica que los puertos estén accesibles:**
   ```bash
   # Desde tu computadora
   curl http://localhost:3001/api/health
   curl http://localhost:8000/api/v1/health
   ```

### Error: "Metro bundler failed to start"

```bash
# Limpiar caché y reiniciar
npm start -- --reset-cache
```

### Error: "Build failed" en Android

```bash
# Limpiar proyecto Android
cd android
./gradlew clean
cd ..
npm run android
```

### La app se abre pero muestra errores de conexión

1. **Verifica que el backend responda:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Verifica los logs del backend:**
   ```bash
   docker-compose logs backend
   ```

3. **Verifica la configuración de CORS en el backend:**
   Asegúrate de que el backend permita conexiones desde tu dispositivo/emulador.

## 📝 Checklist de Verificación

Antes de ejecutar la app, verifica:

- [ ] Backend desplegado y funcionando (`docker-compose ps`)
- [ ] Backend responde en `http://localhost:3001/api/health`
- [ ] AI Services responde en `http://localhost:8000/api/v1/health`
- [ ] Archivo `.env` creado en `mobile/RespiCare-Mobile/`
- [ ] URLs configuradas correctamente según tu entorno
- [ ] Dependencias instaladas (`npm install`)
- [ ] Emulador/dispositivo listo
- [ ] Firewall configurado (si usas dispositivo físico)

## 🎯 URLs de Referencia

Una vez configurado, los servicios deberían estar en:

- **Backend API**: `http://localhost:3001` (o tu IP/dominio)
- **AI Services**: `http://localhost:8000` (o tu IP/dominio)
- **API Docs (Swagger)**: `http://localhost:3001/api-docs`
- **AI Docs**: `http://localhost:8000/docs`

## 📚 Recursos Adicionales

- [Guía de Inicio Rápido](./GUIA_INICIO_RAPIDO.md)
- [Configuración del Proyecto](./CONFIGURACION_PROYECTO.md)
- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de React Native](https://reactnative.dev/)

---

**¡Listo!** Ahora deberías poder usar la aplicación móvil RespiCare conectada a tu backend desplegado. 🎉

