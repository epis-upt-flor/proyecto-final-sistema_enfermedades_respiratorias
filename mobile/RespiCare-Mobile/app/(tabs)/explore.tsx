import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput, 
  Chip,
  Portal,
  Modal,
  Provider
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore';

export default function SymptomAnalyzerScreen() {
  const theme = useTheme();
  const { createMedicalHistory } = useMedicalHistoryStore();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['symptom-analysis', symptoms],
    queryFn: async () => {
      if (symptoms.length === 0) return null;

      // Simular análisis de síntomas con IA
      const response = await fetch('http://localhost:8000/api/v1/symptom-analyzer/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptoms: symptoms.map(symptom => ({
            name: symptom,
            severity: severity,
            duration: duration,
            description: description
          }))
        }),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Error en el análisis');
    },
    enabled: symptoms.length > 0,
  });

  const addSymptom = () => {
    if (currentSymptom.trim()) {
      setSymptoms([...symptoms, currentSymptom.trim()]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const analyzeSymptoms = () => {
    if (symptoms.length === 0) {
      Alert.alert('Error', 'Por favor agrega al menos un síntoma');
      return;
    }
    refetch();
  };

  const saveAnalysis = async () => {
    try {
      await createMedicalHistory({
        patientId: 'current-user-id',
        doctorId: 'system',
        patientName: 'Usuario Actual',
        age: 30,
        diagnosis: analysis?.data?.diagnosis || 'Análisis pendiente',
        symptoms: symptoms.map(symptom => ({
          name: symptom,
          severity: severity,
          duration: duration,
          description: description
        })),
        description: `Análisis de síntomas: ${analysis?.data?.recommendations || 'Sin recomendaciones'}`,
        date: new Date().toISOString(),
        isOffline: false,
        syncStatus: 'synced'
      });

      Alert.alert('Éxito', 'Análisis guardado en tu historial médico');
      setSymptoms([]);
      setCurrentSymptom('');
      setDescription('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el análisis');
    }
  };

  return (
    <Provider theme={theme}>
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <ThemedText style={styles.title}>Analizador de Síntomas</ThemedText>
          <ThemedText style={styles.subtitle}>Describe tus síntomas para obtener un análisis inteligente</ThemedText>

          {/* Formulario de Síntomas */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Agregar Síntomas</Title>
              
              <TextInput
                label="Síntoma"
                value={currentSymptom}
                onChangeText={setCurrentSymptom}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Duración (ej: 3 días, 1 semana)"
                value={duration}
                onChangeText={setDuration}
                style={styles.input}
                mode="outlined"
              />

              <TextInput
                label="Descripción adicional"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
              />

              <Button mode="contained" onPress={addSymptom} style={styles.button}>
                Agregar Síntoma
              </Button>
            </Card.Content>
          </Card>

          {/* Lista de Síntomas */}
          {symptoms.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Title>Síntomas Agregados</Title>
                <ThemedView style={styles.chipContainer}>
                  {symptoms.map((symptom, index) => (
                    <Chip
                      key={index}
                      onClose={() => removeSymptom(index)}
                      style={styles.chip}
                    >
                      {symptom}
                    </Chip>
                  ))}
                </ThemedView>
                <Button mode="outlined" onPress={analyzeSymptoms} style={styles.button}>
                  Analizar Síntomas
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Resultados del Análisis */}
          {analysis && (
            <Card style={styles.card}>
              <Card.Content>
                <Title>Resultado del Análisis</Title>
                <Paragraph style={styles.analysisText}>
                  <ThemedText style={styles.bold}>Diagnóstico:</ThemedText> {analysis.data?.diagnosis || 'No disponible'}
                </Paragraph>
                <Paragraph style={styles.analysisText}>
                  <ThemedText style={styles.bold}>Recomendaciones:</ThemedText> {analysis.data?.recommendations || 'No disponible'}
                </Paragraph>
                <Paragraph style={styles.analysisText}>
                  <ThemedText style={styles.bold}>Urgencia:</ThemedText> {analysis.data?.urgency || 'No disponible'}
                </Paragraph>
                
                <Button mode="contained" onPress={saveAnalysis} style={styles.button}>
                  Guardar en Historial
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Información Adicional */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Información Importante</Title>
              <Paragraph>
                Este análisis es solo informativo y no reemplaza la consulta médica profesional. 
                Si experimentas síntomas graves, consulta inmediatamente con un médico.
              </Paragraph>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Modal para más opciones */}
        <Portal>
          <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
            <Card style={styles.modalCard}>
              <Card.Content>
                <Title>Opciones Adicionales</Title>
                <Button mode="outlined" onPress={() => {}} style={styles.modalButton}>
                  Tomar Foto
                </Button>
                <Button mode="outlined" onPress={() => {}} style={styles.modalButton}>
                  Grabar Audio
                </Button>
                <Button mode="outlined" onPress={() => setShowModal(false)} style={styles.modalButton}>
                  Cerrar
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </ThemedView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  analysisText: {
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  modalCard: {
    margin: 20,
  },
  modalButton: {
    marginVertical: 4,
  },
});