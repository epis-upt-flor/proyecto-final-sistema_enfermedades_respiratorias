/**
 * Performance and Load Tests
 * Tests API performance under load
 */

import request from 'supertest';
import appInstance from '../../src/index';
import { testUtils } from '../setup';

const app = appInstance.app;
import User, { UserDocument } from '../../src/models/User';
import MedicalHistory from '../../src/models/MedicalHistory';
import mongoose from 'mongoose';

describe('Performance Tests', () => {
  let doctorToken: string;
  let doctorId: string;
  let patientId: string;

  beforeEach(async () => {
    await testUtils.cleanTestData();

    const doctor = await User.create({
      name: 'Test Doctor',
      email: 'doctor@test.com',
      password: 'password123',
      role: 'doctor',
      isActive: true
    }) as UserDocument;
    doctorId = doctor._id.toString();
    doctorToken = testUtils.generateTestToken({ userId: doctorId, role: 'doctor' });

    const patient = await User.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'password123',
      role: 'patient',
      isActive: true
    }) as UserDocument;
    patientId = patient._id.toString();
  });

  describe('Response Time Tests', () => {
    it('should respond to GET /api/v1/dashboard/health within 200ms', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/v1/dashboard/health')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200);
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      // Create test data
      const histories = [];
      for (let i = 0; i < 10; i++) {
        histories.push({
          patientId: new mongoose.Types.ObjectId(patientId),
          doctorId: new mongoose.Types.ObjectId(doctorId),
          patientName: `Patient ${i}`,
          age: 30 + i,
          diagnosis: `Diagnosis ${i}`,
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
          date: new Date()
        });
      }
      await MedicalHistory.insertMany(histories);

      // Make concurrent requests
      const startTime = Date.now();
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/v1/medical-histories')
          .set('Authorization', `Bearer ${doctorToken}`)
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Average response time should be reasonable
      const avgTime = totalTime / 10;
      expect(avgTime).toBeLessThan(500);
    });
  });

  describe('Pagination Performance', () => {
    beforeEach(async () => {
      // Create large dataset
      const histories = [];
      for (let i = 0; i < 100; i++) {
        histories.push({
          patientId: new mongoose.Types.ObjectId(patientId),
          doctorId: new mongoose.Types.ObjectId(doctorId),
          patientName: `Patient ${i}`,
          age: 30 + i,
          diagnosis: `Diagnosis ${i}`,
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
          date: new Date()
        });
      }
      await MedicalHistory.insertMany(histories);
    });

    it('should handle pagination with large datasets efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/v1/medical-histories?page=1&limit=10')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(response.body.success).toBe(true);
      // data is an array of medical histories, not an object with histories property
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(responseTime).toBeLessThan(500); // More lenient timeout for test environment
    });
  });

  describe('Database Query Performance', () => {
    beforeEach(async () => {
      // Create test data with indexes
      const histories = [];
      for (let i = 0; i < 50; i++) {
        histories.push({
          patientId: new mongoose.Types.ObjectId(patientId),
          doctorId: new mongoose.Types.ObjectId(doctorId),
          patientName: `Patient ${i}`,
          age: 30 + i,
          diagnosis: `Diagnosis ${i % 5}`, // 5 different diagnoses
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
          date: new Date(Date.now() - i * 86400000) // Spread over days
        });
      }
      await MedicalHistory.insertMany(histories);
    });

    it('should query by patientId efficiently with index', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get(`/api/v1/medical-histories?patientId=${patientId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(500); // More lenient for test environment
    });

    it('should filter and sort efficiently', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get('/api/v1/medical-histories?page=1&limit=20&sort=-date')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(500); // More lenient for test environment
    });
  });
});

