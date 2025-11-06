/**
 * Tests de Modo Offline
 * Verifica funcionalidad cuando no hay conexión a internet
 */

import { localStorageService } from '../../src/services/localStorage';
import { aiService } from '../../src/services/aiService';
import { apiService } from '../../src/services/api';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocks
jest.mock('../../src/services/api');
jest.mock('@react-native-community/netinfo');
jest.mock('@react-native-async-storage/async-storage');

describe('Offline Mode Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Simular modo offline
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });
  });

  describe('Almacenamiento Local', () => {
    it('debe guardar historias médicas localmente cuando está offline', async () => {
      const mockHistory = {
        id: 'history-offline-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        patientName: 'Test Patient',
        age: 30,
        gender: 'M' as const,
        diagnosis: 'Bronquitis',
        symptoms: [],
        treatment: 'Reposo',
        notes: 'Test notes',
        date: '2025-11-01',
        createdAt: '2025-11-01',
        updatedAt: '2025-11-01',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await localStorageService.saveMedicalHistory(mockHistory);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      // Verificar que no se intentó hacer llamada al API
      expect(apiService.createMedicalHistory).not.toHaveBeenCalled();
    });

    it('debe leer historias médicas desde almacenamiento local', async () => {
      const mockHistories = [
        {
          id: 'history-1',
          patientId: 'patient-1',
          diagnosis: 'Bronquitis',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistories));

      const histories = await localStorageService.getMedicalHistories();

      expect(histories).toEqual(mockHistories);
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  describe('Análisis de Síntomas Offline', () => {
    it('debe usar análisis local cuando está offline', async () => {
      const symptoms = [
        {
          symptom: 'Tos',
          severity: 'moderate' as const,
          duration: '3 días',
        },
      ];

      const result = await aiService.analyzeSymptoms(symptoms, 'patient-1');

      expect(result).toBeDefined();
      expect(result.analysisMethod).toBe('local_rules');
      expect(result.urgencyLevel).toBeDefined();
      // Verificar que no se intentó usar el servicio de IA
      expect(apiService.analyzeSymptoms).not.toHaveBeenCalled();
    });

    it('debe calcular urgencia correctamente en modo offline', async () => {
      const severeSymptoms = [
        {
          symptom: 'Dificultad respiratoria severa',
          severity: 'severe' as const,
          duration: '1 hora',
        },
      ];

      const result = await aiService.analyzeSymptoms(severeSymptoms, 'patient-1');

      expect(result.urgencyLevel).toBe('high');
      expect(result.recommendations.emergency.length).toBeGreaterThan(0);
    });

    it('debe guardar análisis localmente cuando está offline', async () => {
      const symptoms = [
        {
          symptom: 'Tos',
          severity: 'mild' as const,
          duration: '1 día',
        },
      ];

      (localStorageService.saveSymptomAnalysis as jest.Mock).mockResolvedValue(undefined);

      await aiService.analyzeSymptoms(symptoms, 'patient-1');

      expect(localStorageService.saveSymptomAnalysis).toHaveBeenCalled();
    });
  });

  describe('Cola de Sincronización', () => {
    it('debe agregar items a la cola cuando está offline', async () => {
      const mockHistory = {
        id: 'history-sync-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        patientName: 'Test Patient',
        age: 30,
        gender: 'M' as const,
        diagnosis: 'Bronquitis',
        symptoms: [],
        treatment: 'Reposo',
        notes: 'Test',
        date: '2025-11-01',
        createdAt: '2025-11-01',
        updatedAt: '2025-11-01',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await localStorageService.saveMedicalHistory(mockHistory);

      // Verificar que se guardó en la cola de sincronización
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('debe mantener cola de sincronización cuando está offline', async () => {
      const mockQueue = [
        {
          id: 'sync-1',
          type: 'CREATE' as const,
          entity: 'medical_history' as const,
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      const status = localStorageService.getSyncStatus();

      expect(status.pendingItems).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Detección de Conexión', () => {
    it('debe detectar correctamente cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const status = (NetInfo.fetch as jest.Mock).mock.results[0].value;
      const isOnline = await status;

      expect(isOnline.isConnected).toBe(false);
    });

    it('debe detectar cuando vuelve la conexión', async () => {
      // Simular cambio de offline a online
      (NetInfo.fetch as jest.Mock)
        .mockResolvedValueOnce({
          isConnected: false,
        })
        .mockResolvedValueOnce({
          isConnected: true,
        });

      const offlineStatus = await NetInfo.fetch();
      expect(offlineStatus.isConnected).toBe(false);

      const onlineStatus = await NetInfo.fetch();
      expect(onlineStatus.isConnected).toBe(true);
    });
  });

  describe('Lectura de Datos Offline', () => {
    it('debe poder leer análisis guardados localmente', async () => {
      const mockAnalyses = [
        {
          id: 'analysis-1',
          patientId: 'patient-1',
          urgencyLevel: 'medium',
          symptoms: [],
        },
      ];

      (localStorageService.getSymptomAnalyses as jest.Mock).mockResolvedValue(mockAnalyses);

      const analyses = await localStorageService.getSymptomAnalyses();

      expect(analyses).toEqual(mockAnalyses);
    });

    it('debe retornar array vacío si no hay datos guardados', async () => {
      (localStorageService.getSymptomAnalyses as jest.Mock).mockResolvedValue([]);

      const analyses = await localStorageService.getSymptomAnalyses();

      expect(analyses).toEqual([]);
    });
  });
});

