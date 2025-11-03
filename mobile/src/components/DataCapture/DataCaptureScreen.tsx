import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
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
  List,
  IconButton,
} from 'react-native-paper';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { useAppStore } from '../../store/useAppStore';
import { MedicalHistory, Symptom } from '../../types';

const DataCaptureScreen: React.FC = () => {
  const { addMedicalHistory, isOnline } = useAppStore();
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

  // Síntomas predefinidos para selección rápida
  const predefinedSymptoms = [
    { id: '1', name: 'Tos seca', severity: 'mild' as const },
    { id: '2', name: 'Tos con flema', severity: 'mild' as const },
    { id: '3', name: 'Dificultad respiratoria', severity: 'severe' as const },
    { id: '4', name: 'Dolor de pecho', severity: 'severe' as const },
    { id: '5', name: 'Fiebre', severity: 'moderate' as const },
    { id: '6', name: 'Fatiga', severity: 'mild' as const },
    { id: '7', name: 'Pérdida de apetito', severity: 'mild' as const },
    { id: '8', name: 'Náuseas', severity: 'mild' as const },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
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
              address: 'Ubicación actual', // En una app real, usarías geocoding
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
  };

  const handleImagePicker = () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    Alert.alert(
      'Seleccionar Imagen',
      '¿Cómo deseas capturar la imagen?',
      [
        { text: 'Cámara', onPress: () => launchCamera(options, handleImageResponse) },
        { text: 'Galería', onPress: () => launchImageLibrary(options, handleImageResponse) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.assets && response.assets[0]) {
      const imageUri = response.assets[0].uri;
      if (imageUri) {
        setImages(prev => [...prev, imageUri]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSymptom = (symptom: Symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, { ...symptom, id: Date.now().toString() }],
    }));
  };

  const removeSymptom = (symptomId: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s.id !== symptomId),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.patientName || !formData.age || !formData.diagnosis) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setIsLoading(true);

    try {
      const newHistory: MedicalHistory = {
        id: Date.now().toString(),
        patientId: 'current-user', // En una app real, esto vendría del usuario logueado
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

      // Limpiar formulario
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
        'Éxito',
        isOnline 
          ? 'Historia médica guardada y sincronizada'
          : 'Historia médica guardada offline. Se sincronizará cuando haya conexión.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la historia médica');
      console.error('Error saving medical history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>📝 Captura de Datos Médicos</Title>
            <Paragraph>
              {isOnline ? '🟢 Conectado' : '🔴 Modo Offline'}
            </Paragraph>
          </Card.Content>
        </Card>

        {/* Información del Paciente */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Información del Paciente</Title>
            <TextInput
              label="Nombre del Paciente *"
              value={formData.patientName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, patientName: text }))}
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Edad *"
              value={formData.age}
              onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />
            <TextInput
              label="Diagnóstico *"
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
            <Title>Síntomas</Title>
            <Paragraph>Selecciona síntomas predefinidos:</Paragraph>
            <View style={styles.symptomsContainer}>
              {predefinedSymptoms.map((symptom) => (
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
                <Paragraph>Síntomas seleccionados:</Paragraph>
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
                  <View key={index} style={styles.imageItem}>
                    <Text numberOfLines={1} style={styles.imageText}>
                      Imagen {index + 1}
                    </Text>
                    <IconButton
                      icon="close"
                      size={20}
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
            <Title>Ubicación</Title>
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
          {isOnline ? '💾 Guardar y Sincronizar' : '💾 Guardar Offline'}
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
  },
  imageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  imageText: {
    flex: 1,
    marginLeft: 8,
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
