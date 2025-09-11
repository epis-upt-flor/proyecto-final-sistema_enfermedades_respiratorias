// Tipos TypeScript para la aplicación móvil RespiCare

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  diagnosis: string;
  symptoms: string[];
  date: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images?: string[];
  audioNotes?: string;
  isOffline?: boolean;
  syncStatus: 'pending' | 'synced' | 'error';
}

export interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description?: string;
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

export interface OfflineData {
  medicalHistories: MedicalHistory[];
  symptoms: Symptom[];
  lastSync: string;
  pendingSync: number;
}

export interface AppState {
  user: User | null;
  isOnline: boolean;
  offlineData: OfflineData;
  notifications: NotificationData[];
  isLoading: boolean;
}

// Tipos para navegación
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  DataCapture: undefined;
  MedicalHistory: { historyId?: string };
  AIAnalysis: { symptoms: Symptom[] };
  Settings: undefined;
  OfflineData: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Capture: undefined;
  History: undefined;
  AI: undefined;
  Profile: undefined;
};
