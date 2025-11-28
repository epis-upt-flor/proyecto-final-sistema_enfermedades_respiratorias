/**
 * Tests de integración - Flujo completo de análisis de síntomas
 * Verifica el flujo desde captura hasta resultados
 */

import { useAppStore } from '../../medical-app/store/useAppStore';
import { symptomAnalyzerService } from '../../medical-app/lib/api/services/symptomAnalyzerService';
import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import { dashboardService } from '../../medical-app/lib/api/services/dashboardService';
// Nota: voiceRecognitionService puede no existir en medical-app

// Mock dependencies
jest.mock('../../medical-app/lib/api/services/dashboardService');
// Nota: voiceRecognitionService puede no existir en medical-app

describe('Symptom Analysis Flow Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localStorageService.clearAllData();
    
    // Setup: usuario logueado
    useAppStore.getState().setUser({
      id: 'patient-1',
      email: 'patient@example.com',
      name: 'Test Patient',
      role: 'patient',
    });
  });

  describe('Complete Analysis Flow', () => {
    it('debe completar flujo completo de análisis de síntomas', async () => {
      // 1. Captura de síntomas (texto)
      const symptoms = [
        { name: 'tos', severity: 'moderate', durationDays: 5 },
        { name: 'fiebre', severity: 'mild', durationDays: 2 },
      ];

      // 2. Análisis con IA
      const analysisResult = await useAppStore.getState().analyzeSymptoms(
        symptoms,
        'patient-1',
        { age: 30, gender: 'M' }
      );

      expect(analysisResult).toBeDefined();
      expect(analysisResult?.disease).toBeDefined();
      expect(analysisResult?.confidence).toBeGreaterThan(0);

      // 3. Verificar que se guarda en store
      const analyses = useAppStore.getState().offlineData.symptomAnalyses;
      expect(analyses.length).toBeGreaterThan(0);

      // 4. Verificar que se guarda en localStorage
      const cached = await localStorageService.getCachedSymptomAnalyses();
      expect(cached.length).toBeGreaterThan(0);

      // 5. Verificar analytics
      expect(analyticsService.logEvent).toHaveBeenCalledWith('symptom_analysis_completed', {
        disease: analysisResult?.disease,
        confidence: analysisResult?.confidence,
        urgencyLevel: analysisResult?.urgencyLevel,
      });
    });

    it('debe manejar análisis con voz', async () => {
      // Mock voice recognition
      (voiceRecognitionService.recognize as jest.Mock).mockResolvedValue({
        text: 'Tengo tos y fiebre desde hace 3 días',
        confidence: 0.9,
      });

      // 1. Reconocimiento de voz
      const voiceResult = await voiceRecognitionService.recognize();
      expect(voiceResult.text).toBeDefined();

      // 2. Procesar texto reconocido
      const symptoms = [
        { name: 'tos', severity: 'moderate', durationDays: 3 },
        { name: 'fiebre', severity: 'mild', durationDays: 3 },
      ];

      // 3. Análisis
      const analysisResult = await useAppStore.getState().analyzeSymptoms(
        symptoms,
        'patient-1',
        {}
      );

      expect(analysisResult).toBeDefined();
    });

    it('debe sincronizar análisis offline al volver online', async () => {
      // 1. Crear análisis offline
      const symptoms = [
        { name: 'tos', severity: 'moderate', durationDays: 5 },
      ];

      const analysisResult = await useAppStore.getState().analyzeSymptoms(
        symptoms,
        'patient-1',
        {}
      );

      // 2. Verificar que está pendiente de sincronización
      const analyses = useAppStore.getState().offlineData.symptomAnalyses;
      const pending = analyses.find(a => a.syncStatus === 'pending');
      expect(pending).toBeDefined();

      // 3. Simular conexión online y sincronización
      const syncResult = await localStorageService.syncPendingData();
      expect(syncResult).toBeDefined();
    });
  });

  describe('Analysis with Medical History', () => {
    it('debe incluir historial médico en análisis', async () => {
      // 1. Crear historial médico previo
      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis previa',
        date: new Date().toISOString(),
        syncStatus: 'synced' as const,
      };
      await localStorageService.saveMedicalHistory(history);

      // 2. Análisis con contexto de historial
      const symptoms = [
        { name: 'tos', severity: 'moderate', durationDays: 5 },
      ];

      const histories = await localStorageService.getMedicalHistories();
      const context = {
        previousDiagnoses: histories.map(h => h.diagnosis),
      };

      const analysisResult = await useAppStore.getState().analyzeSymptoms(
        symptoms,
        'patient-1',
        context
      );

      expect(analysisResult).toBeDefined();
    });
  });
});

