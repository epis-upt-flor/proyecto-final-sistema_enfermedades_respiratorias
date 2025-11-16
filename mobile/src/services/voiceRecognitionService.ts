/**
 * Servicio de Reconocimiento de Voz
 * 
 * Permite convertir voz a texto para:
 * - Chatbot médico
 * - Captura de síntomas
 * - Búsqueda por voz
 */

import { Platform } from 'react-native';
import { analyticsService } from './analyticsService';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Tipos para reconocimiento de voz
export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  error?: string;
}

export interface VoiceRecognitionOptions {
  language?: string; // 'es-ES', 'en-US', etc.
  continuous?: boolean; // Seguir escuchando después de pausas
  interimResults?: boolean; // Devolver resultados parciales
  maxAlternatives?: number; // Número de alternativas
}

class VoiceRecognitionService {
  private isInitialized = false;
  private isListening = false;
  private recognition: any = null;
  private onResultCallback?: (result: VoiceRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;

  /**
   * Inicializa el servicio de reconocimiento de voz
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Verificar permisos
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('No se otorgaron permisos de reconocimiento de voz');
        return false;
      }

      // En producción, aquí se integraría con:
      // - iOS: Speech framework nativo
      // - Android: SpeechRecognizer API
      // Por ahora, simulamos la inicialización
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing voice recognition:', error);
      return false;
    }
  }

  /**
   * Solicita permisos para reconocimiento de voz
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.SPEECH_RECOGNITION);
        return result === RESULTS.GRANTED;
      } else if (Platform.OS === 'android') {
        const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        return result === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Error requesting voice recognition permissions:', error);
      // En desarrollo, permitir sin permisos reales
      if (__DEV__) {
        return true;
      }
      return false;
    }
  }

  /**
   * Inicia el reconocimiento de voz
   */
  async startListening(
    options: VoiceRecognitionOptions = {},
    onResult?: (result: VoiceRecognitionResult) => void,
    onError?: (error: string) => void
  ): Promise<boolean> {
    try {
      analyticsService.logEvent('voice.start', { options });
      if (!this.isInitialized) {
        const initialized = await this.initialize();
        if (!initialized) {
          return false;
        }
      }

      if (this.isListening) {
        await this.stopListening();
      }

      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      this.isListening = true;

      // En producción, aquí se iniciaría el reconocimiento real
      // Por ahora, simulamos el reconocimiento
      if (__DEV__) {
        console.log('Voice recognition started (simulated)');
        // Simular resultado después de 2 segundos
        setTimeout(() => {
          if (this.onResultCallback) {
            analyticsService.logEvent('voice.result', { simulated: true });
            this.onResultCallback({
              text: 'Tengo tos seca y dificultad para respirar',
              confidence: 0.95,
              isFinal: true,
            });
          }
        }, 2000);
      }

      return true;
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      analyticsService.logEvent('voice.error', { message: String(error) });
      if (this.onErrorCallback) {
        this.onErrorCallback('Error al iniciar reconocimiento de voz');
      }
      return false;
    }
  }

  /**
   * Detiene el reconocimiento de voz
   */
  async stopListening(): Promise<void> {
    try {
      if (!this.isListening) {
        return;
      }

      this.isListening = false;
      this.onResultCallback = undefined;
      this.onErrorCallback = undefined;

      // En producción, aquí se detendría el reconocimiento real
      if (__DEV__) {
        console.log('Voice recognition stopped');
      }
      analyticsService.logEvent('voice.stop');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
      analyticsService.logEvent('voice.error', { message: String(error) });
    }
  }

  /**
   * Verifica si el reconocimiento de voz está disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        // En iOS, verificar si Speech framework está disponible
        return true; // Simplificado
      } else if (Platform.OS === 'android') {
        // En Android, verificar si SpeechRecognizer está disponible
        return true; // Simplificado
      }
      return false;
    } catch (error) {
      console.error('Error checking voice recognition availability:', error);
      return false;
    }
  }

  /**
   * Obtiene los idiomas disponibles
   */
  getAvailableLanguages(): string[] {
    return [
      'es-ES', // Español (España)
      'es-MX', // Español (México)
      'es-AR', // Español (Argentina)
      'es-PE', // Español (Perú)
      'en-US', // Inglés (EE.UU.)
      'en-GB', // Inglés (Reino Unido)
      'pt-BR', // Portugués (Brasil)
      'fr-FR', // Francés
    ];
  }

  /**
   * Cancela el reconocimiento de voz
   */
  async cancel(): Promise<void> {
    await this.stopListening();
  }
}

// Instancia singleton
export const voiceRecognitionService = new VoiceRecognitionService();

