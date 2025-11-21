import { AI_SERVICE_URL, API_ENDPOINTS } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { databaseService, ChatbotMessageRow } from './databaseService';

export interface ChatMessage {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  imageUri?: string;
  audioUri?: string;
  urgencyLevel?: 'critical' | 'high' | 'medium' | 'low';
  symptomCount?: number;
  needsMedicalAttention?: boolean;
}

export interface ChatbotResponse {
  success: boolean;
  message: string;
  urgency_level: string;
  symptom_count: number;
  symptom_categories: string[];
  needs_medical_attention: boolean;
  analysis?: any;
  timestamp: string;
}

class ChatbotService {
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private sessionId: string | null = null;

  /**
   * Inicializar sesión de chat
   */
  async initializeSession(): Promise<string> {
    if (!this.sessionId) {
      this.sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('chatbot_session_id', this.sessionId);
    }
    return this.sessionId;
  }

  /**
   * Enviar mensaje de texto al chatbot
   */
  async sendMessage(
    message: string,
    imageBase64?: string,
    audioTranscription?: string,
    coughAnalysis?: any,
    imageType?: string
  ): Promise<ChatbotResponse> {
    try {
      await this.initializeSession();
      
      const token = await AsyncStorage.getItem('token');
      // Si hay transcripción de audio, usarla como mensaje principal
      // Esto permite que personas que no pueden escribir usen la voz
      const userMessage = audioTranscription || message;
      
      // Agregar al historial
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Preparar payload
      const payload: any = {
        message: userMessage,
        conversation_history: this.conversationHistory.slice(-10), // Últimos 10 mensajes
        session_id: this.sessionId,
        context: {
          platform: 'mobile',
          has_image: !!imageBase64,
          has_audio: !!audioTranscription,
          has_cough_analysis: !!coughAnalysis,
        },
      };

      // Si hay análisis de tos, incluirlo en el mensaje
      if (coughAnalysis) {
        const coughInfo = `[Análisis de tos: Severidad ${coughAnalysis.severity}, ${coughAnalysis.characteristics?.join(', ')}]`;
        payload.message = `${userMessage}\n\n${coughInfo}`;
      }

      // Si hay imagen, analizarla primero y luego incluir en el contexto
      if (imageBase64) {
        try {
          console.log('Iniciando análisis de imagen...', { 
            hasImage: !!imageBase64, 
            imageType, 
            imageSize: imageBase64.length 
          });
          
          // Analizar la imagen médica
          const imageAnalysis = await this.analyzeImage(imageBase64, imageType);
          
          console.log('Análisis de imagen completado:', imageAnalysis);
          
          // Incluir análisis de imagen en el contexto
          payload.context = {
            ...payload.context,
            image_available: true,
            image_type: imageType || 'other',
            image_analysis: imageAnalysis,
          };
          
          // Agregar información del análisis de imagen al mensaje
          if (imageAnalysis && imageAnalysis.predictions && imageAnalysis.predictions.length > 0) {
            const topPrediction = imageAnalysis.predictions[0];
            const imageInfo = `[Análisis de imagen médica: ${imageType || 'imagen'}, Clasificación: ${topPrediction.top_label || 'analizando'} (${(topPrediction.scores?.[0] * 100 || 0).toFixed(1)}% confianza)]`;
            payload.message = `${userMessage || 'He enviado una imagen médica para análisis'}\n\n${imageInfo}`;
          } else {
            // Si no hay predicciones, agregar mensaje básico
            payload.message = userMessage || 'He enviado una imagen médica para análisis';
            payload.context = {
              ...payload.context,
              image_available: true,
              image_type: imageType || 'other',
              image_analysis_status: 'processed',
            };
          }
        } catch (error: any) {
          console.error('Error analizando imagen (continuando sin análisis):', error);
          // Continuar sin análisis de imagen si falla, pero informar al usuario
          payload.context = {
            ...payload.context,
            image_available: true,
            image_type: imageType || 'other',
            image_analysis_error: error.message || 'No se pudo analizar la imagen',
            image_analysis_skipped: true,
          };
          // Asegurar que hay un mensaje - importante para que el chatbot responda
          if (!payload.message || payload.message.trim() === '') {
            payload.message = userMessage || 'He enviado una imagen médica para análisis. Por favor, analízala.';
          }
        }
      } else {
        // Si no hay imagen, asegurar que hay un mensaje
        if (!payload.message || payload.message.trim() === '') {
          payload.message = userMessage || 'Hola, ¿puedes ayudarme?';
        }
      }

      // Asegurar que siempre hay un mensaje antes de enviar
      if (!payload.message || payload.message.trim() === '') {
        payload.message = 'Hola, ¿puedes ayudarme?';
      }

      console.log('Enviando payload al chatbot:', {
        messageLength: payload.message.length,
        messagePreview: payload.message.substring(0, 100),
        hasImage: payload.context?.image_available,
        imageType: payload.context?.image_type,
        hasImageAnalysis: !!payload.context?.image_analysis,
        endpoint: API_ENDPOINTS.CHATBOT.ANALYZE,
      });

      // Enviar al servicio de IA
      const response = await fetch(API_ENDPOINTS.CHATBOT.ANALYZE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      console.log('Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error del servidor: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      const data: ChatbotResponse = await response.json();
      console.log('Datos recibidos del chatbot:', {
        hasMessage: !!data.message,
        messageLength: data.message?.length,
        urgencyLevel: data.urgency_level,
        symptomCount: data.symptom_count,
      });

      // Agregar respuesta al historial
      this.conversationHistory.push({
        role: 'assistant',
        content: data.message,
      });

      // Guardar mensajes en SQLite para persistencia offline
      try {
        await databaseService.initialize();
        
        const now = Date.now();
        
        // Guardar mensaje del usuario (con imageUri si hay imagen)
        await databaseService.saveChatbotMessage({
          id: `user_${now}`,
          sessionId: this.sessionId!,
          text: userMessage,
          type: 'user',
          timestamp: new Date().toISOString(),
          // imageUri y audioUri se guardarán desde el componente que llama
        });

        // Guardar respuesta del asistente
        await databaseService.saveChatbotMessage({
          id: `assistant_${now + 1}`,
          sessionId: this.sessionId!,
          text: data.message,
          type: 'assistant',
          urgencyLevel: data.urgency_level,
          symptomCount: data.symptom_count,
          needsMedicalAttention: data.needs_medical_attention ? 1 : 0,
          timestamp: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error('Error guardando mensajes en SQLite:', dbError);
        // No fallar si SQLite falla
      }

      // Guardar historial (últimos 20 mensajes)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return data;
    } catch (error) {
      console.error('Error enviando mensaje al chatbot:', error);
      throw error;
    }
  }

  /**
   * Analizar imagen médica
   */
  async analyzeImage(imageBase64: string, imageType?: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Preparar payload con información del tipo de imagen
      const payload: any = {
        images: [imageBase64], // Enviar como base64
        model_name: 'resnet50',
      };

      // Agregar tipo de imagen si está disponible
      if (imageType) {
        payload.image_type = imageType;
        payload.image_metadata = {
          type: imageType,
          category: this.getImageCategory(imageType),
        };
      }

      console.log('Enviando imagen para análisis:', {
        endpoint: API_ENDPOINTS.IMAGE_ANALYSIS.ANALYZE,
        imageType,
        imageSize: imageBase64.length,
        hasToken: !!token,
      });

      const response = await fetch(API_ENDPOINTS.IMAGE_ANALYSIS.ANALYZE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      console.log('Respuesta del análisis de imagen:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del servidor:', errorText);
        throw new Error(`Error analizando imagen: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Datos de análisis recibidos:', data);
      return data;
    } catch (error: any) {
      console.error('Error analizando imagen:', error);
      // Re-lanzar el error para que el código que llama pueda manejarlo
      throw error;
    }
  }

  /**
   * Obtener categoría de imagen basada en el tipo
   */
  private getImageCategory(imageType: string): string {
    const diagnosticTypes = ['chest_xray', 'chest_ct'];
    const monitoringTypes = ['spirometry', 'oximetry'];
    const symptomTypes = ['sputum', 'skin_rash', 'cyanosis'];

    if (diagnosticTypes.includes(imageType)) return 'diagnostic';
    if (monitoringTypes.includes(imageType)) return 'monitoring';
    if (symptomTypes.includes(imageType)) return 'symptom';
    return 'other';
  }

  /**
   * Obtener historial de conversación
   */
  async getConversationHistory(): Promise<Array<{ role: string; content: string }>> {
    // Si hay sesión, intentar cargar desde SQLite
    if (this.sessionId) {
      try {
        await databaseService.initialize();
        const messages = await databaseService.getChatbotMessages(this.sessionId);
        
        // Convertir mensajes de SQLite a formato de historial
        const history = messages.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));
        
        if (history.length > 0) {
          this.conversationHistory = history;
        }
      } catch (error) {
        console.error('Error cargando historial desde SQLite:', error);
      }
    }
    
    return [...this.conversationHistory];
  }

  /**
   * Limpiar historial de conversación
   */
  async clearHistory(): Promise<void> {
    this.conversationHistory = [];
    
    // Eliminar mensajes de SQLite si hay sesión
    if (this.sessionId) {
      try {
        await databaseService.initialize();
        await databaseService.deleteChatbotMessages(this.sessionId);
      } catch (error) {
        console.error('Error eliminando mensajes de SQLite:', error);
      }
    }
    
    this.sessionId = null;
    await AsyncStorage.removeItem('chatbot_session_id');
  }

  /**
   * Verificar si el servicio está disponible
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(API_ENDPOINTS.CHATBOT.TEST);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new ChatbotService();

