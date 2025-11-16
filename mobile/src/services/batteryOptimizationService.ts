/**
 * Battery Optimization Service
 * 
 * Monitorea y optimiza el consumo de batería mediante:
 * - Gestión inteligente de intervalos de polling
 * - Pausa automática de timers cuando la app está en background
 * - Ajuste dinámico de frecuencias según el estado de la batería
 * - Métricas de consumo de batería
 */

import { AppState, AppStateStatus } from 'react-native';
import { logger } from '../utils/logger';

interface TimerConfig {
  id: string;
  interval: number;
  callback: () => void | Promise<void>;
  priority: 'high' | 'medium' | 'low';
  pauseOnBackground?: boolean;
}

interface BatteryMetrics {
  activeTimers: number;
  totalPollingInterval: number;
  backgroundPausedTimers: number;
  lastOptimization: Date | null;
}

class BatteryOptimizationService {
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private timerConfigs: Map<string, TimerConfig> = new Map();
  private appState: AppStateStatus = AppState.currentState;
  private metrics: BatteryMetrics = {
    activeTimers: 0,
    totalPollingInterval: 0,
    backgroundPausedTimers: 0,
    lastOptimization: null,
  };

  constructor() {
    this.setupAppStateListener();
  }

  /**
   * Configura el listener para cambios de estado de la app
   */
  private setupAppStateListener(): void {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
        // App volvió al foreground: reanudar timers pausados
        this.resumePausedTimers();
      } else if (this.appState === 'active' && nextAppState.match(/inactive|background/)) {
        // App fue al background: pausar timers de baja prioridad
        this.pauseLowPriorityTimers();
      }
      this.appState = nextAppState;
    });
  }

  /**
   * Registra un timer con configuración de optimización
   */
  registerTimer(config: TimerConfig): string {
    const { id, interval, callback, priority, pauseOnBackground = true } = config;

    // Si ya existe, cancelar el anterior
    if (this.timers.has(id)) {
      this.unregisterTimer(id);
    }

    // Ajustar intervalo según prioridad y estado de la app
    const adjustedInterval = this.adjustIntervalForBattery(interval, priority);

    const timerId = setInterval(async () => {
      // No ejecutar si está en background y está configurado para pausar
      if (this.appState.match(/inactive|background/) && pauseOnBackground && priority !== 'high') {
        return;
      }

      try {
        await callback();
      } catch (error) {
        logger.error(`Error en timer ${id}`, { error });
      }
    }, adjustedInterval);

    this.timers.set(id, timerId);
    this.timerConfigs.set(id, { ...config, interval: adjustedInterval });

    this.metrics.activeTimers++;
    this.metrics.totalPollingInterval += adjustedInterval;

    logger.debug(`Timer registrado: ${id} (intervalo: ${adjustedInterval}ms, prioridad: ${priority})`);

    return id;
  }

  /**
   * Cancela un timer registrado
   */
  unregisterTimer(id: string): boolean {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
      const config = this.timerConfigs.get(id);
      if (config) {
        this.metrics.totalPollingInterval -= config.interval;
      }
      this.timerConfigs.delete(id);
      this.metrics.activeTimers--;
      logger.debug(`Timer cancelado: ${id}`);
      return true;
    }
    return false;
  }

  /**
   * Ajusta el intervalo según la prioridad y estado de la batería
   */
  private adjustIntervalForBattery(baseInterval: number, priority: 'high' | 'medium' | 'low'): number {
    // Multiplicadores según prioridad (mayor = menos frecuente = menos batería)
    const multipliers: Record<'high' | 'medium' | 'low', number> = {
      high: 1.0,      // Sin cambio
      medium: 1.5,    // 50% más lento
      low: 2.0,       // 100% más lento (2x)
    };

    // Si está en background, aumentar aún más el intervalo
    if (this.appState.match(/inactive|background/)) {
      return Math.floor(baseInterval * multipliers[priority] * 2);
    }

    return Math.floor(baseInterval * multipliers[priority]);
  }

  /**
   * Pausa timers de baja prioridad cuando la app va al background
   */
  private pauseLowPriorityTimers(): void {
    let paused = 0;
    this.timerConfigs.forEach((config, id) => {
      if (config.pauseOnBackground && config.priority !== 'high') {
        const timer = this.timers.get(id);
        if (timer) {
          clearInterval(timer);
          this.timers.delete(id);
          paused++;
        }
      }
    });
    this.metrics.backgroundPausedTimers = paused;
    logger.debug(`Pausados ${paused} timers de baja prioridad (app en background)`);
  }

  /**
   * Reanuda timers pausados cuando la app vuelve al foreground
   */
  private resumePausedTimers(): void {
    let resumed = 0;
    this.timerConfigs.forEach((config) => {
      if (!this.timers.has(config.id)) {
        const adjustedInterval = this.adjustIntervalForBattery(
          config.interval,
          config.priority
        );
        const timerId = setInterval(async () => {
          try {
            await config.callback();
          } catch (error) {
            logger.error(`Error en timer ${config.id}`, { error });
          }
        }, adjustedInterval);
        this.timers.set(config.id, timerId);
        resumed++;
      }
    });
    this.metrics.backgroundPausedTimers = 0;
    logger.debug(`Reanudados ${resumed} timers (app en foreground)`);
  }

  /**
   * Optimiza todos los timers activos (reduce frecuencias)
   */
  optimizeAllTimers(): void {
    this.timerConfigs.forEach((config, id) => {
      if (this.timers.has(id)) {
        this.unregisterTimer(id);
        // Re-registrar con intervalo optimizado
        this.registerTimer({
          ...config,
          interval: this.adjustIntervalForBattery(config.interval, config.priority),
        });
      }
    });
    this.metrics.lastOptimization = new Date();
    logger.info('Optimización de timers completada');
  }

  /**
   * Obtiene métricas de consumo de batería
   */
  getMetrics(): BatteryMetrics {
    return { ...this.metrics };
  }

  /**
   * Limpia todos los timers registrados
   */
  cleanup(): void {
    this.timers.forEach((timer) => clearInterval(timer));
    this.timers.clear();
    this.timerConfigs.clear();
    this.metrics = {
      activeTimers: 0,
      totalPollingInterval: 0,
      backgroundPausedTimers: 0,
      lastOptimization: null,
    };
    logger.info('BatteryOptimizationService limpiado');
  }
}

// Exportar singleton
export const batteryOptimizationService = new BatteryOptimizationService();

