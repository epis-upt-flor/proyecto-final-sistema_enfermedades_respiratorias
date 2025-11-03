// Tipos TypeScript para el Backend API de RespiCare
import { Request } from 'express';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalHistory {
  _id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  age: number;
  diagnosis: string;
  symptoms: Symptom[];
  description?: string;
  date: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images?: string[];
  audioNotes?: string;
  isOffline?: boolean;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface Symptom {
  _id?: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description?: string;
}

export interface AIAnalysis {
  _id: string;
  medicalHistoryId: string;
  symptoms: Symptom[];
  possibleDiagnoses: {
    condition: string;
    probability: number;
    recommendations: string[];
  }[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'emergency' | 'sync' | 'system';
  data?: any;
  scheduledTime?: Date;
  isRead: boolean;
  isSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeatMapData {
  _id: string;
  latitude: number;
  longitude: number;
  intensity: number;
  zone: string;
  district: string;
  cases: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyTree {
  _id: string;
  familyId: string;
  personId: string;
  name: string;
  fatherId?: string;
  motherId?: string;
  spouseId?: string;
  children: string[];
  diseases: {
    name: string;
    isHereditary: boolean;
    diagnosedAt?: Date;
  }[];
  isAlive: boolean;
  birthDate?: Date;
  deathDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  _id: string;
  title: string;
  type: 'medical' | 'epidemiological' | 'genetic' | 'general';
  data: any;
  filters: any;
  generatedBy: string;
  generatedAt: Date;
  format: 'pdf' | 'excel' | 'csv';
  filePath?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'admin';
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  filters?: Record<string, any>;
}

// Tipos para middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Tipos para servicios de IA
export interface AIAnalysisRequest {
  symptoms: Symptom[];
  patientAge?: number;
  patientGender?: string;
  medicalHistory?: string[];
}

export interface AIAnalysisResponse {
  analysis: AIAnalysis;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

// Tipos para notificaciones
export interface NotificationRequest {
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'emergency' | 'sync' | 'system';
  data?: any;
  scheduledTime?: Date;
}

export interface PushNotificationPayload {
  to: string;
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
}

// Tipos para archivos
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export interface ProcessedImage {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

// Tipos para métricas y monitoreo
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  services: {
    database: boolean;
    redis: boolean;
    ai: boolean;
    storage: boolean;
  };
  metrics: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
}

export interface SystemMetrics {
  timestamp: Date;
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  users: {
    active: number;
    total: number;
    newToday: number;
  };
  medicalHistories: {
    total: number;
    today: number;
    pendingSync: number;
  };
  ai: {
    analyses: number;
    averageConfidence: number;
    errorRate: number;
  };
}

// Tipos para configuración
export interface AppConfig {
  server: {
    port: number;
    host: string;
    env: string;
  };
  database: {
    mongodb: string;
    redis: string;
  };
  jwt: {
    secret: string;
    expire: string;
    refreshSecret: string;
    refreshExpire: string;
  };
  ai: {
    serviceUrl: string;
    apiKey: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  security: {
    bcryptRounds: number;
    rateLimitWindow: number;
    rateLimitMax: number;
  };
  cors: {
    origins: string[];
  };
  logging: {
    level: string;
    file: string;
  };
}
