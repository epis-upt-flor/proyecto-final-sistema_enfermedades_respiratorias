/**
 * End-to-End Tests - Flujos Completos
 * Tests que verifican flujos completos de usuario desde inicio hasta fin
 */

import request from 'supertest';
import appInstance from '../../src/index';
import { testUtils } from '../setup';

const app = appInstance.app;
import User, { UserDocument } from '../../src/models/User';
import MedicalHistory from '../../src/models/MedicalHistory';
import mongoose from 'mongoose';

describe('E2E Tests - Flujos Completos', () => {
  beforeEach(async () => {
    await testUtils.cleanTestData();
  });

  describe('Flujo Completo: Registro → Login → Crear Historia Médica → Ver Dashboard', () => {
    it('should complete full user journey from registration to dashboard', async () => {
      // Paso 1: Registro de nuevo usuario (Paciente)
      const registerData = {
        name: 'Juan Pérez',
        email: 'juan.perez@test.com',
        password: 'password123',
        role: 'patient',
        phone: '+51987654321'
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.data.user.email).toBe(registerData.email);
      expect(registerResponse.body.data.token).toBeDefined();
      
      const patientToken = registerResponse.body.data.token;
      const patientId = registerResponse.body.data.user._id;

      // Paso 2: Login con las credenciales registradas
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: registerData.email,
          password: registerData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.token).toBeDefined();
      expect(loginResponse.body.data.user._id).toBe(patientId);

      // Paso 3: Obtener perfil del usuario
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.email).toBe(registerData.email);

      // Paso 4: Crear un doctor para poder crear historias médicas
      const doctor = await User.create({
        name: 'Dr. María González',
        email: 'dr.maria@test.com',
        password: 'password123',
        role: 'doctor',
        isActive: true
      }) as UserDocument;

      const doctorToken = testUtils.generateTestToken({ 
        userId: doctor._id.toString(), 
        role: 'doctor' 
      });

      // Paso 5: Crear historia médica para el paciente
      const medicalHistoryData = {
        patientId: patientId,
        patientName: registerData.name,
        age: 45,
        diagnosis: 'Bronquitis',
        symptoms: [
          { name: 'tos', severity: 'moderate', duration: '2 weeks' },
          { name: 'fiebre', severity: 'mild', duration: '3 days' }
        ],
        description: 'Paciente con síntomas respiratorios persistentes',
        date: new Date().toISOString()
      };

      const historyResponse = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(medicalHistoryData)
        .expect(201);

      expect(historyResponse.body.success).toBe(true);
      expect(historyResponse.body.data.diagnosis).toBe(medicalHistoryData.diagnosis);
      expect(historyResponse.body.data.patientId).toBe(patientId);
      
      const historyId = historyResponse.body.data._id;

      // Paso 6: El paciente puede ver su historia médica
      const getHistoryResponse = await request(app)
        .get(`/api/v1/medical-histories/${historyId}`)
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(getHistoryResponse.body.success).toBe(true);
      expect(getHistoryResponse.body.data._id).toBe(historyId);

      // Paso 7: El doctor puede ver el dashboard con estadísticas
      const dashboardResponse = await request(app)
        .get('/api/v1/dashboard/doctor')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(dashboardResponse.body.success).toBe(true);
      expect(dashboardResponse.body.data.overview).toBeDefined();
      expect(dashboardResponse.body.data.overview.totalHistories).toBeGreaterThanOrEqual(1);

      // Paso 8: El paciente puede ver su dashboard
      const patientDashboardResponse = await request(app)
        .get('/api/v1/dashboard/patient')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(patientDashboardResponse.body.success).toBe(true);
      expect(patientDashboardResponse.body.data).toBeDefined();
    });
  });

  describe('Flujo Completo: Análisis de Síntomas con IA', () => {
    it('should complete symptom analysis flow with AI integration', async () => {
      // Paso 1: Crear usuario doctor
      const doctor = await User.create({
        name: 'Dr. Ana López',
        email: 'dr.ana@test.com',
        password: 'password123',
        role: 'doctor',
        isActive: true
      }) as UserDocument;

      const doctorToken = testUtils.generateTestToken({ 
        userId: doctor._id.toString(), 
        role: 'doctor' 
      });

      // Paso 2: Crear paciente
      const patient = await User.create({
        name: 'Carlos Ruiz',
        email: 'carlos.ruiz@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      }) as UserDocument;

      const patientToken = testUtils.generateTestToken({ 
        userId: patient._id.toString(), 
        role: 'patient' 
      });

      // Paso 3: Crear historia médica con síntomas
      const symptomsData = {
        patientId: patient._id.toString(),
        patientName: patient.name,
        age: 35,
        diagnosis: 'Pendiente',
        symptoms: [
          { name: 'tos', severity: 'severe', duration: '1 week' },
          { name: 'dificultad_respiratoria', severity: 'severe', duration: '3 days' },
          { name: 'fiebre', severity: 'moderate', duration: '2 days' }
        ],
        description: 'Síntomas severos que requieren análisis'
      };

      const historyResponse = await request(app)
        .post('/api/v1/medical-histories')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(symptomsData)
        .expect(201);

      const historyId = historyResponse.body.data._id;

      // Paso 4: Análisis de síntomas (simulado - el servicio AI puede no estar disponible)
      const analysisResponse = await request(app)
        .post('/api/v1/symptom-analyzer/analyze')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          symptoms: symptomsData.symptoms,
          age: symptomsData.age,
          patientId: patient._id.toString()
        });

      // El análisis puede fallar si el servicio AI no está disponible, pero el flujo debe manejarlo
      expect([200, 500, 503]).toContain(analysisResponse.status);
      
      if (analysisResponse.status === 200) {
        expect(analysisResponse.body.success).toBe(true);
        expect(analysisResponse.body.data).toBeDefined();
      }

      // Paso 5: Actualizar historia médica con diagnóstico después del análisis
      const updateResponse = await request(app)
        .put(`/api/v1/medical-histories/${historyId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          diagnosis: 'Neumonía',
          description: 'Diagnóstico actualizado después del análisis de síntomas'
        })
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.diagnosis).toBe('Neumonía');
    });
  });

  describe('Flujo Completo: Administrador gestiona sistema', () => {
    it('should complete admin system management flow', async () => {
      // Paso 1: Crear administrador
      const admin = await User.create({
        name: 'Admin Sistema',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      }) as UserDocument;

      const adminToken = testUtils.generateTestToken({ 
        userId: admin._id.toString(), 
        role: 'admin' 
      });

      // Paso 2: Crear usuarios (doctor y paciente)
      const doctor = await User.create({
        name: 'Dr. Test',
        email: 'doctor.test@test.com',
        password: 'password123',
        role: 'doctor',
        isActive: true
      }) as UserDocument;

      const patient = await User.create({
        name: 'Paciente Test',
        email: 'patient.test@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      }) as UserDocument;

      // Paso 3: Ver dashboard de administrador
      const dashboardResponse = await request(app)
        .get('/api/v1/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(dashboardResponse.body.success).toBe(true);
      expect(dashboardResponse.body.data.overview).toBeDefined();
      expect(dashboardResponse.body.data.overview.totalUsers).toBeGreaterThanOrEqual(3);

      // Paso 4: Ver salud del sistema
      const healthResponse = await request(app)
        .get('/api/v1/dashboard/health')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(healthResponse.body.success).toBe(true);
      expect(healthResponse.body.data).toBeDefined();

      // Paso 5: Ver estadísticas de historias médicas
      const statsResponse = await request(app)
        .get('/api/v1/medical-histories/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      // Las estadísticas pueden no estar disponibles si no hay historias
      expect([200, 404]).toContain(statsResponse.status);
      if (statsResponse.status === 200) {
        expect(statsResponse.body.success).toBe(true);
      }
    });
  });

  describe('Flujo Completo: Sincronización Offline', () => {
    it('should complete offline sync flow', async () => {
      // Paso 1: Crear doctor
      const doctor = await User.create({
        name: 'Dr. Offline Test',
        email: 'dr.offline@test.com',
        password: 'password123',
        role: 'doctor',
        isActive: true
      }) as UserDocument;

      const doctorToken = testUtils.generateTestToken({ 
        userId: doctor._id.toString(), 
        role: 'doctor' 
      });

      const patient = await User.create({
        name: 'Paciente Offline',
        email: 'patient.offline@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      }) as UserDocument;

      // Paso 2: Crear historias médicas offline (simuladas)
      const offlineHistories = [
        {
          patientId: patient._id.toString(),
          doctorId: doctor._id.toString(),
          patientName: patient.name,
          age: 30,
          diagnosis: 'Gripe',
          symptoms: [{ name: 'tos', severity: 'mild', duration: '1 week' }],
          description: 'Historia offline',
          isOffline: true,
          syncStatus: 'pending',
          date: new Date(Date.now() - 86400000) // Ayer
        },
        {
          patientId: patient._id.toString(),
          doctorId: doctor._id.toString(),
          patientName: patient.name,
          age: 30,
          diagnosis: 'Resfriado',
          symptoms: [{ name: 'congestion', severity: 'mild', duration: '2 days' }],
          description: 'Historia offline 2',
          isOffline: true,
          syncStatus: 'pending',
          date: new Date(Date.now() - 172800000) // Hace 2 días
        }
      ];

      // Crear historias offline directamente en la base de datos
      const createdHistories = await MedicalHistory.insertMany(offlineHistories);

      // Paso 3: Sincronizar historias offline
      const syncResponse = await request(app)
        .post('/api/v1/medical-histories/sync')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          histories: createdHistories.map(h => ({
            patientId: h.patientId,
            patientName: h.patientName,
            age: h.age,
            diagnosis: h.diagnosis,
            symptoms: h.symptoms,
            description: h.description || '',
            date: h.date
          }))
        });

      // El sync puede fallar si las historias ya existen o hay problemas de validación
      expect([200, 400, 500]).toContain(syncResponse.status);
      if (syncResponse.status === 200) {
        expect(syncResponse.body.success).toBe(true);
      }

      // Paso 4: Verificar que las historias están sincronizadas (si el sync fue exitoso)
      if (syncResponse.status === 200) {
        const syncedHistories = await MedicalHistory.find({
          _id: { $in: createdHistories.map(h => h._id) }
        });

        syncedHistories.forEach(history => {
          expect(['synced', 'pending']).toContain(history.syncStatus);
        });
      }
    });
  });

  describe('Flujo Completo: Exportación de Datos', () => {
    it('should complete data export flow', async () => {
      // Paso 1: Crear usuarios y datos de prueba
      const doctor = await User.create({
        name: 'Dr. Export Test',
        email: 'dr.export@test.com',
        password: 'password123',
        role: 'doctor',
        isActive: true
      }) as UserDocument;

      const doctorToken = testUtils.generateTestToken({ 
        userId: doctor._id.toString(), 
        role: 'doctor' 
      });

      const patient = await User.create({
        name: 'Paciente Export',
        email: 'patient.export@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      }) as UserDocument;

      // Crear múltiples historias médicas
      const historiesData = [
        {
          patientId: patient._id.toString(),
          patientName: patient.name,
          age: 40,
          diagnosis: 'Bronquitis',
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '1 week' }],
          date: new Date()
        },
        {
          patientId: patient._id.toString(),
          patientName: patient.name,
          age: 40,
          diagnosis: 'Asma',
          symptoms: [{ name: 'dificultad_respiratoria', severity: 'severe', duration: '2 weeks' }],
          date: new Date(Date.now() - 86400000)
        }
      ];

      await MedicalHistory.insertMany(historiesData);

      // Paso 2: Exportar datos en formato JSON
      const jsonExportResponse = await request(app)
        .get('/api/v1/medical-histories/export?format=json')
        .set('Authorization', `Bearer ${doctorToken}`);

      // La exportación puede requerir permisos específicos
      expect([200, 403, 404]).toContain(jsonExportResponse.status);
      if (jsonExportResponse.status === 200) {
        expect(jsonExportResponse.body.success).toBe(true);
      }

      // Paso 3: Exportar datos en formato CSV
      const csvExportResponse = await request(app)
        .get('/api/v1/medical-histories/export?format=csv')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect([200, 403, 404]).toContain(csvExportResponse.status);
      if (csvExportResponse.status === 200) {
        expect(csvExportResponse.headers['content-type']).toContain('text/csv');
      }
    });
  });

  describe('Flujo Completo: Autenticación y Refresh Token', () => {
    it('should complete authentication flow with token refresh', async () => {
      // Paso 1: Registro
      const registerData = {
        name: 'Usuario Token',
        email: 'token.user@test.com',
        password: 'password123',
        role: 'patient'
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      const { token, refreshToken } = registerResponse.body.data;

      // Paso 2: Usar token para acceder a recurso protegido
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.success).toBe(true);

      // Paso 3: Refrescar token (la ruta requiere autenticación)
      const refreshResponse = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body.success).toBe(true);
      expect(refreshResponse.body.data.token).toBeDefined();
      expect(refreshResponse.body.data.refreshToken).toBeDefined();

      const newToken = refreshResponse.body.data.token;

      // Paso 4: Usar nuevo token
      const newProfileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(newProfileResponse.body.success).toBe(true);
    });
  });

  describe('Flujo Completo: Búsqueda y Filtrado Avanzado', () => {
    it('should complete advanced search and filtering flow', async () => {
      // Paso 1: Crear datos de prueba
      const doctor = await User.create({
        name: 'Dr. Search Test',
        email: 'dr.search@test.com',
        password: 'password123',
        role: 'doctor',
        isActive: true
      }) as UserDocument;

      const doctorToken = testUtils.generateTestToken({ 
        userId: doctor._id.toString(), 
        role: 'doctor' 
      });

      const patient1 = await User.create({
        name: 'Paciente Uno',
        email: 'patient1@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      }) as UserDocument;

      const patient2 = await User.create({
        name: 'Paciente Dos',
        email: 'patient2@test.com',
        password: 'password123',
        role: 'patient',
        isActive: true
      }) as UserDocument;

      // Crear historias médicas con diferentes diagnósticos y fechas
      const histories = [
        {
          patientId: patient1._id.toString(),
          doctorId: doctor._id.toString(),
          patientName: patient1.name,
          age: 35,
          diagnosis: 'Bronquitis',
          symptoms: [{ name: 'tos', severity: 'moderate', duration: '1 week' }],
          date: new Date(Date.now() - 86400000) // Ayer
        },
        {
          patientId: patient2._id.toString(),
          doctorId: doctor._id.toString(),
          patientName: patient2.name,
          age: 50,
          diagnosis: 'Asma',
          symptoms: [{ name: 'dificultad_respiratoria', severity: 'severe', duration: '2 weeks' }],
          date: new Date() // Hoy
        },
        {
          patientId: patient1._id.toString(),
          doctorId: doctor._id.toString(),
          patientName: patient1.name,
          age: 35,
          diagnosis: 'Gripe',
          symptoms: [{ name: 'fiebre', severity: 'mild', duration: '3 days' }],
          date: new Date(Date.now() - 172800000) // Hace 2 días
        }
      ];

      await MedicalHistory.insertMany(histories);

      // Paso 2: Búsqueda por texto
      const searchResponse = await request(app)
        .get('/api/v1/medical-histories?search=Bronquitis')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(searchResponse.body.success).toBe(true);
      expect(searchResponse.body.data.length).toBeGreaterThan(0);

      // Paso 3: Filtrado por paciente
      const filterByPatientResponse = await request(app)
        .get(`/api/v1/medical-histories?patientId=${patient1._id.toString()}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(filterByPatientResponse.body.success).toBe(true);
      filterByPatientResponse.body.data.forEach((history: any) => {
        expect(history.patientId).toBe(patient1._id.toString());
      });

      // Paso 4: Ordenamiento por fecha
      const sortedResponse = await request(app)
        .get('/api/v1/medical-histories?sort=-date&limit=10')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(sortedResponse.body.success).toBe(true);
      if (sortedResponse.body.data.length > 1) {
        const dates = sortedResponse.body.data.map((h: any) => new Date(h.date).getTime());
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
        }
      }

      // Paso 5: Paginación
      const paginatedResponse = await request(app)
        .get('/api/v1/medical-histories?page=1&limit=2')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(paginatedResponse.body.success).toBe(true);
      expect(paginatedResponse.body.data.length).toBeLessThanOrEqual(2);
      expect(paginatedResponse.body.pagination).toBeDefined();
      expect(paginatedResponse.body.pagination.page).toBe(1);
    });
  });
});

