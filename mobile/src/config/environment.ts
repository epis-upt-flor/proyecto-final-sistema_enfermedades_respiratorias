/**
 * Environment Configuration for RespiCare Mobile
 * Handles different configurations for development, staging, and production
 */

// Environment detection
const isDevelopment = __DEV__;
const isProduction = !__DEV__;

// Base configuration
const baseConfig = {
  app: {
    name: 'RespiCare Mobile',
    version: '1.0.0',
    buildNumber: '1',
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  storage: {
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    cacheExpiration: 24 * 60 * 60 * 1000, // 24 hours
  },
  sync: {
    batchSize: 10,
    syncInterval: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
  },
  ai: {
    maxAnalysisHistory: 100,
    analysisTimeout: 30000,
    fallbackToLocal: true,
  },
  notifications: {
    maxNotifications: 50,
    emergencyTimeout: 5000,
  },
};

// Development configuration
const developmentConfig = {
  ...baseConfig,
  api: {
    ...baseConfig.api,
    baseURL: 'http://10.0.2.2:3001/api/v1', // Default: Android Emulator (10.0.2.2)
    wsURL: 'ws://10.0.2.2:3001',            // Override via API_BASE_URL env var if needed
  },
  ai: {
    ...baseConfig.ai,
    serviceURL: 'http://10.0.2.2:8000/api/v1', // Default: Android Emulator
    enableDebugLogs: true,
  },
  debug: {
    enableLogs: true,
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
  },
};

// Production configuration
const productionConfig = {
  ...baseConfig,
  api: {
    ...baseConfig.api,
    baseURL: 'https://api.respicare.com/v1',
    wsURL: 'wss://api.respicare.com',
  },
  ai: {
    ...baseConfig.ai,
    serviceURL: 'https://ai.respicare.com/api/v1',
    enableDebugLogs: false,
  },
  debug: {
    enableLogs: false,
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
  },
};

// Staging configuration (if needed)
const stagingConfig = {
  ...baseConfig,
  api: {
    ...baseConfig.api,
    baseURL: 'https://staging-api.respicare.com/v1',
    wsURL: 'wss://staging-api.respicare.com',
  },
  ai: {
    ...baseConfig.ai,
    serviceURL: 'https://staging-ai.respicare.com/api/v1',
    enableDebugLogs: true,
  },
  debug: {
    enableLogs: true,
    enablePerformanceMonitoring: true,
    enableErrorReporting: true,
  },
};

// Select configuration based on environment
let config;
if (isDevelopment) {
  config = developmentConfig;
} else if (process.env.NODE_ENV === 'staging') {
  config = stagingConfig;
} else {
  config = productionConfig;
}

// Environment variables (can be overridden)
const envOverrides = {
  API_BASE_URL: process.env.API_BASE_URL,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
};

// Apply environment overrides
if (envOverrides.API_BASE_URL) {
  config.api.baseURL = envOverrides.API_BASE_URL;
}

if (envOverrides.AI_SERVICE_URL) {
  config.ai.serviceURL = envOverrides.AI_SERVICE_URL;
}

if (envOverrides.DEBUG_MODE !== undefined) {
  config.debug.enableLogs = envOverrides.DEBUG_MODE;
}

// Feature flags
export const featureFlags = {
  enableOfflineMode: true,
  enableAIAnalysis: true,
  enableChatbot: true,
  enablePushNotifications: true,
  enableLocationTracking: true,
  enableFileUpload: true,
  enableVoiceRecording: true,
  enableEmergencyMode: true,
  enableSyncQueue: true,
  enableCaching: true,
  enableAnalytics: !isDevelopment,
  enableCrashReporting: !isDevelopment,
};

// API endpoints
export const apiEndpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    profile: '/auth/profile',
  },
  medicalHistories: {
    list: '/medical-histories',
    create: '/medical-histories',
    get: (id: string) => `/medical-histories/${id}`,
    update: (id: string) => `/medical-histories/${id}`,
    delete: (id: string) => `/medical-histories/${id}`,
    sync: '/medical-histories/sync',
  },
  symptomAnalyzer: {
    analyze: '/symptom-analyzer/analyze',
    trends: (patientId: string) => `/symptom-analyzer/trends/${patientId}`,
    recommendations: '/symptom-analyzer/recommendations',
  },
  dashboard: {
    admin: '/dashboard/admin',
    doctor: '/dashboard/doctor',
    patient: '/dashboard/patient',
    health: '/dashboard/health',
  },
  upload: {
    medicalFiles: '/upload/medical-files',
    fileInfo: (path: string) => `/upload/file-info/${path}`,
    deleteFile: (path: string) => `/upload/file/${path}`,
  },
  export: {
    medicalHistories: '/export/medical-histories',
    userStatistics: '/export/user-statistics',
    formats: '/export/formats',
  },
};

// Error messages
export const errorMessages = {
  network: {
    noConnection: 'No hay conexión a internet. Verifica tu conexión y vuelve a intentar.',
    timeout: 'La solicitud tardó demasiado. Verifica tu conexión y vuelve a intentar.',
    serverError: 'Error del servidor. Por favor, intenta más tarde.',
    unauthorized: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  },
  validation: {
    required: 'Este campo es obligatorio.',
    email: 'Por favor, ingresa un email válido.',
    password: 'La contraseña debe tener al menos 8 caracteres.',
    phone: 'Por favor, ingresa un número de teléfono válido.',
  },
  ai: {
    analysisFailed: 'No se pudo analizar los síntomas. Por favor, intenta de nuevo.',
    serviceUnavailable: 'El servicio de IA no está disponible. Usando análisis local.',
    timeout: 'El análisis tardó demasiado. Por favor, intenta de nuevo.',
  },
  sync: {
    failed: 'No se pudo sincronizar los datos. Se reintentará automáticamente.',
    partial: 'Algunos datos no se pudieron sincronizar.',
    offline: 'Los datos se sincronizarán cuando haya conexión.',
  },
};

// Success messages
export const successMessages = {
  auth: {
    login: '¡Bienvenido! Has iniciado sesión correctamente.',
    register: '¡Registro exitoso! Revisa tu email para verificar tu cuenta.',
    logout: 'Has cerrado sesión correctamente.',
  },
  data: {
    saved: 'Datos guardados correctamente.',
    synced: 'Datos sincronizados correctamente.',
    deleted: 'Elemento eliminado correctamente.',
  },
  ai: {
    analysisComplete: 'Análisis completado correctamente.',
  },
};

// Validation rules
export const validationRules = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
};

// Storage keys
export const storageKeys = {
  auth: {
    tokens: 'auth_tokens',
    user: 'current_user',
    refreshToken: 'refresh_token',
  },
  data: {
    medicalHistories: 'medical_histories',
    symptomAnalyses: 'symptom_analyses',
    syncQueue: 'sync_queue',
    lastSync: 'last_sync_timestamp',
  },
  settings: {
    preferences: 'user_preferences',
    notifications: 'notification_settings',
    privacy: 'privacy_settings',
  },
  cache: {
    api: 'api_cache',
    images: 'image_cache',
    analysis: 'analysis_cache',
  },
};

// Default values
export const defaults = {
  user: {
    role: 'patient' as const,
    language: 'es',
    timezone: 'America/Lima',
  },
  medicalHistory: {
    gender: 'M' as const,
    severity: 'moderate' as const,
  },
  analysis: {
    confidenceThreshold: 0.7,
    maxRecommendations: 8,
    timeout: 30000,
  },
  sync: {
    interval: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    batchSize: 10,
  },
};

// Export the final configuration
export default config;

// Export individual configurations for testing
export {
  developmentConfig,
  productionConfig,
  stagingConfig,
  baseConfig,
};
