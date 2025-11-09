const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    ...defaultConfig.transformer,
    experimentalImportSupport: false,
    inlineRequires: true,
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        safari10: true,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
      compress: {
        passes: 2,
        drop_console: true,
        pure_getters: true,
      },
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);

