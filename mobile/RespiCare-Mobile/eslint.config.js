// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/**', 'android/**', 'ios/**', '.expo/**'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      'import/no-duplicates': 'warn',
      'import/no-unresolved': ['error', {
        ignore: ['react-native-reanimated']
      }],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
