/**
 * Configuración de Detox para Tests E2E
 * Para ejecutar tests E2E:
 * 1. npm run test:e2e:build (build de la app)
 * 2. npm run test:e2e (ejecutar tests)
 */

module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/RespiCareMobile.app',
      build:
        'xcodebuild -workspace ios/RespiCareMobile.xcworkspace -scheme RespiCareMobile -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/RespiCareMobile.app',
      build:
        'xcodebuild -workspace ios/RespiCareMobile.xcworkspace -scheme RespiCareMobile -configuration Release -sdk iphonesimulator -derivedDataPath ios/build'
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..'
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build:
        'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..'
    }
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14'
      }
    },
    attached: {
      type: 'android.attached',
      device: {
        adbName: '.*'
      }
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30'
      }
    }
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug'
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release'
    },
    'android.attached.debug': {
      device: 'attached',
      app: 'android.debug'
    },
    'android.attached.release': {
      device: 'attached',
      app: 'android.release'
    },
    'android.emulator.debug': {
      device: 'emulator',
      app: 'android.debug'
    },
    'android.emulator.release': {
      device: 'emulator',
      app: 'android.release'
    }
  }
};

