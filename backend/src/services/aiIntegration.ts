/**
 * AI Integration Service
 * Connects with RespiCare AI Services for medical processing
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

export interface AIAnalysisRequest {
  patient_id: string;
  text: string;
  language?: string;
  metadata?: Record<string, any>;
}

export interface SymptomAnalysisRequest {
  patient_id: string;
  symptoms: Array<{
    symptom: string;
    severity: string;
    duration: string;
  }>;
  context?: string;
  metadata?: Record<string, any>;
}

export interface AIAnalysisResponse {
  patient_id: string;
  processed_at: string;
  entities: Array<{
    text: string;
    label: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  symptoms: Array<{
    symptom: string;
    category: string;
    confidence: number;
    context?: Record<string, any>;
  }>;
  diagnosis_suggestions: string[];
  risk_factors: string[];
  recommendations: string[];
  confidence_score: number;
  processing_time_ms: number;
}

export interface SymptomAnalysisResponse {
  patient_id: string;
  analyzed_at: string;
  urgency_level: string;
  severity_score: number;
  classification: {
    urgency: string;
    severity_score: number;
    recommendation: string;
    categories: string[];
    confidence: number;
  };
  recommendations: string[];
  warning_signs: string[];
  follow_up_required: boolean;
  confidence_score: number;
  processing_time_ms: number;
}

class AIIntegrationService {
  private aiClient: AxiosInstance;
  private isConnected: boolean = false;

  constructor() {
    this.aiClient = axios.create({
      baseURL: config.ai.serviceUrl,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RespiCare-Backend/1.0.0'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.aiClient.interceptors.request.use(
      (config) => {
        logger.debug('AI Service Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data ? 'Present' : 'None'
        });
        return config;
      },
      (error) => {
        logger.error('AI Service Request Error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.aiClient.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.debug('AI Service Response', {
          status: response.status,
          url: response.config.url,
          processingTime: response.headers['x-processing-time']
        });
        return response;
      },
      (error) => {
        logger.error('AI Service Response Error', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check if AI service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.aiClient.get('/api/v1/health');
      this.isConnected = response.status === 200;
      return this.isConnected;
    } catch (error) {
      logger.error('AI Service Health Check Failed', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Process medical history text with AI
   */
  async processMedicalHistory(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      if (!this.isConnected) {
        await this.checkHealth();
        if (!this.isConnected) {
          throw new AppError('AI Service no disponible', 503);
        }
      }

      const response = await this.aiClient.post<AIAnalysisResponse>(
        '/api/v1/medical-history/process',
        request
      );

      logger.info('Medical history processed by AI', {
        patientId: request.patient_id,
        processingTime: response.data.processing_time_ms,
        confidence: response.data.confidence_score
      });

      return response.data;
    } catch (error: any) {
      logger.error('AI Medical History Processing Failed', {
        patientId: request.patient_id,
        error: error.message
      });

      if (error.response?.status === 503) {
        throw new AppError('Servicio de IA temporalmente no disponible', 503);
      } else if (error.response?.status === 400) {
        throw new AppError('Datos de entrada inválidos para procesamiento de IA', 400);
      } else {
        throw new AppError('Error interno del servicio de IA', 500);
      }
    }
  }

  /**
   * Analyze symptoms with AI
   */
  async analyzeSymptoms(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResponse> {
    try {
      if (!this.isConnected) {
        await this.checkHealth();
        if (!this.isConnected) {
          throw new AppError('AI Service no disponible', 503);
        }
      }

      const response = await this.aiClient.post<SymptomAnalysisResponse>(
        '/api/v1/symptom-analyzer/analyze',
        request
      );

      logger.info('Symptoms analyzed by AI', {
        patientId: request.patient_id,
        urgencyLevel: response.data.urgency_level,
        processingTime: response.data.processing_time_ms
      });

      return response.data;
    } catch (error: any) {
      logger.error('AI Symptom Analysis Failed', {
        patientId: request.patient_id,
        error: error.message
      });

      if (error.response?.status === 503) {
        throw new AppError('Servicio de IA temporalmente no disponible', 503);
      } else if (error.response?.status === 400) {
        throw new AppError('Datos de síntomas inválidos para análisis de IA', 400);
      } else {
        throw new AppError('Error interno del servicio de IA', 500);
      }
    }
  }

  /**
   * Get symptom trends for a patient
   */
  async getSymptomTrends(patientId: string, period: string = '30d'): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.checkHealth();
        if (!this.isConnected) {
          throw new AppError('AI Service no disponible', 503);
        }
      }

      const response = await this.aiClient.get(
        `/api/v1/symptom-analyzer/trends/${patientId}?period=${period}`
      );

      logger.info('Symptom trends retrieved', {
        patientId,
        period,
        dataPoints: response.data.trend_data?.length || 0
      });

      return response.data;
    } catch (error: any) {
      logger.error('AI Symptom Trends Failed', {
        patientId,
        error: error.message
      });

      if (error.response?.status === 404) {
        throw new AppError('No se encontraron tendencias para el paciente', 404);
      } else {
        throw new AppError('Error al obtener tendencias de síntomas', 500);
      }
    }
  }

  /**
   * Get general symptom recommendations
   */
  async getGeneralRecommendations(): Promise<Record<string, string[]>> {
    try {
      if (!this.isConnected) {
        await this.checkHealth();
        if (!this.isConnected) {
          throw new AppError('AI Service no disponible', 503);
        }
      }

      const response = await this.aiClient.get('/api/v1/symptom-analyzer/recommendations');
      return response.data;
    } catch (error: any) {
      logger.error('AI General Recommendations Failed', error);
      throw new AppError('Error al obtener recomendaciones generales', 500);
    }
  }

  /**
   * Search medical histories with AI
   */
  async searchMedicalHistories(searchParams: {
    patient_id?: string;
    date_from?: string;
    date_to?: string;
    diagnosis?: string;
    symptoms?: string[];
    limit?: number;
  }): Promise<AIAnalysisResponse[]> {
    try {
      if (!this.isConnected) {
        await this.checkHealth();
        if (!this.isConnected) {
          throw new AppError('AI Service no disponible', 503);
        }
      }

      const response = await this.aiClient.post('/api/v1/medical-history/search', searchParams);
      return response.data;
    } catch (error: any) {
      logger.error('AI Medical History Search Failed', {
        searchParams,
        error: error.message
      });
      throw new AppError('Error en búsqueda de historias médicas', 500);
    }
  }

  /**
   * Get AI service status
   */
  async getServiceStatus(): Promise<{
    connected: boolean;
    lastCheck: Date;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    const connected = await this.checkHealth();
    const responseTime = Date.now() - startTime;

    return {
      connected,
      lastCheck: new Date(),
      responseTime: connected ? responseTime : undefined
    };
  }
}

// Export singleton instance
export const aiIntegrationService = new AIIntegrationService();
export default aiIntegrationService;
