/**
 * Servicio de Integración con Wearables (HealthKit / Google Fit)
 * 
 * Nota: Este servicio expone una API estable para la app.
 * Las implementaciones nativas/SDKs reales pueden conectarse aquí posteriormente.
 * Por ahora incluye un fallback/mock seguro.
 */

import { Platform } from 'react-native';

export type WearableMetrics = {
  heartRateBpm?: number;         // frecuencia cardíaca actual/promedio reciente
  stepsToday?: number;           // pasos del día
  oxygenSaturationPct?: number;  // SpO2 si disponible
  lastSync?: string;             // ISO
  provider: 'healthkit' | 'googlefit' | 'mock';
};

class WearablesService {
  async requestPermissions(): Promise<boolean> {
    // Aquí se integrarían permisos de HealthKit/Google Fit
    // iOS: HealthKit (HKHealthStore)
    // Android: Google Fit (Scopes/OAuth)
    // Por ahora, concedemos por defecto (mock)
    return true;
  }

  async isAvailable(): Promise<boolean> {
    // En el futuro, detectar si el SDK correspondiente está disponible y autorizado
    return true;
  }

  async getMetricsSummary(): Promise<WearableMetrics> {
    const granted = await this.requestPermissions();
    if (!granted) {
      return {
        provider: Platform.OS === 'ios' ? 'healthkit' : 'googlefit',
        lastSync: new Date().toISOString(),
      };
    }

    // TODO: Reemplazar con lecturas reales desde SDK nativo
    // Fallback/mock con datos verosímiles
    const mockHeart = 72 + Math.round((Math.random() - 0.5) * 8);
    const mockSteps = 3500 + Math.round(Math.random() * 3000);
    const mockSpO2 = 96 + Math.round(Math.random() * 3);

    return {
      provider: Platform.OS === 'ios' ? 'healthkit' : 'googlefit',
      heartRateBpm: mockHeart,
      stepsToday: mockSteps,
      oxygenSaturationPct: mockSpO2,
      lastSync: new Date().toISOString(),
    };
  }
}

export const wearablesService = new WearablesService();


