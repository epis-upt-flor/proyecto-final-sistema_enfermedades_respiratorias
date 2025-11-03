import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    this.configure();
  }

  private configure() {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
        // Enviar token al backend para notificaciones push
      },

      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Manejar diferentes tipos de notificaciones
        if (notification.userInteraction) {
          // Usuario tocó la notificación
          this.handleNotificationTap(notification);
        }
      },

      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  }

  // Configurar canales de notificación para Android
  createNotificationChannels() {
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'respicare-alerts',
          channelName: 'RespiCare Alertas',
          channelDescription: 'Notificaciones de alertas médicas importantes',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`createChannel returned '${created}'`)
      );

      PushNotification.createChannel(
        {
          channelId: 'respicare-reminders',
          channelName: 'RespiCare Recordatorios',
          channelDescription: 'Recordatorios de medicamentos y citas',
          playSound: true,
          soundName: 'default',
          importance: 3,
          vibrate: true,
        },
        (created) => console.log(`createChannel returned '${created}'`)
      );

      PushNotification.createChannel(
        {
          channelId: 'respicare-sync',
          channelName: 'RespiCare Sincronización',
          channelDescription: 'Notificaciones de sincronización de datos',
          playSound: false,
          importance: 2,
          vibrate: false,
        },
        (created) => console.log(`createChannel returned '${created}'`)
      );
    }
  }

  // Enviar notificación local
  sendLocalNotification(title: string, message: string, data?: any) {
    PushNotification.localNotification({
      title,
      message,
      data,
      channelId: 'respicare-alerts',
      playSound: true,
      soundName: 'default',
    });
  }

  // Enviar notificación de recordatorio
  sendReminderNotification(title: string, message: string, data?: any) {
    PushNotification.localNotification({
      title,
      message,
      data,
      channelId: 'respicare-reminders',
      playSound: true,
      soundName: 'default',
    });
  }

  // Programar notificación para más tarde
  scheduleNotification(title: string, message: string, date: Date, data?: any) {
    PushNotification.localNotificationSchedule({
      title,
      message,
      date,
      data,
      channelId: 'respicare-reminders',
      playSound: true,
      soundName: 'default',
    });
  }

  // Enviar notificación de sincronización
  sendSyncNotification(message: string, isSuccess: boolean = true) {
    PushNotification.localNotification({
      title: isSuccess ? 'Sincronización Exitosa' : 'Error de Sincronización',
      message,
      channelId: 'respicare-sync',
      playSound: !isSuccess,
      soundName: isSuccess ? undefined : 'default',
    });
  }

  // Cancelar todas las notificaciones
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancelar notificación específica
  cancelNotification(id: string) {
    PushNotification.cancelLocalNotifications({ id });
  }

  // Manejar tap en notificación
  private handleNotificationTap(notification: any) {
    const { data } = notification;
    
    if (data?.type === 'medical_alert') {
      // Navegar a pantalla de alertas médicas
      console.log('Navegando a alertas médicas');
    } else if (data?.type === 'appointment_reminder') {
      // Navegar a pantalla de citas
      console.log('Navegando a citas');
    } else if (data?.type === 'sync_status') {
      // Mostrar estado de sincronización
      console.log('Mostrando estado de sincronización');
    }
  }

  // Obtener token de notificación
  async getToken(): Promise<string | null> {
    return new Promise((resolve) => {
      PushNotification.getToken((token) => {
        resolve(token);
      });
    });
  }

  // Verificar permisos
  async checkPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }

  // Solicitar permisos
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then((permissions) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }
}

export default NotificationService;
