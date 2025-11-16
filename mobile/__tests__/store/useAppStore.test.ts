import { act } from '@testing-library/react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { apiService } from '../../src/services/api';
import { localStorageService } from '../../src/services/localStorage';

jest.mock('../../src/services/api', () => ({
  apiService: {
    login: jest.fn(),
    setCurrentUser: jest.fn(),
    clearCurrentUser: jest.fn(),
    getAlerts: jest.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

jest.mock('../../src/services/localStorage', () => ({
  localStorageService: {
    saveMedicalHistory: jest.fn().mockResolvedValue(undefined),
    getMedicalHistories: jest.fn().mockResolvedValue([]),
    deleteMedicalHistory: jest.fn().mockResolvedValue(undefined),
    saveSymptomAnalysis: jest.fn().mockResolvedValue(undefined),
    syncPendingData: jest.fn().mockResolvedValue(undefined),
    syncFromServer: jest.fn().mockResolvedValue(undefined),
    getLastSyncTime: jest.fn().mockResolvedValue(new Date().toISOString()),
  },
}));

describe('useAppStore - acciones críticas', () => {
  beforeEach(() => {
    const { getState, setState } = useAppStore;
    // reset store a estado inicial
    setState({
      ...getState(),
      user: null,
      isOnline: true,
      networkStatus: 'online',
      notifications: [],
      alerts: [],
      isLoading: false,
      offlineData: { medicalHistories: [], symptomAnalyses: [], lastSync: new Date().toISOString(), pendingSync: 0 },
      syncStatus: { isOnline: true, isSyncing: false, pendingItems: 0, lastSyncTime: null, syncErrors: [] },
    });
    jest.clearAllMocks();
  });

  it('setOnlineStatus actualiza isOnline y networkStatus', () => {
    const { setOnlineStatus, isOnline } = useAppStore.getState();
    expect(isOnline).toBe(true);
    act(() => setOnlineStatus(false));
    expect(useAppStore.getState().isOnline).toBe(false);
    expect(useAppStore.getState().networkStatus).toBe('offline');
  });

  it('addMedicalHistory guarda en local y aumenta pendingSync', async () => {
    const history = { id: 'h1', patientId: 'p1', doctorId: 'd1', patientName: 'Juan', age: 30, gender: 'M', diagnosis: 'Dx', symptoms: [], treatment: '', notes: '', date: new Date().toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), syncStatus: 'pending' };
    await act(async () => {
      await useAppStore.getState().addMedicalHistory(history as any);
    });
    expect(localStorageService.saveMedicalHistory).toHaveBeenCalled();
    expect(useAppStore.getState().offlineData.medicalHistories.length).toBe(1);
    expect(useAppStore.getState().offlineData.pendingSync).toBe(1);
  });

  it('syncData cambia networkStatus a syncing y vuelve a online', async () => {
    await act(async () => {
      await useAppStore.getState().syncData();
    });
    expect(localStorageService.syncPendingData).toHaveBeenCalled();
    expect(localStorageService.syncFromServer).toHaveBeenCalled();
    expect(useAppStore.getState().networkStatus).toBe('online');
  });

  it('login establece user al autenticar', async () => {
    (apiService.login as jest.Mock).mockResolvedValue({
      success: true,
      data: { user: { id: 'u1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'patient', isEmailVerified: true, createdAt: '', updatedAt: '' } },
    });
    const ok = await useAppStore.getState().login('a@b.com', 'x');
    expect(ok).toBe(true);
    expect(useAppStore.getState().user?.id).toBe('u1');
  });
});

import { act } from '@testing-library/react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { SyncStatus } from '../../src/types';

jest.mock('../../src/services/localStorage', () => ({
  localStorageService: {
    saveMedicalHistory: jest.fn().mockResolvedValue(undefined),
    getMedicalHistories: jest.fn().mockResolvedValue([]),
    deleteMedicalHistory: jest.fn().mockResolvedValue(undefined),
    saveSymptomAnalysis: jest.fn().mockResolvedValue(undefined),
    getSymptomAnalyses: jest.fn().mockResolvedValue([]),
    syncPendingData: jest.fn().mockResolvedValue(undefined),
    syncFromServer: jest.fn().mockResolvedValue(undefined),
    getLastSyncTime: jest.fn().mockResolvedValue('2025-11-10T10:00:00.000Z'),
  },
}));

jest.mock('../../src/services/api', () => ({
  apiService: {
    login: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    register: jest.fn(),
    setCurrentUser: jest.fn().mockResolvedValue(undefined),
    clearCurrentUser: jest.fn().mockResolvedValue(undefined),
    getAlerts: jest.fn(),
    acknowledgeAlert: jest.fn(),
  },
}));

jest.mock('../../src/services/aiService', () => ({
  aiService: {
    analyzeSymptoms: jest.fn(),
  },
}));

const { localStorageService } = require('../../src/services/localStorage');
const { apiService } = require('../../src/services/api');
const { aiService } = require('../../src/services/aiService');

const resetStoreState = () => {
  useAppStore.setState(() => ({
    user: null,
    isOnline: true,
    offlineData: {
      medicalHistories: [],
      symptomAnalyses: [],
      lastSync: new Date().toISOString(),
      pendingSync: 0,
    },
    notifications: [],
    alerts: [],
    isLoading: false,
    syncStatus: {
      isOnline: true,
      isSyncing: false,
      pendingItems: 0,
      lastSyncTime: null,
      syncErrors: [],
    },
  }));
};

describe('useAppStore actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetStoreState();
  });

  it('setUser y setOnlineStatus actualizan el estado correctamente', () => {
    const { setUser, setOnlineStatus } = useAppStore.getState();

    act(() => {
      setUser({ id: 'user-1', email: 'test@example.com' } as any);
      setOnlineStatus(false);
    });

    const state = useAppStore.getState();
    expect(state.user?.id).toBe('user-1');
    expect(state.isOnline).toBe(false);
  });

  it('gestiona notificaciones (agregar, marcar como leída, limpiar)', () => {
    const { addNotification, markNotificationAsRead, clearNotifications } = useAppStore.getState();

    act(() => {
      addNotification({ id: 'n1', title: 'Alerta', message: 'Mensaje', type: 'alert', isRead: false });
      markNotificationAsRead('n1');
    });

    let state = useAppStore.getState();
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].isRead).toBe(true);

    act(() => {
      clearNotifications();
    });

    state = useAppStore.getState();
    expect(state.notifications).toHaveLength(0);
  });

  it('addMedicalHistory incrementa pendingSync y guarda en localStorage', async () => {
    const history = {
      id: 'history-1',
      patientId: 'patient-1',
      patientName: 'Paciente',
      doctorId: 'doc-1',
      diagnosis: 'Bronquitis',
      age: 30,
      gender: 'M',
      symptoms: [],
      treatment: 'Reposo',
      notes: '',
      date: '2025-11-10',
      createdAt: '2025-11-10',
      updatedAt: '2025-11-10',
    };

    await act(async () => {
      await useAppStore.getState().addMedicalHistory(history as any);
    });

    expect(localStorageService.saveMedicalHistory).toHaveBeenCalledWith(history);
    const state = useAppStore.getState();
    expect(state.offlineData.medicalHistories).toHaveLength(1);
    expect(state.offlineData.pendingSync).toBe(1);
  });

  it('updateMedicalHistory modifica historial existente', async () => {
    const existing = { id: 'history-1', patientId: 'p1', diagnosis: 'A', date: '2025-11-10' };
    (localStorageService.getMedicalHistories as jest.Mock).mockResolvedValue([existing]);

    useAppStore.setState((state) => ({
      offlineData: {
        ...state.offlineData,
        medicalHistories: [existing as any],
      },
    }));

    await act(async () => {
      await useAppStore.getState().updateMedicalHistory('history-1', { diagnosis: 'B' });
    });

    const state = useAppStore.getState();
    expect(localStorageService.saveMedicalHistory).toHaveBeenCalledWith({ ...existing, diagnosis: 'B' });
    expect(state.offlineData.medicalHistories[0].diagnosis).toBe('B');
  });

  it('deleteMedicalHistory elimina elementos offline', async () => {
    const existing = { id: 'history-1', patientId: 'p1', diagnosis: 'A' };

    useAppStore.setState((state) => ({
      offlineData: {
        ...state.offlineData,
        medicalHistories: [existing as any],
      },
    }));

    await act(async () => {
      await useAppStore.getState().deleteMedicalHistory('history-1');
    });

    expect(localStorageService.deleteMedicalHistory).toHaveBeenCalledWith('history-1');
    expect(useAppStore.getState().offlineData.medicalHistories).toHaveLength(0);
  });

  it('addSymptomAnalysis almacena análisis local', async () => {
    const analysis = { id: 'analysis-1', patientId: 'p1', symptoms: [], urgencyLevel: 'low' };

    await act(async () => {
      await useAppStore.getState().addSymptomAnalysis(analysis as any);
    });

    expect(localStorageService.saveSymptomAnalysis).toHaveBeenCalledWith(analysis);
    expect(useAppStore.getState().offlineData.symptomAnalyses).toHaveLength(1);
  });

  it('syncData ejecuta sincronización cuando hay conexión', async () => {
    const { syncData } = useAppStore.getState();
    useAppStore.setState((state) => ({
      offlineData: {
        ...state.offlineData,
        pendingSync: 2,
      },
      isOnline: true,
    }));

    await act(async () => {
      await syncData();
    });

    expect(localStorageService.syncPendingData).toHaveBeenCalled();
    expect(localStorageService.syncFromServer).toHaveBeenCalled();
    expect(useAppStore.getState().offlineData.pendingSync).toBe(0);
    expect(useAppStore.getState().notifications.length).toBeGreaterThan(0);
  });

  it('fetchAlerts y acknowledgeAlertById actualizan alertas', async () => {
    const alerts = [{ id: 'alert-1', title: 'Test', status: 'new' }];
    (apiService.getAlerts as jest.Mock).mockResolvedValue({ success: true, data: alerts });
    (apiService.acknowledgeAlert as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: 'alert-1', title: 'Test', status: 'acknowledged' },
    });

    await act(async () => {
      await useAppStore.getState().fetchAlerts();
    });

    expect(useAppStore.getState().alerts).toEqual(alerts);

    let acknowledged: boolean | undefined;
    await act(async () => {
      acknowledged = await useAppStore.getState().acknowledgeAlertById('alert-1');
    });
    expect(acknowledged).toBe(true);
    expect(useAppStore.getState().alerts[0].status).toBe('acknowledged');
  });

  it('login, register y logout utilizan apiService y actualizan estado', async () => {
    const user = { id: 'user-1', email: 'test@example.com' };
    (apiService.login as jest.Mock).mockResolvedValue({ success: true, data: { user } });
    (apiService.register as jest.Mock).mockResolvedValue({ success: true, data: { user } });

    let loginResult: boolean | undefined;
    await act(async () => {
      loginResult = await useAppStore.getState().login('test@example.com', '123456');
    });
    expect(loginResult).toBe(true);
    expect(apiService.setCurrentUser).toHaveBeenCalledWith(user);

    let registerResult: boolean | undefined;
    await act(async () => {
      registerResult = await useAppStore.getState().register({ email: 'test@example.com' });
    });
    expect(registerResult).toBe(true);

    await act(async () => {
      await useAppStore.getState().logout();
    });

    expect(apiService.logout).toHaveBeenCalled();
    expect(apiService.clearCurrentUser).toHaveBeenCalled();
    expect(useAppStore.getState().user).toBeNull();
  });

  it('analyzeSymptoms delega en aiService y guarda el análisis', async () => {
    const analysis = { id: 'analysis-1', patientId: 'p1', symptoms: [], urgencyLevel: 'medium' };
    (aiService.analyzeSymptoms as jest.Mock).mockResolvedValue(analysis);

    let result: any;
    await act(async () => {
      result = await useAppStore.getState().analyzeSymptoms([{ symptom: 'tos' }], 'patient-1');
    });

    expect(result).toEqual(analysis);
    expect(localStorageService.saveSymptomAnalysis).toHaveBeenCalledWith(analysis);
  });

  it('getSyncStatus refleja pendingSync e isOnline actuales', () => {
    useAppStore.setState((state) => ({
      isOnline: false,
      offlineData: {
        ...state.offlineData,
        pendingSync: 3,
      },
    }));

    const status = useAppStore.getState().getSyncStatus();
    expect(status.pendingItems).toBe(3);
    expect(status.isOnline).toBe(false);
  });
});

