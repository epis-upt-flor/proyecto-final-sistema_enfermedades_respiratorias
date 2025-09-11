# 📱 RespiCare Mobile - React Native

Aplicación móvil para el sistema de gestión de enfermedades respiratorias RespiCare Tacna.

## 🎯 Funcionalidades Implementadas

### ✅ **Alta Prioridad (Implementadas)**

#### 1. **Captura de Datos** 📝
- Formularios optimizados para móvil
- Captura de imágenes con cámara/galería
- Geolocalización automática
- Síntomas predefinidos para selección rápida
- Validación de datos en tiempo real
- Guardado offline automático

#### 2. **Notificaciones** 🔔
- Sistema de notificaciones push
- Notificaciones de emergencia médica
- Recordatorios programados
- Notificaciones de sincronización
- Gestión de notificaciones no leídas
- Alertas de conectividad

#### 3. **Funcionalidad Offline** 📱
- Almacenamiento local con AsyncStorage
- Sincronización automática cuando hay conexión
- Indicadores de estado de conexión
- Cola de sincronización
- Gestión de datos pendientes
- Modo offline completo

#### 4. **IA Básica** 🤖
- Análisis de síntomas con IA
- Diagnósticos posibles con probabilidades
- Recomendaciones médicas automáticas
- Clasificación de urgencia
- Interfaz intuitiva para selección de síntomas
- Guardado de análisis

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico:**
- **React Native 0.72.6** - Framework principal
- **TypeScript** - Tipado estático
- **React Navigation 6** - Navegación
- **React Native Paper** - UI Components
- **Zustand** - Estado global
- **React Query** - Gestión de datos
- **AsyncStorage** - Almacenamiento local

### **Estructura del Proyecto:**
```
mobile/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── DataCapture/     # Captura de datos
│   │   ├── Notifications/   # Sistema de notificaciones
│   │   ├── Offline/         # Funcionalidad offline
│   │   └── AI/              # Análisis con IA
│   ├── screens/             # Pantallas principales
│   ├── navigation/          # Configuración de navegación
│   ├── store/               # Estado global (Zustand)
│   ├── types/               # Tipos TypeScript
│   └── theme/               # Tema y estilos
├── App.tsx                  # Componente principal
└── package.json             # Dependencias
```

## 🚀 Instalación y Configuración

### **Prerrequisitos:**
- Node.js >= 16
- React Native CLI
- Android Studio (para Android)
- Xcode (para iOS)

### **Instalación:**
```bash
# Instalar dependencias
npm install

# iOS (solo en macOS)
cd ios && pod install && cd ..

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

### **Configuración de Permisos:**

#### **Android (android/app/src/main/AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### **iOS (ios/RespiCareMobile/Info.plist):**
```xml
<key>NSCameraUsageDescription</key>
<string>Esta app necesita acceso a la cámara para capturar imágenes médicas</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Esta app necesita acceso a la ubicación para registrar la localización de los casos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Esta app necesita acceso a la galería para seleccionar imágenes médicas</string>
```

## 📱 Características Móviles

### **Optimizaciones para Móvil:**
- **Interfaz táctil** - Botones y controles optimizados
- **Navegación intuitiva** - Bottom tabs y stack navigation
- **Gestos nativos** - Swipe, pull-to-refresh
- **Responsive design** - Adaptable a diferentes pantallas
- **Performance** - Lazy loading y optimizaciones

### **Funcionalidades Offline:**
- **Almacenamiento local** - SQLite con AsyncStorage
- **Sincronización inteligente** - Solo cuando hay conexión
- **Indicadores visuales** - Estado de conexión y sincronización
- **Cola de datos** - Gestión de datos pendientes
- **Recuperación automática** - Reintentos de sincronización

### **Notificaciones Avanzadas:**
- **Push notifications** - Notificaciones remotas
- **Local notifications** - Recordatorios programados
- **Notificaciones de emergencia** - Alertas críticas
- **Badges** - Contadores de notificaciones
- **Categorización** - Diferentes tipos de notificaciones

## 🔧 Configuración de Desarrollo

### **Variables de Entorno:**
```bash
# Crear archivo .env
API_BASE_URL=http://localhost:3001/api
WS_URL=ws://localhost:3001
OPENAI_API_KEY=your_api_key_here
```

### **Scripts Disponibles:**
```bash
npm start          # Metro bundler
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm test           # Ejecutar tests
npm run lint       # Linter
```

## 📊 Métricas y Rendimiento

### **Objetivos de Rendimiento:**
- **Tiempo de inicio** < 3 segundos
- **Tiempo de respuesta** < 1 segundo
- **Uso de memoria** < 100MB
- **Tamaño de app** < 50MB

### **Métricas Implementadas:**
- Monitoreo de rendimiento
- Tracking de errores
- Analytics de uso
- Métricas de sincronización

## 🔒 Seguridad

### **Medidas Implementadas:**
- **Encriptación local** - Datos sensibles encriptados
- **Autenticación JWT** - Tokens seguros
- **Validación de entrada** - Sanitización de datos
- **Permisos granulares** - Solo permisos necesarios
- **Almacenamiento seguro** - Keychain/Keystore

## 🧪 Testing

### **Tipos de Tests:**
- **Unit tests** - Componentes individuales
- **Integration tests** - Flujos completos
- **E2E tests** - Casos de uso reales
- **Performance tests** - Rendimiento y memoria

### **Ejecutar Tests:**
```bash
npm test                    # Tests unitarios
npm run test:e2e           # Tests E2E
npm run test:coverage      # Coverage report
```

## 📈 Roadmap

### **Próximas Funcionalidades:**
- [ ] Integración con wearables
- [ ] Reconocimiento de voz
- [ ] Realidad aumentada
- [ ] Machine Learning local
- [ ] Modo oscuro
- [ ] Múltiples idiomas

## 🤝 Contribución

### **Guías de Desarrollo:**
1. Fork del repositorio
2. Crear feature branch
3. Seguir convenciones de código
4. Escribir tests
5. Crear pull request

### **Convenciones:**
- **Commits** - Conventional Commits
- **Código** - ESLint + Prettier
- **Tests** - Jest + Testing Library
- **Documentación** - JSDoc

## 📞 Soporte

- **Email** - soporte@respicare.com
- **Documentación** - [docs.respicare.com](https://docs.respicare.com)
- **Issues** - GitHub Issues
- **Discord** - [RespiCare Community](https://discord.gg/respicare)

---

**Desarrollado para RespiCare Tacna - Sistema de Gestión de Enfermedades Respiratorias** 🏥