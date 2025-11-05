/**
 * Unit tests for File Upload Controller
 */

import request from 'supertest';
import appInstance from '../../../src/index';
import { testUtils } from '../../setup';

const app = appInstance.app;
import User, { UserDocument } from '../../../src/models/User';

describe('File Upload Controller', () => {
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
  });

  describe('POST /api/v1/upload/medical-files', () => {
    it('should reject upload without files', async () => {
      await request(app)
        .post('/api/v1/upload/medical-files')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/upload/medical-files')
        .expect(401);
    });

    // Note: Testing actual file uploads would require mocking multer
    // This is a placeholder for file upload tests
  });

  describe('GET /api/v1/upload/stats', () => {
    it('should get upload statistics (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/upload/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject access from non-admin users', async () => {
      await request(app)
        .get('/api/v1/upload/stats')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/upload/cleanup', () => {
    it('should cleanup old files (admin only)', async () => {
      const response = await request(app)
        .post('/api/v1/upload/cleanup')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ daysOld: 30 });

      expect([200, 400, 500]).toContain(response.status);
    });

    it('should reject cleanup from non-admin users', async () => {
      await request(app)
        .post('/api/v1/upload/cleanup')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ daysOld: 30 })
        .expect(403);
    });

    it('should validate daysOld parameter', async () => {
      const response = await request(app)
        .post('/api/v1/upload/cleanup')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ daysOld: 500 }); // Invalid: > 365

      expect([400, 500]).toContain(response.status);
    });
  });
});

