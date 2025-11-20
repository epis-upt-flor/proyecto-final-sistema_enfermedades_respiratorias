// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Asegurar que Metro busque módulos en el directorio correcto
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    // Buscar primero en el node_modules del proyecto
    require('path').resolve(__dirname, 'node_modules'),
    // Luego en el node_modules del directorio padre (si existe)
    require('path').resolve(__dirname, '..', 'node_modules'),
  ],
};

module.exports = config;

