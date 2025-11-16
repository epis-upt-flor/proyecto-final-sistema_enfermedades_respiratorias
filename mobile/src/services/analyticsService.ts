/**
 * Servicio de Analítica (stub)
 * 
 * API estable para instrumentación. En el futuro, conectar a Firebase Analytics,
 * Segment, Amplitude u otro proveedor. Incluye buffer en memoria sencillo.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

type AnalyticsEvent = {
  name: string;
  props?: Record<string, any>;
  ts: number;
};

class AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private enabled = true;
  private flushTimer: any = null;
  private readonly storageKey = 'analytics_events_buffer';
  private readonly maxStoredEvents = 1000;

  enable(value: boolean) {
    this.enabled = value;
  }

  logEvent(name: string, props?: Record<string, any>) {
    if (!this.enabled) return;
    const evt: AnalyticsEvent = { name, props, ts: Date.now() };
    this.queue.push(evt);
    // Por ahora, salida a consola para visibilidad en dev
    // Reemplazar por SDK real en producción
    // eslint-disable-next-line no-console
    console.log('[analytics]', name, props || {});
  }

  logTiming(name: string, ms: number, props?: Record<string, any>) {
    this.logEvent(`timing.${name}`, { durationMs: ms, ...(props || {}) });
  }

  async persistQueueToStorage(): Promise<void> {
    if (this.queue.length === 0) return;
    try {
      const existingRaw = await AsyncStorage.getItem(this.storageKey);
      const existing: AnalyticsEvent[] = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = [...existing, ...this.queue].slice(-this.maxStoredEvents);
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(merged));
      this.queue = [];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[analytics] persist error', e);
    }
  }

  async loadStoredEvents(): Promise<AnalyticsEvent[]> {
    try {
      const raw = await AsyncStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  async exportToJSON(): Promise<string> {
    // Une eventos almacenados + en memoria (sin perder los en memoria)
    const stored = await this.loadStoredEvents();
    const all = [...stored, ...this.queue];
    return JSON.stringify(all, null, 2);
  }

  async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch {}
  }

  startAutoFlush(intervalMs = 30000): void {
    if (this.flushTimer) return;
    this.flushTimer = setInterval(() => {
      this.persistQueueToStorage();
    }, intervalMs);
  }

  stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  drain(): AnalyticsEvent[] {
    const out = [...this.queue];
    this.queue = [];
    return out;
  }
}

export const analyticsService = new AnalyticsService();


