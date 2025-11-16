import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutAnimation,
  UIManager,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Chip,
  FAB,
  Portal,
  Modal,
  IconButton,
} from 'react-native-paper';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { useAppStore } from '../../store/useAppStore';
import { MedicalHistory, Symptom } from '../../types';
import { LazyImage } from '../common/LazyImage';
import { shallow } from 'zustand/shallow';
import { voiceRecognitionService } from '../../services/voiceRecognitionService';
import { useTranslation } from '../../services/i18nService';

const PREDEFINED_SYMPTOMS = Object.freeze([
  { id: '1', name: 'Tos seca', severity: 'mild' as const },
  { id: '2', name: 'Tos con flema', severity: 'mild' as const },
  { id: '3', name: 'Dificultad respiratoria', severity: 'severe' as const },
  { id: '4', name: 'Dolor de pecho', severity: 'severe' as const },
  { id: '5', name: 'Fiebre', severity: 'moderate' as const },
  { id: '6', name: 'Fatiga', severity: 'mild' as const },
  { id: '7', name: 'Pérdida de apetito', severity: 'mild' as const },
  { id: '8', name: 'Náuseas', severity: 'mild' as const },
] as const);

const DataCaptureScreen: React.FC = () => {
  const { t } = useTranslation();
  const { addMedicalHistory, isOnline } = useAppStore(
    useCallback(
      (state) => ({
        addMedicalHistory: state.addMedicalHistory,
        isOnline: state.isOnline,
      }),
      []
    ),
    shallow
  );
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    diagnosis: '',
    symptoms: [] as Symptom[],
    description: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [audioNote, setAudioNote] = useState<string>('');
  const [location, setLocation] = useState<{latitude: number; longitude: number; address: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    getCurrentLocation();
  }, [getCurrentLocation]);

  const getCurrentLocation = useCallback(async () => {
    try {
      const granted = await request(
        Platform.OS === 'ios' 
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );

      if (granted === RESULTS.GRANTED) {
        Geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: 'Ubicación actual', // TODO: i18n + geocoding
            });
          },
          (error) => {
            console.log('Error getting location:', error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      }
    } catch (error) {
      console.log('Permission error:', error);
    }
  }, []);

  const handleImageResponse = useCallback((response: ImagePickerResponse) => {
    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setImages(prev => [...prev, imageUri]);
      }
    }
  }, []);

  const handleImagePicker = useCallback(() => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    Alert.alert(
      t('common.save'),
      '¿Cómo deseas capturar la imagen?',
      [
        { text: 'Cámara', onPress: () => launchCamera(options, handleImageResponse) },
        { text: 'Galería', onPress: () => launchImageLibrary(options, handleImageResponse) },
        { text: t('common.cancel'), style: 'cancel' },
      ]
    );
  }, [handleImageResponse, t]);

  const removeImage = useCallback((index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addSymptom = useCallback((symptom: typeof PREDEFINED_SYMPTOMS[number]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFormData(prev => {
      if (prev.symptoms.some(s => (s as any).name === symptom.name)) {
        return prev;
      }

      const newSymptom = {
        id: Date.now().toString(),
        name: symptom.name,
        symptom: symptom.name,
        severity: symptom.severity,
        duration: 'N/A',
      } as unknown as Symptom;

      return {
        ...prev,
        symptoms: [...prev.symptoms, newSymptom],
      };
    });
  }, []);

  const removeSymptom = useCallback((symptomId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s.id !== symptomId),
    }));
  }, []);

  const parseSymptomsFromText = (text: string) => {
    const lowered = text.toLowerCase();
    const matches: Array<typeof PREDEFINED_SYMPTOMS[number]> = [];
    PREDEFINED_SYMPTOMS.forEach((s) => {
      const key = s.name.toLowerCase();
      if (
        lowered.includes(key) ||
        (s.name === 'Tos seca' && (lowered.includes('tos seca') || lowered.includes('tos'))) ||
        (s.name === 'Tos con flema' && (lowered.includes('flema') || lowered.includes('tos con flema')))
      ) {
        matches.push(s);
      }
    });
    if (matches.length === 0) {
      Alert.alert(t('common.error'), 'No se reconocieron síntomas conocidos en el audio.');
      return;
    }
    matches.forEach(addSymptom);
  };

  const startVoiceInput = useCallback(async () => {
    try {
      setIsListening(true);
      const ok = await voiceRecognitionService.startListening(
        { language: 'es-ES', interimResults: false },
        (result) => {
          setIsListening(false);
          if (result.isFinal && result.text) {
            parseSymptomsFromText(result.text);
          }
        },
        (error) => {
          setIsListening(false);
          if (error?.toLowerCase().includes('permiso')) {
            Alert.alert(t('common.error'), 'Habilita el permiso de micrófono para usar dictado.');
          } else {
            Alert.alert(t('common.error'), error || 'No se pudo reconocer la voz.');
          }
        }
      );
      if (!ok) {
        setIsListening(false);
        Alert.alert(t('common.error'), 'No se pudo iniciar el reconocimiento.');
      }
    } catch (e) {
      setIsListening(false);
      Alert.alert(t('common.error'), 'Ocurrió un error al iniciar reconocimiento de voz.');
    }
  }, [parseSymptomsFromText, t]);

  const cancelVoiceInput = useCallback(async () => {
    await voiceRecognitionService.cancel();
    setIsListening(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!formData.patientName || !formData.age || !formData.diagnosis) {
      Alert.alert(t('common.error'), 'Por favor completa todos los campos obligatorios');
      return;
    }

    setIsLoading(true);

    try {
      const newHistory: MedicalHistory = {
        id: Date.now().toString(),
        patientId: 'current-user',
        patientName: formData.patientName,
        age: parseInt(formData.age),
        diagnosis: formData.diagnosis,
        symptoms: formData.symptoms,
        date: new Date().toISOString(),
        location: location || undefined,
        images: images.length > 0 ? images : undefined,
        audioNotes: audioNote || undefined,
        isOffline: !isOnline,
        syncStatus: isOnline ? 'pending' : 'pending',
      };

      addMedicalHistory(newHistory);

      setFormData({
        patientName: '',
        age: '',
        diagnosis: '',
        symptoms: [],
        description: '',
      });
      setImages([]);
      setAudioNote('');

      Alert.alert(
        t('common.success'),
        isOnline 
          ? 'Historia médica guardada y sincronizada'
          : 'Historia médica guardada offline. Se sincronizará cuando haya conexión.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert(t('common.error'), 'No se pudo guardar la historia médica');
      console.error('Error saving medical history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addMedicalHistory, formData, images, isOnline, location, t]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>📝 {t('medicalHistory.title')}</Title>
            <Paragraph>
              {isOnline ? '🟢 Conectado' : '🔴 Modo Offline'}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Información del Paciente */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('medicalHistory.title')}</Title>
            <TextInput
              label={`${t('medicalHistory.patientName')} *`}
              value={formData.patientName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, patientName: text }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label={`${t('medicalHistory.age')} *`}
              value={formData.age}
              onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label={`${t('medicalHistory.diagnosis')} *`}
              value={formData.diagnosis}
              onChangeText={(text) => setFormData(prev => ({ ...prev, diagnosis: text }))}
              style={styles.input}
              mode="outlined"
              multiline
            />
          </Card.Content>
        </Card>

        {/* Síntomas */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title>{t('symptoms.title')}</Title>
              {!isListening ? (
                <Button mode="outlined" icon="microphone" onPress={startVoiceInput}>
                  {t('chatbot.voiceInput')}
                </Button>
              ) : (
                <Button mode="outlined" icon="stop" onPress={cancelVoiceInput}>
                  {t('common.cancel')}
                </Button>
              )}
            </View>
            <Paragraph>{t('symptoms.addSymptom')}</Paragraph>
            <View style={styles.symptomsContainer}>
              {PREDEFINED_SYMPTOMS.map((symptom) => (
                <Chip
                  key={symptom.id}
                  selected={formData.symptoms.some(s => s.name === symptom.name)}
                  onPress={() => addSymptom(symptom)}
                  style={styles.symptomChip}
                >
                  {symptom.name}
                </Chip>
              ))}
            </View>
            
            {formData.symptoms.length > 0 && (
              <View style={styles.selectedSymptoms}>
                <Paragraph>{t('symptoms.title')}</Paragraph>
                {formData.symptoms.map((symptom) => (
                  <Chip
                    key={symptom.id}
                    onClose={() => removeSymptom(symptom.id)}
                    style={styles.selectedChip}
                  >
                    {symptom.name} ({symptom.severity})
                  </Chip>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Imágenes */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Imágenes</Title>
            <Button
              mode="outlined"
              onPress={handleImagePicker}
              icon="camera"
              style={styles.button}
            >
              Agregar Imagen
            </Button>
            
            {images.length > 0 && (
              <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <View key={image} style={styles.imageItem}>
                <LazyImage
                  source={{ uri: image }}
                  style={styles.previewImage}
                  containerStyle={styles.previewContainer}
                  accessibilityLabel={`Imagen seleccionada ${index + 1}`}
                />
                <Text numberOfLines={1} style={styles.imageText}>
                  Imagen {index + 1}
                </Text>
                <IconButton
                  icon="close"
                  size={18}
                  onPress={() => removeImage(index)}
                />
              </View>
            ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Ubicación */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('medicalHistory.location')}</Title>
            {location ? (
              <Paragraph>
                📍 Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
              </Paragraph>
            ) : (
              <Paragraph>📍 Ubicación no disponible</Paragraph>
            )}
            <Button
              mode="outlined"
              onPress={getCurrentLocation}
              icon="map-marker"
              style={styles.button}
            >
              Actualizar Ubicación
            </Button>
          </Card.Content>
        </Card>

        {/* Notas Adicionales */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Notas Adicionales</Title>
            <TextInput
              label="Descripción adicional"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />
          </Card.Content>
        </Card>

        {/* Botón de Guardar */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          {t('common.save')}
        </Button>
      </ScrollView>

      {/* FAB para acceso rápido */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Scroll to top
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  symptomChip: {
    margin: 4,
  },
  selectedSymptoms: {
    marginTop: 16,
  },
  selectedChip: {
    margin: 4,
    backgroundColor: '#e3f2fd',
  },
  imagesContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageItem: {
    marginRight: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  imageText: {
    marginTop: 4,
    maxWidth: 96,
    textAlign: 'center',
    color: '#666',
  },
  previewContainer: {
    width: 96,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default DataCaptureScreen;
