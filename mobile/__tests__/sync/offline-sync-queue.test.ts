/**
 * Tests de Cola de Sincronización Offline
 * Verifica el manejo de colas, prioridades y orden de procesamiento
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

describe('Offline Sync Queue Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  describe('Gestión de Cola', () => {
    it('debe agregar items a la cola cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
        symptoms: [],
      };

      await localStorageService.saveMedicalHistory(history as any);

      // Verificar que se agregó a la cola
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(queueCall).toBeDefined();
      
      const queueData = JSON.parse(queueCall[1]);
      expect(queueData.length).toBeGreaterThan(0);
      expect(queueData[0].entity).toBe('medical_history');
      expect(queueData[0].type).toBe('CREATE');
    });

    it('debe mantener orden FIFO en la cola', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const history1 = { id: 'history-1', patientId: 'patient-1', diagnosis: 'Bronquitis' };
      const history2 = { id: 'history-2', patientId: 'patient-1', diagnosis: 'Neumonía' };

      await localStorageService.saveMedicalHistory(history1 as any);
      await new Promise(resolve => setTimeout(resolve, 10)); // Pequeño delay
      await localStorageService.saveMedicalHistory(history2 as any);

      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      const queueData = JSON.parse(queueCall[1]);
      
      // El primer item debe tener timestamp menor
      expect(queueData[0].timestamp).toBeLessThanOrEqual(queueData[1].timestamp);
    });

    it('debe procesar cola completa cuando vuelve la conexión', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1', diagnosis: 'Bronquitis' },
          timestamp: Date.now() - 2000,
          retryCount: 0,
        },
        {
          id: 'sync-2',
          type: 'CREATE',
          entity: 'appointment',
          data: { patientId: 'patient-1', scheduledAt: '2025-01-15T10:00:00Z' },
          timestamp: Date.now() - 1000,
          retryCount: 0,
        },
        {
          id: 'sync-3',
          type: 'UPDATE',
          entity: 'medical_history',
          data: { id: 'history-2', patientId: 'patient-1', diagnosis: 'Neumonía' },
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
            { id: 'history-2', patientId: 'patient-1', diagnosis: 'Neumonía', syncStatus: 'pending' }
          ]));
        }
        return Promise.resolve(null);
      });

      (apiService.post as jest.Mock).mockResolvedValue({ success: true });
      (apiService.put as jest.Mock).mockResolvedValue({ success: true });
      (telemedicineService.createAppointment as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se procesaron todos los items
      expect(apiService.post).toHaveBeenCalled();
      expect(apiService.put).toHaveBeenCalled();
      expect(telemedicineService.createAppointment).toHaveBeenCalled();
    });

    it('debe manejar diferentes tipos de entidades en la cola', async () => {
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
          data: { patientId: 'patient-1' },
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

      (apiService.post as jest.Mock).mockResolvedValue({ success: true });
      (telemedicineService.createAppointment as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se procesaron diferentes tipos de entidades
      expect(apiService.post).toHaveBeenCalledTimes(2); // medical_history y alert
      expect(telemedicineService.createAppointment).toHaveBeenCalled();
    });
  });

  describe('Reintentos', () => {
    it('debe incrementar retryCount en caso de error', async () => {
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

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se guardó la cola con retryCount incrementado
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(queueCall).toBeDefined();
      
      const updatedQueue = JSON.parse(queueCall[1]);
      expect(updatedQueue[0].retryCount).toBe(1);
    });

    it('debe marcar como error después de 3 reintentos fallidos', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
          timestamp: Date.now(),
          retryCount: 2, // Un intento más y alcanza el máximo
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

      // Verificar que se marcó como error en el almacenamiento local
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const historyCall = setItemCalls.find((call: any[]) => 
        call[0] === 'medical_histories'
      );
      expect(historyCall).toBeDefined();
      
      const histories = JSON.parse(historyCall[1]);
      expect(histories[0].syncStatus).toBe('error');
    });

    it('debe remover item de la cola después de máximo de reintentos', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
          timestamp: Date.now(),
          retryCount: 3, // Máximo alcanzado
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

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Final error'));

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que el item fue removido de la cola
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(queueCall).toBeDefined();
      
      const updatedQueue = JSON.parse(queueCall[1]);
      expect(updatedQueue.length).toBe(0); // Cola vacía después de remover
    });

    it('debe permitir reintento manual con retrySyncNow', async () => {
      const mockQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
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

      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.retrySyncNow();

      expect(apiService.post).toHaveBeenCalled();
    });
  });

  describe('Estados de Sincronización', () => {
    it('debe retornar estado correcto cuando hay items pendientes', () => {
      (localStorageService as any).syncQueue = [
        { id: 'sync-1', type: 'CREATE', entity: 'medical_history', data: {}, timestamp: Date.now(), retryCount: 0 },
        { id: 'sync-2', type: 'UPDATE', entity: 'appointment', data: {}, timestamp: Date.now(), retryCount: 0 },
      ];
      (localStorageService as any).isSyncing = false;

      const status = localStorageService.getSyncStatus();

      expect(status.pendingItems).toBe(2);
      expect(status.isSyncing).toBe(false);
    });

    it('debe retornar estado de sincronización en progreso', () => {
      (localStorageService as any).syncQueue = [
        { id: 'sync-1', type: 'CREATE', entity: 'medical_history', data: {}, timestamp: Date.now(), retryCount: 0 },
      ];
      (localStorageService as any).isSyncing = true;

      const status = localStorageService.getSyncStatus();

      expect(status.isSyncing).toBe(true);
      expect(status.pendingItems).toBe(1);
    });

    it('debe actualizar estado después de sincronización exitosa', async () => {
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
        if (key === 'medical_histories') {
          return Promise.resolve(JSON.stringify([
            { id: 'history-1', patientId: 'patient-1', syncStatus: 'pending' }
          ]));
        }
        return Promise.resolve(null);
      });

      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que el estado se actualizó
      const status = localStorageService.getSyncStatus();
      expect(status.isSyncing).toBe(false);
    });

    it('debe mantener timestamp de última sincronización', async () => {
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

      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // Verificar que se guardó el timestamp
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastSyncCall = setItemCalls.find((call: any[]) => call[0] === 'last_sync_timestamp');
      expect(lastSyncCall).toBeDefined();
    });
  });

  describe('Operaciones Específicas', () => {
    it('debe manejar CREATE de appointment offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const appointment = {
        patientId: 'patient-1',
        scheduledAt: '2025-01-15T10:00:00Z',
        type: 'consultation',
      };

      await localStorageService.createAppointment(appointment);

      // Verificar que se agregó a la cola
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(queueCall).toBeDefined();
      
      const queueData = JSON.parse(queueCall[1]);
      expect(queueData.some((item: SyncQueueItem) => 
        item.entity === 'appointment' && item.type === 'CREATE'
      )).toBe(true);
    });

    it('debe manejar RESCHEDULE de appointment offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      await localStorageService.rescheduleAppointment('appointment-1', '2025-01-20T14:00:00Z');

      // Verificar que se agregó a la cola
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(queueCall).toBeDefined();
      
      const queueData = JSON.parse(queueCall[1]);
      expect(queueData.some((item: SyncQueueItem) => 
        item.entity === 'appointment' && 
        item.operation === 'RESCHEDULE' &&
        item.data.appointmentId === 'appointment-1'
      )).toBe(true);
    });

    it('debe manejar CANCEL de appointment offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      await localStorageService.cancelAppointment('appointment-1', 'Patient request');

      // Verificar que se agregó a la cola
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(queueCall).toBeDefined();
      
      const queueData = JSON.parse(queueCall[1]);
      expect(queueData.some((item: SyncQueueItem) => 
        item.entity === 'appointment' && 
        item.operation === 'CANCEL' &&
        item.data.appointmentId === 'appointment-1'
      )).toBe(true);
    });

    it('debe manejar ACK de alert offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      await localStorageService.ackAlert('alert-1');

      // Verificar que se agregó a la cola
      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const queueCall = setItemCalls.find((call: any[]) => call[0] === 'sync_queue');
      expect(queueCall).toBeDefined();
      
      const queueData = JSON.parse(queueCall[1]);
      expect(queueData.some((item: SyncQueueItem) => 
        item.entity === 'alert' && 
        item.operation === 'ACK' &&
        item.data.alertId === 'alert-1'
      )).toBe(true);
    });
  });

  describe('Listeners', () => {
    it('debe notificar listeners cuando se agrega item a la cola', async () => {
      const mockListener = jest.fn();
      localStorageService.addSyncListener(mockListener);

      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const history = {
        id: 'history-1',
        patientId: 'patient-1',
        diagnosis: 'Bronquitis',
      };

      await localStorageService.saveMedicalHistory(history as any);

      // El listener debería ser llamado
      expect(mockListener).toHaveBeenCalled();
    });

    it('debe notificar listeners durante sincronización', async () => {
      const mockListener = jest.fn();
      localStorageService.addSyncListener(mockListener);

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

      (apiService.post as jest.Mock).mockResolvedValue({ success: true });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      await localStorageService.syncPendingData();

      // El listener debería ser llamado múltiples veces (inicio y fin)
      expect(mockListener).toHaveBeenCalled();
    });
  });
});

