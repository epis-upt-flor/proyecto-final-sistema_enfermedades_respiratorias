# Script para generar APK Release en Windows
Write-Host "🔨 Generando APK Release..." -ForegroundColor Cyan

# Navegar a la carpeta del proyecto
Set-Location $PSScriptRoot

# Verificar que estamos en la carpeta correcta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de ejecutar este script desde la carpeta RespiCare-Mobile." -ForegroundColor Red
    exit 1
}

# Verificar que existe la carpeta android
if (-not (Test-Path "android")) {
    Write-Host "📦 Ejecutando prebuild de Expo..." -ForegroundColor Yellow
    npx expo prebuild --platform android
}

# Verificar keystore
$keystorePath = "android\app\my-release-key.keystore"
if (-not (Test-Path $keystorePath)) {
    Write-Host "⚠️  No se encontró keystore. Generando uno nuevo..." -ForegroundColor Yellow
    Write-Host "📝 Necesitarás ingresar información para el keystore:" -ForegroundColor Yellow
    
    Set-Location android\app
    keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al generar keystore" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Keystore generado. Ahora configura las contraseñas en android/gradle.properties" -ForegroundColor Green
    Write-Host "   MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña" -ForegroundColor Yellow
    Write-Host "   MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña" -ForegroundColor Yellow
    Write-Host "`n⚠️  IMPORTANTE: Guarda estas contraseñas en un lugar seguro!" -ForegroundColor Red
    exit 0
}

# Verificar gradle.properties
$gradleProps = "android\gradle.properties"
$propsContent = Get-Content $gradleProps -Raw

if ($propsContent -notmatch "MYAPP_RELEASE_STORE_PASSWORD" -or $propsContent -notmatch "MYAPP_RELEASE_KEY_PASSWORD") {
    Write-Host "⚠️  No se encontraron las contraseñas del keystore en gradle.properties" -ForegroundColor Yellow
    Write-Host "   Agrega las siguientes líneas a android/gradle.properties:" -ForegroundColor Yellow
    Write-Host "   MYAPP_RELEASE_STORE_FILE=my-release-key.keystore" -ForegroundColor White
    Write-Host "   MYAPP_RELEASE_KEY_ALIAS=my-key-alias" -ForegroundColor White
    Write-Host "   MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña" -ForegroundColor White
    Write-Host "   MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña" -ForegroundColor White
    exit 1
}

# Navegar a android
Set-Location android

# Limpiar builds anteriores
Write-Host "🧹 Limpiando builds anteriores..." -ForegroundColor Yellow
.\gradlew clean

# Generar APK Release
Write-Host "🔨 Generando APK Release..." -ForegroundColor Cyan
.\gradlew assembleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ APK Release generado exitosamente!" -ForegroundColor Green
    Write-Host "📍 Ubicación: android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Cyan
    
    # Verificar si existe el archivo
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    if (Test-Path $apkPath) {
        $fileInfo = Get-Item $apkPath
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        Write-Host "📦 Tamaño: $sizeMB MB" -ForegroundColor Cyan
        Write-Host "`n💡 Para instalar en un dispositivo:" -ForegroundColor Yellow
        Write-Host "   adb install $apkPath" -ForegroundColor White
        Write-Host "`n⚠️  IMPORTANTE: Este APK está firmado y listo para distribución." -ForegroundColor Green
    }
} else {
    Write-Host "❌ Error al generar APK Release" -ForegroundColor Red
    exit 1
}

# Volver a la carpeta raíz
Set-Location ..

