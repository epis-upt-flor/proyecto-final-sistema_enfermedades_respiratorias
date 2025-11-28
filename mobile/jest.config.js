module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-paper|react-native-vector-icons|@react-native-async-storage|@react-native-community|next)/)',
  ],
  collectCoverageFrom: [
    'medical-app/store/useAppStore.ts',
    'medical-app/components/tabs/chatbot.tsx',
    'medical-app/components/tabs/symptom-analyzer.tsx',
    'medical-app/lib/**/*.ts',
    'medical-app/hooks/**/*.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json', 'cobertura'],
  modulePathIgnorePatterns: ['<rootDir>/RespiCare-Mobile'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/medical-app/$1',
    '^@/lib/(.*)$': '<rootDir>/medical-app/lib/$1',
    '^@/components/(.*)$': '<rootDir>/medical-app/components/$1',
    '^@/hooks/(.*)$': '<rootDir>/medical-app/hooks/$1',
    '^@/store/(.*)$': '<rootDir>/medical-app/store/$1',
  },
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  
  // JUnit XML reporter for CI/CD
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        suiteName: 'Mobile Tests',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true'
      }
    ]
  ],
};

