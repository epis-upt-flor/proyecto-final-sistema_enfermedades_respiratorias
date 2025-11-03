/**
 * Medical Chatbot Component - AI-powered medical assistant
 * Provides symptom analysis, medical advice, and emergency guidance
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Avatar, Chip, Button, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { aiService, AISymptomAnalysis } from '../services/aiService';
import { localStorageService } from '../services/localStorage';

// Types
interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    analysis?: AISymptomAnalysis;
    suggestions?: string[];
    isTyping?: boolean;
  };
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: () => void;
}

const MedicalChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPatientId] = useState('mobile_user_' + Date.now());
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chatbot with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'bot',
      content: '¡Hola! Soy tu asistente médico virtual. Puedo ayudarte a analizar síntomas, proporcionar recomendaciones médicas y guiarte en situaciones de emergencia. ¿Cómo te sientes hoy?',
      timestamp: new Date(),
      metadata: {
        suggestions: [
          'Tengo síntomas respiratorios',
          'Me duele el pecho',
          'Tengo fiebre',
          'Me siento muy cansado',
        ],
      },
    };

    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      await processUserMessage(userMessage.content);
    } catch (error) {
      console.error('Error processing message:', error);
      addBotMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.');
    } finally {
      setIsTyping(false);
    }
  };

  // Process user message and generate response
  const processUserMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase();

    // Check for emergency keywords
    if (this.isEmergencyMessage(lowerMessage)) {
      addBotMessage(
        '🚨 **EMERGENCIA MÉDICA DETECTADA** 🚨\n\n' +
        'Si estás experimentando una emergencia médica:\n\n' +
        '• Llama al 911 inmediatamente\n' +
        '• No conduzcas, pide ayuda\n' +
        '• Mantén la calma y sigue las instrucciones\n' +
        '• Ten información médica relevante a mano\n\n' +
        '¿Necesitas que te ayude a identificar los síntomas específicos?',
        {
          suggestions: [
            'Sí, analiza mis síntomas',
            'No, ya llamé al 911',
            'Necesito más información',
          ],
        }
      );
      return;
    }

    // Check if user is describing symptoms
    if (this.isSymptomDescription(lowerMessage)) {
      await analyzeSymptoms(message);
      return;
    }

    // Check for specific questions
    if (lowerMessage.includes('recomendación') || lowerMessage.includes('consejo')) {
      await provideGeneralRecommendations();
      return;
    }

    if (lowerMessage.includes('tendencia') || lowerMessage.includes('evolución')) {
      await showSymptomTrends();
      return;
    }

    // Default response
    addBotMessage(
      'Entiendo. Para ayudarte mejor, puedes:\n\n' +
      '• Describir tus síntomas específicos\n' +
      '• Pedir recomendaciones generales\n' +
      '• Consultar sobre tendencias de síntomas\n' +
      '• Reportar una emergencia médica\n\n' +
      '¿Qué te gustaría hacer?',
      {
        suggestions: [
          'Analizar mis síntomas',
          'Ver recomendaciones',
          'Consultar tendencias',
          'Es una emergencia',
        ],
      }
    );
  };

  // Analyze symptoms using AI service
  const analyzeSymptoms = async (symptomDescription: string) => {
    setIsAnalyzing(true);
    
    try {
      // Parse symptoms from description
      const symptoms = parseSymptomsFromText(symptomDescription);
      
      if (symptoms.length === 0) {
        addBotMessage(
          'No pude identificar síntomas específicos en tu descripción. Por favor, describe tus síntomas de manera más detallada.\n\n' +
          'Ejemplo: "Tengo tos seca desde hace 3 días, fiebre moderada y dolor de cabeza"',
          {
            suggestions: [
              'Tengo tos y fiebre',
              'Me duele el pecho',
              'Tengo dificultad para respirar',
              'Me siento muy cansado',
            ],
          }
        );
        return;
      }

      // Perform AI analysis
      const analysis = await aiService.analyzeSymptoms(symptoms, currentPatientId, symptomDescription);
      
      // Generate response based on analysis
      const response = generateAnalysisResponse(analysis);
      
      addBotMessage(response.content, {
        analysis,
        suggestions: response.suggestions,
      });

    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      addBotMessage(
        'Lo siento, no pude analizar tus síntomas en este momento. Por favor, intenta de nuevo o consulta con un médico.',
        {
          suggestions: [
            'Intentar de nuevo',
            'Contactar médico',
            'Ver recomendaciones generales',
          ],
        }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Provide general recommendations
  const provideGeneralRecommendations = async () => {
    try {
      const recommendations = await aiService.getGeneralRecommendations();
      
      let response = '**Recomendaciones Generales de Salud:**\n\n';
      
      Object.entries(recommendations).forEach(([category, items]) => {
        const categoryName = this.getCategoryDisplayName(category);
        response += `**${categoryName}:**\n`;
        items.forEach(item => {
          response += `• ${item}\n`;
        });
        response += '\n';
      });

      addBotMessage(response, {
        suggestions: [
          'Analizar síntomas específicos',
          'Ver más recomendaciones',
          'Consultar con médico',
        ],
      });

    } catch (error) {
      console.error('Error getting recommendations:', error);
      addBotMessage('No pude obtener las recomendaciones en este momento. Por favor, intenta de nuevo.');
    }
  };

  // Show symptom trends
  const showSymptomTrends = async () => {
    try {
      const trends = await aiService.getSymptomTrends(currentPatientId, '30d');
      
      if (trends.overallTrend === 'insufficient_data') {
        addBotMessage(
          'No tengo suficientes datos para mostrar tendencias de síntomas. ' +
          'Para generar un análisis de tendencias, necesito que describas tus síntomas varias veces a lo largo del tiempo.',
          {
            suggestions: [
              'Analizar síntomas actuales',
              'Ver recomendaciones',
              'Entendido',
            ],
          }
        );
        return;
      }

      const trendEmoji = this.getTrendEmoji(trends.overallTrend);
      const trendText = this.getTrendText(trends.overallTrend);
      
      let response = `${trendEmoji} **Análisis de Tendencia de Síntomas**\n\n`;
      response += `**Tendencia General:** ${trendText}\n\n`;
      
      if (trends.recommendations.length > 0) {
        response += `**Recomendaciones:**\n`;
        trends.recommendations.forEach(rec => {
          response += `• ${rec}\n`;
        });
        response += '\n';
      }

      if (trends.insights.length > 0) {
        response += `**Insights:**\n`;
        trends.insights.forEach(insight => {
          response += `• ${insight}\n`;
        });
      }

      addBotMessage(response, {
        suggestions: [
          'Analizar síntomas actuales',
          'Ver recomendaciones detalladas',
          'Contactar médico',
        ],
      });

    } catch (error) {
      console.error('Error getting trends:', error);
      addBotMessage('No pude obtener las tendencias de síntomas en este momento. Por favor, intenta de nuevo.');
    }
  };

  // Add bot message
  const addBotMessage = (content: string, metadata?: ChatMessage['metadata']) => {
    const botMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      metadata,
    };

    setMessages(prev => [...prev, botMessage]);
  };

  // Parse symptoms from text description
  const parseSymptomsFromText = (text: string) => {
    const symptoms = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Common symptom patterns
    const symptomPatterns = [
      { pattern: /tos/i, symptom: 'tos', severity: 'moderate' as const },
      { pattern: /fiebre/i, symptom: 'fiebre', severity: 'moderate' as const },
      { pattern: /dolor.*pecho/i, symptom: 'dolor en el pecho', severity: 'severe' as const },
      { pattern: /dificultad.*respir/i, symptom: 'dificultad respiratoria', severity: 'severe' as const },
      { pattern: /dolor.*cabeza/i, symptom: 'dolor de cabeza', severity: 'moderate' as const },
      { pattern: /fatiga|cansancio/i, symptom: 'fatiga', severity: 'mild' as const },
      { pattern: /nausea|vomito/i, symptom: 'nausea', severity: 'moderate' as const },
    ];

    symptomPatterns.forEach(({ pattern, symptom, severity }) => {
      if (pattern.test(text)) {
        symptoms.push({
          symptom,
          severity,
          duration: 'desconocida',
        });
      }
    });

    return symptoms;
  };

  // Generate analysis response
  const generateAnalysisResponse = (analysis: AISymptomAnalysis) => {
    const urgencyEmoji = this.getUrgencyEmoji(analysis.urgencyLevel);
    const urgencyText = this.getUrgencyText(analysis.urgencyLevel);
    
    let response = `${urgencyEmoji} **Análisis de Síntomas**\n\n`;
    response += `**Nivel de Urgencia:** ${urgencyText}\n`;
    response += `**Puntuación de Severidad:** ${(analysis.severityScore * 100).toFixed(0)}%\n`;
    response += `**Confianza del Análisis:** ${(analysis.confidenceScore * 100).toFixed(0)}%\n\n`;

    if (analysis.classification.possibleConditions.length > 0) {
      response += `**Posibles Condiciones:**\n`;
      analysis.classification.possibleConditions.forEach(condition => {
        response += `• ${condition.condition} (${(condition.probability * 100).toFixed(0)}%)\n`;
      });
      response += '\n';
    }

    if (analysis.recommendations.immediate.length > 0) {
      response += `**Acciones Inmediatas:**\n`;
      analysis.recommendations.immediate.forEach(rec => {
        response += `• ${rec}\n`;
      });
      response += '\n';
    }

    if (analysis.warningSigns.length > 0) {
      response += `**⚠️ Signos de Alerta:**\n`;
      analysis.warningSigns.forEach(sign => {
        response += `• ${sign}\n`;
      });
      response += '\n';
    }

    if (analysis.followUpRequired) {
      response += `**📋 Seguimiento Requerido:** Sí\n\n`;
    }

    const suggestions = [
      'Ver recomendaciones detalladas',
      'Analizar tendencias',
      'Contactar médico',
    ];

    if (analysis.urgencyLevel === 'high') {
      suggestions.unshift('🚨 EMERGENCIA - Llamar 911');
    }

    return { content: response, suggestions };
  };

  // Utility methods
  private isEmergencyMessage = (message: string): boolean => {
    const emergencyKeywords = [
      'emergencia', 'urgencia', 'grave', 'crítico', 'morir', 'muerte',
      'infarto', 'derrame', 'convulsión', 'sangrado severo',
      'dificultad respiratoria severa', 'dolor pecho intenso'
    ];
    
    return emergencyKeywords.some(keyword => message.includes(keyword));
  };

  private isSymptomDescription = (message: string): boolean => {
    const symptomKeywords = [
      'tengo', 'siento', 'me duele', 'tengo dolor', 'síntoma',
      'tos', 'fiebre', 'dolor', 'fatiga', 'nausea', 'vomito'
    ];
    
    return symptomKeywords.some(keyword => message.includes(keyword));
  };

  private getCategoryDisplayName = (category: string): string => {
    const names: Record<string, string> = {
      respiratory: 'Respiratorias',
      fever: 'Fiebre',
      pain: 'Dolor',
      general: 'Generales',
    };
    
    return names[category] || category;
  };

  private getTrendEmoji = (trend: string): string => {
    const emojis: Record<string, string> = {
      improving: '📈',
      worsening: '📉',
      stable: '➡️',
      insufficient_data: '❓',
    };
    
    return emojis[trend] || '❓';
  };

  private getTrendText = (trend: string): string => {
    const texts: Record<string, string> = {
      improving: 'Mejorando',
      worsening: 'Empeorando',
      stable: 'Estable',
      insufficient_data: 'Datos insuficientes',
    };
    
    return texts[trend] || 'Desconocido';
  };

  private getUrgencyEmoji = (urgency: string): string => {
    const emojis: Record<string, string> = {
      low: '🟢',
      medium: '🟡',
      high: '🔴',
    };
    
    return emojis[urgency] || '❓';
  };

  private getUrgencyText = (urgency: string): string => {
    const texts: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
    };
    
    return texts[urgency] || 'Desconocida';
  };

  // Render message
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.type === 'user';
    
    return (
      <View key={message.id} style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {message.content}
          </Text>
          
          {message.metadata?.suggestions && (
            <View style={styles.suggestionsContainer}>
              {message.metadata.suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => setInputText(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {message.metadata?.analysis && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisTitle}>Análisis Detallado:</Text>
              <Text style={styles.analysisText}>
                Método: {message.metadata.analysis.analysisMethod === 'ai_service' ? 'IA Avanzada' : 'Reglas Locales'}
              </Text>
              <Text style={styles.analysisText}>
                Tiempo de procesamiento: {message.metadata.analysis.processingTimeMs}ms
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map(renderMessage)}
        
        {isTyping && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={styles.typingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.typingText}>Analizando...</Text>
              </View>
            </View>
          </View>
        )}
        
        {isAnalyzing && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.analyzingText}>Procesando síntomas con IA...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Describe tus síntomas o haz una pregunta..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Icon name="send" size={24} color={inputText.trim() ? "#007AFF" : "#999"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#333333',
  },
  suggestionsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  suggestionText: {
    color: '#1976D2',
    fontSize: 14,
  },
  analysisContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  analysisText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzingText: {
    marginLeft: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  sendButtonDisabled: {
    backgroundColor: '#F5F5F5',
  },
});

export default MedicalChatbot;
