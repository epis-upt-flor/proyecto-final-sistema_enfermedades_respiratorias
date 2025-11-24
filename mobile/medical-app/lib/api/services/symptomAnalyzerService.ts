/**
 * Servicio de análisis de síntomas con IA
 */

import { apiClient } from '../client'
import { API_ENDPOINTS } from '../config'
import type { SymptomAnalysisRequest, SymptomAnalysisResult } from '../../types'

interface AnalyzeResponse {
  success: boolean
  message: string
  data: SymptomAnalysisResult
}

interface HistoryResponse {
  success: boolean
  message: string
  data: Array<{
    id: string
    date: string
    diagnosis: string
    symptoms: Array<{
      name: string
      severity: string
      duration: number
    }>
    symptomCount: number
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface StatisticsResponse {
  success: boolean
  message: string
  data: {
    period: string
    totalVisits: number
    totalSymptoms: number
    avgSymptomsPerVisit: number
    severityDistribution: {
      mild: number
      moderate: number
      severe: number
    }
    mostCommonSymptoms: Array<{
      symptom: string
      count: number
    }>
    dateRange: {
      start: string
      end: string
    }
  }
}

export class SymptomAnalyzerService {
  async analyze(request: SymptomAnalysisRequest): Promise<SymptomAnalysisResult> {
    const response = await apiClient.post<AnalyzeResponse>(
      `/api/v1${API_ENDPOINTS.symptomAnalyzer.analyze}`,
      {
        symptoms: request.symptoms,
        context: request.context,
        metadata: request.metadata
      }
    )
    // Manejar diferentes formatos de respuesta
    if (response && response.data) {
      return response.data
    } else if (response && 'success' in response && response.success && 'data' in response) {
      return (response as AnalyzeResponse).data
    }
    return response as any as SymptomAnalysisResult
  }

  async getTrends(patientId: string, period: string = '30d'): Promise<any> {
    const response = await apiClient.get(
      `/api/v1${API_ENDPOINTS.symptomAnalyzer.trends(patientId)}?period=${period}`
    )
    return response.data || response
  }

  async getRecommendations(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      `/api/v1${API_ENDPOINTS.symptomAnalyzer.recommendations}`
    )
    return response.data || []
  }

  async getHistory(patientId: string, page: number = 1, limit: number = 10): Promise<HistoryResponse['data']> {
    const response = await apiClient.get<HistoryResponse>(
      `/api/v1${API_ENDPOINTS.symptomAnalyzer.history(patientId)}?page=${page}&limit=${limit}`
    )
    return response.data || []
  }

  async getStatistics(patientId: string, period: string = '30d'): Promise<StatisticsResponse['data']> {
    const response = await apiClient.get<StatisticsResponse>(
      `/api/v1${API_ENDPOINTS.symptomAnalyzer.statistics(patientId)}?period=${period}`
    )
    return response.data
  }
}

export const symptomAnalyzerService = new SymptomAnalyzerService()

