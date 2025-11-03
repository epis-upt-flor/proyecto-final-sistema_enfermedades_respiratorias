// Tipos TypeScript para la aplicación móvil RespiCare

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F';
  diagnosis: string;
  symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
  }>;
  treatment: string;
  notes: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  attachments?: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
  isOffline?: boolean;
  syncStatus: 'pending' | 'synced' | 'error';
}

export interface Symptom {
  id: string;
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description?: string;
}

export interface SymptomAnalysis {
  id: string;
  patientId: string;
  symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
  }>;
  urgencyLevel: 'low' | 'medium' | 'high';
  severityScore: number;
  classification: {
    categories: string[];
    confidence: number;
    urgency: string;
    possibleConditions: Array<{
      condition: string;
      probability: number;
      description: string;
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    emergency: string[];
  };
  warningSigns: string[];
  followUpRequired: boolean;
  confidenceScore: number;
  analyzedAt: string;
  processingTimeMs: number;
  analysisMethod: 'ai_service' | 'local_rules' | 'hybrid';
}

export interface AIAnalysis {
  id: string;
  symptoms: Symptom[];
  possibleDiagnoses: {
    condition: string;
    probability: number;
    recommendations: string[];
  }[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'emergency' | 'sync';
  data?: any;
  scheduledTime?: string;
  isRead: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: number;
  lastSyncTime: string | null;
  syncErrors: string[];
}

export interface OfflineData {
  medicalHistories: MedicalHistory[];
  symptomAnalyses: SymptomAnalysis[];
  lastSync: string;
  pendingSync: number;
}

export interface AppState {
  user: User | null;
  isOnline: boolean;
  offlineData: OfflineData;
  notifications: NotificationData[];
  isLoading: boolean;
  syncStatus: SyncStatus;
}

// Tipos para navegación
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  DataCapture: undefined;
  MedicalHistory: { historyId?: string };
  AIAnalysis: { symptoms: Symptom[] };
  ChatBot: undefined;
  Settings: undefined;
  OfflineData: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Capture: undefined;
  History: undefined;
  AI: undefined;
  ChatBot: undefined;
  Profile: undefined;
};
