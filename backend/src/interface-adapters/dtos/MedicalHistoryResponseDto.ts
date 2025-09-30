// DTO para Respuesta de Historial Médico - Capa de Interfaz
import { MedicalHistoryEntity, SyncStatus } from '../../domain/entities/MedicalHistory';
import { SymptomSeverity } from '../../domain/value-objects/Symptom';

export interface MedicalHistoryResponseDto {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  age: number;
  diagnosis: string;
  symptoms: Array<{
    name: string;
    severity: SymptomSeverity;
    duration: string;
    description?: string;
  }>;
  description?: string;
  date: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images?: string[];
  audioNotes?: string;
  isOffline: boolean;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class MedicalHistoryResponseDto {
  static fromEntity(medicalHistory: MedicalHistoryEntity): MedicalHistoryResponseDto {
    return {
      id: medicalHistory.id,
      patientId: medicalHistory.patientId,
      doctorId: medicalHistory.doctorId,
      patientName: medicalHistory.patientName,
      age: medicalHistory.age,
      diagnosis: medicalHistory.diagnosis,
      symptoms: medicalHistory.symptoms.map(symptom => ({
        name: symptom.name,
        severity: symptom.severity,
        duration: symptom.duration,
        description: symptom.description
      })),
      description: medicalHistory.description,
      date: medicalHistory.date,
      location: medicalHistory.location ? {
        latitude: medicalHistory.location.latitude,
        longitude: medicalHistory.location.longitude,
        address: medicalHistory.location.address
      } : undefined,
      images: medicalHistory.images,
      audioNotes: medicalHistory.audioNotes,
      isOffline: medicalHistory.isOffline,
      syncStatus: medicalHistory.syncStatus,
      createdAt: medicalHistory.createdAt,
      updatedAt: medicalHistory.updatedAt
    };
  }

  static fromEntities(medicalHistories: MedicalHistoryEntity[]): MedicalHistoryResponseDto[] {
    return medicalHistories.map(medicalHistory => this.fromEntity(medicalHistory));
  }
}
