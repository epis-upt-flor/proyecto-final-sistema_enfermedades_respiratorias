/**
 * Servicio de alertas
 */

import { apiClient } from '../client'
import { API_ENDPOINTS } from '../config'
import type { Alert, PaginatedResponse } from '../../types'

export interface AlertFilters {
  page?: number
  limit?: number
  type?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  acknowledged?: boolean
}

export class AlertService {
  async list(filters?: AlertFilters): Promise<PaginatedResponse<Alert>> {
    const params = new URLSearchParams()
    
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.type) params.append('category', filters.type)
    if (filters?.severity) params.append('priority', filters.severity)
    if (filters?.acknowledged !== undefined) {
      params.append('status', filters.acknowledged ? 'acknowledged' : 'pending')
    }

    const query = params.toString()
    const endpoint = query ? `/api/v1${API_ENDPOINTS.alerts.list}?${query}` : `/api/v1${API_ENDPOINTS.alerts.list}`

    const response = await apiClient.get<PaginatedResponse<Alert> | Alert[] | { success: boolean; data: Alert[] }>(endpoint)
    
    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response)) {
      return { data: response, total: response.length, page: 1, limit: response.length, totalPages: 1 }
    }
    if (response && typeof response === 'object' && 'data' in response) {
      const data = (response as { success: boolean; data: Alert[] }).data
      return { data, total: data.length, page: 1, limit: data.length, totalPages: 1 }
    }
    return response as PaginatedResponse<Alert>
  }

  async acknowledge(alertId: string): Promise<Alert> {
    const response = await apiClient.post<{ success: boolean; data: Alert } | Alert>(
      `/api/v1${API_ENDPOINTS.alerts.acknowledge(alertId)}`
    )
    // Manejar diferentes formatos de respuesta
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { success: boolean; data: Alert }).data
    }
    return response as Alert
  }

  async getDashboardSummary(): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: any } | any>(
      `/api/v1${API_ENDPOINTS.alerts.dashboard}`
    )
    // Manejar diferentes formatos de respuesta
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { success: boolean; data: any }).data
    }
    return response
  }
}

export const alertService = new AlertService()

