/**
 * Configuración de la API del backend RespiCare
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000, // 30 segundos
  retries: 3,
}

export const API_ENDPOINTS = {
  // Autenticación
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
    profile: '/auth/profile',
    changePassword: '/auth/change-password',
  },
  
  // Historias Médicas
  medicalHistories: {
    list: '/medical-histories',
    get: (id: string) => `/medical-histories/${id}`,
    create: '/medical-histories',
    update: (id: string) => `/medical-histories/${id}`,
    delete: (id: string) => `/medical-histories/${id}`,
    sync: '/medical-histories/sync',
    stats: '/medical-histories/stats',
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
    admin: '/dashboard/admin',
    doctor: '/dashboard/doctor',
    patient: '/dashboard/patient',
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
    metrics: '/wearables/metrics',
    sync: '/wearables/sync',
  },
  
  // Chat - usando rutas del backend sin /v1
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

