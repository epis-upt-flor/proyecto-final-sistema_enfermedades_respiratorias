# 📱 RespiCare Mobile - React Native

Aplicación móvil completa para el sistema de gestión de enfermedades respiratorias RespiCare Tacna, con integración completa al backend, servicios de IA y funcionalidades offline.

## 🎯 Funcionalidades Implementadas

### ✅ **Funcionalidades Principales (Completas)**

#### 1. **Conexión al Backend** 🔗
- API client completo con autenticación JWT
- Manejo automático de tokens y refresh
- Reintentos automáticos y manejo de errores
- Configuración por ambiente (desarrollo/producción)
- Interceptores para requests/responses

#### 2. **Servicios de IA** 🤖
- Análisis de síntomas con IA avanzada
- Fallback a análisis local cuando no hay conexión
- Múltiples estrategias de análisis (OpenAI, local, híbrido)
- Análisis de tendencias temporales
- Recomendaciones médicas personalizadas
- Clasificación de urgencia automática

#### 3. **Chatbot Médico** 💬
- Asistente médico virtual inteligente
- Análisis de síntomas en tiempo real
- Detección automática de emergencias
- Recomendaciones contextuales
- Interfaz de chat intuitiva
- Sugerencias automáticas

#### 4. **Funcionalidades de Base de Datos** 💾
- Almacenamiento local con AsyncStorage
- Sincronización bidireccional con el backend
- Cola de sincronización para modo offline
- Gestión de conflictos de datos
- Backup y recuperación automática

#### 5. **Captura de Datos** 📝
- Formularios optimizados para móvil
- Captura de imágenes con cámara/galería
- Geolocalización automática
- Síntomas predefinidos para selección rápida
- Validación de datos en tiempo real
- Guardado offline automático

#### 6. **Notificaciones** 🔔
- Sistema de notificaciones push
- Notificaciones de emergencia médica
- Recordatorios programados
- Notificaciones de sincronización
- Gestión de notificaciones no leídas
- Alertas de conectividad

#### 7. **Funcionalidad Offline** 📱
- Modo offline completo
- Sincronización automática cuando hay conexión
- Indicadores de estado de conexión
- Cola de sincronización inteligente
- Gestión de datos pendientes
- Recuperación automática

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico:**
- **React Native 0.72.6** - Framework principal
- **TypeScript** - Tipado estático
- **React Navigation 6** - Navegación
- **React Native Paper** - UI Components
- **Zustand** - Estado global
- **React Query** - Gestión de datos
- **AsyncStorage** - Almacenamiento local
- **Axios** - Cliente HTTP
- **NetInfo** - Detección de conectividad

### **Arquitectura de Servicios:**
```
mobile/
├── src/
│   ├── services/
│   │   ├── api.ts                 # Cliente API centralizado
│   │   ├── localStorage.ts        # Servicio de almacenamiento local
│   │   └── aiService.ts          # Servicio de IA
│   ├── components/
│   │   ├── ChatBot/              # Chatbot médico
│   │   ├── DataCapture/          # Captura de datos
│   │   ├── Notifications/        # Sistema de notificaciones
│   │   └── Offline/              # Funcionalidad offline
│   ├── screens/
│   │   ├── HomeScreen.tsx        # Dashboard principal
│   │   ├── LoginScreen.tsx       # Autenticación
│   │   └── ProfileScreen.tsx     # Perfil de usuario
│   ├── store/
│   │   └── useAppStore.ts        # Estado global (Zustand)
│   ├── types/
│   │   └── index.ts              # Tipos TypeScript
│   ├── config/
│   │   └── environment.ts        # Configuración por ambiente
│   └── navigation/
│       └── AppNavigator.tsx      # Navegación principal
├── __tests__/                    # Tests unitarios y de integración
│   ├── services/                 # Tests de servicios
│   ├── components/               # Tests de componentes
│   ├── integration/              # Tests de integración
│   ├── offline/                  # Tests de modo offline
│   └── sync/                     # Tests de sincronización
├── e2e/                          # Tests E2E con Detox
├── jest.config.js                # Configuración de Jest
├── jest.setup.js                 # Setup global de tests
└── .detoxrc.js                   # Configuración de Detox
```

## 🔌 Integración con Backend

### **Endpoints Integrados:**
- **Autenticación**: `/api/v1/auth/*`
- **Historias Médicas**: `/api/v1/medical-histories/*`
- **Análisis de Síntomas**: `/api/v1/symptom-analyzer/*`
- **Dashboard**: `/api/v1/dashboard/*`
- **Subida de Archivos**: `/api/v1/upload/*`
- **Exportación**: `/api/v1/export/*`

### **Servicios AI Integrados:**
- **Análisis de Síntomas**: `/api/symptom-analyzer/analyze`
- **Tendencias**: `/api/symptom-analyzer/trends/{patientId}`
- **Recomendaciones**: `/api/symptom-analyzer/recommendations`

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

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

### **Variables de Entorno:**
```bash
# API Configuration
API_BASE_URL=http://localhost:3001/api/v1
AI_SERVICE_URL=http://localhost:8000/api/v1

# Authentication
JWT_SECRET=your_jwt_secret_here

# AI Services
OPENAI_API_KEY=your_openai_api_key_here

# Debug
DEBUG_MODE=true
```

## 📱 Características Móviles

### **Optimizaciones para Móvil:**
- **Interfaz táctil** - Botones y controles optimizados
- **Navegación intuitiva** - Bottom tabs y stack navigation
- **Gestos nativos** - Swipe, pull-to-refresh
- **Responsive design** - Adaptable a diferentes pantallas
- **Performance** - Lazy loading y optimizaciones

### **Funcionalidades Offline:**
- **Almacenamiento local** - AsyncStorage con SQLite
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

## 🤖 Servicios de IA

### **Análisis de Síntomas:**
- **Múltiples estrategias**: OpenAI, modelos locales, reglas médicas
- **Fallback automático**: Si falla la IA, usa análisis local
- **Clasificación de urgencia**: Baja, media, alta
- **Recomendaciones personalizadas**: Inmediatas, corto plazo, largo plazo
- **Detección de signos de alerta**: Identificación automática de síntomas graves

### **Chatbot Médico:**
- **Conversación natural**: Procesamiento de lenguaje natural
- **Detección de emergencias**: Identificación automática de situaciones críticas
- **Análisis contextual**: Entiende el contexto de la conversación
- **Sugerencias inteligentes**: Recomendaciones basadas en síntomas
- **Interfaz conversacional**: Chat intuitivo y fácil de usar

## 🔒 Seguridad

### **Medidas Implementadas:**
- **Encriptación local** - Datos sensibles encriptados
- **Autenticación JWT** - Tokens seguros con refresh automático
- **Validación de entrada** - Sanitización de datos
- **Permisos granulares** - Solo permisos necesarios
- **Almacenamiento seguro** - Keychain/Keystore
- **Comunicación HTTPS** - Todas las comunicaciones encriptadas

## 📊 Monitoreo y Analytics

### **Métricas Implementadas:**
- **Rendimiento** - Tiempo de respuesta y uso de memoria
- **Conectividad** - Estado de conexión y sincronización
- **Uso de IA** - Análisis exitosos y fallos
- **Errores** - Tracking de errores y crashes
- **Sincronización** - Datos sincronizados y pendientes

## 🧪 Testing

El proyecto incluye una suite completa de tests que cubre todos los aspectos de la aplicación móvil. Para información detallada, consulta [**__tests__/README.md**](__tests__/README.md).

### **Tipos de Tests Implementados:**

#### **1. Tests Unitarios** ✅
- **Servicios**: `aiService`, `apiService`, `localStorageService`
- **Componentes**: `AIAnalysisScreen`, componentes de UI
- **Ubicación**: `__tests__/services/`, `__tests__/components/`

#### **2. Tests de Integración** ✅
- **Backend Integration**: Comunicación real con el backend
- **Ubicación**: `__tests__/integration/backend-integration.test.ts`

#### **3. Tests de Modo Offline** ✅
- **Almacenamiento local**: Guardado y lectura de datos offline
- **Análisis offline**: Funcionalidad sin conexión a internet
- **Ubicación**: `__tests__/offline/offline-mode.test.ts`

#### **4. Tests de Sincronización** ✅
- **Sincronización bidireccional**: Datos locales ↔ Servidor
- **Cola de sincronización**: Gestión de items pendientes
- **Resolución de conflictos**: Manejo de datos concurrentes
- **Ubicación**: `__tests__/sync/synchronization.test.ts`

#### **5. Tests E2E (End-to-End)** ✅
- **Detox**: Tests en dispositivos reales/emuladores
- **Flujos completos**: Sincronización offline, análisis de síntomas
- **Ubicación**: `e2e/offline-sync.e2e.ts`

### **Ejecutar Tests:**

```bash
# Todos los tests
npm test

# Tests unitarios únicamente
npm run test:unit

# Tests de integración con backend
npm run test:integration

# Tests de modo offline
npm run test:offline

# Tests de sincronización
npm run test:sync

# Tests E2E (requiere Detox configurado)
npm run test:e2e:build    # Build de la app
npm run test:e2e          # Ejecutar tests E2E

# Modo watch (desarrollo)
npm run test:watch

# Reporte de cobertura
npm run test:coverage
```

### **Configuración de Tests:**

- **Jest**: Configurado en `jest.config.js`
- **Setup Global**: Mocks en `jest.setup.js`
- **Detox**: Configurado en `.detoxrc.js`
- **E2E Jest**: Config en `e2e/jest.config.js`

### **Cobertura de Tests:**

- ✅ **Servicios**: 100% de servicios principales cubiertos
- ✅ **Componentes**: Componentes críticos testeados
- ✅ **Integración**: Tests de comunicación con backend
- ✅ **Offline**: Funcionalidad offline completamente testada
- ✅ **E2E**: Flujos críticos de usuario testeados

### **Documentación de Tests:**

📖 Para más detalles sobre estructura, ejecución y troubleshooting, consulta:
- **[Guía Completa de Tests](__tests__/README.md)** - Documentación detallada de todos los tests

### **Mocks y Configuración:**

Los tests incluyen mocks para:
- `@react-native-async-storage/async-storage` - Almacenamiento local
- `@react-native-community/netinfo` - Estado de conexión
- `react-native-paper` - Componentes UI
- `@react-navigation/native` - Navegación
- `axios` - Peticiones HTTP

## 📈 Roadmap

### **Funcionalidades Futuras:**
- [ ] Integración con wearables
- [ ] Reconocimiento de voz
- [ ] Realidad aumentada
- [ ] Machine Learning local
- [ ] Modo oscuro
- [ ] Múltiples idiomas
- [ ] Telemedicina integrada
- [ ] Análisis predictivo

## 🔧 Configuración de Desarrollo

### **Scripts Disponibles:**

#### **Desarrollo:**
```bash
npm start          # Metro bundler
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run lint       # Linter
```

#### **Testing:**
```bash
npm test                    # Todos los tests
npm run test:unit           # Tests unitarios
npm run test:integration    # Tests de integración
npm run test:offline        # Tests de modo offline
npm run test:sync           # Tests de sincronización
npm run test:e2e            # Tests E2E (Detox)
npm run test:watch          # Modo watch
npm run test:coverage       # Reporte de cobertura
```

#### **Build:**
```bash
npm run build              # Build de producción
npm run test:e2e:build     # Build para tests E2E
```

### **Estructura de Configuración:**
- **Desarrollo**: `http://localhost:3001`
- **Staging**: `https://staging-api.respicare.com`
- **Producción**: `https://api.respicare.com`

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
- **Tests** - Jest + Testing Library + Detox
- **Documentación** - JSDoc + READMEs

### **Estructura de Testing:**
- **Tests Unitarios**: `__tests__/services/`, `__tests__/components/`
- **Tests de Integración**: `__tests__/integration/`
- **Tests Especializados**: `__tests__/offline/`, `__tests__/sync/`
- **Tests E2E**: `e2e/`
- **Documentación**: `__tests__/README.md`

## 📞 Soporte

- **Email** - soporte@respicare.com
- **Documentación** - [docs.respicare.com](https://docs.respicare.com)
- **Issues** - GitHub Issues
- **Discord** - [RespiCare Community](https://discord.gg/respicare)

---

**Desarrollado para RespiCare Tacna - Sistema Integral de Gestión de Enfermedades Respiratorias** 🏥