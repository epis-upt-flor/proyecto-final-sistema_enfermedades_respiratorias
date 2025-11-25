/**
 * Configuración de la API del backend RespiCare
 */

// Obtener la URL base original
const getOriginalBaseURL = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
}

// Helper para normalizar la baseURL - remover /api/v1 si está presente
const normalizeBaseURL = (url: string): string => {
  // Si la URL termina con /api/v1, removerlo
  if (url.endsWith('/api/v1')) {
    return url.replace('/api/v1', '')
  }
  // Si termina con /api, removerlo también
  if (url.endsWith('/api')) {
    return url.replace('/api', '')
  }
  return url
}

// Helper para obtener la baseURL sin /api/v1 (para rutas de chat que están en /api, no /api/v1)
const getChatBaseURL = (): string => {
  return normalizeBaseURL(getOriginalBaseURL())
}

// Helper para construir endpoints - siempre incluir /api/v1 porque normalizamos la baseURL
const buildEndpoint = (path: string): string => {
  // Siempre incluir /api/v1 porque la baseURL ya está normalizada (sin /api/v1)
  return `/api/v1${path}`
}

export const API_CONFIG = {
  baseURL: normalizeBaseURL(getOriginalBaseURL()),
  aiServiceURL: process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000, // 30 segundos
  retries: 3,
  // BaseURL específica para chat (sin /api/v1)
  chatBaseURL: getChatBaseURL(),
}

export const API_ENDPOINTS = {
  // Autenticación
  auth: {
    login: buildEndpoint('/auth/login'),
    register: buildEndpoint('/auth/register'),
    refreshToken: buildEndpoint('/auth/refresh-token'),
    logout: buildEndpoint('/auth/logout'),
    profile: buildEndpoint('/auth/profile'),
    changePassword: buildEndpoint('/auth/change-password'),
  },
  
  // Historias Médicas
  medicalHistories: {
    list: buildEndpoint('/medical-histories'),
    get: (id: string) => buildEndpoint(`/medical-histories/${id}`),
    create: buildEndpoint('/medical-histories'),
    update: (id: string) => buildEndpoint(`/medical-histories/${id}`),
    delete: (id: string) => buildEndpoint(`/medical-histories/${id}`),
    sync: buildEndpoint('/medical-histories/sync'),
    stats: buildEndpoint('/medical-histories/stats'),
  },
  
  // Análisis de Síntomas
  symptomAnalyzer: {
    analyze: '/symptom-analyzer/analyze',
    trends: (patientId: string) => `/symptom-analyzer/trends/${patientId}`,
    recommendations: '/symptom-analyzer/recommendations',
    history: (patientId: string) => `/symptom-analyzer/history/${patientId}`,
    statistics: (patientId: string) => `/symptom-analyzer/statistics/${patientId}`,
  },
  
  // Dashboard
  dashboard: {
    admin: buildEndpoint('/dashboard/admin'),
    doctor: buildEndpoint('/dashboard/doctor'),
    patient: buildEndpoint('/dashboard/patient'),
  },
  
  // Citas Médicas
  appointments: {
    list: '/appointments',
    get: (id: string) => `/appointments/${id}`,
    create: '/appointments',
    update: (id: string) => `/appointments/${id}`,
    cancel: (id: string) => `/appointments/${id}/cancel`,
    reschedule: (id: string) => `/appointments/${id}/reschedule`,
    upcoming: '/appointments/me/upcoming',
    availability: (doctorId: string) => `/appointments/doctor/${doctorId}/availability`,
  },
  
  // Alertas
  alerts: {
    list: '/alerts',
    acknowledge: (id: string) => `/alerts/${id}/acknowledge`,
    dashboard: '/alerts/dashboard/summary',
  },
  
  // Analytics
  analytics: {
    executiveDashboard: '/analytics/executive-dashboard',
    temporalTrends: '/analytics/temporal-trends',
    diseaseReports: '/analytics/disease-reports',
    geographicData: '/analytics/geographic-data',
    symptomSummary: '/analytics/symptom-summary',
    districtTrends: '/analytics/district-trends',
    outbreakPredictions: '/analytics/outbreak-predictions',
  },
  
  // Wearables
  wearables: {
    metrics: buildEndpoint('/wearables/metrics'),
    sync: buildEndpoint('/wearables/sync'),
  },
  
  // Chat - usando rutas del backend (sin /v1, directamente en /api)
  // Nota: Estas rutas están en /api/chat-conversations (no en /api/v1)
  chat: {
    conversations: '/api/chat-conversations',
    messages: (sessionId: string) => `/api/chat-conversations/${sessionId}/messages`,
    getConversation: (sessionId: string) => `/api/chat-conversations/${sessionId}`,
    completeConversation: (sessionId: string) => `/api/chat-conversations/${sessionId}/complete`,
  },
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('refresh_token')
}

export const setAuthTokens = (token: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
  localStorage.setItem('refresh_token', refreshToken)
}

export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

export const getUser = (): any | null => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

export const setUser = (user: any): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('user', JSON.stringify(user))
}

