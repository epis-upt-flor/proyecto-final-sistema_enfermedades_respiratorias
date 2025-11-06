/**
 * Tests de integración con Backend
 * Verifica la comunicación real con el backend y el flujo completo
 */

import { apiService } from '../../src/services/api';
import { aiService } from '../../src/services/aiService';
import { localStorageService } from '../../src/services/localStorage';

// Nota: Estos tests requieren que el backend esté corriendo
// Se pueden ejecutar en CI/CD o localmente con backend activo
const BACKEND_URL = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';

describe('Backend Integration Tests', () => {
  // Estos tests se pueden saltar si no hay backend disponible
  const skipIfNoBackend = process.env.SKIP_BACKEND_TESTS === 'true';

  beforeAll(() => {
    if (skipIfNoBackend) {
      console.log('Backend tests skipped - set SKIP_BACKEND_TESTS=false to run');
    }
  });

  describe('Autenticación', () => {
    it.skip('debe hacer login exitoso con credenciales válidas', async () => {
      const result = await apiService.login('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.tokens.accessToken).toBeDefined();
    });

    it.skip('debe fallar con credenciales inválidas', async () => {
      const result = await apiService.login('test@example.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('CRUD de Historias Médicas', () => {
    let testHistoryId: string;
    let authToken: string;

    beforeAll(async () => {
      // Login antes de los tests
      const loginResult = await apiService.login('test@example.com', 'password123');
      if (loginResult.success) {
        authToken = loginResult.data!.tokens.accessToken;
      }
    });

    it.skip('debe crear una nueva historia médica', async () => {
      const newHistory = {
        patientId: 'patient-test-1',
        doctorId: 'doctor-1',
        patientName: 'Test Patient',
        age: 30,
        gender: 'M' as const,
        diagnosis: 'Bronquitis',
        symptoms: [
          {
            symptom: 'Tos',
            severity: 'moderate' as const,
            duration: '3 días',
          },
        ],
        treatment: 'Reposo y medicación',
        notes: 'Test notes',
        date: new Date().toISOString(),
      };

      const result = await apiService.createMedicalHistory(newHistory);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      testHistoryId = result.data!.id;
    });

    it.skip('debe obtener lista de historias médicas', async () => {
      const result = await apiService.getMedicalHistories({
        page: 1,
        limit: 10,
      });

      expect(result.success).toBe(true);
      expect(result.data?.histories).toBeDefined();
      expect(Array.isArray(result.data?.histories)).toBe(true);
    });

    it.skip('debe obtener una historia médica específica', async () => {
      if (!testHistoryId) return;

      const result = await apiService.getMedicalHistory(testHistoryId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe(testHistoryId);
    });

    it.skip('debe actualizar una historia médica', async () => {
      if (!testHistoryId) return;

      const updateData = {
        diagnosis: 'Neumonía',
        treatment: 'Tratamiento actualizado',
      };

      const result = await apiService.updateMedicalHistory(testHistoryId, updateData);

      expect(result.success).toBe(true);
      expect(result.data?.diagnosis).toBe('Neumonía');
    });

    it.skip('debe eliminar una historia médica', async () => {
      if (!testHistoryId) return;

      const result = await apiService.deleteMedicalHistory(testHistoryId);

      expect(result.success).toBe(true);
    });
  });

  describe('Análisis de Síntomas con IA', () => {
    it.skip('debe analizar síntomas usando el servicio de IA', async () => {
      const symptoms = [
        {
          symptom: 'Tos persistente',
          severity: 'moderate' as const,
          duration: '5 días',
        },
        {
          symptom: 'Fiebre',
          severity: 'mild' as const,
          duration: '2 días',
        },
      ];

      const result = await aiService.analyzeSymptoms(symptoms, 'patient-test-1');

      expect(result).toBeDefined();
      expect(result.urgencyLevel).toBeDefined();
      expect(result.classification).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it.skip('debe obtener tendencias de síntomas', async () => {
      const result = await aiService.getSymptomTrends('patient-test-1', '30d');

      expect(result).toBeDefined();
      expect(result.patientId).toBe('patient-test-1');
      expect(result.trendData).toBeDefined();
      expect(result.overallTrend).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it.skip('debe verificar que el backend está disponible', async () => {
      const result = await apiService.healthCheck();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('ok');
    });
  });
});

