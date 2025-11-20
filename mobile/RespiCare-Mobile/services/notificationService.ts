import { Platform } from 'react-native';

// Importar PushNotification solo en plataformas nativas
let PushNotification: any = null;
if (Platform.OS !== 'web') {
  try {
    PushNotification = require('react-native-push-notification').default;
  } catch (error) {
    console.warn('react-native-push-notification no disponible:', error);
  }
}

class NotificationService {
  private static instance: NotificationService;
  private isWeb = Platform.OS === 'web';

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  constructor() {
    if (!this.isWeb && PushNotification) {
      this.configure();
    } else {
      console.log('NotificationService: Modo web - notificaciones deshabilitadas');
    }
  }

  private configure() {
    if (!PushNotification) return;
    
    PushNotification.configure({
      onRegister: function (token: { token: string; os: string }) {
        console.log('TOKEN:', token);
        // Enviar token al backend para notificaciones push
      },

      onNotification: function (notification: any) {
        console.log('NOTIFICATION:', notification);
        
        // Manejar diferentes tipos de notificaciones
        if (notification.userInteraction) {
          // Usuario tocó la notificación
          NotificationService.getInstance().handleNotificationTap(notification);
        }
      },

      onAction: function (notification: any) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      onRegistrationError: function(err: any) {
        console.error(err?.message || err, err);
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
    if (this.isWeb || !PushNotification) {
      console.log('NotificationService: createNotificationChannels no disponible en web');
      return;
    }
    
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
        (created: boolean) => console.log(`createChannel returned '${created}'`)
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
        (created: boolean) => console.log(`createChannel returned '${created}'`)
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
        (created: boolean) => console.log(`createChannel returned '${created}'`)
      );
    }
  }

  // Enviar notificación local
  sendLocalNotification(title: string, message: string, data?: any) {
    if (this.isWeb || !PushNotification) {
      console.log('NotificationService: Notificación (web):', title, message);
      // En web, podrías usar la API de notificaciones del navegador
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body: message });
        }
      }
      return;
    }
    
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
    if (this.isWeb || !PushNotification) {
      console.log('NotificationService: Recordatorio (web):', title, message);
      return;
    }
    
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
    if (this.isWeb || !PushNotification) {
      console.log('NotificationService: Programar notificación no disponible en web');
      return;
    }
    
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
    if (this.isWeb || !PushNotification) {
      console.log('NotificationService: Sincronización (web):', message);
      return;
    }
    
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
    if (this.isWeb || !PushNotification) {
      return;
    }
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancelar notificación específica
  cancelNotification(id: string) {
    if (this.isWeb || !PushNotification) {
      return;
    }
    PushNotification.cancelLocalNotifications({ id });
  }

  // Manejar tap en notificación
  handleNotificationTap(notification: any) {
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
    if (this.isWeb || !PushNotification) {
      return null;
    }
    
    return new Promise((resolve) => {
      PushNotification.getToken((token: string) => {
        resolve(token);
      });
    });
  }

  // Verificar permisos
  async checkPermissions(): Promise<boolean> {
    if (this.isWeb) {
      // En web, verificar permisos de la API de notificaciones del navegador
      if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    }
    
    if (!PushNotification) {
      return false;
    }
    
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions: { alert: boolean; badge: boolean; sound: boolean }) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      });
    });
  }

  // Solicitar permisos
  async requestPermissions(): Promise<boolean> {
    if (this.isWeb) {
      // En web, usar la API de notificaciones del navegador
      if (typeof window !== 'undefined' && 'Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }
    
    if (!PushNotification) {
      return false;
    }
    
    return new Promise((resolve) => {
      PushNotification.requestPermissions().then((permissions: { alert: boolean; badge: boolean; sound: boolean }) => {
        resolve(permissions.alert && permissions.badge && permissions.sound);
      }).catch(() => {
        resolve(false);
      });
    });
  }
}

export default NotificationService;
