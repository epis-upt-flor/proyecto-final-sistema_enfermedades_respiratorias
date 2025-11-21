# 🔧 Solución: Error de Inconsistencia de JVM Target

## ❌ Problema

El error indica una inconsistencia entre los targets de JVM:

```
Inconsistent JVM-target compatibility detected for tasks 'compileDebugJavaWithJavac' (17) and 'compileDebugKotlin' (1.8).
```

**Causa:** Java está compilando con target 17, pero Kotlin está usando 1.8.

## ✅ Solución Aplicada

### 1. Actualización de `android/app/build.gradle`

Se cambió de Java 1.8 a Java 17:

```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}

kotlinOptions {
    jvmTarget = '17'
}
```

### 2. Actualización de `android/build.gradle` (Global)

Se actualizó la configuración global para todos los subproyectos:

```gradle
afterEvaluate { project ->
  if (project.hasProperty('android')) {
    project.android {
      compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
      }
    }
  }
  if (project.plugins.hasPlugin('org.jetbrains.kotlin.android')) {
    project.android {
      kotlinOptions {
        jvmTarget = '17'
      }
    }
  }
}
```

## 🔄 Próximos Pasos

### 1. Limpiar Build

```bash
cd mobile/RespiCare-Mobile/android
./gradlew clean
cd ..
```

### 2. Intentar Build Nuevamente

```bash
eas build --platform android --profile development --clear-cache
```

## 📝 Nota

Expo SDK 53 y React Native 0.79 requieren Java 17 como mínimo. Esta configuración es necesaria para la compatibilidad correcta.

---

**Última actualización:** Noviembre 2025

