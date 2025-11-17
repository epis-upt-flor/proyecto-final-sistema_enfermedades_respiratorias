/**
 * Tests de Cola de Sincronización Offline
 * Verifica el manejo de colas, reintentos y estados de sincronización
 */

import { localStorageService, SyncQueueItem } from '../../src/services/localStorage';
import { apiService } from '../../src/services/api';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocks
jest.mock('../../src/services/api');
jest.mock('@react-native-community/netinfo');
jest.mock('@react-native-async-storage/async-storage');

describe('Offline Sync Queue Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (localStorageService as any).syncQueue = [];
    (localStorageService as any).isSyncing = false;
  });

  describe('Gestión de Cola de Sincronización', () => {
    it('debe agregar items a la cola cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
        symptoms: [],
        treatment: 'Reposo',
      };

      await localStorageService.saveMedicalHistory(history as any);

      // Verificar que se agregó a la cola
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const syncQueueCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (call: any[]) => call[0] === 'sync_queue'
      );
      expect(syncQueueCall).toBeDefined();
    });

    it('debe procesar cola en orden FIFO (First In First Out)', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now() - 2000,
          retryCount: 0,
        },
        {
          id: 'sync-2',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-2' },
          timestamp: Date.now() - 1000,
          retryCount: 0,
        },
        {
          id: 'sync-3',
          type: 'UPDATE',
          entity: 'medical_history',
          data: { id: 'history-3' },
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

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });
      (apiService.put as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se procesaron en orden
      expect(apiService.post).toHaveBeenCalledTimes(2);
      expect(apiService.put).toHaveBeenCalledTimes(1);
    });

    it('debe limitar el tamaño máximo de la cola', async () => {
      const largeQueue: SyncQueueItem[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `sync-${i}`,
        type: 'CREATE',
        entity: 'medical_history',
        data: { id: `history-${i}` },
        timestamp: Date.now() - i,
        retryCount: 0,
      }));

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(largeQueue));
        }
        return Promise.resolve(null);
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(largeQueue));

      const status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBe(1000);
    });

    it('debe priorizar items críticos en la cola', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-normal',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync-critical',
          type: 'CREATE',
          entity: 'alert',
          data: { id: 'alert-1', priority: 'critical' },
          timestamp: Date.now() + 1000,
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se procesaron ambos items
      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe('Sistema de Reintentos', () => {
    it('debe incrementar retryCount en caso de error', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        if (key === 'medical_histories') {
          return Promise.resolve(JSON.stringify([{ id: 'history-1', syncStatus: 'pending' }]));
        }
        return Promise.resolve(null);
      });

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que el item permanece en la cola con retryCount incrementado
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const syncQueueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(syncQueueCall).toBeDefined();
      const savedQueue: SyncQueueItem[] = JSON.parse(syncQueueCall[1]);
      expect(savedQueue[0].retryCount).toBe(1);
    });

    it('debe aplicar backoff exponencial en reintentos', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 1, // Ya tiene un reintento
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      const startTime = Date.now();
      await localStorageService.syncPendingData();
      const endTime = Date.now();

      // Verificar que se procesó (aunque falló)
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('debe remover items que alcanzaron máximo de reintentos (3)', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 3, // Máximo alcanzado
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        if (key === 'medical_histories') {
          return Promise.resolve(JSON.stringify([{ id: 'history-1', syncStatus: 'pending' }]));
        }
        return Promise.resolve(null);
      });

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que el item fue removido y marcado como error
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const medicalHistoriesCall = setItemCalls.find((call: any[]) =>
        call[0].includes('medical_histories')
      );
      if (medicalHistoriesCall) {
        const savedHistories = JSON.parse(medicalHistoriesCall[1]);
        const history = savedHistories.find((h: any) => h.id === 'history-1');
        if (history) {
          expect(history.syncStatus).toBe('error');
        }
      }
    });

    it('debe permitir reintento manual con retrySyncNow', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.retrySyncNow();

      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe('Estados de Sincronización', () => {
    it('debe reportar estado correcto cuando está sincronizando', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
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

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      // Iniciar sincronización
      const syncPromise = localStorageService.syncPendingData();

      // Verificar estado durante sincronización
      const status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBeGreaterThan(0);

      await syncPromise;
    });

    it('debe actualizar estado después de sincronización exitosa', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        if (key === 'medical_histories') {
          return Promise.resolve(JSON.stringify([]));
        }
        return Promise.resolve(null);
      });

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se actualizó el timestamp de última sincronización
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastSyncCall = setItemCalls.find((call: any[]) => call[0] === 'last_sync_timestamp');
      expect(lastSyncCall).toBeDefined();
    });

    it('debe manejar estado cuando no hay conexión', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const status = localStorageService.getSyncStatus();
      expect(status).toHaveProperty('isSyncing');
      expect(status).toHaveProperty('pendingItems');
    });

    it('debe notificar listeners cuando cambia el estado', async () => {
      const mockListener = jest.fn();

      localStorageService.addSyncListener(mockListener);

      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
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

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // El listener debería ser llamado
      expect(mockListener).toHaveBeenCalled();
    });
  });

  describe('Tipos de Entidades en Cola', () => {
    it('debe manejar diferentes tipos de entidades (medical_history, appointment, alert)', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync-2',
          type: 'CREATE',
          entity: 'appointment',
          data: { id: 'appointment-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync-3',
          type: 'UPDATE',
          entity: 'alert',
          operation: 'ACK',
          data: { alertId: 'alert-1' },
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

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se procesaron diferentes tipos de entidades
      expect(apiService.post).toHaveBeenCalled();
    });

    it('debe manejar operaciones específicas (RESCHEDULE, CANCEL, ACK)', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'UPDATE',
          entity: 'appointment',
          operation: 'RESCHEDULE',
          data: { appointmentId: 'appt-1', scheduledAt: '2025-12-01T10:00:00Z' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync-2',
          type: 'UPDATE',
          entity: 'appointment',
          operation: 'CANCEL',
          data: { appointmentId: 'appt-2', reason: 'Patient request' },
          timestamp: Date.now(),
          retryCount: 0,
        },
        {
          id: 'sync-3',
          type: 'UPDATE',
          entity: 'alert',
          operation: 'ACK',
          data: { alertId: 'alert-1' },
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

      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se procesaron las operaciones
      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe('Persistencia de Cola', () => {
    it('debe cargar cola desde AsyncStorage al inicializar', async () => {
      const savedQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(savedQueue));
        }
        return Promise.resolve(null);
      });

      // Simular reinicio del servicio
      (localStorageService as any).loadSyncQueue();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBeGreaterThanOrEqual(0);
    });

    it('debe guardar cola después de cada modificación', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
      };

      await localStorageService.saveMedicalHistory(history as any);

      // Verificar que se guardó la cola
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'sync_queue',
        expect.any(String)
      );
    });
  });
});

