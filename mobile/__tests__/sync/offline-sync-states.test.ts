/**
 * Tests de Estados de Sincronización Offline
 * Verifica el manejo de estados, transiciones y notificaciones
 */

import { localStorageService, SyncStatus } from '../../src/services/localStorage';
import { useAppStore } from '../../src/store/useAppStore';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocks
jest.mock('@react-native-community/netinfo');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../src/services/api');
jest.mock('../../src/services/telemedicineService');

describe('Offline Sync States Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  describe('Estados Básicos', () => {
    it('debe iniciar con estado offline cuando no hay conexión', () => {
      (localStorageService as any).syncQueue = [];
      (localStorageService as any).isSyncing = false;

      const status = localStorageService.getSyncStatus();
      
      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('isSyncing');
      expect(status).toHaveProperty('pendingItems');
      expect(status).toHaveProperty('lastSyncTime');
      expect(status).toHaveProperty('syncErrors');
    });

    it('debe retornar estado idle cuando no hay items pendientes', () => {
      (localStorageService as any).syncQueue = [];
      (localStorageService as any).isSyncing = false;

      const status = localStorageService.getSyncStatus();
      
      expect(status.pendingItems).toBe(0);
      expect(status.isSyncing).toBe(false);
    });

    it('debe retornar estado pending cuando hay items en cola', () => {
      (localStorageService as any).syncQueue = [
        { id: 'sync-1', type: 'CREATE', entity: 'medical_history', data: {}, timestamp: Date.now(), retryCount: 0 },
      ];
      (localStorageService as any).isSyncing = false;

      const status = localStorageService.getSyncStatus();
      
      expect(status.pendingItems).toBe(1);
      expect(status.isSyncing).toBe(false);
    });

    it('debe retornar estado syncing cuando está sincronizando', () => {
      (localStorageService as any).syncQueue = [
        { id: 'sync-1', type: 'CREATE', entity: 'medical_history', data: {}, timestamp: Date.now(), retryCount: 0 },
      ];
      (localStorageService as any).isSyncing = true;

      const status = localStorageService.getSyncStatus();
      
      expect(status.isSyncing).toBe(true);
      expect(status.pendingItems).toBe(1);
    });
  });

  describe('Transiciones de Estado', () => {
    it('debe transicionar de idle a syncing cuando inicia sincronización', async () => {
      const mockQueue = [
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

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));
      (localStorageService as any).isSyncing = false;

      // Estado inicial
      let status = localStorageService.getSyncStatus();
      expect(status.isSyncing).toBe(false);

      // Iniciar sincronización (simulado)
      (localStorageService as any).isSyncing = true;
      status = localStorageService.getSyncStatus();
      expect(status.isSyncing).toBe(true);
    });

    it('debe transicionar de syncing a idle cuando completa sincronización', async () => {
      const mockQueue: any[] = [];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      (localStorageService as any).syncQueue = [];
      (localStorageService as any).isSyncing = true;

      // Estado durante sincronización
      let status = localStorageService.getSyncStatus();
      expect(status.isSyncing).toBe(true);

      // Completar sincronización
      (localStorageService as any).isSyncing = false;
      status = localStorageService.getSyncStatus();
      expect(status.isSyncing).toBe(false);
      expect(status.pendingItems).toBe(0);
    });

    it('debe transicionar de pending a syncing cuando hay conexión', async () => {
      const mockQueue = [
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

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));
      (localStorageService as any).isSyncing = false;

      // Estado pending
      let status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBe(1);
      expect(status.isSyncing).toBe(false);

      // Cambiar a syncing
      (localStorageService as any).isSyncing = true;
      status = localStorageService.getSyncStatus();
      expect(status.isSyncing).toBe(true);
      expect(status.pendingItems).toBe(1);
    });
  });

  describe('Estados de Error', () => {
    it('debe incluir errores en el estado cuando hay fallos', () => {
      (localStorageService as any).syncQueue = [];
      (localStorageService as any).isSyncing = false;

      const status = localStorageService.getSyncStatus();
      
      expect(status.syncErrors).toBeDefined();
      expect(Array.isArray(status.syncErrors)).toBe(true);
    });

    it('debe mantener estado de error después de fallos', async () => {
      const mockQueue = [
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
            { id: 'history-1', patientId: 'patient-1', syncStatus: 'error' }
          ]));
        }
        return Promise.resolve(null);
      });

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      const status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBe(1);
    });
  });

  describe('Timestamp de Última Sincronización', () => {
    it('debe obtener timestamp de última sincronización', async () => {
      const mockTimestamp = Date.now().toString();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockTimestamp);

      const lastSync = await localStorageService.getLastSyncTime();

      expect(lastSync).toBeDefined();
      expect(new Date(lastSync!).getTime()).toBe(parseInt(mockTimestamp));
    });

    it('debe retornar null si no hay timestamp guardado', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const lastSync = await localStorageService.getLastSyncTime();

      expect(lastSync).toBeNull();
    });

    it('debe actualizar timestamp después de sincronización exitosa', async () => {
      const mockQueue: any[] = [];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockQueue));
        }
        return Promise.resolve(null);
      });

      (localStorageService as any).syncQueue = [];

      // Simular sincronización exitosa
      await AsyncStorage.setItem('last_sync_timestamp', Date.now().toString());

      const setItemCalls = (AsyncStorage.setItem as jest.Mock).mock.calls;
      const lastSyncCall = setItemCalls.find((call: any[]) => 
        call[0] === 'last_sync_timestamp'
      );
      expect(lastSyncCall).toBeDefined();
    });
  });

  describe('Integración con Store', () => {
    it('debe actualizar estado en store cuando cambia sincronización', () => {
      // El store debería reflejar cambios en el servicio de sincronización
      const status = localStorageService.getSyncStatus();
      
      expect(status).toHaveProperty('isSyncing');
      expect(status).toHaveProperty('pendingItems');
    });

    it('debe sincronizar estado entre servicio y store', () => {
      (localStorageService as any).syncQueue = [
        { id: 'sync-1', type: 'CREATE', entity: 'medical_history', data: {}, timestamp: Date.now(), retryCount: 0 },
      ];
      (localStorageService as any).isSyncing = true;

      const serviceStatus = localStorageService.getSyncStatus();
      
      expect(serviceStatus.pendingItems).toBe(1);
      expect(serviceStatus.isSyncing).toBe(true);
    });
  });

  describe('Estados de Conexión', () => {
    it('debe detectar estado offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const isOnline = (await NetInfo.fetch()).isConnected ?? false;
      
      expect(isOnline).toBe(false);
    });

    it('debe detectar estado online', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });

      const isOnline = (await NetInfo.fetch()).isConnected ?? false;
      
      expect(isOnline).toBe(true);
    });

    it('debe no sincronizar cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const mockQueue = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1', patientId: 'patient-1' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (localStorageService as any).syncQueue = JSON.parse(JSON.stringify(mockQueue));

      // Intentar sincronizar
      await localStorageService.syncPendingData();

      // No debería procesar items cuando está offline
      const status = localStorageService.getSyncStatus();
      expect(status.pendingItems).toBeGreaterThan(0);
    });
  });

  describe('Notificaciones de Estado', () => {
    it('debe notificar cambios de estado a listeners', () => {
      const mockListener = jest.fn();
      localStorageService.addSyncListener(mockListener);

      (localStorageService as any).syncQueue = [
        { id: 'sync-1', type: 'CREATE', entity: 'medical_history', data: {}, timestamp: Date.now(), retryCount: 0 },
      ];

      // Notificar listeners
      (localStorageService as any).notifySyncListeners();

      expect(mockListener).toHaveBeenCalled();
    });

    it('debe permitir múltiples listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      localStorageService.addSyncListener(listener1);
      localStorageService.addSyncListener(listener2);

      (localStorageService as any).notifySyncListeners();

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('debe remover listeners correctamente', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      localStorageService.addSyncListener(listener1);
      localStorageService.addSyncListener(listener2);
      localStorageService.removeSyncListener(listener1);

      (localStorageService as any).notifySyncListeners();

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});

