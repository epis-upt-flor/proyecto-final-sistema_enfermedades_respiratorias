import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
  Modal as RNModal,
} from 'react-native';
import { ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import chatbotService, { ChatMessage } from '@/services/chatbotService';
import audioService from '@/services/audioService';
import { MEDICAL_IMAGE_TYPES, MedicalImageType } from '@/constants/imageTypes';

const URGENCY_EMOJIS = {
  critical: '🚨',
  high: '⚠️',
  medium: '⚡',
  low: '✅',
};

const URGENCY_COLORS = {
  critical: '#f44336',
  high: '#ff9800',
  medium: '#ffc107',
  low: '#4caf50',
};

export default function ChatbotScreen() {
  // FORZAR modo oscuro
  const isDark = true;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [showAudioOptions, setShowAudioOptions] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [showImageTypeSelector, setShowImageTypeSelector] = useState(false);

  useEffect(() => {
    // Solicitar permisos
    (async () => {
      const { status: imageStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      
      if (imageStatus !== 'granted' || cameraStatus !== 'granted' || audioStatus !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos permisos para cámara, galería y micrófono para usar todas las funciones del chatbot.'
        );
      }
    })();

    // Cargar mensajes guardados desde SQLite
    const loadSavedMessages = async () => {
      try {
        const sessionId = await chatbotService.initializeSession();
        
        // Cargar mensajes desde SQLite
        const { databaseService } = await import('@/services/databaseService');
        await databaseService.initialize();
        const savedMessages = await databaseService.getChatbotMessages(sessionId);
        
        if (savedMessages.length > 0) {
          // Convertir mensajes de SQLite a ChatMessage
          const chatMessages: ChatMessage[] = savedMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            type: msg.type as 'user' | 'assistant',
            timestamp: new Date(msg.timestamp),
            urgencyLevel: msg.urgencyLevel as any,
            symptomCount: msg.symptomCount || undefined,
            needsMedicalAttention: msg.needsMedicalAttention === 1,
            imageUri: msg.imageUri || undefined,
            audioUri: msg.audioUri || undefined,
          }));
          setMessages(chatMessages);
          scrollToBottom();
        } else {
          // Si no hay mensajes guardados, mostrar mensaje de bienvenida
          const welcomeMessage: ChatMessage = {
            id: 'welcome',
            text: '¡Hola! Soy tu asistente médico virtual. Puedo ayudarte con:\n\n• Consultas sobre enfermedades respiratorias\n• Análisis de síntomas\n• Recomendaciones médicas\n• Análisis de imágenes médicas\n• Transcripción de voz (para personas que no pueden escribir)\n\n¿En qué puedo ayudarte hoy?',
            type: 'assistant',
            timestamp: new Date(),
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error cargando mensajes guardados:', error);
        // Si falla, mostrar mensaje de bienvenida
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          text: '¡Hola! Soy tu asistente médico virtual. Puedo ayudarte con:\n\n• Consultas sobre enfermedades respiratorias\n• Análisis de síntomas\n• Recomendaciones médicas\n• Análisis de imágenes médicas\n• Transcripción de voz (para personas que no pueden escribir)\n\n¿En qué puedo ayudarte hoy?',
          type: 'assistant',
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);
      }
    };

    loadSavedMessages();
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText || 'Imagen enviada',
      type: 'user',
      timestamp: new Date(),
      imageUri: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      // Convertir imagen a base64 si existe
      let imageBase64: string | undefined;
      if (selectedImage) {
        try {
          const base64 = await FileSystem.readAsStringAsync(selectedImage, {
            encoding: FileSystem.EncodingType.Base64,
          });
          imageBase64 = base64;
        } catch (error) {
          console.error('Error convirtiendo imagen:', error);
          Alert.alert('Error', 'No se pudo procesar la imagen');
        }
      }

      // Enviar mensaje con imagen y tipo de imagen
      console.log('Enviando mensaje al chatbot:', {
        hasText: !!inputText,
        hasImage: !!imageBase64,
        imageType,
      });

      const response = await chatbotService.sendMessage(
        inputText || (imageBase64 ? 'He enviado una imagen médica para análisis' : ''), 
        imageBase64,
        undefined, // sin transcripción de audio
        undefined, // sin análisis de tos
        imageType // tipo de imagen médica
      );

      console.log('Respuesta del chatbot recibida:', response);

      if (!response || !response.message) {
        throw new Error('El servidor no devolvió una respuesta válida');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        text: response.message,
        type: 'assistant',
        timestamp: new Date(),
        urgencyLevel: response.urgency_level as any,
        symptomCount: response.symptom_count,
        needsMedicalAttention: response.needs_medical_attention,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSelectedImage(null);
      setImageType(null);
      scrollToBottom();
    } catch (error: any) {
      console.error('Error completo al enviar mensaje:', error);
      Alert.alert(
        'Error', 
        error.message || 'No se pudo enviar el mensaje. Intenta de nuevo.',
        [
          { text: 'OK' },
          { 
            text: 'Ver detalles', 
            onPress: () => console.log('Detalles del error:', error) 
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowImageTypeSelector(true); // Mostrar selector de tipo de imagen
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowImageTypeSelector(true); // Mostrar selector de tipo de imagen
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const handleSelectImageType = (type: MedicalImageType) => {
    setImageType(type.id);
    setShowImageTypeSelector(false);
  };

  const handleCancelImageType = () => {
    setShowImageTypeSelector(false);
    setSelectedImage(null);
    setImageType(null);
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    if (uri) {
      setRecordedAudioUri(uri);
      setShowAudioOptions(true); // Mostrar opciones para el audio
    }

    setRecording(null);
  };

  const handleAnalyzeCough = async () => {
    if (!recordedAudioUri) return;

    setIsProcessingAudio(true);
    setShowAudioOptions(false);

    try {
      const analysis = await audioService.analyzeCough(recordedAudioUri);

      if (analysis.success && analysis.coughAnalysis) {
        const coughInfo = analysis.coughAnalysis;
        
        // Crear mensaje con el análisis de tos
        const coughMessage = `He analizado tu tos. Severidad: ${coughInfo.severity}. Características: ${coughInfo.characteristics?.join(', ')}.`;
        
        const messageId = `user_${Date.now()}`;
        const userMessage: ChatMessage = {
          id: messageId,
          text: 'Análisis de tos',
          type: 'user',
          timestamp: new Date(),
          audioUri: recordedAudioUri,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        scrollToBottom();
        
        // Guardar mensaje en SQLite
        try {
          const { databaseService } = await import('@/services/databaseService');
          await databaseService.initialize();
          const sessionId = await chatbotService.initializeSession();
          
          await databaseService.saveChatbotMessage({
            id: messageId,
            sessionId,
            text: userMessage.text,
            type: 'user',
            timestamp: userMessage.timestamp.toISOString(),
            audioUri: recordedAudioUri || null,
          });
        } catch (error) {
          console.error('Error guardando mensaje en SQLite:', error);
        }

        try {
          // Enviar al chatbot con el análisis de tos
          const response = await chatbotService.sendMessage(
            coughMessage,
            undefined, // sin imagen
            undefined, // sin transcripción
            coughInfo // análisis de tos
          );

          const assistantMessage: ChatMessage = {
            id: `assistant_${Date.now()}`,
            text: response.message,
            type: 'assistant',
            timestamp: new Date(),
            urgencyLevel: response.urgency_level as any,
            symptomCount: response.symptom_count,
            needsMedicalAttention: response.needs_medical_attention,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setRecordedAudioUri(null);
          scrollToBottom();
        } catch (error: any) {
          // Si falla el chatbot, mostrar solo el análisis de tos
          const analysisMessage: ChatMessage = {
            id: `assistant_${Date.now()}`,
            text: `📊 Análisis de Tos:\n\nSeveridad: ${coughInfo.severity || 'moderate'}\n\nCaracterísticas:\n${coughInfo.characteristics?.map((c: string) => `• ${c}`).join('\n') || '• Tos detectada'}\n\nRecomendaciones:\n${coughInfo.recommendations?.map((r: string) => `• ${r}`).join('\n') || '• Consulta con un médico'}\n\nNivel de urgencia: ${coughInfo.urgency_level || 'medium'}`,
            type: 'assistant',
            timestamp: new Date(),
            urgencyLevel: (coughInfo.urgency_level || 'medium') as any,
            needsMedicalAttention: coughInfo.urgency_level === 'high' || coughInfo.urgency_level === 'critical',
          };
          setMessages((prev) => [...prev, analysisMessage]);
          setRecordedAudioUri(null);
          scrollToBottom();
        } finally {
          setIsLoading(false);
        }
      } else {
        Alert.alert('Error', analysis.error || 'No se pudo analizar la tos');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al analizar la tos');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleTranscribeAndAnalyze = async () => {
    if (!recordedAudioUri) return;

    setIsProcessingAudio(true);
    setShowAudioOptions(false);

    try {
      // Mostrar mensaje de procesamiento
      const processingMessage: ChatMessage = {
        id: `processing_${Date.now()}`,
        text: '🎤 Transcribiendo tu mensaje de voz...',
        type: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, processingMessage]);
      scrollToBottom();

      const transcriptionResult = await audioService.transcribeAudio(recordedAudioUri);

      if (transcriptionResult.success && transcriptionResult.transcription) {
        // Usar la transcripción como mensaje de texto
        const transcription = transcriptionResult.transcription.trim();
        
        // Remover el mensaje de procesamiento
        setMessages((prev) => prev.filter(msg => msg.id !== processingMessage.id));
        
        // Mostrar el mensaje transcrito del usuario
        const messageId = `user_${Date.now()}`;
        const userMessage: ChatMessage = {
          id: messageId,
          text: transcription,
          type: 'user',
          timestamp: new Date(),
          audioUri: recordedAudioUri,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        scrollToBottom();
        
        // Guardar mensaje en SQLite
        try {
          const { databaseService } = await import('@/services/databaseService');
          await databaseService.initialize();
          const sessionId = await chatbotService.initializeSession();
          
          await databaseService.saveChatbotMessage({
            id: messageId,
            sessionId,
            text: transcription,
            type: 'user',
            timestamp: userMessage.timestamp.toISOString(),
            audioUri: recordedAudioUri || null,
          });
        } catch (error) {
          console.error('Error guardando mensaje transcrito en SQLite:', error);
        }

        try {
          // Enviar automáticamente el mensaje transcrito al chatbot
          // Pasar la transcripción como audioTranscription para que el servicio la use
          const response = await chatbotService.sendMessage(
            transcription, // mensaje principal
            undefined, // sin imagen
            transcription, // transcripción de audio (para contexto)
            undefined, // sin análisis de tos
            undefined // sin tipo de imagen
          );
          
          const assistantMessage: ChatMessage = {
            id: `assistant_${Date.now()}`,
            text: response.message,
            type: 'assistant',
            timestamp: new Date(),
            urgencyLevel: response.urgency_level as any,
            symptomCount: response.symptom_count,
            needsMedicalAttention: response.needs_medical_attention,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          setRecordedAudioUri(null);
          scrollToBottom();
        } catch (error: any) {
          console.error('Error enviando mensaje transcrito:', error);
          Alert.alert(
            'Error al enviar mensaje',
            error.message || 'No se pudo enviar el mensaje transcrito. El texto está disponible para que lo envíes manualmente.'
          );
          // Si falla, poner el texto en el input para que el usuario pueda enviarlo manualmente
          setInputText(transcription);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Remover el mensaje de procesamiento
        setMessages((prev) => prev.filter(msg => msg.id !== processingMessage.id));
        
        Alert.alert(
          'Transcripción no disponible',
          transcriptionResult.error || 'No se pudo transcribir el audio. Por favor, intenta de nuevo o escribe tu mensaje manualmente.',
          [
            { text: 'OK' },
            {
              text: 'Intentar de nuevo',
              onPress: () => {
                setRecordedAudioUri(null);
                setShowAudioOptions(false);
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error en transcripción:', error);
      Alert.alert(
        'Error',
        error.message || 'Error al transcribir el audio. Por favor, intenta de nuevo o escribe tu mensaje manualmente.'
      );
    } finally {
      setIsProcessingAudio(false);
      setRecordedAudioUri(null);
    }
  };

  const handleCancelAudio = () => {
    setShowAudioOptions(false);
    setRecordedAudioUri(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0f172a' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.type === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              {message.imageUri && (
                <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
              )}
              <View
                style={[
                  {
                    backgroundColor: message.type === 'user' ? '#14b8a6' : '#1e293b',
                    borderRadius: 24,
                    padding: 16,
                    maxWidth: '85%',
                  }
                ]}
              >
                <ThemedText style={{ fontSize: 16, lineHeight: 22, color: '#ffffff' }}>{message.text}</ThemedText>
                {message.urgencyLevel && (
                  <View style={{ marginTop: 8, padding: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' }}>
                    <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: '#ffffff' }}>
                      {URGENCY_EMOJIS[message.urgencyLevel]}{' '}
                      {message.urgencyLevel.toUpperCase()}
                    </ThemedText>
                  </View>
                )}
                {message.needsMedicalAttention && (
                  <ThemedText style={{ marginTop: 8, fontSize: 12, fontWeight: 'bold', color: '#f59e0b' }}>
                    ⚠️ Se recomienda atención médica
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#14b8a6" />
              <ThemedText style={styles.loadingText}>El asistente está pensando...</ThemedText>
            </View>
          )}
          {isProcessingAudio && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#14b8a6" />
              <ThemedText style={styles.loadingText}>Procesando audio...</ThemedText>
            </View>
          )}
        </ScrollView>

        {selectedImage && !showImageTypeSelector && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <View style={styles.imagePreviewInfo}>
              {imageType && (
                <ThemedText style={styles.imageTypeLabel}>
                  {MEDICAL_IMAGE_TYPES.find(t => t.id === imageType)?.icon} {MEDICAL_IMAGE_TYPES.find(t => t.id === imageType)?.name}
                </ThemedText>
              )}
              <TouchableOpacity 
                onPress={() => {
                  setSelectedImage(null);
                  setImageType(null);
                }}
                style={{ padding: 8 }}
              >
                <ThemedText style={{ color: '#14b8a6', fontSize: 14, fontWeight: '600' }}>
                  Eliminar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={handlePickImage} style={styles.iconButton}>
              <ThemedText style={styles.iconText}>📷</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleTakePhoto} style={styles.iconButton}>
              <ThemedText style={styles.iconText}>📸</ThemedText>
            </TouchableOpacity>
            <View style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: 24, borderWidth: 1, borderColor: '#334155', paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 8 }}>
              <TextInput
                style={{ color: '#ffffff', fontSize: 16, minHeight: 40, maxHeight: 100 }}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor="#94a3b8"
                multiline
                editable={!isLoading}
              />
            </View>
            {isRecording ? (
              <TouchableOpacity 
                onPress={stopRecording} 
                style={[styles.recordButton, { backgroundColor: '#f44336' }]}
              >
                <ThemedText style={styles.recordText}>⏹</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={startRecording} 
                style={styles.recordButton}
                disabled={isProcessingAudio}
              >
                <ThemedText style={styles.recordText}>🎤</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              style={{
                backgroundColor: isLoading || (!inputText.trim() && !selectedImage) ? '#64748b' : '#14b8a6',
                borderRadius: 24,
                paddingVertical: 12,
                paddingHorizontal: 24,
                justifyContent: 'center',
                alignItems: 'center',
                minWidth: 80,
              }}
            >
              <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Enviar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de opciones de audio - Usar Modal nativo en web para evitar problemas con Portal */}
      {Platform.OS === 'web' ? (
        <RNModal
          visible={showAudioOptions}
          transparent
          animationType="fade"
          onRequestClose={handleCancelAudio}
        >
          <View style={styles.audioModalOverlay}>
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 24,
              padding: 24,
              width: '90%',
              maxWidth: 400,
            }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 }}>
                ¿Qué deseas hacer con el audio?
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
                Selecciona una opción para procesar tu grabación de audio.
              </ThemedText>
              <TouchableOpacity
                onPress={handleAnalyzeCough}
                disabled={isProcessingAudio}
                style={{
                  backgroundColor: '#14b8a6',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  marginBottom: 12,
                  opacity: isProcessingAudio ? 0.5 : 1,
                }}
              >
                <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  🫁 Analizar Tos
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTranscribeAndAnalyze}
                disabled={isProcessingAudio}
                style={{
                  backgroundColor: '#14b8a6',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  marginBottom: 12,
                  opacity: isProcessingAudio ? 0.5 : 1,
                }}
              >
                <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  🎤 Transcribir y Enviar (Para personas que no pueden escribir)
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelAudio}
                style={{
                  borderWidth: 2,
                  borderColor: '#334155',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}
              >
                <ThemedText style={{ color: '#94a3b8', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      ) : (
        <RNModal
          visible={showAudioOptions}
          transparent
          animationType="fade"
          onRequestClose={handleCancelAudio}
        >
          <View style={styles.audioModalOverlay}>
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 24,
              padding: 24,
              width: '90%',
              maxWidth: 400,
            }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 }}>
                ¿Qué deseas hacer con el audio?
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
                Selecciona una opción para procesar tu grabación de audio.
              </ThemedText>
              <TouchableOpacity
                onPress={handleAnalyzeCough}
                disabled={isProcessingAudio}
                style={{
                  backgroundColor: '#14b8a6',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  marginBottom: 12,
                  opacity: isProcessingAudio ? 0.5 : 1,
                }}
              >
                <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  🫁 Analizar Tos
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTranscribeAndAnalyze}
                disabled={isProcessingAudio}
                style={{
                  backgroundColor: '#14b8a6',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  marginBottom: 12,
                  opacity: isProcessingAudio ? 0.5 : 1,
                }}
              >
                <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  🎤 Transcribir y Enviar (Para personas que no pueden escribir)
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancelAudio}
                style={{
                  borderWidth: 2,
                  borderColor: '#334155',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}
              >
                <ThemedText style={{ color: '#94a3b8', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      )}

      {/* Modal para seleccionar tipo de imagen médica */}
      {Platform.OS === 'web' ? (
        <RNModal
          visible={showImageTypeSelector}
          transparent
          animationType="fade"
          onRequestClose={handleCancelImageType}
        >
          <View style={styles.imageTypeModalOverlay}>
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 24,
              padding: 24,
              width: '90%',
              maxWidth: 400,
              maxHeight: '80%',
            }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 }}>
                Tipo de Imagen Médica
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                Selecciona el tipo de imagen que estás enviando para un mejor análisis.
              </ThemedText>
              <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
                {MEDICAL_IMAGE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => handleSelectImageType(type)}
                    style={{
                      backgroundColor: imageType === type.id ? '#14b8a6' : 'transparent',
                      borderWidth: 2,
                      borderColor: imageType === type.id ? '#14b8a6' : '#334155',
                      borderRadius: 24,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <ThemedText style={{ fontSize: 24 }}>{type.icon}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 4 }}>
                          {type.name}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 12, color: '#94a3b8' }}>
                          {type.description}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={handleCancelImageType}
                style={{
                  borderWidth: 2,
                  borderColor: '#334155',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  marginTop: 12,
                }}
              >
                <ThemedText style={{ color: '#94a3b8', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      ) : (
        <RNModal
          visible={showImageTypeSelector}
          transparent
          animationType="fade"
          onRequestClose={handleCancelImageType}
        >
          <View style={styles.imageTypeModalOverlay}>
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 24,
              padding: 24,
              width: '90%',
              maxWidth: 400,
              maxHeight: '80%',
            }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 }}>
                Tipo de Imagen Médica
              </ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
                Selecciona el tipo de imagen que estás enviando para un mejor análisis.
              </ThemedText>
              <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
                {MEDICAL_IMAGE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => handleSelectImageType(type)}
                    style={{
                      backgroundColor: imageType === type.id ? '#14b8a6' : 'transparent',
                      borderWidth: 2,
                      borderColor: imageType === type.id ? '#14b8a6' : '#334155',
                      borderRadius: 24,
                      padding: 16,
                      marginBottom: 12,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <ThemedText style={{ fontSize: 24 }}>{type.icon}</ThemedText>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 4 }}>
                          {type.name}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 12, color: '#94a3b8' }}>
                          {type.description}
                        </ThemedText>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={handleCancelImageType}
                style={{
                  borderWidth: 2,
                  borderColor: '#334155',
                  borderRadius: 24,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  marginTop: 12,
                }}
              >
                <ThemedText style={{ color: '#94a3b8', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // FORZADO: Dark background moderno
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  messagesContent: {
    padding: 16,
    backgroundColor: '#0f172a',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageCard: {
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userCard: {
    backgroundColor: '#14b8a6', // Teal primary
  },
  assistantCard: {
    backgroundColor: '#1e293b', // Slate 800
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#ffffff',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  urgencyBadge: {
    marginTop: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  medicalAlert: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#94a3b8',
  },
  imagePreview: {
    padding: 8,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  inputContainer: {
    padding: 12,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 4,
  },
  iconText: {
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    marginHorizontal: 4,
    maxHeight: 100,
    backgroundColor: '#334155',
    color: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  recordButton: {
    padding: 8,
    marginRight: 4,
  },
  recordText: {
    fontSize: 24,
  },
  sendButton: {
    marginLeft: 4,
    backgroundColor: '#14b8a6',
    borderRadius: 24,
  },
  audioModal: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  audioModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  audioModalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
  },
  audioOptionButton: {
    marginVertical: 4,
  },
  imagePreviewInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageTypeLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 8,
  },
  imageTypeModal: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  imageTypeModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  imageTypeModalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 500,
  },
  imageTypeList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  imageTypeButton: {
    marginVertical: 6,
    borderColor: '#334155',
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
  imageTypeButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageTypeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  imageTypeButtonDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  imageTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
});

