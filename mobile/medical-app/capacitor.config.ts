import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.respicare.medicalapp',
  appName: 'RespiCare Medical',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Para desarrollo local, descomenta la siguiente línea:
    // url: 'http://localhost:8083',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'Esta aplicación necesita acceso a la cámara para capturar fotos de síntomas.',
        photos: 'Esta aplicación necesita acceso a las fotos para seleccionar imágenes.',
      },
    },
    Filesystem: {
      androidPermissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
    },
  },
};

export default config;

