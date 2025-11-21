// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Asegurar que Metro busque módulos en el directorio correcto
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    // Buscar primero en el node_modules del proyecto
    path.resolve(__dirname, 'node_modules'),
    // Luego en el node_modules del directorio padre (si existe)
    path.resolve(__dirname, '..', 'node_modules'),
  ],
  // Resolver expo-sqlite a un mock en web
  resolveRequest: (context, moduleName, platform) => {
    // Si estamos en web y se intenta importar expo-sqlite, usar el mock
    if (platform === 'web' && moduleName === 'expo-sqlite') {
      return {
        filePath: path.resolve(__dirname, 'services/sqliteMock.ts'),
        type: 'sourceFile',
      };
    }
    // Para otras plataformas o módulos, usar la resolución por defecto
    return context.resolveRequest(context, moduleName, platform);
  },
  // Excluir archivos WASM del bundle en web
  assetExts: [...config.resolver.assetExts, 'wasm'],
};

// Configurar el transformer para ignorar archivos WASM
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;

