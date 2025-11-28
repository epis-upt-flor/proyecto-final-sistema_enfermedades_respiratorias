/**
 * Tests for TelemedicineService
 */

import { appointmentService } from '../../medical-app/lib/api/services/appointmentService';
// Nota: telemedicineService puede estar integrado en appointmentService

// Mock Jitsi Meet
jest.mock('react-native-jitsi-meet', () => ({
  launchJitsiMeetView: jest.fn(),
  endCall: jest.fn(),
}));

describe('TelemedicineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startVideoCall', () => {
    it('should start video call', async () => {
      const JitsiMeet = require('react-native-jitsi-meet');
      
      await telemedicineService.startVideoCall('room123', {
        patientName: 'Test Patient',
        doctorName: 'Dr. Test',
      });
      
      expect(JitsiMeet.launchJitsiMeetView).toHaveBeenCalled();
    });

    it('should handle call start error', async () => {
      const JitsiMeet = require('react-native-jitsi-meet');
      JitsiMeet.launchJitsiMeetView.mockRejectedValue(new Error('Call failed'));
      
      await expect(
        telemedicineService.startVideoCall('room123', {})
      ).rejects.toThrow();
    });
  });

  describe('endVideoCall', () => {
    it('should end video call', () => {
      const JitsiMeet = require('react-native-jitsi-meet');
      
      telemedicineService.endVideoCall();
      
      expect(JitsiMeet.endCall).toHaveBeenCalled();
    });
  });

  describe('generateRoomId', () => {
    it('should generate unique room ID', () => {
      const roomId1 = telemedicineService.generateRoomId('patient1', 'doctor1');
      const roomId2 = telemedicineService.generateRoomId('patient1', 'doctor1');
      
      expect(roomId1).toBe(roomId2); // Same participants = same room
      
      const roomId3 = telemedicineService.generateRoomId('patient2', 'doctor1');
      expect(roomId3).not.toBe(roomId1);
    });
  });

  describe('validateRoomId', () => {
    it('should validate room ID format', () => {
      const validRoomId = telemedicineService.generateRoomId('patient1', 'doctor1');
      expect(telemedicineService.validateRoomId(validRoomId)).toBe(true);
      
      expect(telemedicineService.validateRoomId('invalid')).toBe(false);
      expect(telemedicineService.validateRoomId('')).toBe(false);
    });
  });
});

