/**
 * Servicio de wearables
 */

import { apiClient } from '../client'
import { API_ENDPOINTS } from '../config'
import type { WearableMetrics } from '../../types'

export class WearableService {
  async getMetrics(): Promise<WearableMetrics> {
    return apiClient.get<WearableMetrics>(API_ENDPOINTS.wearables.metrics)
  }

  async syncMetrics(metrics: WearableMetrics): Promise<WearableMetrics> {
    return apiClient.post<WearableMetrics>(
      API_ENDPOINTS.wearables.sync,
      metrics
    )
  }
}

export const wearableService = new WearableService()

