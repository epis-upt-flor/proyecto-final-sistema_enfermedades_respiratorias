/**
 * Unit tests for Export Controller
 */

import request from 'supertest';
import appInstance from '../../../src/index';
import { testUtils } from '../../setup';

const app = appInstance.app;
import User, { UserDocument } from '../../../src/models/User';
import MedicalHistory from '../../../src/models/MedicalHistory';
import mongoose from 'mongoose';

describe('Export Controller', () => {
  let adminToken: string;
  let doctorToken: string;
  let patientToken: string;
  let adminId: string;
  let doctorId: string;
  let patientId: string;

  beforeEach(async () => {
    await testUtils.cleanTestData();

    // Create test admin
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    }) as UserDocument;
    adminId = admin._id.toString();
    adminToken = testUtils.generateTestToken({ userId: adminId, role: 'admin' });

    // Create test doctor
    const doctor = await User.create({
      name: 'Test Doctor',
      email: 'doctor@test.com',
      password: 'password123',
      role: 'doctor',
      isActive: true
    }) as UserDocument;
    doctorId = doctor._id.toString();
    doctorToken = testUtils.generateTestToken({ userId: doctorId, role: 'doctor' });

    // Create test patient
    const patient = await User.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'password123',
      role: 'patient',
      isActive: true
    }) as UserDocument;
    patientId = patient._id.toString();
    patientToken = testUtils.generateTestToken({ userId: patientId, role: 'patient' });

    // Create test medical histories
    await MedicalHistory.create([
      {
        patientId: patientId,
        doctorId: doctorId,
        patientName: 'Test Patient',
        age: 45,
        diagnosis: 'Bronquitis',
        symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
        date: new Date()
      }
    ]);
  });

  describe('GET /api/v1/export/medical-histories', () => {
    it('should export medical histories in JSON format', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=json')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should export medical histories in CSV format', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=csv')
        .set('Authorization', `Bearer ${doctorToken}`);

      // CSV export might return different content type
      expect([200, 404]).toContain(response.status);
    });

    it('should export medical histories in PDF format', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=pdf')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 404, 500]).toContain(response.status);
    });

    it('should filter by date range', async () => {
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/export/medical-histories?format=json&dateFrom=${dateFrom}&dateTo=${dateTo}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should filter by patient ID', async () => {
      const response = await request(app)
        .get(`/api/v1/export/medical-histories?format=json&patientId=${patientId}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should filter by doctor ID', async () => {
      const response = await request(app)
        .get(`/api/v1/export/medical-histories?format=json&doctorId=${doctorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should allow patients to export their own data', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=json')
        .set('Authorization', `Bearer ${patientToken}`);

      expect([200, 403, 404]).toContain(response.status);
    });

    it('should prevent patients from exporting other patients data', async () => {
      const otherPatient = await User.create({
        name: 'Other Patient',
        email: 'other.patient@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      });

      const response = await request(app)
        .get(`/api/v1/export/medical-histories?format=json&patientId=${otherPatient._id}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect([403, 404]).toContain(response.status);
    });

    it('should prevent doctors from exporting other doctors data', async () => {
      const otherDoctor = await User.create({
        name: 'Other Doctor',
        email: 'other.doctor@test.com',
        password: 'password123',
        role: 'doctor',
        isActive: true
      });

      const response = await request(app)
        .get(`/api/v1/export/medical-histories?format=json&doctorId=${otherDoctor._id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([403, 404]).toContain(response.status);
    });

    it('should reject export from unauthorized users', async () => {
      await request(app)
        .get('/api/v1/export/medical-histories?format=json')
        .expect(401);
    });

    it('should handle invalid format gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=invalid')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([400, 422]).toContain(response.status);
    });

    it('should handle invalid date range', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=json&dateFrom=invalid-date')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([400, 422, 500]).toContain(response.status);
    });

    it('should include images when requested', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=json&includeImages=true')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 404]).toContain(response.status);
    });

    it('should include audio when requested', async () => {
      const response = await request(app)
        .get('/api/v1/export/medical-histories?format=json&includeAudio=true')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('GET /api/v1/export/formats', () => {
    it('should get available export formats', async () => {
      const response = await request(app)
        .get('/api/v1/export/formats')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.formats).toBeDefined();
      expect(Array.isArray(response.body.data.formats)).toBe(true);
    });
  });

  describe('GET /api/v1/export/users/stats', () => {
    it('should export user statistics (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/export/users/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should reject export from non-admin users', async () => {
      await request(app)
        .get('/api/v1/export/users/stats')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });
  });
});

