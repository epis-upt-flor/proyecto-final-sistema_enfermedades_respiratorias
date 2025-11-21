# 🔧 Solución: Error de Clases Duplicadas en EAS Build

## ❌ Error Encontrado

```
Duplicate class android.support.v4.app.INotificationSideChannel found in modules 
core-1.13.1.aar -> core-1.13.1-runtime (androidx.core:core:1.13.1) and 
support-compat-27.1.1.aar -> support-compat-27.1.1-runtime (com.android.support:support-compat:27.1.1)
```

## 🔍 Causa del Problema

El error se debe a que `react-native-push-notification` está usando las librerías antiguas de **Android Support** (`com.android.support`) en lugar de **AndroidX** (`androidx`), lo que causa conflictos de clases duplicadas.

## ✅ Solución Implementada

Se han agregado exclusiones en los archivos de configuración de Gradle para:

1. **Excluir dependencias de Android Support** que causan conflictos
2. **Forzar el uso de AndroidX** en todas las dependencias
3. **Aplicar la configuración globalmente** en todos los módulos

### Cambios Realizados

#### 1. `android/build.gradle` (Raíz)

Se agregó configuración global para excluir Android Support:

```gradle
allprojects {
  // ... repositories ...
  
  // Configuración global para resolver conflictos de Android Support vs AndroidX
  configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-annotations'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-fragment'
    
    resolutionStrategy {
      // Forzar uso de AndroidX
      force 'androidx.core:core:1.13.1'
      force 'androidx.core:core-ktx:1.13.1'
    }
  }
}
```

#### 2. `android/app/build.gradle`

Se agregaron exclusiones específicas para el módulo de la app:

```gradle
// Excluir dependencias de Android Support para evitar conflictos con AndroidX
configurations.all {
    exclude group: 'com.android.support', module: 'support-compat'
    exclude group: 'com.android.support', module: 'support-annotations'
    exclude group: 'com.android.support', module: 'support-v4'
    exclude group: 'com.android.support', module: 'support-core-utils'
    exclude group: 'com.android.support', module: 'support-fragment'
    
    resolutionStrategy {
        // Forzar uso de AndroidX
        force 'androidx.core:core:1.13.1'
        force 'androidx.core:core-ktx:1.13.1'
    }
}
```

## 🚀 Próximos Pasos

1. **Hacer commit de los cambios:**
   ```bash
   git add android/build.gradle android/app/build.gradle
   git commit -m "Fix: Resolver conflictos de Android Support vs AndroidX"
   ```

2. **Intentar el build nuevamente con EAS:**
   ```bash
   eas build --platform android --profile production
   ```

## 🔍 Verificación

Si el error persiste, puedes verificar las dependencias con:

```bash
cd android
./gradlew app:dependencies --configuration releaseRuntimeClasspath | grep "com.android.support"
```

No deberían aparecer dependencias de `com.android.support` en la salida.

## 📝 Notas Adicionales

- **AndroidX está habilitado** en `gradle.properties` con `android.useAndroidX=true`
- Las exclusiones se aplican **globalmente** a todos los módulos del proyecto
- Se fuerza el uso de **AndroidX Core 1.13.1** para mantener consistencia

## ⚠️ Alternativa (Si el problema persiste)

Si después de estos cambios el error continúa, considera:

1. **Actualizar `react-native-push-notification`** a una versión más reciente que soporte AndroidX
2. **Usar una alternativa** como `@react-native-community/push-notification-ios` y `react-native-push-notification` con parches
3. **Aplicar un parche** usando `patch-package` para migrar manualmente la librería a AndroidX

---

**Última actualización:** Noviembre 2025

