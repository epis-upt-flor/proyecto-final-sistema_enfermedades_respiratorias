/**
 * Tests de Performance - Sincronización
 * Verifica performance de sincronización de datos offline/online
 */

import { localStorageService } from '../../src/services/localStorage';
import { apiService } from '../../src/services/api';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('../../src/services/api', () => ({
  apiService: {
    post: jest.fn(),
    put: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

// Performance thresholds
const SYNC_THRESHOLD_MS = 5000; // 5 segundos para sincronizar
const SYNC_ITEM_THRESHOLD_MS = 100; // 100ms por item
const BATCH_SYNC_THRESHOLD_MS = 2000; // 2 segundos para batch

describe('Sync Performance Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localStorageService.clearAllData();
    (apiService.post as jest.Mock).mockResolvedValue({ success: true, data: {} });
    (apiService.put as jest.Mock).mockResolvedValue({ success: true, data: {} });
  });

  describe('Single Item Sync', () => {
    it('debe sincronizar un historial médico en menos de 100ms', async () => {
      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      };

      await localStorageService.saveMedicalHistory(history as any);

      const startTime = performance.now();
      await localStorageService.syncPendingData();
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      expect(syncTime).toBeLessThan(SYNC_ITEM_THRESHOLD_MS);
    });

    it('debe sincronizar una cita en menos de 100ms', async () => {
      const appointment = {
        _id: 'appt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
        syncStatus: 'pending' as const,
      };

      await localStorageService.createAppointment(appointment as any);

      const startTime = performance.now();
      await localStorageService.syncPendingData();
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      expect(syncTime).toBeLessThan(SYNC_ITEM_THRESHOLD_MS);
    });
  });

  describe('Batch Sync Performance', () => {
    it('debe sincronizar 10 items en menos de 2 segundos', async () => {
      // Crear 10 historiales pendientes
      for (let i = 0; i < 10; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientId: 'patient-1',
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'pending' as const,
        } as any);
      }

      const startTime = performance.now();
      await localStorageService.syncPendingData();
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      expect(syncTime).toBeLessThan(BATCH_SYNC_THRESHOLD_MS);
    });

    it('debe sincronizar 50 items en menos de 5 segundos', async () => {
      // Crear 50 historiales pendientes
      for (let i = 0; i < 50; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientId: 'patient-1',
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'pending' as const,
        } as any);
      }

      const startTime = performance.now();
      await localStorageService.syncPendingData();
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      expect(syncTime).toBeLessThan(SYNC_THRESHOLD_MS);
    });

    it('debe sincronizar múltiples tipos de datos eficientemente', async () => {
      // Crear datos mixtos
      for (let i = 0; i < 10; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientId: 'patient-1',
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'pending' as const,
        } as any);

        await localStorageService.createAppointment({
          _id: `appt-${i}`,
          patientId: 'patient-1',
          doctorId: 'doctor-1',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          durationMinutes: 30,
          syncStatus: 'pending' as const,
        } as any);
      }

      const startTime = performance.now();
      await localStorageService.syncPendingData();
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      expect(syncTime).toBeLessThan(BATCH_SYNC_THRESHOLD_MS);
    });
  });

  describe('Network Performance', () => {
    it('debe manejar cambios de red sin degradación', async () => {
      // Simular offline
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      await localStorageService.saveMedicalHistory({
        id: 'history-1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      } as any);

      // Simular online
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      const startTime = performance.now();
      await localStorageService.syncPendingData();
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      expect(syncTime).toBeLessThan(SYNC_ITEM_THRESHOLD_MS);
    });

    it('debe manejar errores de red sin bloquear', async () => {
      (apiService.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await localStorageService.saveMedicalHistory({
        id: 'history-1',
        patientId: 'patient-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'pending' as const,
      } as any);

      const startTime = performance.now();
      await localStorageService.syncPendingData();
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      // Incluso con error, no debe bloquear
      expect(syncTime).toBeLessThan(SYNC_ITEM_THRESHOLD_MS * 2);
    });
  });

  describe('Concurrent Sync Performance', () => {
    it('debe manejar sincronizaciones concurrentes eficientemente', async () => {
      // Crear múltiples items
      for (let i = 0; i < 20; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientId: 'patient-1',
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'pending' as const,
        } as any);
      }

      const startTime = performance.now();
      
      // Simular sincronizaciones concurrentes
      await Promise.all([
        localStorageService.syncPendingData(),
        localStorageService.syncPendingData(),
      ]);
      
      const endTime = performance.now();

      const syncTime = endTime - startTime;
      // Las sincronizaciones concurrentes no deben tomar mucho más tiempo
      expect(syncTime).toBeLessThan(BATCH_SYNC_THRESHOLD_MS * 1.5);
    });
  });
});

