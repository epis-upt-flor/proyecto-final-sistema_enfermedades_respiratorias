module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // React Native Reanimated plugin has to be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};

