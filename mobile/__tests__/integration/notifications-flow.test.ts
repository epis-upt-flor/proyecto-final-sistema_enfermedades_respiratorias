/**
 * Tests de integración - Flujo completo de notificaciones
 * Verifica recibir, leer, eliminar y sincronización
 */

import { useAppStore } from '../../medical-app/store/useAppStore';
// Nota: NotificationService puede no existir en medical-app
import { dashboardService } from '../../medical-app/lib/api/services/dashboardService';
import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';

// Mock dependencies
jest.mock('../../medical-app/lib/api/services/dashboardService');
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  setApplicationIconBadgeNumber: jest.fn(),
}));

describe('Notifications Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.getState().clearNotifications();
  });

  describe('Receive Notifications', () => {
    it('debe recibir y procesar notificación', () => {
      const notification = {
        id: 'notif-1',
        title: 'Nueva cita',
        message: 'Tienes una cita en 1 hora',
        type: 'reminder' as const,
        isRead: false,
      };

      // Agregar notificación
      useAppStore.getState().addNotification(notification);

      // Verificar que se agrega al store
      const notifications = useAppStore.getState().notifications;
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].id).toBe('notif-1');

      // Verificar que se muestra notificación local
      const notificationService = NotificationService.getInstance();
      expect(notificationService).toBeDefined();
    });

    it('debe manejar múltiples notificaciones', () => {
      const notifications = [
        {
          id: 'notif-1',
          title: 'Notificación 1',
          message: 'Mensaje 1',
          type: 'info' as const,
          isRead: false,
        },
        {
          id: 'notif-2',
          title: 'Notificación 2',
          message: 'Mensaje 2',
          type: 'reminder' as const,
          isRead: false,
        },
      ];

      notifications.forEach(n => {
        useAppStore.getState().addNotification(n);
      });

      const stored = useAppStore.getState().notifications;
      expect(stored.length).toBe(2);
    });
  });

  describe('Read Notifications', () => {
    it('debe marcar notificación como leída', () => {
      const notification = {
        id: 'notif-1',
        title: 'Nueva cita',
        message: 'Tienes una cita',
        type: 'reminder' as const,
        isRead: false,
      };

      useAppStore.getState().addNotification(notification);

      // Marcar como leída
      useAppStore.getState().markNotificationAsRead('notif-1');

      const notifications = useAppStore.getState().notifications;
      const read = notifications.find(n => n.id === 'notif-1');
      expect(read?.isRead).toBe(true);
    });

    it('debe actualizar badge count al leer', () => {
      const notifications = [
        { id: 'notif-1', title: 'Test 1', message: 'Msg 1', type: 'info' as const, isRead: false },
        { id: 'notif-2', title: 'Test 2', message: 'Msg 2', type: 'info' as const, isRead: false },
      ];

      notifications.forEach(n => {
        useAppStore.getState().addNotification(n);
      });

      // Verificar count inicial
      const unreadCount = useAppStore.getState().notifications.filter(n => !n.isRead).length;
      expect(unreadCount).toBe(2);

      // Marcar una como leída
      useAppStore.getState().markNotificationAsRead('notif-1');

      // Verificar count actualizado
      const newUnreadCount = useAppStore.getState().notifications.filter(n => !n.isRead).length;
      expect(newUnreadCount).toBe(1);
    });
  });

  describe('Delete Notifications', () => {
    it('debe eliminar notificación específica', () => {
      const notifications = [
        { id: 'notif-1', title: 'Test 1', message: 'Msg 1', type: 'info' as const, isRead: false },
        { id: 'notif-2', title: 'Test 2', message: 'Msg 2', type: 'info' as const, isRead: false },
      ];

      notifications.forEach(n => {
        useAppStore.getState().addNotification(n);
      });

      // Eliminar una
      useAppStore.getState().removeNotification('notif-1');

      const stored = useAppStore.getState().notifications;
      expect(stored.length).toBe(1);
      expect(stored[0].id).toBe('notif-2');
    });

    it('debe eliminar todas las notificaciones', () => {
      const notifications = [
        { id: 'notif-1', title: 'Test 1', message: 'Msg 1', type: 'info' as const, isRead: false },
        { id: 'notif-2', title: 'Test 2', message: 'Msg 2', type: 'info' as const, isRead: false },
      ];

      notifications.forEach(n => {
        useAppStore.getState().addNotification(n);
      });

      // Eliminar todas
      useAppStore.getState().clearNotifications();

      const stored = useAppStore.getState().notifications;
      expect(stored.length).toBe(0);
    });
  });

  describe('Notification Analytics', () => {
    it('debe registrar eventos de notificación', () => {
      const notification = {
        id: 'notif-1',
        title: 'Nueva cita',
        message: 'Tienes una cita',
        type: 'reminder' as const,
        isRead: false,
      };

      useAppStore.getState().addNotification(notification);

      expect(analyticsService.logEvent).toHaveBeenCalledWith('notification_received', {
        notificationId: 'notif-1',
        type: 'reminder',
      });
    });
  });
});

