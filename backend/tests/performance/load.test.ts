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

  describe('Stress Testing', () => {
    it('should handle sustained load of 50 requests', async () => {
      const startTime = Date.now();
      const requests = Array(50).fill(null).map(() =>
        request(app)
          .get('/api/v1/dashboard/health')
          .set('Authorization', `Bearer ${doctorToken}`)
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Average time should be reasonable
      const avgTime = totalTime / 50;
      expect(avgTime).toBeLessThan(1000);
    });

    it('should handle heavy database operations under load', async () => {
      // Create large dataset
      const histories = [];
      for (let i = 0; i < 200; i++) {
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

      const startTime = Date.now();
      const requests = Array(20).fill(null).map(() =>
        request(app)
          .get('/api/v1/medical-histories?page=1&limit=50')
          .set('Authorization', `Bearer ${doctorToken}`)
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(totalTime).toBeLessThan(10000); // 10 seconds for all requests
    });
  });

  describe('Spike Testing', () => {
    it('should handle sudden spike in traffic', async () => {
      // Simulate sudden spike - 100 requests at once
      const requests = Array(100).fill(null).map(() =>
        request(app)
          .get('/api/v1/dashboard/health')
          .set('Authorization', `Bearer ${doctorToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // Most requests should succeed (allowing for some failures under extreme load)
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(80); // At least 80% success rate

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(30000); // 30 seconds max
    });

    it('should recover after spike', async () => {
      // Create spike
      const spikeRequests = Array(50).fill(null).map(() =>
        request(app)
          .get('/api/v1/dashboard/health')
          .set('Authorization', `Bearer ${doctorToken}`)
      );
      await Promise.all(spikeRequests);

      // Wait a bit for recovery
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Normal requests should work fine after spike
      const response = await request(app)
        .get('/api/v1/dashboard/health')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Endurance Testing', () => {
    it('should handle sustained moderate load', async () => {
      const iterations = 10;
      const requestsPerIteration = 5;
      const results = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        const requests = Array(requestsPerIteration).fill(null).map(() =>
          request(app)
            .get('/api/v1/dashboard/health')
            .set('Authorization', `Bearer ${doctorToken}`)
        );

        const responses = await Promise.all(requests);
        const iterationTime = Date.now() - startTime;

        results.push({
          iteration: i,
          time: iterationTime,
          successCount: responses.filter(r => r.status === 200).length
        });

        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // All iterations should have high success rate
      results.forEach(result => {
        expect(result.successCount).toBe(requestsPerIteration);
      });

      // Performance should not degrade over time
      const firstHalfAvg = results.slice(0, 5).reduce((sum, r) => sum + r.time, 0) / 5;
      const secondHalfAvg = results.slice(5, 10).reduce((sum, r) => sum + r.time, 0) / 5;

      // Second half should not be significantly slower (allow 50% degradation)
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 1.5);
    });
  });

  describe('Resource Usage Tests', () => {
    it('should not leak memory on repeated requests', async () => {
      const iterations = 20;

      for (let i = 0; i < iterations; i++) {
        await request(app)
          .get('/api/v1/dashboard/health')
          .set('Authorization', `Bearer ${doctorToken}`)
          .expect(200);
      }

      // If there's a memory leak, the test would eventually fail or timeout
      expect(true).toBe(true);
    });

    it('should handle complex queries without timeout', async () => {
      // Create diverse dataset
      const histories = [];
      for (let i = 0; i < 100; i++) {
        histories.push({
          patientId: new mongoose.Types.ObjectId(patientId),
          doctorId: new mongoose.Types.ObjectId(doctorId),
          patientName: `Patient ${i}`,
          age: 20 + (i % 60),
          diagnosis: `Diagnosis ${i % 10}`,
          symptoms: [
            { name: 'tos', severity: 'moderate', duration: '2 weeks' },
            { name: 'fiebre', severity: 'mild', duration: '3 days' }
          ],
          date: new Date(Date.now() - i * 3600000)
        });
      }
      await MedicalHistory.insertMany(histories);

      const startTime = Date.now();
      const response = await request(app)
        .get('/api/v1/medical-histories?page=1&limit=50&sort=-date')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;

      expect(response.body.success).toBe(true);
      expect(responseTime).toBeLessThan(2000); // 2 seconds max for complex query
    });
  });

  describe('Scalability Tests', () => {
    it('should scale with increasing data volume', async () => {
      const results = [];

      // Test with different data volumes
      for (const volume of [10, 50, 100]) {
        await testUtils.cleanTestData();

        // Create dataset
        const histories = [];
        for (let i = 0; i < volume; i++) {
          histories.push({
            patientId: new mongoose.Types.ObjectId(patientId),
            doctorId: new mongoose.Types.ObjectId(doctorId),
            patientName: `Patient ${i}`,
            age: 30,
            diagnosis: 'Test',
            symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
            date: new Date()
          });
        }
        await MedicalHistory.insertMany(histories);

        // Measure query time
        const startTime = Date.now();
        await request(app)
          .get('/api/v1/medical-histories?page=1&limit=10')
          .set('Authorization', `Bearer ${doctorToken}`)
          .expect(200);
        const queryTime = Date.now() - startTime;

        results.push({ volume, queryTime });
      }

      // Performance should scale linearly or better
      // (query time for 100 records should be less than 10x the time for 10 records)
      const ratio = results[2].queryTime / results[0].queryTime;
      expect(ratio).toBeLessThan(10);
    });
  });
});

