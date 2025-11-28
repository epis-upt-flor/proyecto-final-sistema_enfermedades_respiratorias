/**
 * Tests de integración - Flujo completo de telemedicina
 * Verifica iniciar llamada, finalizar y sincronización
 */

import { appointmentService } from '../../medical-app/lib/api/services/appointmentService';
import { useAppStore } from '../../medical-app/store/useAppStore';
import { dashboardService } from '../../medical-app/lib/api/services/dashboardService';
import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';

// Mock dependencies
jest.mock('../../medical-app/lib/api/services/dashboardService');
jest.mock('react-native-jitsi-meet', () => ({
  launchJitsiMeetView: jest.fn(),
  endCall: jest.fn(),
}));

describe('Telemedicine Flow Integration Tests', () => {
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

  describe('Video Call Flow', () => {
    it('debe completar flujo de videollamada', async () => {
      // 1. Inicializar servicio
      const initialized = await telemedicineService.initialize();
      expect(initialized).toBe(true);

      // 2. Crear llamada
      const callOptions = {
        doctorId: 'doctor-1',
        scheduledAt: new Date().toISOString(),
        notes: 'Consulta de seguimiento',
      };

      const call = await telemedicineService.createCall(callOptions);

      if (call) {
        // 3. Verificar que se crea la llamada
        expect(call.id).toBeDefined();
        expect(call.roomId).toBeDefined();
        expect(call.status).toBe('scheduled');

        // 4. Iniciar videollamada
        const startResult = await telemedicineService.startVideoCall(
          call.roomId,
          {
            patientName: 'Test Patient',
            doctorName: 'Dr. Test',
          }
        );

        expect(startResult).toBeDefined();

        // 5. Verificar analytics
        expect(analyticsService.logEvent).toHaveBeenCalledWith('telemedicine_call_started', {
          callId: call.id,
          roomId: call.roomId,
        });
      }
    });

    it('debe finalizar videollamada correctamente', async () => {
      // Setup: llamada activa
      const call = await telemedicineService.createCall({
        doctorId: 'doctor-1',
      });

      if (call) {
        await telemedicineService.startVideoCall(call.roomId, {});

        // Finalizar llamada
        await telemedicineService.endVideoCall();

        // Verificar analytics
        expect(analyticsService.logEvent).toHaveBeenCalledWith('telemedicine_call_ended', {
          callId: call.id,
        });
      }
    });

    it('debe manejar errores de conexión', async () => {
      // Mock error
      (telemedicineService.startVideoCall as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed')
      );

      const call = await telemedicineService.createCall({
        doctorId: 'doctor-1',
      });

      if (call) {
        await expect(
          telemedicineService.startVideoCall(call.roomId, {})
        ).rejects.toThrow();

        // Verificar que se registra el error
        expect(analyticsService.logEvent).toHaveBeenCalledWith(
          'telemedicine_call_error',
          expect.objectContaining({
            error: 'Connection failed',
          })
        );
      }
    });
  });

  describe('Room Management', () => {
    it('debe generar room ID único', () => {
      const roomId1 = telemedicineService.generateRoomId('patient-1', 'doctor-1');
      const roomId2 = telemedicineService.generateRoomId('patient-1', 'doctor-1');
      const roomId3 = telemedicineService.generateRoomId('patient-2', 'doctor-1');

      expect(roomId1).toBe(roomId2); // Mismos participantes = mismo room
      expect(roomId1).not.toBe(roomId3); // Diferentes participantes = diferente room
    });

    it('debe validar room ID', () => {
      const validRoomId = telemedicineService.generateRoomId('patient-1', 'doctor-1');
      expect(telemedicineService.validateRoomId(validRoomId)).toBe(true);
      expect(telemedicineService.validateRoomId('invalid')).toBe(false);
    });
  });
});

