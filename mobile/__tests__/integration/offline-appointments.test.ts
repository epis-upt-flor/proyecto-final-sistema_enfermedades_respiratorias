import { localStorageService } from '../../src/services/localStorage';
import NetInfo from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: false })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../../src/services/telemedicineService', () => ({
  telemedicineService: {
    createAppointment: jest.fn(),
    rescheduleAppointment: jest.fn(),
    cancelAppointment: jest.fn(),
  },
}));

import { telemedicineService } from '../../src/services/telemedicineService';

describe('Offline-first - appointments queue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    await localStorageService.clearAllData();
  });

  test('crea cita offline y se sincroniza al volver online', async () => {
    const payload = {
      _id: 'appt_local',
      patientId: 'p1',
      doctorId: 'd1',
      createdBy: 'p1',
      scheduledAt: new Date(Date.now() + 3600_000).toISOString(),
      durationMinutes: 30,
      status: 'scheduled',
    };

    await localStorageService.createAppointment(payload);
    const cached1 = await localStorageService.getCachedAppointments<any>();
    expect(cached1.find((a: any) => a._id.includes('local_') || a._id === 'appt_local')?.syncStatus).toBe('pending');

    // Online + backend ok
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (telemedicineService.createAppointment as jest.Mock).mockResolvedValue({ ...payload, _id: 'server_id' });

    await localStorageService.syncPendingData();

    const cached2 = await localStorageService.getCachedAppointments<any>();
    const synced = cached2.find((a: any) => a._id === 'server_id' || a._id === 'appt_local');
    expect(synced?.syncStatus).toBeUndefined(); // server item might not include syncStatus
    // ensure no pending local item remains
    expect(cached2.some((a: any) => (a._id || '').startsWith('local_') && a.syncStatus === 'pending')).toBeFalsy();
  });

  test('errores recurrentes en citas marcan error tras reintentos', async () => {
    const payload = {
      _id: 'appt_local2',
      patientId: 'p1',
      doctorId: 'd1',
      createdBy: 'p1',
      scheduledAt: new Date(Date.now() + 3600_000).toISOString(),
      durationMinutes: 30,
      status: 'scheduled',
    };

    await localStorageService.createAppointment(payload);

    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (telemedicineService.createAppointment as jest.Mock).mockRejectedValue(new Error('network'));
    (telemedicineService.rescheduleAppointment as jest.Mock).mockRejectedValue(new Error('network'));
    (telemedicineService.cancelAppointment as jest.Mock).mockRejectedValue(new Error('network'));

    await localStorageService.syncPendingData();
    await localStorageService.syncPendingData();
    await localStorageService.syncPendingData();

    const cached = await localStorageService.getCachedAppointments<any>();
    // El item local puede conservar su _id local, marcar error
    const errored = cached.find((a: any) => (a._id || '').includes('local_'));
    expect(errored?.syncStatus).toBe('error');
  });
});


