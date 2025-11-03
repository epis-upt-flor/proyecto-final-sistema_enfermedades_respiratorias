/**
 * Jest test setup configuration
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';

// Extend Jest matchers
import 'jest-extended';

// Global test variables
declare global {
  var __MONGOD: MongoMemoryServer | undefined;
  var __MONGO_URI: string | undefined;
  var __SERVER: any;
  var __IO: Server | undefined;
  var __CLIENT_SOCKET: any;
}

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/respicare-test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.CORS_ORIGINS = 'http://localhost:3000';

// Mock external services
jest.mock('nodemailer');
jest.mock('sharp');
jest.mock('redis');

// Global test setup
beforeAll(async () => {
  // Setup MongoDB Memory Server
  globalThis.__MONGOD = await MongoMemoryServer.create();
  globalThis.__MONGO_URI = globalThis.__MONGOD.getUri();
  
  // Connect to test database
  await mongoose.connect(globalThis.__MONGO_URI);
  
  // Setup test server
  const { app } = await import('../src/index');
  globalThis.__SERVER = createServer(app);
  globalThis.__IO = new Server(globalThis.__SERVER);
  
  globalThis.__SERVER.listen(0, () => {
    const port = globalThis.__SERVER.address()?.port;
    globalThis.__CLIENT_SOCKET = Client(`http://localhost:${port}`);
  });
});

// Global test teardown
afterAll(async () => {
  // Close socket connections
  if (globalThis.__CLIENT_SOCKET) {
    globalThis.__CLIENT_SOCKET.close();
  }
  
  if (globalThis.__IO) {
    globalThis.__IO.close();
  }
  
  if (globalThis.__SERVER) {
    globalThis.__SERVER.close();
  }
  
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
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
  
  // Generate test user data
  generateTestUser: (overrides: any = {}) => ({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
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
      { symptom: 'tos', severity: 'moderate', duration: '2 weeks' },
      { symptom: 'fiebre', severity: 'mild', duration: '3 days' }
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
