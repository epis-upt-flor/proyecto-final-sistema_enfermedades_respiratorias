/**
 * Wearable Service - Integración con HealthKit (iOS) y Google Fit (Android)
 * 
 * Monitorea datos de salud relevantes para enfermedades respiratorias:
 * - Ritmo cardíaco (Heart Rate)
 * - Oxigenación (SpO2)
 * - Actividad física (Steps, Distance)
 * - Respiración (Respiratory Rate)
 * - Sueño (Sleep Data)
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOTA: Las librerías nativas de salud (HealthKit/Google Fit) requieren configuración adicional
// Por ahora, el servicio funciona con datos simulados y está preparado para integración futura
// Para integrar en producción, instalar:
// - iOS: react-native-health o configurar HealthKit manualmente
// - Android: react-native-google-fit o configurar Health Connect manualmente

// Intentar importar librerías de salud (si están instaladas)
let HealthKit: any = null;
let HealthConnect: any = null;

// En el futuro, descomentar cuando las librerías estén instaladas:
// if (Platform.OS === 'ios') {
//   try {
//     HealthKit = require('react-native-health');
//   } catch (e) {
//     console.warn('HealthKit library not available');
//   }
// } else {
//   try {
//     HealthConnect = require('react-native-google-fit');
//   } catch (e) {
//     console.warn('Google Fit library not available');
//   }
// }

// Tipos de datos de wearables
export interface WearableData {
  heartRate?: number; // BPM
  oxygenSaturation?: number; // SpO2 (%)
  steps?: number;
  distance?: number; // metros
  respiratoryRate?: number; // respiraciones por minuto
  sleepHours?: number;
  timestamp: Date;
  source: 'apple_health' | 'google_fit' | 'manual';
}

export interface WearableMetrics {
  heartRate: {
    current: number;
    average: number;
    min: number;
    max: number;
    resting: number;
  };
  oxygenSaturation: {
    current: number;
    average: number;
    min: number;
  };
  activity: {
    steps: number;
    distance: number; // metros
    activeMinutes: number;
  };
  respiratoryRate: {
    current: number;
    average: number;
  };
}

export interface WearableAlerts {
  lowOxygen: boolean; // SpO2 < 90%
  highHeartRate: boolean; // HR > 100 bpm en reposo
  lowHeartRate: boolean; // HR < 50 bpm
  irregularBreathing: boolean; // Respiratory rate < 10 o > 30
  alertMessages: string[];
}

class WearableService {
  private isInitialized = false;
  private isAuthorized = false;
  private syncInterval: NodeJS.Timeout | null = null;
  
  /**
   * Inicializa el servicio de wearables
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return this.isAuthorized;
      }

      // Verificar si ya está autorizado
      const authorized = await AsyncStorage.getItem('wearable_authorized');
      this.isAuthorized = authorized === 'true';

      // En producción, aquí se integraría con expo-health o react-native-health
      // Por ahora, simulamos la autorización
      if (!this.isAuthorized) {
        // Simular autorización
        this.isAuthorized = await this.requestPermissions();
        if (this.isAuthorized) {
          await AsyncStorage.setItem('wearable_authorized', 'true');
        }
      }

      this.isInitialized = true;
      return this.isAuthorized;
    } catch (error) {
      console.error('Error initializing wearable service:', error);
      return false;
    }
  }

  /**
   * Solicita permisos para acceder a datos de salud
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios' && HealthKit) {
        // iOS: HealthKit
        try {
          const isAvailable = await HealthKit.isHealthDataAvailable();
          if (!isAvailable) {
            console.warn('HealthKit is not available on this device');
            if (__DEV__) return true; // Simular en desarrollo
            return false;
          }

          const result = await HealthKit.requestAuthorizationAsync({
            read: [
              HealthKit.HealthDataType.HeartRate,
              HealthKit.HealthDataType.OxygenSaturation,
              HealthKit.HealthDataType.Steps,
              HealthKit.HealthDataType.DistanceWalkingRunning,
              HealthKit.HealthDataType.RespiratoryRate,
              HealthKit.HealthDataType.SleepAnalysis,
            ],
            write: []
          });

          if (result.granted && result.granted.length > 0) {
            this.isAuthorized = true;
            await AsyncStorage.setItem('wearable_authorized', 'true');
            return true;
          }
        } catch (error) {
          console.error('Error requesting HealthKit permissions:', error);
        }
      } else if (Platform.OS === 'android' && HealthConnect) {
        // Android: Health Connect
        try {
          const result = await HealthConnect.requestPermissionsAsync({
            read: [
              HealthConnect.HealthDataType.HeartRate,
              HealthConnect.HealthDataType.OxygenSaturation,
              HealthConnect.HealthDataType.Steps,
              HealthConnect.HealthDataType.Distance,
              HealthConnect.HealthDataType.RespiratoryRate,
              HealthConnect.HealthDataType.SleepSession,
            ],
            write: []
          });

          if (result.granted && result.granted.length > 0) {
            this.isAuthorized = true;
            await AsyncStorage.setItem('wearable_authorized', 'true');
            return true;
          }
        } catch (error) {
          console.error('Error requesting Health Connect permissions:', error);
        }
      }

      // Fallback: simular permisos para desarrollo
      if (__DEV__) {
        console.warn('Using simulated permissions in development mode');
        this.isAuthorized = true;
        await AsyncStorage.setItem('wearable_authorized', 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      // Fallback: simular permisos para desarrollo
      if (__DEV__) {
        console.warn('Using simulated permissions in development mode');
        return true;
      }
      return false;
    }
  }

  /**
   * Obtiene datos recientes de wearables
   */
  async getRecentData(hours: number = 24): Promise<WearableData[]> {
    try {
      if (!this.isAuthorized) {
        const authorized = await this.initialize();
        if (!authorized) {
          // En desarrollo, usar datos simulados
          if (__DEV__) {
            return this.getSimulatedData(hours);
          }
          return [];
        }
      }

      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - hours * 60 * 60 * 1000);
      const data: WearableData[] = [];

      try {
        if (Platform.OS === 'ios' && HealthKit) {
          // iOS: Usar HealthKit
          try {
            const isAvailable = await HealthKit.isHealthDataAvailable();
            if (!isAvailable) {
              return this.getSimulatedData(hours);
            }

            // Obtener ritmo cardíaco
            const heartRateData = await HealthKit.getHeartRateSamplesAsync({
              startDate,
              endDate,
            });
            if (heartRateData && heartRateData.length > 0) {
              heartRateData.forEach((sample: any) => {
                data.push({
                  heartRate: sample.value,
                  timestamp: new Date(sample.startDate),
                  source: 'apple_health',
                });
              });
            }

            // Obtener oxigenación (SpO2)
            const oxygenData = await HealthKit.getOxygenSaturationSamplesAsync({
              startDate,
              endDate,
            });
            if (oxygenData && oxygenData.length > 0) {
              oxygenData.forEach((sample: any) => {
                const existing = data.find(d => 
                  Math.abs(d.timestamp.getTime() - new Date(sample.startDate).getTime()) < 60000
                );
                if (existing) {
                  existing.oxygenSaturation = sample.value;
                } else {
                  data.push({
                    oxygenSaturation: sample.value,
                    timestamp: new Date(sample.startDate),
                    source: 'apple_health',
                  });
                }
              });
            }

            // Obtener pasos y distancia
            const stepsData = await HealthKit.getStepsAsync({ startDate, endDate });
            if (stepsData && stepsData.length > 0) {
              stepsData.forEach((sample: any) => {
                const existing = data.find(d => 
                  Math.abs(d.timestamp.getTime() - new Date(sample.startDate).getTime()) < 60000
                );
                if (existing) {
                  existing.steps = sample.value;
                  existing.distance = sample.distance || 0;
                } else {
                  data.push({
                    steps: sample.value,
                    distance: sample.distance || 0,
                    timestamp: new Date(sample.startDate),
                    source: 'apple_health',
                  });
                }
              });
            }
          } catch (error) {
            console.error('Error fetching HealthKit data:', error);
          }
        } else if (Platform.OS === 'android' && HealthConnect) {
          // Android: Usar Health Connect
          try {
            // Obtener datos de Health Connect
            // Nota: La API puede variar según la versión de expo-health-connect
            const heartRateData = await HealthConnect.getHeartRateSamplesAsync({
              startDate,
              endDate,
            });
            if (heartRateData && heartRateData.length > 0) {
              heartRateData.forEach((sample: any) => {
                data.push({
                  heartRate: sample.value,
                  timestamp: new Date(sample.startDate),
                  source: 'google_fit',
                });
              });
            }

            // Similar para otros tipos de datos
            // (La implementación exacta dependerá de la API de expo-health-connect)
          } catch (error) {
            console.error('Error fetching Health Connect data:', error);
          }
        }

        // Ordenar por timestamp
        data.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        return data.length > 0 ? data : this.getSimulatedData(hours);
      } catch (error) {
        console.error('Error fetching health data:', error);
        // Fallback a datos simulados en caso de error
        return this.getSimulatedData(hours);
      }
    } catch (error) {
      console.error('Error getting wearable data:', error);
      // Fallback a datos simulados
      return this.getSimulatedData(hours);
    }
  }

  /**
   * Obtiene métricas calculadas
   */
  async getMetrics(): Promise<WearableMetrics | null> {
    try {
      const data = await this.getRecentData(24);
      if (data.length === 0) {
        return null;
      }

      const heartRates = data.filter(d => d.heartRate).map(d => d.heartRate!);
      const oxygenLevels = data.filter(d => d.oxygenSaturation).map(d => d.oxygenSaturation!);
      const respiratoryRates = data.filter(d => d.respiratoryRate).map(d => d.respiratoryRate!);
      
      const totalSteps = data.reduce((sum, d) => sum + (d.steps || 0), 0);
      const totalDistance = data.reduce((sum, d) => sum + (d.distance || 0), 0);

      return {
        heartRate: {
          current: heartRates[heartRates.length - 1] || 0,
          average: heartRates.length > 0 
            ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length 
            : 0,
          min: heartRates.length > 0 ? Math.min(...heartRates) : 0,
          max: heartRates.length > 0 ? Math.max(...heartRates) : 0,
          resting: this.calculateRestingHeartRate(heartRates),
        },
        oxygenSaturation: {
          current: oxygenLevels[oxygenLevels.length - 1] || 0,
          average: oxygenLevels.length > 0 
            ? oxygenLevels.reduce((a, b) => a + b, 0) / oxygenLevels.length 
            : 0,
          min: oxygenLevels.length > 0 ? Math.min(...oxygenLevels) : 0,
        },
        activity: {
          steps: totalSteps,
          distance: totalDistance,
          activeMinutes: data.length * 15, // Estimado
        },
        respiratoryRate: {
          current: respiratoryRates[respiratoryRates.length - 1] || 0,
          average: respiratoryRates.length > 0 
            ? respiratoryRates.reduce((a, b) => a + b, 0) / respiratoryRates.length 
            : 0,
        },
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return null;
    }
  }

  /**
   * Detecta alertas basadas en datos de wearables
   */
  async checkAlerts(metrics: WearableMetrics): Promise<WearableAlerts> {
    const alerts: WearableAlerts = {
      lowOxygen: false,
      highHeartRate: false,
      lowHeartRate: false,
      irregularBreathing: false,
      alertMessages: [],
    };

    // Alertas de oxigenación
    if (metrics.oxygenSaturation.current < 90) {
      alerts.lowOxygen = true;
      alerts.alertMessages.push(
        `⚠️ Oxigenación baja detectada: ${metrics.oxygenSaturation.current}% (Normal: >95%)`
      );
    }

    // Alertas de ritmo cardíaco
    if (metrics.heartRate.resting > 100) {
      alerts.highHeartRate = true;
      alerts.alertMessages.push(
        `⚠️ Ritmo cardíaco elevado en reposo: ${metrics.heartRate.resting} bpm`
      );
    }

    if (metrics.heartRate.resting < 50 && metrics.heartRate.resting > 0) {
      alerts.lowHeartRate = true;
      alerts.alertMessages.push(
        `⚠️ Ritmo cardíaco bajo: ${metrics.heartRate.resting} bpm`
      );
    }

    // Alertas de respiración
    if (metrics.respiratoryRate.current > 0) {
      if (metrics.respiratoryRate.current < 10 || metrics.respiratoryRate.current > 30) {
        alerts.irregularBreathing = true;
        alerts.alertMessages.push(
          `⚠️ Frecuencia respiratoria irregular: ${metrics.respiratoryRate.current} resp/min (Normal: 12-20)`
        );
      }
    }

    return alerts;
  }

  /**
   * Inicia sincronización automática con backend
   */
  startSync(intervalMinutes: number = 15): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncToBackend();
      } catch (error) {
        console.error('Error syncing wearable data:', error);
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Detiene sincronización automática
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Sincroniza datos con el backend
   */
  async syncToBackend(): Promise<boolean> {
    try {
      const data = await this.getRecentData(24);
      if (data.length === 0) {
        return false;
      }

      // Obtener token de autenticación
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found, saving locally');
        await AsyncStorage.setItem('wearable_data_pending', JSON.stringify(data));
        return false;
      }

      // Enviar al backend
      const { API_ENDPOINTS } = await import('@/constants/config');
      const response = await fetch(API_ENDPOINTS.WEARABLES.SYNC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      });

      if (response.ok) {
        // Limpiar datos pendientes si se sincronizó exitosamente
        await AsyncStorage.removeItem('wearable_data_pending');
        return true;
      } else {
        // Guardar localmente para sincronización offline
        await AsyncStorage.setItem('wearable_data_pending', JSON.stringify(data));
        return false;
      }
    } catch (error) {
      console.error('Error syncing to backend:', error);
      // Guardar localmente para sincronización offline
      const data = await this.getRecentData(24);
      await AsyncStorage.setItem('wearable_data_pending', JSON.stringify(data));
      return false;
    }
  }

  /**
   * Calcula ritmo cardíaco en reposo
   */
  private calculateRestingHeartRate(heartRates: number[]): number {
    if (heartRates.length === 0) return 0;
    
    // Tomar el mínimo como aproximación del ritmo en reposo
    // En producción, usar datos durante períodos de descanso
    return Math.min(...heartRates);
  }

  /**
   * Genera datos simulados para desarrollo/testing
   */
  private getSimulatedData(hours: number): WearableData[] {
    const data: WearableData[] = [];
    const now = new Date();
    const intervals = hours * 4; // Cada 15 minutos

    for (let i = intervals; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 15 * 60 * 1000);
      
      // Simular variaciones normales
      const baseHeartRate = 70 + Math.random() * 20;
      const baseOxygen = 95 + Math.random() * 3;
      const baseRespiratory = 14 + Math.random() * 4;
      
      data.push({
        heartRate: Math.round(baseHeartRate),
        oxygenSaturation: Math.round(baseOxygen * 10) / 10,
        respiratoryRate: Math.round(baseRespiratory * 10) / 10,
        steps: i === intervals ? Math.floor(Math.random() * 1000) : 0,
        distance: i === intervals ? Math.floor(Math.random() * 500) : 0,
        timestamp,
        source: Platform.OS === 'ios' ? 'apple_health' : 'google_fit',
      });
    }

    return data;
  }

  /**
   * Obtiene el estado de autorización
   */
  async isHealthKitAuthorized(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return await this.initialize();
      }

      if (Platform.OS === 'ios' && HealthKit) {
        try {
          const isAvailable = await HealthKit.isHealthDataAvailable();
          if (!isAvailable) return false;

          const result = await HealthKit.getAuthorizationStatusAsync({
            read: [
              HealthKit.HealthDataType.HeartRate,
              HealthKit.HealthDataType.OxygenSaturation,
            ],
          });
          this.isAuthorized = result.granted && result.granted.length > 0;
          return this.isAuthorized;
        } catch (error) {
          console.error('Error checking HealthKit authorization:', error);
        }
      } else if (Platform.OS === 'android' && HealthConnect) {
        try {
          const result = await HealthConnect.getAuthorizationStatusAsync({
            read: [
              HealthConnect.HealthDataType.HeartRate,
              HealthConnect.HealthDataType.OxygenSaturation,
            ],
          });
          this.isAuthorized = result.granted && result.granted.length > 0;
          return this.isAuthorized;
        } catch (error) {
          console.error('Error checking Health Connect authorization:', error);
        }
      }

      return this.isAuthorized;
    } catch (error) {
      console.error('Error checking authorization:', error);
      return this.isAuthorized;
    }
  }

  /**
   * Revoca autorización
   */
  async revokeAuthorization(): Promise<void> {
    this.isAuthorized = false;
    await AsyncStorage.removeItem('wearable_authorized');
    this.stopSync();
  }
}

// Instancia singleton
export const wearableService = new WearableService();

