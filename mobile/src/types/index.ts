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

/**
 * Modelo de dominio para Paciente en mobile.
 * Representa un usuario con rol 'patient' y metadatos adicionales de salud.
 */
export interface Patient {
  id: string;
  userId: string;
  fullName: string;
  documentId?: string;
  age?: number;
  gender?: 'M' | 'F' | 'O';
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  primaryDoctorId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modelo de dominio para Doctor en mobile.
 * Representa un usuario con rol 'doctor' y su información profesional básica.
 */
export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  specialty?: string;
  medicalLicenseId?: string;
  phone?: string;
  email: string;
  workplace?: string;
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

export type AppointmentStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no_show';

/**
 * DTO de cita médica alineado con el backend.
 * Las fechas se representan como string ISO en mobile.
 */
export interface AppointmentDTO {
  _id: string;
  patientId: string;
  doctorId: string;
  createdBy: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  location?: {
    type: 'virtual' | 'in_person';
    description?: string;
    meetingLink?: string;
    address?: string;
  };
  reminderMinutesBefore?: number;
  tags?: string[];
  rescheduledFrom?: string;
  cancellationReason?: string;
  metadata?: Record<string, any>;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modelo de dominio simplificado para citas en mobile.
 * Usar este tipo en pantallas y componentes.
 */
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  meetingLink?: string;
  isVirtual: boolean;
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

export type PrescriptionStatus =
  | 'draft'
  | 'pending_validation'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  form?: string;
  frequencyPerDay: number;
  durationDays: number;
  startDate?: string;
  instructions?: string;
  notes?: string;
  reminderTimes?: string[];
  smartDosage?: {
    recommended: string;
    rationale: string;
  };
}

export interface DrugInteraction {
  medicationA: string;
  medicationB: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description?: string;
  source?: string;
}

/**
 * DTO de prescripción alineado con el backend (fechas en string).
 */
export interface PrescriptionDTO {
  _id: string;
  patientId: string;
  doctorId: string;
  createdBy: string;
  diagnosis?: string;
  observations?: string;
  medications: PrescriptionMedication[];
  status: PrescriptionStatus;
  interactions?: DrugInteraction[];
  warnings?: string[];
  isValid?: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Modelo de dominio simplificado para prescripciones en mobile.
 */
export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis?: string;
  medications: PrescriptionMedication[];
  status: PrescriptionStatus;
  expiresAt?: string;
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

export type AlertCategory =
  | 'critical_symptom'
  | 'medication_reminder'
  | 'follow_up'
  | 'doctor_notification'
  | 'system';

export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus =
  | 'pending'
  | 'scheduled'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'acknowledged'
  | 'expired';

export interface Alert {
  id: string;
  userId: string;
  patientId?: string;
  doctorId?: string;
  title: string;
  message: string;
  category: AlertCategory;
  priority: AlertPriority;
  status: AlertStatus;
  channels: string[];
  createdAt: string;
  scheduledAt?: string;
  acknowledgedAt?: string;
  dispatchedAt?: string;
  metadata?: Record<string, any>;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: number;
  lastSyncTime: string | null;
  syncErrors: string[];
}

export type NetworkStatus = 'online' | 'offline' | 'syncing';

export interface OfflineData {
  medicalHistories: MedicalHistory[];
  symptomAnalyses: SymptomAnalysis[];
  lastSync: string;
  pendingSync: number;
}

export type ThemeMode = 'light' | 'dark' | 'auto';
export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr' | 'qu';

export interface HealthPreferences {
  remindersEnabled: boolean;
  notificationFrequency: 'low' | 'normal' | 'high';
}

export interface HealthProfile {
  age?: number;
  baseDiagnosis?: string;
  riskFactors?: string[];
  preferences: HealthPreferences;
  updatedAt?: string;
}

export interface AppState {
  user: User | null;
  isOnline: boolean;
  networkStatus: NetworkStatus;
  offlineData: OfflineData;
  notifications: NotificationData[];
  alerts: Alert[];
  isLoading: boolean;
  syncStatus: SyncStatus;
  themeMode?: ThemeMode;
  language?: SupportedLanguage;
  healthProfile?: HealthProfile;
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
  AppointmentDetail: { appointmentId: string; fromError?: boolean } | undefined;
  AlertDetail: { alertId: string } | undefined;
  ReportDetail: { reportId: string } | undefined;
  ARTraining: { mode: 'breathing' | 'inhaler' } | undefined;
  DirectChat: { patientId: string; patientName: string };
  PatientAnalytics: undefined;
  DoctorAnalytics: undefined;
  Consent: undefined;
  MLAdvancedResults: { analysisId?: string; experimentId?: string; sessionId?: string } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Capture: undefined;
  History: undefined;
  AI: undefined;
  ChatBot: undefined;
  Alerts: undefined;
  Appointments: undefined;
  Profile: undefined;
  DoctorDashboard?: undefined;
};
