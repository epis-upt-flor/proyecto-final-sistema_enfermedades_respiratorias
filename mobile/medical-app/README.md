# Medical App - Aplicación Web Next.js

Esta es una aplicación web desarrollada con Next.js que simula una interfaz móvil para el sistema de enfermedades respiratorias RespiCare.

## 🚀 Ejecutar la aplicación en web

### Requisitos previos
- Node.js instalado (versión 18 o superior recomendada)
- npm o pnpm instalado
- Backend de RespiCare corriendo en `http://localhost:3001`

### Configuración

1. **Instalar dependencias**:
```bash
npm install
# o si prefieres usar pnpm
pnpm install
```

2. **Configurar variables de entorno**:
Crea un archivo `.env.local` en la raíz del proyecto:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Ejecutar en modo desarrollo

3. **Iniciar el servidor de desarrollo**:
```bash
npm run dev
# o
pnpm dev
```

4. **Abrir en el navegador**:
   - La aplicación estará disponible en: `http://localhost:8083`
   - Se abrirá automáticamente en tu navegador predeterminado

### Otros comandos disponibles

- **Construir para producción**:
```bash
npm run build
```

- **Ejecutar versión de producción** (después de construir):
```bash
npm start
```

- **Ejecutar linter**:
```bash
npm run lint
```

## 📁 Estructura del proyecto

- `app/` - Páginas y layouts de Next.js (App Router)
- `components/` - Componentes React reutilizables
- `lib/api/` - Servicios API para comunicación con el backend
- `lib/types/` - Tipos TypeScript compartidos
- `store/` - Store global con Zustand
- `hooks/` - Hooks personalizados
- `public/` - Archivos estáticos (imágenes, iconos)
- `styles/` - Estilos globales

## 🔗 Integración con Backend

La aplicación está completamente integrada con el backend de RespiCare. Ver documentación detallada en:
- `INTEGRACION_BACKEND.md` - Documentación completa de integración

### Funcionalidades Integradas

✅ **Autenticación**
- Login y registro de usuarios
- Refresh token automático
- Logout
- Gestión de perfil

✅ **Historias Médicas**
- CRUD completo
- Listado con filtros
- Sincronización offline

✅ **Análisis de Síntomas**
- Análisis con IA
- Historial de análisis
- Recomendaciones

✅ **Citas Médicas**
- Crear, listar, reprogramar, cancelar citas
- Próximas citas
- Disponibilidad de doctores

✅ **Alertas**
- Listado de alertas
- Reconocer alertas
- Dashboard de alertas

✅ **Dashboard**
- Dashboard personalizado por rol (paciente, doctor, admin)
- Estadísticas en tiempo real
- Analytics

✅ **Wearables**
- Métricas de salud
- Sincronización de datos

## 🌐 Acceso

Una vez que el servidor esté corriendo, puedes acceder a la aplicación en:
- **URL local**: http://localhost:8083
- El servidor se recarga automáticamente cuando haces cambios en el código (Hot Reload)

## 🔧 Solución de problemas

### Error: "Unable to acquire lock"

Si ves el error:
```
⨯ Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
```

**Solución rápida (Windows PowerShell):**

1. **Opción 1: Usar el script de limpieza automática**
   ```powershell
   cd mobile/medical-app
   .\limpiar-y-ejecutar.ps1
   ```

2. **Opción 2: Limpiar manualmente**
   ```powershell
   # Eliminar archivo de lock
   Remove-Item -Path mobile/medical-app/.next/dev/lock -Force -ErrorAction SilentlyContinue
   
   # O eliminar todo el directorio .next
   Remove-Item -Path mobile/medical-app/.next -Recurse -Force -ErrorAction SilentlyContinue
   
   # Terminar procesos de Node.js si es necesario
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   
   # Luego ejecutar normalmente
   cd mobile/medical-app
   npm run dev
   ```

3. **Opción 3: Usar el Administrador de tareas**
   - Abre el Administrador de tareas (Ctrl + Shift + Esc)
   - Busca procesos de "Node.js"
   - Termínalos manualmente
   - Luego ejecuta `npm run dev` nuevamente

### Puerto 8083 en uso

Si el puerto 8083 está ocupado, puedes:

1. **Ver qué proceso está usando el puerto:**
   ```powershell
   netstat -ano | Select-String ":8083"
   ```

2. **Terminar el proceso (reemplaza PID con el número que encuentres):**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

### Error de conexión con el backend

Asegúrate de que:
1. El backend esté corriendo en `http://localhost:3001`
2. La variable `NEXT_PUBLIC_API_URL` en `.env.local` apunte al backend correcto
3. El backend tenga CORS configurado para permitir `http://localhost:8083`

## 🛠️ Tecnologías utilizadas

- **Next.js 16** - Framework de React
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes accesibles
- **shadcn/ui** - Componentes UI modernos
- **Zustand** - Estado global
- **Sonner** - Notificaciones toast

## 📚 Documentación Adicional

- `INTEGRACION_BACKEND.md` - Guía completa de integración con el backend
- Ver también: `/backend/README.md` - Documentación del backend
