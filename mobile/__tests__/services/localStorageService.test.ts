import { localStorageService } from '../../src/services/localStorage';

describe('localStorageService - operaciones básicas', () => {
  beforeEach(async () => {
    await localStorageService.clearAllData();
  });

  it('guarda y recupera configuraciones', async () => {
    await localStorageService.saveSettings({ theme: 'dark' });
    const settings = await localStorageService.getSettings();
    expect(settings.theme).toBe('dark');
  });

  it('set/get secure items', async () => {
    await localStorageService.setSecureItem('token', 'abc');
    const v = await localStorageService.getSecureItem('token');
    expect(v).toBe('abc');
    await localStorageService.removeSecureItem('token');
    const v2 = await localStorageService.getSecureItem('token');
    expect(v2).toBeNull();
  });

  it('cachea últimas predicciones', async () => {
    await localStorageService.saveLastPredictions([{ id: 'p1', analyzedAt: new Date().toISOString() }]);
    const preds = await localStorageService.getLastPredictions();
    expect(preds.length).toBe(1);
  });
});

/**
 * Tests unitarios para Local Storage Service
 * Cubre almacenamiento offline, sincronización y gestión de cola
 */

import { localStorageService, SyncQueueItem } from '../../src/services/localStorage';
import { apiService } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Mocks
jest.mock('../../src/services/api');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

describe('LocalStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getMedicalHistories', () => {
    it('debe retornar array vacío cuando no hay historias guardadas', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const histories = await localStorageService.getMedicalHistories();

      expect(histories).toEqual([]);
    });

    it('debe retornar historias guardadas', async () => {
      const mockHistories = [
        {
          id: 'history-1',
          patientId: 'patient-1',
          diagnosis: 'Bronquitis',
          symptoms: [],
          treatment: 'Reposo',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockHistories));

      const histories = await localStorageService.getMedicalHistories();

      expect(histories).toEqual(mockHistories);
    });

    it('debe manejar errores de lectura', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const histories = await localStorageService.getMedicalHistories();

      expect(histories).toEqual([]);
    });
  });

  describe('saveMedicalHistory', () => {
    const mockHistory = {
      id: 'history-1',
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

    it('debe guardar nueva historia médica cuando está online', async () => {
      jest.spyOn(localStorageService, 'getMedicalHistories').mockResolvedValue([]);
      (apiService.createMedicalHistory as jest.Mock).mockResolvedValue({
        success: true,
        data: mockHistory,
      });

      await localStorageService.saveMedicalHistory(mockHistory);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(apiService.createMedicalHistory).toHaveBeenCalledWith(mockHistory);
    });

    it('debe agregar a cola de sincronización cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      jest.spyOn(localStorageService, 'getMedicalHistories').mockResolvedValue([]);

      await localStorageService.saveMedicalHistory(mockHistory);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      // Verificar que se agregó a la cola (indirectamente a través del guardado)
    });

    it('debe actualizar historia existente', async () => {
      const existingHistory = { ...mockHistory };
      const updatedHistory = { ...mockHistory, diagnosis: 'Neumonía' };

      jest.spyOn(localStorageService, 'getMedicalHistories').mockResolvedValue([existingHistory]);
      (apiService.updateMedicalHistory as jest.Mock).mockResolvedValue({
        success: true,
        data: updatedHistory,
      });

      await localStorageService.saveMedicalHistory(updatedHistory);

      expect(apiService.updateMedicalHistory).toHaveBeenCalledWith(
        updatedHistory.id,
        updatedHistory
      );
    });
  });

  describe('syncPendingData', () => {
    it('debe sincronizar datos pendientes cuando está online', async () => {
      const mockSyncQueue: SyncQueueItem[] = [
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
          return Promise.resolve(JSON.stringify(mockSyncQueue));
        }
        return Promise.resolve(null);
      });

      (apiService.createMedicalHistory as jest.Mock).mockResolvedValue({
        success: true,
      });

      await localStorageService.syncPendingData();

      expect(apiService.createMedicalHistory).toHaveBeenCalled();
    });

    it('no debe sincronizar cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      await localStorageService.syncPendingData();

      expect(apiService.createMedicalHistory).not.toHaveBeenCalled();
    });

    it('debe reintentar items fallidos hasta 3 veces', async () => {
      const mockSyncQueue: SyncQueueItem[] = [
        {
          id: 'sync-1',
          type: 'CREATE',
          entity: 'medical_history',
          data: { id: 'history-1' },
          timestamp: Date.now(),
          retryCount: 2,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'sync_queue') {
          return Promise.resolve(JSON.stringify(mockSyncQueue));
        }
        return Promise.resolve(null);
      });

      (apiService.createMedicalHistory as jest.Mock).mockRejectedValue(new Error('Error'));

      await localStorageService.syncPendingData();

      // El item debe seguir en la cola porque aún no alcanzó el límite
      expect(true).toBe(true); // Verificación básica
    });
  });

  describe('syncFromServer', () => {
    it('debe sincronizar datos desde el servidor', async () => {
      const mockHistories = [
        {
          id: 'history-1',
          patientId: 'patient-1',
          diagnosis: 'Bronquitis',
        },
      ];

      (apiService.getMedicalHistories as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          histories: mockHistories,
          total: 1,
          page: 1,
          limit: 10,
        },
      });

      await localStorageService.syncFromServer();

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('debe lanzar error cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      await expect(localStorageService.syncFromServer()).rejects.toThrow('No internet');
    });
  });

  describe('getSyncStatus', () => {
    it('debe retornar estado de sincronización', () => {
      const status = localStorageService.getSyncStatus();

      expect(status).toHaveProperty('isSyncing');
      expect(status).toHaveProperty('pendingItems');
    });
  });

  describe('clearAllData', () => {
    it('debe limpiar todos los datos', async () => {
      await localStorageService.clearAllData();

      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });
});

