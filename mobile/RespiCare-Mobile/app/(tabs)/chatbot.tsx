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
import { TextInput, Button, Card, Avatar, ActivityIndicator, useTheme, Portal, Modal, Title, Paragraph } from 'react-native-paper';
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
  const theme = useTheme();
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

    // Mensaje de bienvenida
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      text: '¡Hola! Soy tu asistente médico virtual. Puedo ayudarte con:\n\n• Consultas sobre enfermedades respiratorias\n• Análisis de síntomas\n• Recomendaciones médicas\n• Análisis de imágenes médicas\n\n¿En qué puedo ayudarte hoy?',
      type: 'assistant',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
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
        
        const userMessage: ChatMessage = {
          id: `user_${Date.now()}`,
          text: 'Análisis de tos',
          type: 'user',
          timestamp: new Date(),
          audioUri: recordedAudioUri,
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        scrollToBottom();

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
      const transcriptionResult = await audioService.transcribeAudio(recordedAudioUri);

      if (transcriptionResult.success && transcriptionResult.transcription) {
        // Usar la transcripción como mensaje de texto
        const transcription = transcriptionResult.transcription;
        setInputText(transcription);
        
        // Enviar automáticamente el mensaje transcrito
        const userMessage: ChatMessage = {
          id: `user_${Date.now()}`,
          text: transcription,
          type: 'user',
          timestamp: new Date(),
          audioUri: recordedAudioUri,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        scrollToBottom();

        try {
          const response = await chatbotService.sendMessage(transcription);
          
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
          Alert.alert('Error', error.message || 'No se pudo enviar el mensaje');
        } finally {
          setIsLoading(false);
        }
      } else {
        Alert.alert(
          'Transcripción no disponible',
          transcriptionResult.error || 'No se pudo transcribir el audio. Por favor, escribe tu mensaje manualmente.'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al transcribir el audio');
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
    <View style={styles.container}>
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
              <Card
                style={[
                  styles.messageCard,
                  message.type === 'user'
                    ? styles.userCard
                    : styles.assistantCard,
                ]}
              >
                <Card.Content>
                  <ThemedText style={styles.messageText}>{message.text}</ThemedText>
                  {message.urgencyLevel && (
                    <View style={styles.urgencyBadge}>
                      <ThemedText style={styles.urgencyText}>
                        {URGENCY_EMOJIS[message.urgencyLevel]}{' '}
                        {message.urgencyLevel.toUpperCase()}
                      </ThemedText>
                    </View>
                  )}
                  {message.needsMedicalAttention && (
                    <ThemedText style={[styles.medicalAlert, { color: '#ff9800' }]}>
                      ⚠️ Se recomienda atención médica
                    </ThemedText>
                  )}
                </Card.Content>
              </Card>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3390ec" />
              <ThemedText style={styles.loadingText}>El asistente está pensando...</ThemedText>
            </View>
          )}
          {isProcessingAudio && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3390ec" />
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
              <Button 
                onPress={() => {
                  setSelectedImage(null);
                  setImageType(null);
                }} 
                mode="text" 
                compact
              >
                Eliminar
              </Button>
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
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#708499"
              multiline
              mode="outlined"
              disabled={isLoading}
              outlineColor="#1e2732"
              activeOutlineColor="#3390ec"
              textColor="#ffffff"
            />
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
            <Button
              mode="contained"
              onPress={handleSendMessage}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              style={styles.sendButton}
            >
              Enviar
            </Button>
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
            <Card style={styles.audioModalCard}>
              <Card.Content>
                <Title style={{ color: '#ffffff', marginBottom: 8 }}>
                  ¿Qué deseas hacer con el audio?
                </Title>
                <Paragraph style={{ color: '#b1bbc4', marginBottom: 16 }}>
                  Selecciona una opción para procesar tu grabación de audio.
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={handleAnalyzeCough}
                  style={[styles.audioOptionButton, { backgroundColor: '#3390ec' }]}
                  icon="stethoscope"
                  disabled={isProcessingAudio}
                >
                  🫁 Analizar Tos
                </Button>
                <Button
                  mode="contained"
                  onPress={handleTranscribeAndAnalyze}
                  style={[styles.audioOptionButton, { backgroundColor: '#3390ec', marginTop: 12 }]}
                  icon="microphone"
                  disabled={isProcessingAudio}
                >
                  🎤 Transcribir y Analizar
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleCancelAudio}
                  style={[styles.audioOptionButton, { marginTop: 12, borderColor: '#1e2732' }]}
                >
                  Cancelar
                </Button>
              </Card.Content>
            </Card>
          </View>
        </RNModal>
      ) : (
        <Portal>
          <Modal 
            visible={showAudioOptions} 
            onDismiss={handleCancelAudio}
            contentContainerStyle={styles.audioModal}
          >
            <Card style={styles.audioModalCard}>
              <Card.Content>
                <Title style={{ color: '#ffffff', marginBottom: 8 }}>
                  ¿Qué deseas hacer con el audio?
                </Title>
                <Paragraph style={{ color: '#b1bbc4', marginBottom: 16 }}>
                  Selecciona una opción para procesar tu grabación de audio.
                </Paragraph>
                <Button
                  mode="contained"
                  onPress={handleAnalyzeCough}
                  style={[styles.audioOptionButton, { backgroundColor: '#3390ec' }]}
                  icon="stethoscope"
                  disabled={isProcessingAudio}
                >
                  🫁 Analizar Tos
                </Button>
                <Button
                  mode="contained"
                  onPress={handleTranscribeAndAnalyze}
                  style={[styles.audioOptionButton, { backgroundColor: '#3390ec', marginTop: 12 }]}
                  icon="microphone"
                  disabled={isProcessingAudio}
                >
                  🎤 Transcribir y Analizar
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleCancelAudio}
                  style={[styles.audioOptionButton, { marginTop: 12, borderColor: '#1e2732' }]}
                >
                  Cancelar
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
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
            <Card style={styles.imageTypeModalCard}>
              <Card.Content>
                <Title style={{ color: '#ffffff', marginBottom: 8 }}>
                  Tipo de Imagen Médica
                </Title>
                <Paragraph style={{ color: '#b1bbc4', marginBottom: 16 }}>
                  Selecciona el tipo de imagen que estás enviando para un mejor análisis.
                </Paragraph>
                <ScrollView style={styles.imageTypeList} nestedScrollEnabled>
                  {MEDICAL_IMAGE_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      mode={imageType === type.id ? 'contained' : 'outlined'}
                      onPress={() => handleSelectImageType(type)}
                      style={[
                        styles.imageTypeButton,
                        imageType === type.id && { backgroundColor: '#3390ec' },
                      ]}
                    >
                      <View style={styles.imageTypeButtonContent}>
                        <ThemedText style={styles.imageTypeIcon}>{type.icon}</ThemedText>
                        <View>
                          <ThemedText style={styles.imageTypeButtonText}>{type.name}</ThemedText>
                          <ThemedText style={styles.imageTypeButtonDesc}>{type.description}</ThemedText>
                        </View>
                      </View>
                    </Button>
                  ))}
                </ScrollView>
                <Button
                  mode="outlined"
                  onPress={handleCancelImageType}
                  style={[styles.imageTypeButton, { marginTop: 12, borderColor: '#1e2732' }]}
                >
                  Cancelar
                </Button>
              </Card.Content>
            </Card>
          </View>
        </RNModal>
      ) : (
        <Portal>
          <Modal 
            visible={showImageTypeSelector} 
            onDismiss={handleCancelImageType}
            contentContainerStyle={styles.imageTypeModal}
          >
            <Card style={styles.imageTypeModalCard}>
              <Card.Content>
                <Title style={{ color: '#ffffff', marginBottom: 8 }}>
                  Tipo de Imagen Médica
                </Title>
                <Paragraph style={{ color: '#b1bbc4', marginBottom: 16 }}>
                  Selecciona el tipo de imagen que estás enviando para un mejor análisis.
                </Paragraph>
                <ScrollView style={styles.imageTypeList} nestedScrollEnabled>
                  {MEDICAL_IMAGE_TYPES.map((type) => (
                    <Button
                      key={type.id}
                      mode={imageType === type.id ? 'contained' : 'outlined'}
                      onPress={() => handleSelectImageType(type)}
                      style={[
                        styles.imageTypeButton,
                        imageType === type.id && { backgroundColor: '#3390ec' },
                      ]}
                    >
                      <View style={styles.imageTypeButtonContent}>
                        <ThemedText style={styles.imageTypeIcon}>{type.icon}</ThemedText>
                        <View>
                          <ThemedText style={styles.imageTypeButtonText}>{type.name}</ThemedText>
                          <ThemedText style={styles.imageTypeButtonDesc}>{type.description}</ThemedText>
                        </View>
                      </View>
                    </Button>
                  ))}
                </ScrollView>
                <Button
                  mode="outlined"
                  onPress={handleCancelImageType}
                  style={[styles.imageTypeButton, { marginTop: 12, borderColor: '#1e2732' }]}
                >
                  Cancelar
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e1621', // Fondo estilo Telegram
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#0e1621',
  },
  messagesContent: {
    padding: 16,
    backgroundColor: '#0e1621',
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  userCard: {
    backgroundColor: '#3390ec', // Azul estilo Telegram
  },
  assistantCard: {
    backgroundColor: '#182229', // Gris oscuro estilo Telegram
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
    color: '#b1bbc4',
  },
  imagePreview: {
    padding: 8,
    backgroundColor: '#17212b',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1e2732',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  inputContainer: {
    padding: 8,
    backgroundColor: '#17212b',
    borderTopWidth: 1,
    borderTopColor: '#1e2732',
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
    backgroundColor: '#1e2732',
    color: '#ffffff',
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
    backgroundColor: '#3390ec',
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
    backgroundColor: '#17212b',
    borderRadius: 12,
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
    color: '#b1bbc4',
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
    backgroundColor: '#17212b',
    borderRadius: 12,
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
    borderColor: '#1e2732',
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
    color: '#b1bbc4',
    fontSize: 11,
    marginTop: 2,
  },
  imageTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
});

