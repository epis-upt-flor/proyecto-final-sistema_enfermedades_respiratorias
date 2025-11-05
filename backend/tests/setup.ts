/**
 * Jest test setup configuration
 * IMPORTANT: Environment variables must be set BEFORE any imports
 */

// ============================================
// SET ENVIRONMENT VARIABLES FIRST (before any imports)
// ============================================
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.HOST = 'localhost';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRE = '7d';
process.env.JWT_REFRESH_EXPIRE = '30d';
process.env.MONGODB_URI = 'mongodb://localhost:27017/respicare-test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.AI_SERVICE_URL = 'http://localhost:8000';
process.env.AI_SERVICE_API_KEY = 'test-api-key';

// ============================================
// NOW WE CAN IMPORT MODULES
// ============================================
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Extend Jest matchers (optional, comment out if not installed)
try {
  require('jest-extended');
} catch (e) {
  // jest-extended is optional
}

// Global test variables
declare global {
  var __MONGOD: MongoMemoryServer | undefined;
  var __MONGO_URI: string | undefined;
}

// Mock external services
jest.mock('nodemailer');
jest.mock('sharp');
jest.mock('redis');

// Global test setup
beforeAll(async () => {
  // Setup MongoDB Memory Server only if not already set
  if (!globalThis.__MONGOD) {
    globalThis.__MONGOD = await MongoMemoryServer.create();
    globalThis.__MONGO_URI = globalThis.__MONGOD.getUri();
  }
  
  // Connect to test database only if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(globalThis.__MONGO_URI || 'mongodb://localhost:27017/respicare-test');
  } else if (mongoose.connection.readyState === 1) {
    // Already connected, use existing connection
    // But we need to switch to test database
    // For now, just use the existing connection
  }
});

// Global test teardown
afterAll(async () => {
  // Close database connections
  await mongoose.connection.close();
  if (globalThis.__MONGOD) {
    await globalThis.__MONGOD.stop();
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Mock console methods in test environment
const originalConsole = console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Custom test utilities
export const testUtils = {
  // Generate test JWT token
  generateTestToken: (payload: any = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'doctor',
        ...payload 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
  },
  
  // Generate test user data
  generateTestUser: (overrides: any = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'doctor',
    ...overrides
  }),
  
  // Generate test medical history data
  generateTestMedicalHistory: (overrides: any = {}) => ({
    patientId: 'test-patient-id',
    doctorId: 'test-doctor-id',
    patientName: 'Test Patient',
    age: 45,
    diagnosis: 'Test Diagnosis',
    symptoms: [
      { name: 'tos', severity: 'moderate', duration: '2 weeks' },
      { name: 'fiebre', severity: 'mild', duration: '3 days' }
    ],
    description: 'Test medical history description',
    date: new Date(),
    ...overrides
  }),
  
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Clean test data
  cleanTestData: async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

// Export test utilities globally
global.testUtils = testUtils;
