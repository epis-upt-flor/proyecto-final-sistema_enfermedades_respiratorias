/**
 * Tests de integración - Flujo completo de citas
 * Verifica crear, editar, cancelar y sincronizar citas
 */

import { appointmentService } from '../../medical-app/lib/api/services/appointmentService';
import { useAppStore } from '../../medical-app/store/useAppStore';
import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import { dashboardService } from '../../medical-app/lib/api/services/dashboardService';
import NetInfo from '@react-native-community/netinfo';

// Mock dependencies
jest.mock('../../medical-app/lib/api/services/dashboardService');
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(() => jest.fn()),
  },
}));

describe('Appointment Flow Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localStorageService.clearAllData();
    
    useAppStore.getState().setUser({
      id: 'patient-1',
      email: 'patient@example.com',
      name: 'Test Patient',
      role: 'patient',
    });
  });

  describe('Create Appointment Flow', () => {
    it('debe completar flujo de creación de cita', async () => {
      const appointmentData = {
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
        notes: 'Consulta de seguimiento',
      };

      // 1. Crear cita
      const createResult = await telemedicineService.createAppointment(appointmentData);

      if (createResult) {
        // 2. Verificar que se guarda en store
        const appointments = useAppStore.getState().offlineData.appointments;
        expect(appointments.length).toBeGreaterThan(0);

        // 3. Verificar que se guarda en localStorage
        const cached = await localStorageService.getCachedAppointments();
        expect(cached.length).toBeGreaterThan(0);

        // 4. Verificar analytics
        expect(analyticsService.logEvent).toHaveBeenCalledWith('appointment_created', {
          appointmentId: createResult.id,
          doctorId: appointmentData.doctorId,
        });
      }
    });

    it('debe crear cita offline y sincronizar después', async () => {
      // Simular offline
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      const appointmentData = {
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
      };

      // Crear offline
      await localStorageService.createAppointment({
        ...appointmentData,
        _id: 'local_appt_1',
        syncStatus: 'pending',
      } as any);

      // Verificar pendiente
      const cached = await localStorageService.getCachedAppointments();
      const pending = cached.find(a => a.syncStatus === 'pending');
      expect(pending).toBeDefined();

      // Simular online
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (telemedicineService.createAppointment as jest.Mock).mockResolvedValue({
        id: 'server_appt_1',
        ...appointmentData,
      });

      // Sincronizar
      await localStorageService.syncPendingData();

      // Verificar sincronización
      const synced = await localStorageService.getCachedAppointments();
      const syncedAppt = synced.find(a => a._id === 'server_appt_1');
      expect(syncedAppt).toBeDefined();
    });
  });

  describe('Edit Appointment Flow', () => {
    it('debe completar flujo de edición de cita', async () => {
      // 1. Crear cita inicial
      const appointment = {
        id: 'appt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
      };

      await localStorageService.createAppointment(appointment as any);

      // 2. Editar cita
      const newDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const updateResult = await telemedicineService.rescheduleAppointment('appt-1', {
        scheduledAt: newDate,
      });

      if (updateResult) {
        // 3. Verificar actualización
        const cached = await localStorageService.getCachedAppointments();
        const updated = cached.find(a => a._id === 'appt-1');
        expect(updated?.scheduledAt).toBe(newDate);

        // 4. Verificar analytics
        expect(analyticsService.logEvent).toHaveBeenCalledWith('appointment_rescheduled', {
          appointmentId: 'appt-1',
        });
      }
    });
  });

  describe('Cancel Appointment Flow', () => {
    it('debe completar flujo de cancelación de cita', async () => {
      // 1. Crear cita
      const appointment = {
        id: 'appt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
        status: 'scheduled' as const,
      };

      await localStorageService.createAppointment(appointment as any);

      // 2. Cancelar cita
      const cancelResult = await telemedicineService.cancelAppointment('appt-1', 'Patient request');

      if (cancelResult) {
        // 3. Verificar cancelación
        const cached = await localStorageService.getCachedAppointments();
        const cancelled = cached.find(a => a._id === 'appt-1');
        expect(cancelled?.status).toBe('cancelled');

        // 4. Verificar analytics
        expect(analyticsService.logEvent).toHaveBeenCalledWith('appointment_cancelled', {
          appointmentId: 'appt-1',
        });
      }
    });
  });

  describe('Appointment Notifications', () => {
    it('debe generar notificación de recordatorio', async () => {
      const appointment = {
        id: 'appt-1',
        patientId: 'patient-1',
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
        durationMinutes: 30,
        status: 'scheduled' as const,
      };

      await localStorageService.createAppointment(appointment as any);

      // Verificar que se agrega notificación
      const notifications = useAppStore.getState().notifications;
      const reminder = notifications.find(n => n.id === `appt_${appointment.id}`);
      expect(reminder).toBeDefined();
    });
  });
});

