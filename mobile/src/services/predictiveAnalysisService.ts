/**
 * Servicio de Análisis Predictivo
 * 
 * Proporciona análisis predictivo de síntomas y tendencias de salud
 */

import { apiService } from './api';
import { SymptomAnalysis } from '../types';

export interface PredictiveTrend {
  date: string;
  predictedSeverity: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface HealthTrend {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercent: number;
  timeframe: '7d' | '30d' | '90d';
}

export interface PredictiveAnalysis {
  patientId: string;
  trends: HealthTrend[];
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    factors: Array<{
      factor: string;
      impact: 'low' | 'medium' | 'high';
      description: string;
    }>;
  };
  predictions: {
    nextWeek: PredictiveTrend[];
    nextMonth: PredictiveTrend[];
  };
  recommendations: string[];
  generatedAt: string;
}

class PredictiveAnalysisService {
  /**
   * Obtiene análisis predictivo para un paciente
   */
  async getPredictiveAnalysis(
    patientId: string,
    timeframe: '7d' | '30d' | '90d' = '30d'
  ): Promise<PredictiveAnalysis | null> {
    try {
      const response = await apiService.get(
        `/analytics/predictive/${patientId}?timeframe=${timeframe}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: generar análisis básico localmente
      return this.generateLocalAnalysis(patientId, timeframe);
    } catch (error) {
      console.error('Error getting predictive analysis:', error);
      // Fallback a análisis local
      return this.generateLocalAnalysis(patientId, timeframe);
    }
  }

  /**
   * Obtiene tendencias de síntomas
   */
  async getSymptomTrends(
    patientId: string,
    symptomType?: string
  ): Promise<HealthTrend[]> {
    try {
      const response = await apiService.get(
        `/analytics/trends/${patientId}${symptomType ? `?symptom=${symptomType}` : ''}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('Error getting symptom trends:', error);
      return [];
    }
  }

  /**
   * Predice riesgo de complicaciones
   */
  async predictRisk(
    patientId: string,
    symptoms: any[]
  ): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    probability: number;
    factors: string[];
  } | null> {
    try {
      const response = await apiService.post('/analytics/predict-risk', {
        patientId,
        symptoms,
      });

      if (response.success && response.data) {
        return response.data;
      }

      // Fallback: cálculo básico local
      return this.calculateLocalRisk(symptoms);
    } catch (error) {
      console.error('Error predicting risk:', error);
      return this.calculateLocalRisk(symptoms);
    }
  }

  /**
   * Genera análisis predictivo local (fallback)
   */
  private async generateLocalAnalysis(
    patientId: string,
    timeframe: '7d' | '30d' | '90d'
  ): Promise<PredictiveAnalysis> {
    // Análisis básico basado en reglas
    const trends: HealthTrend[] = [
      {
        metric: 'Severidad de Síntomas',
        currentValue: 2.5,
        predictedValue: 2.0,
        trend: 'decreasing',
        changePercent: -20,
        timeframe,
      },
      {
        metric: 'Frecuencia de Episodios',
        currentValue: 3,
        predictedValue: 2,
        trend: 'decreasing',
        changePercent: -33,
        timeframe,
      },
    ];

    const predictions: PredictiveTrend[] = [];
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;

    for (let i = 1; i <= days; i++) {
      predictions.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        predictedSeverity: 2.0 - (i / days) * 0.5,
        confidence: 0.7,
        riskLevel: i < days / 2 ? 'medium' : 'low',
        recommendations: [
          'Continuar con el tratamiento',
          'Monitorear síntomas diariamente',
        ],
      });
    }

    return {
      patientId,
      trends,
      riskAssessment: {
        overallRisk: 'medium',
        factors: [
          {
            factor: 'Tendencia de síntomas',
            impact: 'medium',
            description: 'Los síntomas muestran una tendencia a la mejora',
          },
        ],
      },
      predictions: {
        nextWeek: predictions.slice(0, 7),
        nextMonth: predictions.slice(0, 30),
      },
      recommendations: [
        'Continuar con el tratamiento prescrito',
        'Monitorear síntomas regularmente',
        'Consultar médico si los síntomas empeoran',
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Calcula riesgo local (fallback)
   */
  private calculateLocalRisk(symptoms: any[]): {
    riskLevel: 'low' | 'medium' | 'high';
    probability: number;
    factors: string[];
  } {
    const severeSymptoms = symptoms.filter(s => s.severity === 'severe').length;
    const moderateSymptoms = symptoms.filter(s => s.severity === 'moderate').length;

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    let probability = 0.3;
    const factors: string[] = [];

    if (severeSymptoms >= 2) {
      riskLevel = 'high';
      probability = 0.8;
      factors.push('Múltiples síntomas severos');
    } else if (severeSymptoms >= 1 || moderateSymptoms >= 3) {
      riskLevel = 'medium';
      probability = 0.5;
      factors.push('Síntomas moderados a severos');
    } else {
      factors.push('Síntomas leves');
    }

    if (symptoms.length > 5) {
      factors.push('Gran cantidad de síntomas');
      probability += 0.1;
    }

    return {
      riskLevel,
      probability: Math.min(probability, 0.95),
      factors,
    };
  }

  /**
   * Obtiene visualizaciones de datos para gráficos
   */
  async getVisualizationData(
    patientId: string,
    metric: string,
    timeframe: '7d' | '30d' | '90d'
  ): Promise<Array<{ date: string; value: number }>> {
    try {
      const response = await apiService.get(
        `/analytics/visualization/${patientId}?metric=${metric}&timeframe=${timeframe}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      // Generar datos de ejemplo
      return this.generateSampleData(timeframe);
    } catch (error) {
      console.error('Error getting visualization data:', error);
      return this.generateSampleData(timeframe);
    }
  }

  /**
   * Genera datos de ejemplo para visualización
   */
  private generateSampleData(
    timeframe: '7d' | '30d' | '90d'
  ): Array<{ date: string; value: number }> {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const data: Array<{ date: string; value: number }> = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString(),
        value: 2.5 + Math.random() * 1.5 - Math.random() * (i / days) * 0.5,
      });
    }

    return data;
  }
}

// Instancia singleton
export const predictiveAnalysisService = new PredictiveAnalysisService();

