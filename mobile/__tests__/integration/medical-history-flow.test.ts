/**
 * Tests de integración - Flujo completo de historial médico
 * Verifica crear, editar, sincronizar y buscar historial
 */

import { useAppStore } from '../../medical-app/store/useAppStore';
import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import { medicalHistoryService } from '../../medical-app/lib/api/services/medicalHistoryService';
import { dashboardService } from '../../medical-app/lib/api/services/dashboardService';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('../../medical-app/lib/api/services/dashboardService');
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

describe('Medical History Flow Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localStorageService.clearAllData();
    
    useAppStore.getState().setUser({
      id: 'patient-1',
      email: 'patient@example.com',
      name: 'Test Patient',
      role: 'patient',
    });
  });

  describe('Create Medical History Flow', () => {
    it('debe completar flujo de creación de historial', async () => {
      const historyData = {
        patientId: 'patient-1',
        patientName: 'Test Patient',
        doctorId: 'doctor-1',
        age: 30,
        gender: 'M' as const,
        diagnosis: 'Bronquitis',
        symptoms: [
          { name: 'tos', severity: 'moderate' as const, duration: '3 días' },
        ],
        treatment: 'Reposo y medicación',
        notes: 'Paciente con tos persistente',
        date: new Date().toISOString(),
      };

      // 1. Crear historial
      await useAppStore.getState().createMedicalHistory(historyData);

      // 2. Verificar que se guarda en store
      const histories = useAppStore.getState().offlineData.medicalHistories;
      expect(histories.length).toBeGreaterThan(0);
      expect(histories[0].diagnosis).toBe('Bronquitis');

      // 3. Verificar que se guarda en localStorage
      const cached = await localStorageService.getMedicalHistories();
      expect(cached.length).toBeGreaterThan(0);

      // 4. Verificar analytics
      expect(analyticsService.logEvent).toHaveBeenCalledWith('medical_history_created', {
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
      });
    });

    it('debe crear historial offline y sincronizar después', async () => {
      // Simular offline
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const historyData = {
        id: 'local_history_1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Asma',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };

      await localStorageService.saveMedicalHistory(historyData as any);

      // Verificar pendiente
      const cached = await localStorageService.getMedicalHistories();
      const pending = cached.find(h => h.syncStatus === 'pending');
      expect(pending).toBeDefined();

      // Simular online
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'server_history_1', ...historyData, syncStatus: 'synced' },
      });

      // Sincronizar
      await localStorageService.syncPendingData();

      // Verificar sincronización
      const synced = await localStorageService.getMedicalHistories();
      const syncedHistory = synced.find(h => h.id === 'server_history_1');
      expect(syncedHistory).toBeDefined();
    });
  });

  describe('Edit Medical History Flow', () => {
    it('debe completar flujo de edición de historial', async () => {
      // 1. Crear historial inicial
      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'synced' as const,
      };

      await localStorageService.saveMedicalHistory(history as any);

      // 2. Editar historial
      const updatedHistory = {
        ...history,
        diagnosis: 'Bronquitis crónica',
        notes: 'Actualizado',
      };

      await useAppStore.getState().updateMedicalHistory('history-1', updatedHistory);

      // 3. Verificar actualización
      const cached = await localStorageService.getMedicalHistories();
      const updated = cached.find(h => h.id === 'history-1');
      expect(updated?.diagnosis).toBe('Bronquitis crónica');
      expect(updated?.notes).toBe('Actualizado');
    });
  });

  describe('Delete Medical History Flow', () => {
    it('debe completar flujo de eliminación de historial', async () => {
      // 1. Crear historial
      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'synced' as const,
      };

      await localStorageService.saveMedicalHistory(history as any);

      // 2. Eliminar historial
      await useAppStore.getState().deleteMedicalHistory('history-1');

      // 3. Verificar eliminación
      const cached = await localStorageService.getMedicalHistories();
      const deleted = cached.find(h => h.id === 'history-1');
      expect(deleted).toBeUndefined();

      // 4. Verificar analytics
      expect(analyticsService.logEvent).toHaveBeenCalledWith('medical_history_deleted', {
        historyId: 'history-1',
      });
    });
  });

  describe('Search Medical History', () => {
    it('debe buscar historiales por criterios', async () => {
      const histories = [
        {
          id: 'history-1',
          patientName: 'Juan Pérez',
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'synced' as const,
        },
        {
          id: 'history-2',
          patientName: 'María García',
          diagnosis: 'Asma',
          date: new Date().toISOString(),
          syncStatus: 'synced' as const,
        },
      ];

      histories.forEach(h => {
        localStorageService.saveMedicalHistory(h as any);
      });

      // Buscar por nombre
      const cached = await localStorageService.getMedicalHistories();
      const searchResults = cached.filter(h => 
        h.patientName.toLowerCase().includes('juan')
      );

      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults[0].patientName).toBe('Juan Pérez');
    });
  });
});

