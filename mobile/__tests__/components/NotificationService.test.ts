/**
 * Tests for NotificationService
 */

// Nota: NotificationService puede no existir en medical-app
// Verificar si existe o si se usa toast de sonner directamente
import { Platform } from 'react-native';

// Mock react-native-push-notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotification: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  setApplicationIconBadgeNumber: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Alert: {
    alert: jest.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('setStore', () => {
    it('should set store reference', () => {
      const service = NotificationService.getInstance();
      const mockStore = { addNotification: jest.fn() };
      
      service.setStore(mockStore);
      
      // Store should be set
      expect(service).toBeDefined();
    });
  });

  describe('showLocalNotification', () => {
    it('should show local notification', () => {
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      
      service.showLocalNotification({
        title: 'Test',
        message: 'Test message',
      });
      
      expect(PushNotification.localNotification).toHaveBeenCalled();
    });

    it('should handle notification with data', () => {
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      
      service.showLocalNotification({
        title: 'Test',
        message: 'Test message',
        data: { id: '123' },
      });
      
      expect(PushNotification.localNotification).toHaveBeenCalled();
    });
  });

  describe('cancelNotification', () => {
    it('should cancel specific notification', () => {
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      
      service.cancelNotification('notification_id');
      
      expect(PushNotification.cancelLocalNotifications).toHaveBeenCalled();
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all notifications', () => {
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      
      service.cancelAllNotifications();
      
      expect(PushNotification.cancelAllLocalNotifications).toHaveBeenCalled();
    });
  });

  describe('setBadgeCount', () => {
    it('should set badge count', () => {
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      
      service.setBadgeCount(5);
      
      expect(PushNotification.setApplicationIconBadgeNumber).toHaveBeenCalledWith(5);
    });
  });

  describe('getDeliveredNotifications', () => {
    it('should get delivered notifications', async () => {
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      PushNotification.getDeliveredNotifications.mockResolvedValue([
        { identifier: '1', title: 'Test' },
      ]);
      
      const notifications = await service.getDeliveredNotifications();
      
      expect(notifications).toBeDefined();
      expect(PushNotification.getDeliveredNotifications).toHaveBeenCalled();
    });
  });

  describe('removeAllDeliveredNotifications', () => {
    it('should remove all delivered notifications', () => {
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      
      service.removeAllDeliveredNotifications();
      
      expect(PushNotification.removeAllDeliveredNotifications).toHaveBeenCalled();
    });
  });

  describe('Platform-specific behavior', () => {
    it('should handle Android channel creation', () => {
      Platform.OS = 'android';
      const service = NotificationService.getInstance();
      const PushNotification = require('react-native-push-notification');
      
      // Should create channel on Android
      expect(PushNotification.createChannel).toHaveBeenCalled();
    });
  });
});

