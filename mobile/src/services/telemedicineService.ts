/**
 * Servicio de Telemedicina Completo
 * 
 * Integración completa con proveedores de video (Jitsi, Zoom, etc.)
 * Incluye: sala de espera virtual, compartir pantalla, grabación de sesiones
 */

import { Platform, Linking } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { apiService } from './api';
import { AppointmentDTO } from '../types';

export type VideoProvider = 'jitsi' | 'zoom' | 'custom';
export type CallStatus = 'scheduled' | 'waiting' | 'active' | 'ended' | 'cancelled';
export type RecordingStatus = 'not_started' | 'recording' | 'paused' | 'stopped' | 'processing';

export interface TelemedicineCall {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  status: CallStatus;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  roomId: string;
  roomName: string;
  token?: string;
  provider: VideoProvider;
  waitingRoomEnabled: boolean;
  screenSharingEnabled: boolean;
  recordingEnabled: boolean;
  recordingStatus?: RecordingStatus;
  recordingUrl?: string;
  metadata?: Record<string, any>;
}

export interface TelemedicineCallOptions {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  scheduledAt?: string;
  provider?: VideoProvider;
  waitingRoomEnabled?: boolean;
  screenSharingEnabled?: boolean;
  recordingEnabled?: boolean;
  notes?: string;
}

export interface WaitingRoomParticipant {
  id: string;
  name: string;
  role: 'patient' | 'doctor';
  joinedAt: string;
  isReady: boolean;
}

export interface ScreenShareOptions {
  enabled: boolean;
  participantId: string;
  streamId?: string;
}

export interface RecordingOptions {
  enabled: boolean;
  quality?: 'low' | 'medium' | 'high';
  includeAudio?: boolean;
  includeVideo?: boolean;
}

class TelemedicineService {
  private currentCall: TelemedicineCall | null = null;
  private isInitialized = false;
  private readonly base = '/api/v1/telemedicine';
  private waitingRoomParticipants: WaitingRoomParticipant[] = [];
  private screenShareActive: ScreenShareOptions | null = null;
  private recordingActive: RecordingOptions | null = null;

  // Configuración de proveedores
  private readonly providers = {
    jitsi: {
      baseUrl: process.env.JITSI_SERVER_URL || 'https://meet.jit.si',
      appName: 'RespiCare',
    },
    zoom: {
      baseUrl: process.env.ZOOM_SERVER_URL || 'https://zoom.us',
      apiKey: process.env.ZOOM_API_KEY,
    },
    custom: {
      baseUrl: process.env.CUSTOM_VIDEO_SERVER_URL,
    },
  };

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
      const response = await apiService.post(`${this.base}/calls`, {
        ...options,
        provider: options.provider || 'jitsi',
        waitingRoomEnabled: options.waitingRoomEnabled ?? true,
        screenSharingEnabled: options.screenSharingEnabled ?? true,
        recordingEnabled: options.recordingEnabled ?? false,
      });

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
      // Detener grabación si está activa
      if (this.recordingActive?.enabled) {
        await this.stopRecording(callId);
      }

      const response = await apiService.post(`${this.base}/calls/${callId}/end`);
      if (response.success) {
        if (this.currentCall?.id === callId) {
          this.currentCall = null;
          this.waitingRoomParticipants = [];
          this.screenShareActive = null;
          this.recordingActive = null;
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
   * Obtiene la URL de la videollamada según el proveedor
   */
  getCallUrl(call: TelemedicineCall, userRole: 'patient' | 'doctor'): string {
    const { provider, roomName, token } = call;
    const config = this.providers[provider];

    switch (provider) {
      case 'jitsi':
        const jitsiUrl = `${config.baseUrl}/${encodeURIComponent(roomName)}`;
        const params = new URLSearchParams();
        if (token) params.append('jwt', token);
        params.append('userInfo.displayName', userRole === 'doctor' ? 'Doctor' : 'Paciente');
        params.append('config.startWithVideoMuted', 'false');
        params.append('config.startWithAudioMuted', 'false');
        params.append('config.enableWelcomePage', call.waitingRoomEnabled ? 'true' : 'false');
        params.append('config.enableScreenSharing', call.screenSharingEnabled ? 'true' : 'false');
        params.append('config.enableRecording', call.recordingEnabled ? 'true' : 'false');
        return `${jitsiUrl}?${params.toString()}`;

      case 'zoom':
        // Integración con Zoom SDK requeriría configuración adicional
        return `${config.baseUrl}/join?room=${roomName}&token=${token || ''}`;

      case 'custom':
        return `${config.baseUrl}/room/${roomName}?token=${token || ''}`;

      default:
        return '';
    }
  }

  /**
   * Abre la videollamada en el navegador o app nativa
   */
  async joinCall(call: TelemedicineCall, userRole: 'patient' | 'doctor'): Promise<boolean> {
    try {
      const url = this.getCallUrl(call, userRole);
      if (!url) {
        console.error('No se pudo generar la URL de la llamada');
        return false;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        console.error('No se puede abrir la URL de la videollamada');
        return false;
      }
    } catch (error) {
      console.error('Error joining call:', error);
      return false;
    }
  }

  /**
   * Sala de Espera Virtual
   */

  /**
   * Entra a la sala de espera
   */
  async joinWaitingRoom(callId: string, participant: Omit<WaitingRoomParticipant, 'joinedAt'>): Promise<boolean> {
    try {
      const response = await apiService.post(`${this.base}/calls/${callId}/waiting-room/join`, participant);
      if (response.success && response.data) {
        this.waitingRoomParticipants = response.data.participants || [];
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error joining waiting room:', error);
      return false;
    }
  }

  /**
   * Obtiene los participantes en la sala de espera
   */
  async getWaitingRoomParticipants(callId: string): Promise<WaitingRoomParticipant[]> {
    try {
      const response = await apiService.get(`${this.base}/calls/${callId}/waiting-room/participants`);
      if (response.success && response.data) {
        this.waitingRoomParticipants = response.data.participants || [];
        return this.waitingRoomParticipants;
      }
      return [];
    } catch (error) {
      console.error('Error getting waiting room participants:', error);
      return [];
    }
  }

  /**
   * Admite un participante desde la sala de espera (solo doctor)
   */
  async admitParticipant(callId: string, participantId: string): Promise<boolean> {
    try {
      const response = await apiService.post(
        `${this.base}/calls/${callId}/waiting-room/admit`,
        { participantId }
      );
      if (response.success) {
        // Actualizar lista de participantes
        await this.getWaitingRoomParticipants(callId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error admitting participant:', error);
      return false;
    }
  }

  /**
   * Marca al participante como listo en la sala de espera
   */
  async markReady(callId: string, participantId: string, isReady: boolean): Promise<boolean> {
    try {
      const response = await apiService.post(
        `${this.base}/calls/${callId}/waiting-room/ready`,
        { participantId, isReady }
      );
      if (response.success) {
        // Actualizar estado local
        const participant = this.waitingRoomParticipants.find(p => p.id === participantId);
        if (participant) {
          participant.isReady = isReady;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking ready:', error);
      return false;
    }
  }

  /**
   * Compartir Pantalla
   */

  /**
   * Inicia el compartir de pantalla
   */
  async startScreenShare(callId: string, participantId: string): Promise<boolean> {
    try {
      const response = await apiService.post(
        `${this.base}/calls/${callId}/screen-share/start`,
        { participantId }
      );
      if (response.success && response.data) {
        this.screenShareActive = {
          enabled: true,
          participantId,
          streamId: response.data.streamId,
        };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting screen share:', error);
      return false;
    }
  }

  /**
   * Detiene el compartir de pantalla
   */
  async stopScreenShare(callId: string, participantId: string): Promise<boolean> {
    try {
      const response = await apiService.post(
        `${this.base}/calls/${callId}/screen-share/stop`,
        { participantId }
      );
      if (response.success) {
        this.screenShareActive = null;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error stopping screen share:', error);
      return false;
    }
  }

  /**
   * Obtiene el estado del compartir de pantalla
   */
  getScreenShareStatus(): ScreenShareOptions | null {
    return this.screenShareActive;
  }

  /**
   * Grabación de Sesiones
   */

  /**
   * Inicia la grabación de la sesión
   */
  async startRecording(
    callId: string,
    options: RecordingOptions
  ): Promise<boolean> {
    try {
      const response = await apiService.post(
        `${this.base}/calls/${callId}/recording/start`,
        options
      );
      if (response.success) {
        this.recordingActive = { ...options, enabled: true };
        // Actualizar estado de la llamada
        if (this.currentCall?.id === callId) {
          this.currentCall.recordingStatus = 'recording';
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }

  /**
   * Pausa la grabación
   */
  async pauseRecording(callId: string): Promise<boolean> {
    try {
      const response = await apiService.post(`${this.base}/calls/${callId}/recording/pause`);
      if (response.success) {
        if (this.currentCall?.id === callId) {
          this.currentCall.recordingStatus = 'paused';
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error pausing recording:', error);
      return false;
    }
  }

  /**
   * Reanuda la grabación
   */
  async resumeRecording(callId: string): Promise<boolean> {
    try {
      const response = await apiService.post(`${this.base}/calls/${callId}/recording/resume`);
      if (response.success) {
        if (this.currentCall?.id === callId) {
          this.currentCall.recordingStatus = 'recording';
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resuming recording:', error);
      return false;
    }
  }

  /**
   * Detiene la grabación
   */
  async stopRecording(callId: string): Promise<string | null> {
    try {
      const response = await apiService.post(`${this.base}/calls/${callId}/recording/stop`);
      if (response.success && response.data) {
        this.recordingActive = null;
        const recordingUrl = (response.data as any).recordingUrl;
        if (this.currentCall?.id === callId) {
          this.currentCall.recordingStatus = 'stopped';
          this.currentCall.recordingUrl = recordingUrl;
        }
        return recordingUrl;
      }
      return null;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  /**
   * Obtiene el estado de la grabación
   */
  getRecordingStatus(): RecordingStatus | null {
    return this.currentCall?.recordingStatus || null;
  }

  /**
   * Obtiene la URL de la grabación
   */
  getRecordingUrl(callId: string): string | null {
    if (this.currentCall?.id === callId) {
      return this.currentCall.recordingUrl || null;
    }
    return null;
  }

  /**
   * Utilidades
   */

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
   * Obtiene las llamadas del doctor
   */
  async getDoctorCalls(doctorId: string): Promise<TelemedicineCall[]> {
    try {
      const response = await apiService.get(`${this.base}/calls?doctorId=${doctorId}`);
      if (response.success && response.data) {
        return response.data as TelemedicineCall[];
      }
      return [];
    } catch (error) {
      console.error('Error getting doctor calls:', error);
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

  /**
   * Verifica si hay una llamada en sala de espera
   */
  hasWaitingCall(): boolean {
    return this.currentCall !== null && this.currentCall.status === 'waiting';
  }

  /**
   * Obtiene los participantes de la sala de espera
   */
  getWaitingRoomParticipants(): WaitingRoomParticipant[] {
    return this.waitingRoomParticipants;
  }
}

// Instancia singleton
export const telemedicineService = new TelemedicineService();
