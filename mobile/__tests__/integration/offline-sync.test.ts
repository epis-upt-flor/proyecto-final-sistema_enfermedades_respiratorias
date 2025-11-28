import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import { authService } from '../../medical-app/lib/api/services/authService';
import NetInfo from '@react-native-community/netinfo';

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

describe('Offline-first - integración básica', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // asegurar que empezamos offline por defecto
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    await localStorageService.clearAllData();
  });

  test('lee datos cacheados en modo offline', async () => {
    // Simular que ya hay un historial médico cacheado
    const fakeHistory = { id: 'h1', patientName: 'Juan', age: 20, diagnosis: 'Dx', date: new Date().toISOString(), syncStatus: 'pending' };
    await localStorageService.saveMedicalHistory(fakeHistory as any);

    const list = await localStorageService.getMedicalHistories();
    expect(list.find(h => h.id === 'h1')).toBeTruthy();
  });

  test('reconexión dispara sincronización pendiente', async () => {
    // Crear elemento offline
    const offlineHistory = { id: 'h2', patientName: 'Ana', age: 30, diagnosis: 'Dx', date: new Date().toISOString(), syncStatus: 'pending' };
    await localStorageService.saveMedicalHistory(offlineHistory as any);

    // Pasar a online
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    // Simular respuesta exitosa del backend
    (apiService.post as jest.Mock).mockResolvedValue({ success: true, data: { ok: true } });

    await localStorageService.syncPendingData();

    const after = await localStorageService.getMedicalHistories();
    // Debe marcarse como 'synced' en cache tras procesar la cola
    expect(after.find(h => h.id === 'h2')?.syncStatus).toBe('synced');
  });

  test('errores de red recurrentes marcan error tras reintentos', async () => {
    // Crear elemento offline
    const offlineHistory = { id: 'h3', patientName: 'Luis', age: 40, diagnosis: 'Dx', date: new Date().toISOString(), syncStatus: 'pending' };
    await localStorageService.saveMedicalHistory(offlineHistory as any);

    // Fuerza online pero con API fallando
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (apiService.post as jest.Mock).mockRejectedValue(new Error('network'));
    (apiService.put as jest.Mock).mockRejectedValue(new Error('network'));

    // Ejecutar múltiples rondas de sincronización para alcanzar límite de reintentos
    await localStorageService.syncPendingData();
    await localStorageService.syncPendingData();
    await localStorageService.syncPendingData();

    const after = await localStorageService.getMedicalHistories();
    expect(after.find(h => h.id === 'h3')?.syncStatus).toBe('error');
  });
});


