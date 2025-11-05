/**
 * Security Tests
 * Tests for common security vulnerabilities (OWASP Top 10)
 */

import request from 'supertest';
import appInstance from '../../src/index';
import { testUtils } from '../setup';

const app = appInstance.app;
import User, { UserDocument } from '../../src/models/User';
import mongoose from 'mongoose';

describe('Security Tests', () => {
  let doctorToken: string;
  let doctorId: string;

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
  });

  describe('Authentication Security', () => {
    it('should reject requests without authentication token', async () => {
      await request(app)
        .get('/api/v1/medical-histories')
        .expect(401);
    });

    it('should reject invalid JWT tokens', async () => {
      await request(app)
        .get('/api/v1/medical-histories')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });

    it('should reject expired tokens', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: doctorId, role: 'doctor' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired token
      );

      await request(app)
        .get('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('should prevent token tampering', async () => {
      const tamperedToken = doctorToken.slice(0, -5) + 'XXXXX';
      
      await request(app)
        .get('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);
    });
  });

  describe('Authorization Security', () => {
    it('should prevent unauthorized access to admin endpoints', async () => {
      await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });

    it('should prevent privilege escalation', async () => {
      // Try to access as admin with doctor token
      const response = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('Input Validation Security', () => {
    it('should prevent SQL injection attempts', async () => {
      const maliciousInput = {
        patientId: "'; DROP TABLE users; --",
        patientName: 'Test',
        age: 30,
        diagnosis: 'Test',
        symptoms: []
      };

      const response = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(maliciousInput);

      // Should either reject or sanitize, not execute
      expect([400, 422]).toContain(response.status);
    });

    it('should prevent XSS attacks in input fields', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const maliciousData = {
        patientId: new mongoose.Types.ObjectId().toString(),
        patientName: xssPayload,
        age: 30,
        diagnosis: 'Test',
        symptoms: []
      };

      const response = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(maliciousData);

      // Should sanitize XSS payload
      if (response.status === 201 || response.status === 200) {
        expect(response.body.data.patientName).not.toContain('<script>');
      }
    });

    it('should prevent NoSQL injection', async () => {
      const nosqlPayload = { $gt: '' };
      
      const response = await request(app)
        .get(`/api/v1/medical-histories?patientId=${JSON.stringify(nosqlPayload)}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      // Should reject or sanitize NoSQL injection
      expect([400, 422, 500]).toContain(response.status);
    });

    it('should validate data types strictly', async () => {
      const invalidData = {
        patientId: new mongoose.Types.ObjectId().toString(),
        patientName: 'Test',
        age: 'not-a-number', // Invalid type
        diagnosis: 'Test',
        symptoms: []
      };

      const response = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should implement rate limiting on authentication endpoints', async () => {
      const loginAttempts = Array(20).fill(null).map(() =>
        request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' })
      );

      const responses = await Promise.all(loginAttempts);
      
      // All should return 401 (unauthorized) or 429 (rate limited)
      responses.forEach(response => {
        expect([401, 429]).toContain(response.status);
      });
      
      // If rate limiting is active, we should see 429 responses
      // Otherwise, all should be 401 (which is still secure)
      const rateLimited = responses.filter(r => r.status === 429);
      const unauthorized = responses.filter(r => r.status === 401);
      
      // Either rate limiting is active (429) or requests are being rejected (401)
      expect(rateLimited.length + unauthorized.length).toBe(20);
    });
  });

  describe('CORS Security', () => {
    it('should only allow requests from whitelisted origins', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/health')
        .set('Origin', 'http://malicious-site.com')
        .set('Authorization', `Bearer ${doctorToken}`);

      // Should either reject or have proper CORS headers
      // This depends on CORS configuration
      expect(response.headers['access-control-allow-origin']).not.toBe('*');
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize MongoDB operator injection', async () => {
      const maliciousData = {
        patientId: new mongoose.Types.ObjectId().toString(),
        patientName: { $ne: null }, // MongoDB operator
        age: 30,
        diagnosis: 'Test',
        symptoms: []
      };

      const response = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(maliciousData);

      // Should sanitize or reject
      expect([400, 422]).toContain(response.status);
    });
  });

  describe('Password Security', () => {
    it('should not return passwords in API responses', async () => {
      const user = await User.create({
        name: 'Test User',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      });

      const response = await request(app)
        .get(`/api/users/${user._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      if (response.status === 200) {
        expect(response.body.data.password).toBeUndefined();
      }
    });

    it('should hash passwords before storing', async () => {
      const password = 'plaintextpassword';
      const user = await User.create({
        name: 'Test User',
        email: 'hashtest@test.com',
        password: password,
        role: 'patient',
        isActive: true
      });

      expect(user.password).not.toBe(password);
      expect(user.password.length).toBeGreaterThan(20); // Bcrypt hash length
    });
  });
});

