declare module 'react-native-push-notification' {
  interface PushNotificationPermissions {
    alert: boolean;
    badge: boolean;
    sound: boolean;
  }

  interface PushNotificationChannel {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  interface PushNotificationConfig {
    onRegister?: (token: { token: string; os: string }) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (err: Error) => void;
    permissions?: PushNotificationPermissions;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  interface LocalNotification {
    title?: string;
    message: string;
    data?: any;
    channelId?: string;
    playSound?: boolean;
    soundName?: string;
    id?: string;
  }

  interface LocalNotificationSchedule extends LocalNotification {
    date: Date;
  }

  class PushNotification {
    static configure(config: PushNotificationConfig): void;
    static localNotification(notification: LocalNotification): void;
    static localNotificationSchedule(notification: LocalNotificationSchedule): void;
    static cancelAllLocalNotifications(): void;
    static cancelLocalNotifications(details: { id: string }): void;
    static createChannel(channel: PushNotificationChannel, callback: (created: boolean) => void): void;
    static getToken(callback: (token: string) => void): void;
    static checkPermissions(callback: (permissions: PushNotificationPermissions) => void): void;
    static requestPermissions(): Promise<PushNotificationPermissions>;
  }

  export default PushNotification;
}

