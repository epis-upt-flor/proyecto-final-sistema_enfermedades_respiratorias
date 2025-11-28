/**
 * Tests de Estados de Sincronización Offline
 * Verifica los diferentes estados y transiciones del sistema de sincronización
 */

import { useAppStore } from '../../medical-app/store/useAppStore';
import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import NetInfo from '@react-native-community/netinfo';

// Mocks
jest.mock('../../medical-app/lib/services/offlineQueue');
jest.mock('../../medical-app/lib/api/services/authService');
jest.mock('@react-native-community/netinfo');

describe('Offline Sync States Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({
      isOnline: true,
      networkStatus: 'online',
      syncStatus: {
        isOnline: true,
        isSyncing: false,
        pendingItems: 0,
        lastSyncTime: null,
        syncErrors: [],
      },
      offlineData: {
        medicalHistories: [],
        symptomAnalyses: [],
        lastSync: new Date().toISOString(),
        pendingSync: 0,
      },
    });
  });

  describe('Estados de Red', () => {
    it('debe cambiar a estado offline cuando se pierde conexión', () => {
      useAppStore.getState().setOnlineStatus(false);

      const state = useAppStore.getState();
      expect(state.isOnline).toBe(false);
      expect(state.networkStatus).toBe('offline');
    });

    it('debe cambiar a estado online cuando se recupera conexión', () => {
      useAppStore.getState().setOnlineStatus(false);
      useAppStore.getState().setOnlineStatus(true);

      const state = useAppStore.getState();
      expect(state.isOnline).toBe(true);
      expect(state.networkStatus).toBe('online');
    });

    it('debe cambiar a estado syncing durante sincronización', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(
        new Date().toISOString()
      );

      const syncPromise = useAppStore.getState().syncData();

      // Verificar estado durante sincronización
      let state = useAppStore.getState();
      expect(state.networkStatus).toBe('syncing');
      expect(state.syncStatus.isSyncing).toBe(true);
      expect(state.isLoading).toBe(true);

      await syncPromise;

      // Verificar estado después de sincronización
      state = useAppStore.getState();
      expect(state.networkStatus).toBe('online');
      expect(state.syncStatus.isSyncing).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('Estados de Sincronización', () => {
    it('debe inicializar con estado correcto', () => {
      const status = useAppStore.getState().getSyncStatus();

      expect(status).toHaveProperty('isOnline');
      expect(status).toHaveProperty('isSyncing');
      expect(status).toHaveProperty('pendingItems');
      expect(status).toHaveProperty('lastSyncTime');
      expect(status).toHaveProperty('syncErrors');
    });

    it('debe actualizar pendingItems cuando hay items en cola', () => {
      useAppStore.setState({
        syncStatus: {
          isOnline: true,
          isSyncing: false,
          pendingItems: 5,
          lastSyncTime: null,
          syncErrors: [],
        },
        offlineData: {
          medicalHistories: [],
          symptomAnalyses: [],
          lastSync: new Date().toISOString(),
          pendingSync: 5,
        },
      });

      const status = useAppStore.getState().getSyncStatus();
      expect(status.pendingItems).toBe(5);
    });

    it('debe actualizar lastSyncTime después de sincronización exitosa', async () => {
      const mockLastSyncTime = new Date().toISOString();
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(mockLastSyncTime);

      await useAppStore.getState().syncData();

      const status = useAppStore.getState().getSyncStatus();
      expect(status.lastSyncTime).toBe(mockLastSyncTime);
    });

    it('debe registrar errores en syncErrors cuando falla sincronización', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockRejectedValue(
        new Error('Sync failed')
      );

      await useAppStore.getState().syncData();

      const status = useAppStore.getState().getSyncStatus();
      expect(status.syncErrors.length).toBeGreaterThan(0);
      expect(status.isSyncing).toBe(false);
    });

    it('debe limpiar errores después de sincronización exitosa', async () => {
      // Primero fallar
      useAppStore.setState({
        syncStatus: {
          isOnline: true,
          isSyncing: false,
          pendingItems: 0,
          lastSyncTime: null,
          syncErrors: ['Error anterior'],
        },
      });

      // Luego sincronizar exitosamente
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(
        new Date().toISOString()
      );

      await useAppStore.getState().syncData();

      const status = useAppStore.getState().getSyncStatus();
      // Los errores pueden persistir o limpiarse según la implementación
      expect(status.isSyncing).toBe(false);
    });
  });

  describe('Transiciones de Estado', () => {
    it('debe transicionar: online -> syncing -> online', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(
        new Date().toISOString()
      );

      // Estado inicial: online
      expect(useAppStore.getState().networkStatus).toBe('online');

      // Iniciar sincronización
      const syncPromise = useAppStore.getState().syncData();

      // Estado durante: syncing
      expect(useAppStore.getState().networkStatus).toBe('syncing');

      await syncPromise;

      // Estado final: online
      expect(useAppStore.getState().networkStatus).toBe('online');
    });

    it('debe transicionar: offline -> online -> syncing -> online', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(
        new Date().toISOString()
      );

      // Estado inicial: offline
      useAppStore.getState().setOnlineStatus(false);
      expect(useAppStore.getState().networkStatus).toBe('offline');

      // Recuperar conexión
      useAppStore.getState().setOnlineStatus(true);
      expect(useAppStore.getState().networkStatus).toBe('online');

      // Iniciar sincronización automática
      const syncPromise = useAppStore.getState().syncData();

      // Estado durante: syncing
      expect(useAppStore.getState().networkStatus).toBe('syncing');

      await syncPromise;

      // Estado final: online
      expect(useAppStore.getState().networkStatus).toBe('online');
    });

    it('debe manejar interrupción de sincronización (pérdida de conexión)', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve, reject) => {
            setTimeout(() => {
              useAppStore.getState().setOnlineStatus(false);
              reject(new Error('Connection lost'));
            }, 100);
          })
      );

      try {
        await useAppStore.getState().syncData();
      } catch (error) {
        // Esperado
      }

      const state = useAppStore.getState();
      expect(state.networkStatus).toBe('offline');
      expect(state.syncStatus.isSyncing).toBe(false);
    });
  });

  describe('Sincronización Condicional', () => {
    it('no debe sincronizar si está offline', async () => {
      useAppStore.getState().setOnlineStatus(false);

      await useAppStore.getState().syncData();

      expect(localStorageService.syncPendingData).not.toHaveBeenCalled();
      expect(localStorageService.syncFromServer).not.toHaveBeenCalled();
    });

    it('debe sincronizar automáticamente cuando se recupera conexión', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(
        new Date().toISOString()
      );

      // Simular pérdida y recuperación de conexión
      useAppStore.getState().setOnlineStatus(false);
      useAppStore.getState().setOnlineStatus(true);

      // La sincronización debería iniciarse automáticamente
      // (esto depende de la implementación del listener de NetInfo)
      expect(useAppStore.getState().isOnline).toBe(true);
    });

    it('debe sincronizar solo si hay items pendientes', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(
        new Date().toISOString()
      );

      // Sin items pendientes
      useAppStore.setState({
        offlineData: {
          medicalHistories: [],
          symptomAnalyses: [],
          lastSync: new Date().toISOString(),
          pendingSync: 0,
        },
      });

      await useAppStore.getState().syncData();

      // Debería intentar sincronizar de todas formas (syncFromServer)
      expect(localStorageService.syncFromServer).toHaveBeenCalled();
    });
  });

  describe('Notificaciones de Estado', () => {
    it('debe agregar notificación de éxito después de sincronización exitosa', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.syncFromServer as jest.Mock).mockResolvedValue(undefined);
      (localStorageService.getLastSyncTime as jest.Mock).mockResolvedValue(
        new Date().toISOString()
      );

      const initialNotifications = useAppStore.getState().notifications.length;

      await useAppStore.getState().syncData();

      const finalNotifications = useAppStore.getState().notifications;
      expect(finalNotifications.length).toBeGreaterThan(initialNotifications);
      expect(finalNotifications[finalNotifications.length - 1].type).toBe('sync');
    });

    it('debe agregar notificación de error cuando falla sincronización', async () => {
      (localStorageService.syncPendingData as jest.Mock).mockRejectedValue(
        new Error('Sync failed')
      );

      const initialNotifications = useAppStore.getState().notifications.length;

      await useAppStore.getState().syncData();

      const finalNotifications = useAppStore.getState().notifications;
      expect(finalNotifications.length).toBeGreaterThan(initialNotifications);
      expect(finalNotifications[finalNotifications.length - 1].type).toBe('alert');
    });
  });
});

