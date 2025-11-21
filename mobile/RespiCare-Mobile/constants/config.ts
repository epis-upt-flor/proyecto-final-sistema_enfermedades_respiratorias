/**
 * Configuración centralizada de URLs y endpoints
 * 
 * Para desarrollo local, usa las variables de entorno:
 * - EXPO_PUBLIC_API_BASE_URL: URL base del backend API
 * - EXPO_PUBLIC_AI_SERVICE_URL: URL del servicio de IA
 * - EXPO_PUBLIC_WS_URL: URL del WebSocket
 */

// URLs por defecto para desarrollo local
const DEFAULT_API_BASE_URL = 'http://localhost:3001';
const DEFAULT_AI_SERVICE_URL = 'http://localhost:8000';
const DEFAULT_WS_URL = 'ws://localhost:3001';

// Obtener URLs desde variables de entorno o usar valores por defecto
export const API_BASE_URL = 
  process.env.EXPO_PUBLIC_API_BASE_URL || 
  DEFAULT_API_BASE_URL;

export const AI_SERVICE_URL = 
  process.env.EXPO_PUBLIC_AI_SERVICE_URL || 
  DEFAULT_AI_SERVICE_URL;

export const WS_URL = 
  process.env.EXPO_PUBLIC_WS_URL || 
  DEFAULT_WS_URL;

// Endpoints completos
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/v1/auth/login`,
    REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    ME: `${API_BASE_URL}/api/v1/auth/me`,
    REFRESH: `${API_BASE_URL}/api/v1/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/api/v1/auth/logout`,
  },
  
  // Análisis de síntomas
  SYMPTOM_ANALYZER: {
    ANALYZE: `${API_BASE_URL}/api/v1/symptom-analyzer/analyze`,
    ML_ANALYZE: `${API_BASE_URL}/api/v1/symptom-analyzer/ml-analyze`,
  },
  
  // Citas médicas
  APPOINTMENTS: {
    LIST: `${API_BASE_URL}/api/v1/appointments`,
    CREATE: `${API_BASE_URL}/api/v1/appointments`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/v1/appointments/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/v1/appointments/${id}`,
  },
  
  // Historial médico
  MEDICAL_HISTORY: {
    LIST: `${API_BASE_URL}/api/v1/medical-history`,
    CREATE: `${API_BASE_URL}/api/v1/medical-history`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/v1/medical-history/${id}`,
  },
  
  // Historiales médicos (plural, usado en algunos endpoints)
  MEDICAL_HISTORIES: {
    LIST: `${API_BASE_URL}/api/v1/medical-histories`,
    CREATE: `${API_BASE_URL}/api/v1/medical-histories`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/v1/medical-histories/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/v1/medical-histories/${id}`,
  },
  
  // Wearables
  WEARABLES: {
    SYNC: `${API_BASE_URL}/api/v1/wearables/sync`,
    DATA: `${API_BASE_URL}/api/v1/wearables/data`,
  },
  
  // Health checks
  HEALTH: {
    BACKEND: `${API_BASE_URL}/api/health`,
    AI_SERVICE: `${AI_SERVICE_URL}/api/v1/health`,
  },
  
  // Chatbot y Análisis con IA
  CHATBOT: {
    ANALYZE: `${AI_SERVICE_URL}/api/v1/analyze`,
    TEST: `${AI_SERVICE_URL}/api/v1/test`,
  },
  
  // Análisis de Imágenes
  IMAGE_ANALYSIS: {
    ANALYZE: `${AI_SERVICE_URL}/api/v1/ml/advanced/image`,
  },
  
  // Análisis de Audio
  AUDIO_ANALYSIS: {
    COUGH: `${AI_SERVICE_URL}/api/v1/audio/cough`,
    TRANSCRIBE: `${AI_SERVICE_URL}/api/v1/audio/transcribe`,
  },
};

// Configuración de la aplicación
export const APP_CONFIG = {
  API_BASE_URL,
  AI_SERVICE_URL,
  WS_URL,
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
};

export default APP_CONFIG;

