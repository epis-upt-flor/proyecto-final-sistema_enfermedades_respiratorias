/**
 * Servicio de Manejo de Errores en Producción (stub amigable con Sentry)
 * 
 * API:
 * - init(options) -> habilita captura (futuro: conectar Sentry u otro SDK)
 * - captureException(error, context?, severity?) -> registra excepción
 * - captureMessage(message, severity?) -> registra mensaje
 * - setUser(user) -> adjunta usuario
 * - setGlobalHandler() -> instala manejador global para crashes JS
 * 
 * Incluye clasificación de severidad simple y contadores por tipo para triage básico.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

type Severity = 'info' | 'warning' | 'error' | 'fatal';

type TrackingOptions = {
  enabled?: boolean;
  dsn?: string; // reservado para Sentry
  environment?: 'dev' | 'staging' | 'prod';
};

type CapturedError = {
  name: string;
  message: string;
  stack?: string;
};

function normalizeError(error: any): CapturedError {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (typeof error === 'string') {
    return { name: 'Error', message: error };
  }
  try {
    return { name: 'Error', message: JSON.stringify(error) };
  } catch {
    return { name: 'Error', message: String(error) };
  }
}

class ErrorTrackingService {
  private enabled = true;
  private userContext: { id?: string; email?: string } | null = null;
  private env: TrackingOptions['environment'] = 'dev';
  private readonly countersKey = 'error_tracking_counters';

  init(options?: TrackingOptions) {
    this.enabled = options?.enabled ?? true;
    this.env = options?.environment ?? 'dev';
  }

  setUser(user?: { id?: string; email?: string } | null) {
    this.userContext = user || null;
  }

  async captureException(error: any, context?: Record<string, any>, severity?: Severity) {
    if (!this.enabled) return;
    const err = normalizeError(error);
    const sev = severity ?? this.classifySeverity(err);
    // eslint-disable-next-line no-console
    console.log('[error]', { sev, err, context, user: this.userContext, env: this.env });
    await this.incrementCounter(`${err.name}:${sev}`);
  }

  async captureMessage(message: string, severity: Severity = 'info', context?: Record<string, any>) {
    if (!this.enabled) return;
    // eslint-disable-next-line no-console
    console.log('[error:msg]', { severity, message, context, user: this.userContext, env: this.env });
    await this.incrementCounter(`message:${severity}`);
  }

  classifySeverity(err: CapturedError): Severity {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('out of memory') || msg.includes('cannot read property') || msg.includes('undefined is not')) {
      return 'fatal';
    }
    if (msg.includes('network') || msg.includes('timeout')) {
      return 'warning';
    }
    return 'error';
  }

  setGlobalHandler() {
    // RN Global JS error handler
    const globalAny: any = global;
    const prev = globalAny.ErrorUtils?.getGlobalHandler?.();
    const handler = async (error: any, isFatal?: boolean) => {
      await this.captureException(error, { isFatal: Boolean(isFatal) }, isFatal ? 'fatal' : 'error');
      if (prev) {
        try { prev(error, isFatal); } catch {}
      }
    };
    if (globalAny.ErrorUtils?.setGlobalHandler) {
      globalAny.ErrorUtils.setGlobalHandler(handler);
    }
  }

  async getCounters(): Promise<Record<string, number>> {
    try {
      const raw = await AsyncStorage.getItem(this.countersKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private async incrementCounter(key: string): Promise<void> {
    try {
      const counters = await this.getCounters();
      counters[key] = (counters[key] || 0) + 1;
      await AsyncStorage.setItem(this.countersKey, JSON.stringify(counters));
    } catch {}
  }
}

export const errorTrackingService = new ErrorTrackingService();


