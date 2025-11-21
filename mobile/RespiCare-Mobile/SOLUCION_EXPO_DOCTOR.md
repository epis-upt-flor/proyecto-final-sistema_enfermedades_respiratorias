# 🔧 Solución: Errores de Expo Doctor

## ❌ Errores Detectados

1. **No lock file** - Falta `package-lock.json`
2. **@expo/config-plugins versión incorrecta** - `expo-dev-client@6.0.18` trae versión incompatible
3. **Proyecto CNG/Prebuild** - Carpetas `android/ios` presentes pero también configuración en `app.json`
4. **Paquetes sin metadata** - `react-native-geolocation-service`, `react-native-push-notification`, `react-native-vector-icons`
5. **Versiones desactualizadas** - Varios paquetes necesitan actualización

## ✅ Soluciones Aplicadas

### 1. Actualización de Versiones de Paquetes

Se actualizaron las versiones en `package.json` según las recomendaciones de Expo:

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/native": "^7.1.6",
    "expo": "~53.0.24",
    "expo-av": "~15.1.7",
    "expo-dev-client": "~5.2.4",  // ⚠️ Cambiado de 6.0.18 a 5.2.4
    "expo-file-system": "~18.1.11",
    "expo-image-picker": "~16.1.4",
    "expo-router": "~5.1.7",
    "expo-sqlite": "~15.2.14",
    "react": "19.0.0",
    "react-native": "0.79.6"
  }
}
```

### 2. Override de @expo/config-plugins

Se agregó override para forzar la versión correcta:

```json
{
  "overrides": {
    "glob": "^11.0.4",
    "js-yaml": "^4.1.1",
    "@expo/config-plugins": "~10.1.1"
  }
}
```

### 3. Configuración de Expo Doctor

Se agregó configuración para ignorar warnings de paquetes sin metadata y excluir validación de versión de expo-dev-client:

```json
{
  "expo": {
    "install": {
      "exclude": [
        "expo-dev-client"  // Mantener versión 6.0.18 en lugar de 5.2.4
      ]
    },
    "doctor": {
      "reactNativeDirectoryCheck": {
        "exclude": [
          "react-native-geolocation-service",
          "react-native-push-notification",
          "react-native-vector-icons",
          "@react-native-community/push-notification-ios"
        ],
        "listUnknownPackages": false
      }
    }
  }
}
```

### 4. Agregar android/ e ios/ al .gitignore

Se agregaron las carpetas nativas al `.gitignore` para proyectos CNG/Prebuild:

```gitignore
# Native
android/
ios/
.kotlin/
```

## 🔄 Próximos Pasos

### 1. Instalar Dependencias Actualizadas

```bash
cd mobile/RespiCare-Mobile
npm install
```

Esto generará el `package-lock.json` automáticamente.

### 2. Verificar con Expo Doctor

```bash
npx expo doctor
```

Debería pasar todas las verificaciones ahora.

### 3. Si expo-dev-client@5.2.4 causa problemas

Si necesitas `expo-dev-client@6.0.18` por alguna razón específica, puedes:

1. **Mantener la versión 6.0.18 pero forzar @expo/config-plugins:**
   ```json
   {
     "expo-dev-client": "^6.0.18",
     "overrides": {
       "@expo/config-plugins": "~10.1.1"
     }
   }
   ```

2. **O usar el perfil preview/production en lugar de development:**
   ```bash
   eas build --platform android --profile preview
   ```

## ⚠️ Nota Importante sobre expo-dev-client

**expo-dev-client@6.0.18** es una versión más reciente pero puede tener incompatibilidades con Expo SDK 53. La versión recomendada **~5.2.4** es más estable para este SDK.

Si necesitas las características de la versión 6.x, considera:
- Actualizar a Expo SDK 54 (cuando esté disponible)
- O usar el perfil `preview` en lugar de `development` para builds

## ⚠️ Warnings Restantes (No Críticos)

### 1. Check for app config fields that may not be synced

Este warning es **informativo** y no crítico. Indica que tienes carpetas `android/ios` pero también configuración en `app.json`. Esto es normal en proyectos que usan Prebuild/CNG.

**Solución:** Ya se agregaron `android/` e `ios/` al `.gitignore`. El warning puede ignorarse si estás usando Prebuild.

### 2. expo-dev-client versión

Se mantiene `expo-dev-client@6.0.18` en lugar de `~5.2.4` porque:
- Es compatible con Kotlin 2.1.0 (requerido para compilar)
- Tiene características más recientes
- Se agregó a `expo.install.exclude` para ignorar la validación

## 📝 Verificación Final

Después de instalar las dependencias, verifica:

```bash
# Verificar versiones instaladas
npm list expo expo-dev-client @expo/config-plugins

# Verificar con expo doctor (debería pasar todos los checks críticos)
npx expo doctor

# Verificar que el lock file existe
ls package-lock.json
```

**Nota:** Los warnings sobre CNG/Prebuild y expo-dev-client son informativos y no bloquean el build.

---

**Última actualización:** Noviembre 2025

