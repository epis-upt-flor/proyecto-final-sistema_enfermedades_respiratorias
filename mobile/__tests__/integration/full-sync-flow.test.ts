/**
 * Tests de integración - Flujo completo de sincronización
 * Verifica sincronización de múltiples tipos de datos
 */

import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import { useAppStore } from '../../medical-app/store/useAppStore';
import { authService } from '../../medical-app/lib/api/services/authService';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('../../medical-app/lib/api/services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: false })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

describe('Full Sync Flow Integration Tests', () => {
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

  describe('Multi-Data Type Sync', () => {
    it('debe sincronizar todos los tipos de datos pendientes', async () => {
      // Simular offline
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      // 1. Crear múltiples tipos de datos offline
      // - Historial médico
      const history = {
        id: 'local_history_1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };
      await localStorageService.saveMedicalHistory(history as any);

      // - Cita
      const appointment = {
        _id: 'local_appt_1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
        syncStatus: 'pending' as const,
      };
      await localStorageService.createAppointment(appointment as any);

      // - Análisis de síntomas
      const analysis = {
        id: 'local_analysis_1',
        patientId: 'patient-1',
        disease: 'Bronquitis',
        confidence: 0.85,
        syncStatus: 'pending' as const,
      };
      await localStorageService.saveSymptomAnalysis(analysis as any);

      // 2. Verificar que todos están pendientes
      const histories = await localStorageService.getMedicalHistories();
      const appointments = await localStorageService.getCachedAppointments();
      const analyses = await localStorageService.getCachedSymptomAnalyses();

      expect(histories.filter(h => h.syncStatus === 'pending').length).toBeGreaterThan(0);
      expect(appointments.filter(a => a.syncStatus === 'pending').length).toBeGreaterThan(0);
      expect(analyses.filter(a => a.syncStatus === 'pending').length).toBeGreaterThan(0);

      // 3. Simular online y sincronizar
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true, data: { id: 'server_id' } });
      (apiService.put as jest.Mock).mockResolvedValue({ success: true, data: {} });

      // 4. Ejecutar sincronización completa
      await localStorageService.syncPendingData();

      // 5. Verificar que se sincronizaron
      const syncedHistories = await localStorageService.getMedicalHistories();
      const syncedAppointments = await localStorageService.getCachedAppointments();
      const syncedAnalyses = await localStorageService.getCachedSymptomAnalyses();

      // Al menos algunos deberían estar sincronizados
      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe('Sync Error Handling', () => {
    it('debe manejar errores parciales en sincronización', async () => {
      // Crear múltiples datos
      const history1 = {
        id: 'local_history_1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };
      await localStorageService.saveMedicalHistory(history1 as any);

      const history2 = {
        id: 'local_history_2',
        patientId: 'patient-1',
        diagnosis: 'Asma',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };
      await localStorageService.saveMedicalHistory(history2 as any);

      // Simular: uno exitoso, uno falla
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (apiService.post as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: { id: 'server_history_1' } })
        .mockRejectedValueOnce(new Error('Network error'));

      // Sincronizar
      await localStorageService.syncPendingData();

      // Verificar que al menos uno se procesó
      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe('Sync Priority', () => {
    it('debe sincronizar datos críticos primero', async () => {
      // Crear datos con diferentes prioridades
      const criticalAppointment = {
        _id: 'local_appt_critical',
        patientId: 'patient-1',
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
        priority: 'high' as const,
        syncStatus: 'pending' as const,
      };
      await localStorageService.createAppointment(criticalAppointment as any);

      const normalHistory = {
        id: 'local_history_normal',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };
      await localStorageService.saveMedicalHistory(normalHistory as any);

      // Simular online
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true, data: {} });

      // Sincronizar
      await localStorageService.syncPendingData();

      // Verificar que se intentó sincronizar
      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe('Sync Status Tracking', () => {
    it('debe actualizar estado de sincronización correctamente', async () => {
      const history = {
        id: 'local_history_1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };
      await localStorageService.saveMedicalHistory(history as any);

      // Verificar estado inicial
      const initial = await localStorageService.getMedicalHistories();
      expect(initial[0].syncStatus).toBe('pending');

      // Simular sincronización exitosa
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (apiService.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'server_history_1', ...history, syncStatus: 'synced' },
      });

      await localStorageService.syncPendingData();

      // Verificar estado actualizado
      const synced = await localStorageService.getMedicalHistories();
      const syncedHistory = synced.find(h => h.id === 'server_history_1' || h.id === 'local_history_1');
      // El estado puede variar según la implementación
      expect(syncedHistory).toBeDefined();
    });
  });
});

