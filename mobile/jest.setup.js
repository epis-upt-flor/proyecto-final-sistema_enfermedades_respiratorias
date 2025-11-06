// Mock de módulos nativos de React Native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.SettingsManager = {
    settings: {},
  };
  return RN;
});

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const storage: Record<string, string> = {};
  return {
    setItem: jest.fn((key: string, value: string) => {
      return Promise.resolve((storage[key] = value));
    }),
    getItem: jest.fn((key: string) => {
      return Promise.resolve(storage[key] || null);
    }),
    removeItem: jest.fn((key: string) => {
      return Promise.resolve(delete storage[key]);
    }),
    clear: jest.fn(() => {
      return Promise.resolve((Object.keys(storage).forEach(key => delete storage[key])));
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Object.keys(storage));
    }),
    multiGet: jest.fn((keys: string[]) => {
      return Promise.resolve(keys.map(key => [key, storage[key] || null]));
    }),
    multiSet: jest.fn((pairs: [string, string][]) => {
      pairs.forEach(([key, value]) => (storage[key] = value));
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys: string[]) => {
      keys.forEach(key => delete storage[key]);
      return Promise.resolve();
    }),
  };
});

// Mock de NetInfo
jest.mock('@react-native-community/netinfo', () => {
  return {
    __esModule: true,
    default: {
      fetch: jest.fn(() =>
        Promise.resolve({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        })
      ),
      addEventListener: jest.fn(() => jest.fn()),
    },
  };
});

// Mock de React Native Paper
jest.mock('react-native-paper', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Provider: ({ children }: any) => children,
    Card: ({ children }: any) => children,
    Title: ({ children }: any) => children,
    Paragraph: ({ children }: any) => children,
    Button: ({ children }: any) => children,
    TextInput: ({ children }: any) => children,
  };
});

// Mock de React Navigation
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock de console para evitar ruido en los tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

