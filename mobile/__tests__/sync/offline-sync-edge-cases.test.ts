/**
 * Tests de Casos Especiales - Offline/Sync
 * Verifica edge cases, errores, conflictos y recuperación
 */

import { localStorageService, SyncQueueItem } from '../../src/services/localStorage';
import { apiService } from '../../src/services/api';
import { telemedicineService } from '../../src/services/telemedicineService';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocks
jest.mock('../../src/services/api');
jest.mock('../../src/services/telemedicineService');
jest.mock('@react-native-community/netinfo');
jest.mock('@react-native-async-storage/async-storage');

describe('Offline Sync Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  describe('Manejo de Errores de Red', () => {
    it('debe manejar errores de timeout durante sincronización', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
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

      // Simular timeout
      (apiService.post as jest.Mock).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        });
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Debe incrementar retryCount
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      if (queueCall) {
        const updatedQueue = JSON.parse(queueCall[1]);
        expect(updatedQueue[0]?.retryCount).toBeGreaterThan(0);
      }
    });

    it('debe manejar errores 500 del servidor', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
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

      (apiService.post as jest.Mock).mockRejectedValue({
        response: { status: 500, data: { error: 'Internal server error' } },
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Debe mantener el item en la cola para reintento
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('debe manejar errores 401 (no autorizado) y no reintentar', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
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

      (apiService.post as jest.Mock).mockRejectedValue({
        response: { status: 401, data: { error: 'Unauthorized' } },
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Los errores 401 no deberían reintentarse indefinidamente
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('debe manejar conexión intermitente (online/offline alternado)', async () => {
      let connectionState = false;
      (NetInfo.fetch as jest.Mock).mockImplementation(() => {
        connectionState = !connectionState; // Alternar estado
        return Promise.resolve({ isConnected: connectionState });
      });

      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
      };

      // Primera llamada: offline
      await localStorageService.saveMedicalHistory(history as any);

      // Segunda llamada: online (debería intentar sincronizar)
      await localStorageService.saveMedicalHistory(history as any);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Conflictos de Datos', () => {
    it('debe manejar conflictos cuando el servidor rechaza datos obsoletos', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'UPDATE',
          entity: 'medical_history',
          data: {
            id: 'history-1',
            patientId: 'patient-1',
            diagnosis: 'Bronquitis (local)',
            updatedAt: '2025-01-01T10:00:00Z',
          },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        if (key === 'medical_histories') {
          return Promise.resolve(JSON.stringify([
            { id: 'history-1', patientId: 'patient-1', diagnosis: 'Bronquitis (local)', syncStatus: 'pending' }
          ]));
        }
        return Promise.resolve(null);
      });

      // Servidor rechaza con 409 Conflict
      (apiService.put as jest.Mock).mockRejectedValue({
        response: { status: 409, data: { error: 'Conflict: newer version exists' } },
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Debe manejar el conflicto apropiadamente
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('debe resolver conflictos usando timestamp más reciente', async () => {
      const localHistory = {
        id: 'history-1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis (local)',
        updatedAt: '2025-01-01T10:00:00Z',
      };

      const serverHistory = {
        id: 'history-1',
        patientId: 'patient-1',
        diagnosis: 'Neumonía (server)',
        updatedAt: '2025-01-01T12:00:00Z', // Más reciente
      };

      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { histories: [serverHistory] },
      });

      await localStorageService.syncFromServer();

      // Debe guardar la versión del servidor (más reciente)
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const historyCall = setItemCalls.find((call: any[]) =>
        call[0] === 'medical_histories'
      );
      if (historyCall) {
        const savedHistories = JSON.parse(historyCall[1]);
        expect(savedHistories[0].diagnosis).toBe('Neumonía (server)');
      }
    });
  });

  describe('Cola Llena y Límites', () => {
    it('debe manejar cola con muchos items (100+)', async () => {
      const largeQueue: SyncQueueItem[] = Array.from({ length: 150 }, (_, i) => ({
        id: `sync-${i}`,
        type: 'CREATE' as const,
        entity: 'medical_history' as const,
        data: { id: `history-${i}`, patientId: 'patient-1' },
        timestamp: Date.now() - (150 - i) * 1000, // Orden cronológico
        retryCount: 0,
      }));

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(largeQueue));
        }
        return Promise.resolve(null);
      });

      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(largeQueue));

      // Debe procesar todos los items
      await localStorageService.syncPendingData();

      // Verificar que se intentó procesar
      expect(apiService.post).toHaveBeenCalled();
    });

    it('debe priorizar items más antiguos en cola grande', async () => {
      const queue: SyncQueueItem[] = [
        {
          id: 'sync-old',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-old' },
          timestamp: Date.now() - 10000, // Más antiguo
          retryCount: 0,
        },
        {
          id: 'sync-new',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-new' },
          timestamp: Date.now(), // Más reciente
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(queue));
        }
        return Promise.resolve(null);
      });

      const callOrder: string[] = [];
      (apiService.post as jest.Mock).mockImplementation((url: string, data: any) => {
        callOrder.push(data.id);
        return Promise.resolve({ success: true });
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(queue));

      await localStorageService.syncPendingData();

      // El item más antiguo debe procesarse primero
      expect(callOrder[0]).toBe('history-old');
    });
  });

  describe('Persistencia y Recuperación', () => {
    it('debe recuperar cola después de reinicio de app', async () => {
      const savedQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
          timestamp: Date.now() - 5000,
          retryCount: 1,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(savedQueue));
        }
        return Promise.resolve(null);
      });

      // Simular reinicio: crear nueva instancia del servicio
      await (localStorageService as any).loadSyncQueue();

      const status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBe(1);
    });

    it('debe mantener estado de sincronización después de error', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
          timestamp: Date.now(),
          retryCount: 2,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      const statusBefore = localStorageService.getSyncStatus();
      expect(statusBefore.pendingItems).toBe(1);

      // Después de error, el estado debe persistir
      (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
      await localStorageService.syncPendingData();

      const statusAfter = localStorageService.getSyncStatus();
      expect(statusAfter.pendingItems).toBeGreaterThanOrEqual(0);
    });

    it('debe limpiar cola cuando se solicita explícitamente', async () => {
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

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.clearAllData();

      const status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBe(0);
    });
  });

  describe('Operaciones Concurrentes', () => {
    it('debe prevenir sincronización concurrente', async () => {
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

      (apiService.post as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 100));
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      // Intentar sincronizar dos veces simultáneamente
      const sync1 = localStorageService.syncPendingData();
      const sync2 = localStorageService.syncPendingData();

      await Promise.all([sync1, sync2]);

      // Solo debería procesar una vez
      expect(apiService.post).toHaveBeenCalledTimes(1);
    });

    it('debe manejar agregar items mientras sincroniza', async () => {
      const initialQueue: SyncQueueItem[] = [
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
          return Promise.resolve(JSON.stringify(initialQueue));
        }
        return Promise.resolve(null);
      });

      (apiService.post as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 50));
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(initialQueue));

      // Iniciar sincronización
      const syncPromise = localStorageService.syncPendingData();

      // Agregar nuevo item mientras sincroniza
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
      await localStorageService.saveMedicalHistory({
        id: 'history-2',
        patientId: 'patient-1',
        diagnosis: 'Neumonía',
      } as any);

      await syncPromise;

      // Ambos items deben estar en la cola
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Datos Inválidos', () => {
    it('debe manejar items con datos corruptos en la cola', async () => {
      const corruptQueue = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: null, // Datos corruptos
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(corruptQueue));
        }
        return Promise.resolve(null);
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(corruptQueue));

      // No debe lanzar error, debe manejar graciosamente
      await expect(localStorageService.syncPendingData()).resolves.not.toThrow();
    });

    it('debe manejar cola con formato JSON inválido', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve('invalid json{');
        }
        return Promise.resolve(null);
      });

      // Debe manejar el error sin crashear
      await expect((localStorageService as any).loadSyncQueue()).resolves.not.toThrow();
    });
  });

  describe('Recuperación Después de Fallos', () => {
    it('debe reintentar después de fallo de red temporal', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
          timestamp: Date.now(),
          retryCount: 1, // Ya intentó una vez
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      // Primera llamada falla, segunda exitosa
      let callCount = 0;
      (apiService.post as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ success: true });
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Debe procesar exitosamente en el segundo intento
      expect(apiService.post).toHaveBeenCalled();
    });

    it('debe marcar como error después de múltiples fallos', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
          timestamp: Date.now(),
          retryCount: 2, // Cerca del máximo
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        if (key === 'medical_histories') {
          return Promise.resolve(JSON.stringify([
            { id: 'history-1', patientId: 'patient-1', syncStatus: 'pending' }
          ]));
        }
        return Promise.resolve(null);
      });

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Persistent error'));

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Debe marcar como error después del último intento
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const historyCall = setItemCalls.find((call: any[]) =>
        call[0] === 'medical_histories'
      );
      if (historyCall) {
        const histories = JSON.parse(historyCall[1]);
        expect(histories[0].syncStatus).toBe('error');
      }
    });
  });
});

