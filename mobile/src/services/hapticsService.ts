// Haptics service (optional dependency on expo-haptics). Falls back gracefully.
type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';

class HapticsService {
  private getModule() {
    try {
      // @ts-ignore optional dependency
      return require('expo-haptics');
    } catch {
      return null;
    }
  }

  async impact(style: ImpactStyle = 'light') {
    const Haptics = this.getModule();
    if (!Haptics) return;
    const map: Record<ImpactStyle, any> = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
      rigid: Haptics.ImpactFeedbackStyle.Rigid,
      soft: Haptics.ImpactFeedbackStyle.Soft,
    };
    try {
      await Haptics.impactAsync(map[style] || Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  }

  async selection() {
    const Haptics = this.getModule();
    if (!Haptics) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success') {
    const Haptics = this.getModule();
    if (!Haptics) return;
    const map: Record<string, any> = {
      success: Haptics.NotificationFeedbackType.Success,
      warning: Haptics.NotificationFeedbackType.Warning,
      error: Haptics.NotificationFeedbackType.Error,
    };
    try {
      await Haptics.notificationAsync(map[type] || Haptics.NotificationFeedbackType.Success);
    } catch {}
  }
}

export const hapticsService = new HapticsService();
export default hapticsService;


