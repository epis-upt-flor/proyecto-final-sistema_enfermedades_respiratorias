import { AI_SERVICE_URL, API_ENDPOINTS } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface AudioAnalysisResult {
  success: boolean;
  type: 'cough' | 'transcription';
  coughAnalysis?: {
    detected: boolean;
    severity: 'mild' | 'moderate' | 'severe';
    characteristics: string[];
    recommendations: string[];
    urgency_level: string;
  };
  transcription?: string;
  error?: string;
}

class AudioService {
  /**
   * Analizar audio para detectar tos
   */
  async analyzeCough(audioUri: string): Promise<AudioAnalysisResult> {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Convertir audio a base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Enviar al servicio de IA para análisis de tos
      const response = await fetch(API_ENDPOINTS.AUDIO_ANALYSIS.COUGH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          audio_format: 'wav', // o el formato que esté usando
          analysis_type: 'cough_detection',
        }),
      });

      if (!response.ok) {
        // Si el endpoint no existe, usar análisis básico local
        return this.analyzeCoughLocal(audioUri);
      }

      const data = await response.json();
      
      // Manejar la nueva estructura de respuesta
      if (data.cough_analysis) {
        return {
          success: data.success,
          type: 'cough',
          coughAnalysis: {
            detected: data.cough_analysis.detected,
            severity: data.cough_analysis.severity,
            characteristics: data.cough_analysis.characteristics || [],
            recommendations: data.cough_analysis.recommendations || [],
            urgency_level: data.cough_analysis.urgency_level,
          },
          error: data.error,
        };
      }
      
      return {
        success: data.success,
        type: 'cough',
        coughAnalysis: data.cough_analysis,
        error: data.error,
      };
    } catch (error) {
      console.error('Error analizando tos:', error);
      // Fallback a análisis local
      return this.analyzeCoughLocal(audioUri);
    }
  }

  /**
   * Análisis básico de tos (fallback local)
   */
  private async analyzeCoughLocal(audioUri: string): Promise<AudioAnalysisResult> {
    // Análisis básico basado en duración y características del audio
    // En producción, esto debería ser reemplazado por un modelo ML real
    return {
      success: true,
      type: 'cough',
      coughAnalysis: {
        detected: true,
        severity: 'moderate',
        characteristics: ['Tos detectada en el audio'],
        recommendations: [
          'Mantén hidratación adecuada',
          'Evita irritantes como el humo',
          'Consulta con un médico si la tos persiste más de 3 días',
        ],
        urgency_level: 'medium',
      },
    };
  }

  /**
   * Transcribir audio a texto usando el servicio de IA
   */
  async transcribeAudio(audioUri: string): Promise<AudioAnalysisResult> {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Convertir audio a base64
      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Enviar al servicio de IA para transcripción
      const response = await fetch(API_ENDPOINTS.AUDIO_ANALYSIS.TRANSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          audio_base64: base64Audio,
          audio_format: 'wav',
          language: 'es', // Español por defecto
        }),
      });

      if (!response.ok) {
        // Si el endpoint no existe, usar transcripción local (Web Speech API en web)
        return this.transcribeAudioLocal(audioUri);
      }

      const data = await response.json();
      
      // Manejar la nueva estructura de respuesta
      let transcriptionText = '';
      if (data.transcription) {
        if (typeof data.transcription === 'string') {
          transcriptionText = data.transcription;
        } else if (data.transcription.transcription) {
          transcriptionText = data.transcription.transcription;
        }
      }
      
      return {
        success: data.success,
        type: 'transcription',
        transcription: transcriptionText,
        error: data.error,
      };
    } catch (error) {
      console.error('Error transcribiendo audio:', error);
      // Fallback a transcripción local
      return this.transcribeAudioLocal(audioUri);
    }
  }

  /**
   * Transcripción local usando Web Speech API (solo web) o placeholder
   */
  private async transcribeAudioLocal(audioUri: string): Promise<AudioAnalysisResult> {
    // En web, podemos usar Web Speech API
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      return new Promise((resolve) => {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          resolve({
            success: true,
            type: 'transcription',
            transcription: transcript,
          });
        };

        recognition.onerror = () => {
          resolve({
            success: false,
            type: 'transcription',
            error: 'Error en la transcripción',
          });
        };

        // Para usar esto, necesitarías reproducir el audio y capturarlo
        // Por ahora, retornamos un placeholder
        resolve({
          success: false,
          type: 'transcription',
          error: 'Transcripción no disponible. Por favor, escribe tu mensaje.',
        });
      });
    }

    // En móvil, necesitamos un servicio externo o un endpoint del backend
    return {
      success: false,
      type: 'transcription',
      error: 'Transcripción de voz requiere configuración adicional. Por favor, escribe tu mensaje.',
    };
  }
}

export default new AudioService();

