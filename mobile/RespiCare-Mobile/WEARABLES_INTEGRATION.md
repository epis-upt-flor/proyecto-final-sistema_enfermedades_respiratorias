# 🔧 Integración de Wearables - Guía de Implementación

## Estado Actual

El servicio de wearables está implementado y funcional con **datos simulados** para desarrollo. La infraestructura está lista para integrar con librerías nativas cuando estén disponibles.

## ⚠️ Nota Importante

Las librerías `expo-health-kit` y `expo-health-connect` no están disponibles como paquetes npm oficiales en este momento. Para producción, necesitarás usar una de las siguientes opciones:

## Opciones de Implementación

### Opción 1: Usar React Native Health (Recomendado para iOS)

```bash
npm install react-native-health
cd ios && pod install && cd ..
```

**Configuración iOS:**
1. Abre `ios/RespiCareMobile.xcworkspace` en Xcode
2. Agrega la capacidad "HealthKit"
3. Configura los tipos de datos en Xcode

### Opción 2: Usar React Native Google Fit (Android)

```bash
npm install react-native-google-fit
```

**Configuración Android:**
1. Configura OAuth 2.0 en Google Cloud Console
2. Agrega `google-services.json` a `android/app/`

### Opción 3: Implementación Manual (Bare React Native)

Para proyectos bare React Native, puedes implementar directamente:
- iOS: HealthKit framework nativo
- Android: Health Connect API

### Opción 4: Mantener Datos Simulados (Desarrollo)

Por ahora, el servicio funciona perfectamente con datos simulados para desarrollo y testing. Esto permite:
- Probar la interfaz de usuario
- Desarrollar funcionalidades
- Testing sin necesidad de dispositivos físicos

## Integración Futura

Cuando instales las librerías nativas, actualiza `wearableService.ts`:

1. Descomenta las importaciones de librerías
2. Ajusta los métodos según la API de la librería elegida
3. La estructura actual ya está preparada para la integración

## Ejemplo de Integración (cuando esté disponible)

```typescript
// En wearableService.ts, descomentar y ajustar:
if (Platform.OS === 'ios') {
  HealthKit = require('react-native-health');
  // O usar HealthKit nativo
}
```

## Funcionalidad Actual

El servicio actualmente:
- ✅ Funciona con datos simulados
- ✅ Tiene toda la infraestructura lista
- ✅ Permite desarrollo y testing
- ✅ Está preparado para integración nativa
- ✅ Sincroniza con backend
- ✅ Detecta alertas médicas
- ✅ Calcula métricas

## Próximos Pasos

1. **Para desarrollo**: Continúa usando datos simulados (ya funciona)
2. **Para producción**: Elige una de las opciones de librerías nativas arriba
3. **Actualiza el código**: Descomenta y ajusta las importaciones en `wearableService.ts`

## Documentación

- [React Native Health](https://github.com/agencyenterprise/react-native-health)
- [React Native Google Fit](https://github.com/StasDoskalenko/react-native-google-fit)
- [Apple HealthKit](https://developer.apple.com/documentation/healthkit)
- [Google Health Connect](https://developer.android.com/guide/health-and-fitness/health-connect)

