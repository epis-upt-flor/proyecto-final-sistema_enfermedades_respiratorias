/**
 * Servicio de Telemedicina
 * 
 * Permite videollamadas con médicos para consultas remotas
 */

import { Platform } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { apiService } from './api';
import { AppointmentDTO } from '../types';

export interface TelemedicineCall {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  roomId: string;
  token?: string;
}

export interface TelemedicineCallOptions {
  doctorId: string;
  scheduledAt?: string;
  notes?: string;
}

class TelemedicineService {
  private currentCall: TelemedicineCall | null = null;
  private isInitialized = false;
  private readonly base = '/telemedicine';

  /**
   * Inicializa el servicio de telemedicina
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Verificar permisos de cámara y micrófono
      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        console.warn('No se otorgaron permisos de cámara/micrófono');
        return false;
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing telemedicine service:', error);
      return false;
    }
  }

  /**
   * Solicita permisos necesarios
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const cameraResult = await request(PERMISSIONS.IOS.CAMERA);
        const micResult = await request(PERMISSIONS.IOS.MICROPHONE);
        return (
          cameraResult === RESULTS.GRANTED && micResult === RESULTS.GRANTED
        );
      } else if (Platform.OS === 'android') {
        const cameraResult = await request(PERMISSIONS.ANDROID.CAMERA);
        const micResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        return (
          cameraResult === RESULTS.GRANTED && micResult === RESULTS.GRANTED
        );
      }
      return false;
    } catch (error) {
      console.error('Error requesting telemedicine permissions:', error);
      // En desarrollo, permitir sin permisos reales
      if (__DEV__) {
        return true;
      }
      return false;
    }
  }

  /**
   * Crea una nueva llamada de telemedicina
   */
  async createCall(options: TelemedicineCallOptions): Promise<TelemedicineCall | null> {
    try {
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return null;
        }
      }

      // Crear llamada en el backend
      const response = await apiService.post(`${this.base}/calls`, options);
      if (response.success && response.data) {
        this.currentCall = response.data as TelemedicineCall;
        return this.currentCall;
      }

      return null;
    } catch (error) {
      console.error('Error creating telemedicine call:', error);
      return null;
    }
  }

  /**
   * Inicia una llamada existente
   */
  async startCall(callId: string): Promise<boolean> {
    try {
      const response = await apiService.post(`${this.base}/calls/${callId}/start`);
      if (response.success && response.data) {
        this.currentCall = response.data as TelemedicineCall;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting call:', error);
      return false;
    }
  }

  /**
   * Finaliza una llamada
   */
  async endCall(callId: string): Promise<boolean> {
    try {
      const response = await apiService.post(`${this.base}/calls/${callId}/end`);
      if (response.success) {
        if (this.currentCall?.id === callId) {
          this.currentCall = null;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error ending call:', error);
      return false;
    }
  }

  /**
   * Obtiene el token de acceso para la videollamada
   */
  async getCallToken(callId: string): Promise<string | null> {
    try {
      const response = await apiService.get(`${this.base}/calls/${callId}/token`);
      if (response.success && (response.data as any)?.token) {
        return (response.data as any).token as string;
      }
      return null;
    } catch (error) {
      console.error('Error getting call token:', error);
      return null;
    }
  }

  /**
   * Obtiene las llamadas del paciente
   */
  async getPatientCalls(patientId: string): Promise<TelemedicineCall[]> {
    try {
      const response = await apiService.get(`${this.base}/calls?patientId=${patientId}`);
      if (response.success && response.data) {
        return response.data as TelemedicineCall[];
      }
      return [];
    } catch (error) {
      console.error('Error getting patient calls:', error);
      return [];
    }
  }

  /**
   * Obtiene la llamada actual
   */
  getCurrentCall(): TelemedicineCall | null {
    return this.currentCall;
  }

  /**
   * Verifica si hay una llamada activa
   */
  hasActiveCall(): boolean {
    return this.currentCall !== null && this.currentCall.status === 'active';
  }

  // ---- Appointments management ----
  async getAppointments(patientId: string): Promise<AppointmentDTO[]> {
    try {
      const res = await apiService.get(`${this.base}/appointments?patientId=${patientId}`);
      return res.success && res.data ? (res.data as AppointmentDTO[]) : [];
    } catch (e) {
      console.error('Error getting appointments:', e);
      return [];
    }
  }

  async createAppointment(payload: Partial<AppointmentDTO>): Promise<AppointmentDTO | null> {
    try {
      const res = await apiService.post(`${this.base}/appointments`, payload);
      return res.success && res.data ? (res.data as AppointmentDTO) : null;
    } catch (e) {
      console.error('Error creating appointment:', e);
      return null;
    }
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    try {
      const res = await apiService.post(`${this.base}/appointments/${appointmentId}/cancel`, { reason });
      return !!res.success;
    } catch (e) {
      console.error('Error cancelling appointment:', e);
      return false;
    }
  }

  async rescheduleAppointment(appointmentId: string, newDateISO: string): Promise<boolean> {
    try {
      const res = await apiService.post(`${this.base}/appointments/${appointmentId}/reschedule`, { scheduledAt: newDateISO });
      return !!res.success;
    } catch (e) {
      console.error('Error rescheduling appointment:', e);
      return false;
    }
  }
}

// Instancia singleton
export const telemedicineService = new TelemedicineService();

