// Servicio de notificaciones para React Native
import PushNotification from 'react-native-push-notification';
import { Platform, Alert } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { NotificationData } from '../../types';

class NotificationService {
  private static instance: NotificationService;
  private store: any;

  private constructor() {
    this.configure();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public setStore(store: any) {
    this.store = store;
  }

  private configure() {
    PushNotification.configure({
      // (required) Called when a remote or local notification is opened or received
      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
        
        // Handle different notification types
        if (notification.userInfo) {
          this.handleNotificationData(notification.userInfo);
        }
      },

      // (optional) Called when Registered For Remote Notifications is successful
      onRegister: (token) => {
        console.log('TOKEN:', token);
        // Send token to server
        this.sendTokenToServer(token.token);
      },

      // (optional) Called when a remote is received
      onRemoteNotification: (notification) => {
        console.log('REMOTE NOTIFICATION:', notification);
      },

      // (optional) Called when a local notification is opened
      onLocalNotification: (notification) => {
        console.log('LOCAL NOTIFICATION:', notification);
      },

      // (optional) Called when the user fails to register for remote notifications
      onRegistrationError: (err) => {
        console.error('REGISTRATION ERROR:', err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // (optional) default: true - Specifies if the notification should be silent
      requestPermissions: Platform.OS === 'ios',
    });

    // Create default channel for Android
    this.createDefaultChannel();
  }

  private createDefaultChannel() {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'respicare-default',
          channelName: 'RespiCare Notifications',
          channelDescription: 'Notificaciones del sistema RespiCare',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }
  }

  private handleNotificationData(data: any) {
    if (this.store) {
      const notification: NotificationData = {
        id: data.id || Date.now().toString(),
        title: data.title || 'Notificación',
        message: data.message || '',
        type: data.type || 'alert',
        data: data.data,
        isRead: false,
      };

      this.store.getState().addNotification(notification);
    }
  }

  private async sendTokenToServer(token: string) {
    try {
      // Aquí enviarías el token al servidor
      console.log('Sending token to server:', token);
      // await api.post('/notifications/register', { token });
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  // Métodos públicos para enviar notificaciones
  public showLocalNotification(title: string, message: string, data?: any) {
    PushNotification.localNotification({
      channelId: 'respicare-default',
      title,
      message,
      playSound: true,
      soundName: 'default',
      userInfo: data,
    });
  }

  public scheduleNotification(
    title: string,
    message: string,
    date: Date,
    data?: any
  ) {
    PushNotification.localNotificationSchedule({
      channelId: 'respicare-default',
      title,
      message,
      date,
      playSound: true,
      soundName: 'default',
      userInfo: data,
    });
  }

  public showEmergencyNotification(title: string, message: string) {
    PushNotification.localNotification({
      channelId: 'respicare-default',
      title: `🚨 ${title}`,
      message,
      playSound: true,
      soundName: 'default',
      priority: 'high',
      importance: 'high',
      vibrate: true,
      userInfo: { type: 'emergency' },
    });

    // Mostrar alerta adicional para emergencias
    Alert.alert(
      '🚨 Emergencia Médica',
      message,
      [
        { text: 'OK', style: 'default' },
        { text: 'Llamar Emergencias', style: 'destructive', onPress: () => {
          // Aquí podrías implementar llamada a emergencias
          console.log('Calling emergency services...');
        }},
      ]
    );
  }

  public showSyncNotification(success: boolean, message?: string) {
    const title = success ? '✅ Sincronización Exitosa' : '❌ Error de Sincronización';
    const defaultMessage = success 
      ? 'Los datos se han sincronizado correctamente'
      : 'No se pudo sincronizar los datos';

    this.showLocalNotification(title, message || defaultMessage, {
      type: 'sync',
      success,
    });
  }

  public showReminderNotification(title: string, message: string, scheduledTime: Date) {
    this.scheduleNotification(title, message, scheduledTime, {
      type: 'reminder',
    });
  }

  public clearAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  public getDeliveredNotifications(callback: (notifications: any[]) => void) {
    PushNotification.getDeliveredNotifications(callback);
  }

  public removeDeliveredNotification(notificationId: string) {
    PushNotification.removeDeliveredNotifications([notificationId]);
  }
}

export default NotificationService;
