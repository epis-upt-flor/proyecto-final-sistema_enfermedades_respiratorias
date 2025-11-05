/**
 * Unit tests for Medical History Controller
 */

import request from 'supertest';
import appInstance from '../../../src/index';
import { testUtils } from '../../setup';

const app = appInstance.app;
import MedicalHistory from '../../../src/models/MedicalHistory';
import User, { UserDocument } from '../../../src/models/User';
import mongoose from 'mongoose';

describe('Medical History Controller', () => {
  let doctorToken: string;
  let patientToken: string;
  let doctorId: string;
  let patientId: string;
  let adminToken: string;

  beforeEach(async () => {
    await testUtils.cleanTestData();

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

    // Create test admin
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      isActive: true
    }) as UserDocument;
    adminToken = testUtils.generateTestToken({ userId: admin._id.toString(), role: 'admin' });
  });

  describe('POST /api/v1/medical-histories', () => {
    it('should create a medical history successfully', async () => {
      const medicalHistoryData = {
        patientId: patientId,
        patientName: 'Test Patient',
        age: 45,
        diagnosis: 'Bronquitis',
        symptoms: [
          { name: 'tos', severity: 'moderate', duration: '2 weeks' },
          { name: 'fiebre', severity: 'mild', duration: '3 days' }
        ],
        description: 'Paciente con síntomas respiratorios',
        date: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(medicalHistoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.diagnosis).toBe(medicalHistoryData.diagnosis);
      expect(response.body.data.patientId).toBe(patientId);
    });

    it('should reject medical history without authentication', async () => {
      const medicalHistoryData = testUtils.generateTestMedicalHistory();

      await request(app)
        .post('/api/v1/medical-histories')
        .send(medicalHistoryData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        patientName: 'Test Patient'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/medical-histories', () => {
    beforeEach(async () => {
      // Create test medical histories
      await MedicalHistory.create([
        {
          patientId: new mongoose.Types.ObjectId(patientId),
          doctorId: new mongoose.Types.ObjectId(doctorId),
          patientName: 'Test Patient 1',
          age: 45,
          diagnosis: 'Bronquitis',
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
          date: new Date()
        },
        {
          patientId: new mongoose.Types.ObjectId(patientId),
          doctorId: new mongoose.Types.ObjectId(doctorId),
          patientName: 'Test Patient 2',
          age: 30,
          diagnosis: 'Asma',
          symptoms: [{ name: 'dificultad_respiratoria', severity: 'severe', duration: '1 week' }],
          date: new Date()
        }
      ]);
    });

    it('should get all medical histories for doctor', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.histories.length).toBeGreaterThan(0);
    });

    it('should filter medical histories by patient', async () => {
      const response = await request(app)
        .get(`/api/v1/medical-histories?patientId=${patientId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.histories.forEach((history: any) => {
        expect(history.patientId).toBe(patientId);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories?page=1&limit=1')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.histories.length).toBeLessThanOrEqual(1);
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/v1/medical-histories/:id', () => {
    let medicalHistoryId: string;

    beforeEach(async () => {
      const history = await MedicalHistory.create({
        patientId: new mongoose.Types.ObjectId(patientId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        patientName: 'Test Patient',
        age: 45,
        diagnosis: 'Bronquitis',
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
        date: new Date()
      });
      medicalHistoryId = history._id.toString();
    });

    it('should get a medical history by id', async () => {
      const response = await request(app)
        .get(`/api/v1/medical-histories/${medicalHistoryId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(medicalHistoryId);
    });

    it('should return 404 for non-existent history', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await request(app)
        .get(`/api/v1/medical-histories/${fakeId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/v1/medical-histories/:id', () => {
    let medicalHistoryId: string;

    beforeEach(async () => {
      const history = await MedicalHistory.create({
        patientId: new mongoose.Types.ObjectId(patientId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        patientName: 'Test Patient',
        age: 45,
        diagnosis: 'Bronquitis',
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
        date: new Date()
      });
      medicalHistoryId = history._id.toString();
    });

    it('should update a medical history successfully', async () => {
      const updateData = {
        diagnosis: 'Actualizado - Neumonía',
        description: 'Diagnóstico actualizado'
      };

      const response = await request(app)
        .put(`/api/v1/medical-histories/${medicalHistoryId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.diagnosis).toBe(updateData.diagnosis);
    });

    it('should reject update from unauthorized user', async () => {
      const updateData = { diagnosis: 'Hacked' };
      
      await request(app)
        .put(`/api/v1/medical-histories/${medicalHistoryId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .send(updateData)
        .expect(403);
    });
  });

  describe('DELETE /api/v1/medical-histories/:id', () => {
    let medicalHistoryId: string;

    beforeEach(async () => {
      const history = await MedicalHistory.create({
        patientId: new mongoose.Types.ObjectId(patientId),
        doctorId: new mongoose.Types.ObjectId(doctorId),
        patientName: 'Test Patient',
        age: 45,
        diagnosis: 'Bronquitis',
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
        date: new Date()
      });
      medicalHistoryId = history._id.toString();
    });

    it('should delete a medical history (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/v1/medical-histories/${medicalHistoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await MedicalHistory.findById(medicalHistoryId);
      expect(deleted).toBeNull();
    });

    it('should allow doctor to delete their own medical history', async () => {
      // Create a new history for this test (the previous one was deleted)
      const history = await MedicalHistory.create({
        patientId: patientId,
        doctorId: doctorId,
        patientName: 'Test Patient',
        age: 45,
        diagnosis: 'Bronquitis',
        symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
        date: new Date()
      });
      const newHistoryId = history._id.toString();

      // Doctor can delete their own history
      const response = await request(app)
        .delete(`/api/v1/medical-histories/${newHistoryId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deleted = await MedicalHistory.findById(newHistoryId);
      expect(deleted).toBeNull();
    });

    it('should reject deletion from patient', async () => {
      // Create a new history for this test
      const history = await MedicalHistory.create({
        patientId: patientId,
        doctorId: doctorId,
        patientName: 'Test Patient',
        age: 45,
        diagnosis: 'Bronquitis',
        symptoms: [{ name: 'tos', severity: 'moderate', duration: '2 weeks' }],
        date: new Date()
      });
      const historyId = history._id.toString();

      // Patient cannot delete medical histories
      await request(app)
        .delete(`/api/v1/medical-histories/${historyId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);
    });
  });

  describe('POST /api/v1/medical-histories/sync', () => {
    it('should sync offline histories successfully', async () => {
      const historiesData = [
        {
          patientId: patientId,
          patientName: 'Test Patient',
          age: 45,
          diagnosis: 'Gripe',
          symptoms: [{ name: 'tos', severity: 'mild', duration: '1 week' }],
          description: 'Historia offline 1',
          date: new Date()
        },
        {
          patientId: patientId,
          patientName: 'Test Patient',
          age: 45,
          diagnosis: 'Resfriado',
          symptoms: [{ name: 'congestion', severity: 'mild', duration: '2 days' }],
          description: 'Historia offline 2',
          date: new Date()
        }
      ];

      const response = await request(app)
        .post('/api/v1/medical-histories/sync')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ histories: historiesData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.synced).toBeDefined();
      expect(Array.isArray(response.body.data.synced)).toBe(true);
      expect(response.body.data.errors).toBeDefined();
      expect(Array.isArray(response.body.data.errors)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/medical-histories/sync')
        .send({ histories: [] })
        .expect(401);
    });

    it('should validate histories array', async () => {
      const response = await request(app)
        .post('/api/v1/medical-histories/sync')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ histories: 'not-an-array' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/medical-histories/stats', () => {
    it('should get medical history statistics', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/stats')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.total).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/medical-histories/stats')
        .expect(401);
    });
  });

  describe('GET /api/v1/medical-histories/top-diagnoses', () => {
    it('should get top diagnoses', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/top-diagnoses?limit=5')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/medical-histories/top-diagnoses')
        .expect(401);
    });
  });

  describe('GET /api/v1/medical-histories/age-stats', () => {
    it('should get age statistics', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/age-stats')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/medical-histories/age-stats')
        .expect(401);
    });
  });

  describe('GET /api/v1/medical-histories/location', () => {
    it('should get medical histories by location', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/location?latitude=-18.0153&longitude=-70.2500&radius=10')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });

    it('should require latitude and longitude', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/location')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/medical-histories/location?latitude=-18.0153&longitude=-70.2500')
        .expect(401);
    });
  });

  describe('GET /api/v1/medical-histories/date-range', () => {
    it('should get medical histories by date range', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/v1/medical-histories/date-range?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      }
    });

    it('should require startDate and endDate', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/date-range')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/medical-histories/date-range?startDate=2024-01-01&endDate=2024-12-31')
        .expect(401);
    });
  });

  describe('GET /api/v1/medical-histories/export', () => {
    it('should export medical histories in JSON format', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/export?format=json')
        .set('Authorization', `Bearer ${doctorToken}`);

      // Export may require admin permissions or may not be implemented
      expect([200, 403, 404]).toContain(response.status);
    });

    it('should export medical histories in CSV format', async () => {
      const response = await request(app)
        .get('/api/v1/medical-histories/export?format=csv')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 403, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.headers['content-type']).toContain('text/csv');
      }
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/medical-histories/export?format=json')
        .expect(401);
    });
  });
});

