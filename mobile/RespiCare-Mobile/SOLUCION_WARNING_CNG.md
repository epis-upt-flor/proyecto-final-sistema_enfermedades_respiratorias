# ⚠️ Solución: Warning de CNG/Prebuild en Expo Doctor

## 📋 Warning Detectado

```
✖ Check for app config fields that may not be synced in a non-CNG project

This project contains native project folders but also has native configuration 
properties in app.json, indicating it is configured to use Prebuild. When the 
android/ios folders are present, EAS Build will not sync the following properties: 
orientation, icon, scheme, userInterfaceStyle, ios, android, plugins, androidStatusBar.
```

## ✅ ¿Es Crítico?

**NO.** Este es un **warning informativo** que NO bloquea el build. Solo indica que:

1. Tienes carpetas `android/` e `ios/` presentes
2. También tienes configuración nativa en `app.json`
3. EAS Build no sincronizará automáticamente ciertas propiedades cuando las carpetas nativas existen

## 🔍 ¿Qué Significa?

Cuando tienes carpetas nativas (`android/ios`), EAS Build asume que:
- Ya tienes código nativo personalizado
- No necesita generar/actualizar las carpetas desde `app.json`
- Debes mantener la configuración nativa manualmente

## ✅ Soluciones

### Opción 1: Ignorar el Warning (Recomendado)

Este warning es **informativo** y no afecta el funcionamiento. Puedes ignorarlo si:
- ✅ Ya agregaste `android/` e `ios/` al `.gitignore`
- ✅ Estás usando Prebuild/CNG
- ✅ El build funciona correctamente

### Opción 2: Eliminar Carpetas Nativas (Si no necesitas código nativo personalizado)

Si **NO** necesitas código nativo personalizado, puedes eliminar las carpetas y dejar que Expo las genere:

```bash
cd mobile/RespiCare-Mobile
rm -rf android ios
npx expo prebuild
```

**⚠️ Advertencia:** Esto eliminará cualquier código nativo personalizado que tengas.

### Opción 3: Mover Configuración a Código Nativo

Si necesitas mantener las carpetas nativas, mueve la configuración de `app.json` directamente a los archivos nativos:

- **Android:** `android/app/src/main/AndroidManifest.xml`
- **iOS:** `ios/RespiCare-Mobile/Info.plist`

## 📝 Configuración Actual

Tu proyecto está configurado para usar **Prebuild/CNG**:

- ✅ `android/` e `ios/` están en `.gitignore`
- ✅ `app.json` tiene configuración nativa
- ✅ EAS Build regenerará las carpetas si es necesario

## 🚀 Verificación

El warning no bloquea el build. Puedes verificar:

```bash
# El build debería funcionar normalmente
eas build --platform android --profile development

# O verificar que las carpetas están en .gitignore
cat .gitignore | grep -E "android|ios"
```

## 💡 Recomendación

**Mantén la configuración actual** y **ignora este warning**. Es solo informativo y no afecta:
- ✅ El build de EAS
- ✅ El funcionamiento de la app
- ✅ La sincronización de dependencias

Si quieres eliminar el warning completamente, usa la **Opción 2** (eliminar carpetas nativas), pero solo si no tienes código nativo personalizado.

---

**Última actualización:** Noviembre 2025

