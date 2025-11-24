import React, { useState } from 'react';
import { StyleSheet, ScrollView, Alert, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TouchableOpacity, TextInput as RNTextInput, Modal as RNModal } from 'react-native';
import { RespiCareColors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useQuery } from '@tanstack/react-query';
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '@/constants/config';

export default function SymptomAnalyzerScreen() {
  const colorScheme = useColorScheme();
  // FORZAR modo oscuro para asegurar que se vean los cambios
  const isDark = true; // Siempre oscuro para ver los cambios
  const { createMedicalHistory } = useMedicalHistoryStore();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [severity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: analysis, refetch } = useQuery({
    queryKey: ['symptom-analysis-ml', symptoms],
    queryFn: async () => {
      if (symptoms.length === 0) return null;

      // Use the new ML endpoint with ensemble + SHAP
      const token = await AsyncStorage.getItem('token');
      const headers: any = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_ENDPOINTS.SYMPTOM_ANALYZER.ML_ANALYZE, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          symptoms: symptoms, // Array of symptom strings
          patient_age: 35, // TODO: Get from user profile
          risk_factors: [],
          include_explanation: true,
          apply_personalization: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.data; // Return the ML prediction data
      }
      throw new Error('Error en el análisis ML');
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
        diagnosis: analysis?.disease || 'Análisis pendiente',
        symptoms: symptoms.map(symptom => ({
          name: symptom,
          severity: severity,
          duration: duration,
          description: description
        })),
        description: `Análisis ML: ${analysis?.disease || 'Sin diagnóstico'} (${analysis?.confidence ? (analysis.confidence * 100).toFixed(1) : 0}% confianza). ${analysis?.personalized_recommendations?.join(', ') || 'Sin recomendaciones'}`,
        date: new Date().toISOString(),
        isOffline: false,
        syncStatus: 'synced'
      });

      Alert.alert('Éxito', 'Análisis guardado en tu historial médico');
      setSymptoms([]);
      setCurrentSymptom('');
      setDescription('');
    } catch {
      Alert.alert('Error', 'No se pudo guardar el análisis');
    }
  };

  return (
    <Provider theme={theme}>
      <View style={[styles.container, { backgroundColor: '#0f172a' }]}>
        <ScrollView style={styles.scrollView}>
          <ThemedText style={[styles.title, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
            Analizador de Síntomas
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: isDark ? RespiCareColors.textTertiary : RespiCareColors.textSecondary }]}>
            Describe tus síntomas para obtener un análisis inteligente
          </ThemedText>

          {/* Formulario de Síntomas */}
          <Card 
            style={[styles.card, { 
              backgroundColor: isDark ? RespiCareColors.dark.card : RespiCareColors.light.card,
              borderRadius: 24,
            }]}
            contentStyle={{ backgroundColor: 'transparent' }}
          >
            <Card.Content style={{ backgroundColor: 'transparent' }}>
              <Title style={{ color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>Agregar Síntomas</Title>
              
              <TextInput
                label="Síntoma"
                value={currentSymptom}
                onChangeText={setCurrentSymptom}
                style={[styles.input, { backgroundColor: isDark ? RespiCareColors.dark.backgroundTertiary : '#ffffff' }]}
                mode="outlined"
                outlineColor={isDark ? RespiCareColors.dark.backgroundTertiary : RespiCareColors.border}
                activeOutlineColor={RespiCareColors.primary}
                textColor={isDark ? '#f8fafc' : RespiCareColors.textPrimary}
              />

              <TextInput
                label="Duración (ej: 3 días, 1 semana)"
                value={duration}
                onChangeText={setDuration}
                style={[styles.input, { backgroundColor: isDark ? RespiCareColors.dark.backgroundTertiary : '#ffffff' }]}
                mode="outlined"
                outlineColor={isDark ? RespiCareColors.dark.backgroundTertiary : RespiCareColors.border}
                activeOutlineColor={RespiCareColors.primary}
                textColor={isDark ? '#f8fafc' : RespiCareColors.textPrimary}
              />

              <TextInput
                label="Descripción adicional"
                value={description}
                onChangeText={setDescription}
                style={[styles.input, { backgroundColor: isDark ? RespiCareColors.dark.backgroundTertiary : '#ffffff' }]}
                mode="outlined"
                multiline
                numberOfLines={3}
                outlineColor={isDark ? RespiCareColors.dark.backgroundTertiary : RespiCareColors.border}
                activeOutlineColor={RespiCareColors.primary}
                textColor={isDark ? '#f8fafc' : RespiCareColors.textPrimary}
              />

              <Button 
                mode="contained" 
                onPress={addSymptom} 
                style={[styles.button, { backgroundColor: RespiCareColors.primary }]}
                buttonColor={RespiCareColors.primary}
                labelStyle={{ color: '#ffffff', fontWeight: '600' }}
              >
                Agregar Síntoma
              </Button>
            </Card.Content>
          </Card>

          {/* Lista de Síntomas */}
          {symptoms.length > 0 && (
            <Card 
              style={[styles.card, { 
                backgroundColor: isDark ? RespiCareColors.dark.card : RespiCareColors.light.card,
                borderRadius: 24,
              }]}
              contentStyle={{ backgroundColor: 'transparent' }}
            >
              <Card.Content style={{ backgroundColor: 'transparent' }}>
                <Title style={{ color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>Síntomas Agregados</Title>
                <View style={styles.chipContainer}>
                  {symptoms.map((symptom, index) => (
                    <Chip
                      key={index}
                      onClose={() => removeSymptom(index)}
                      style={styles.chip}
                    >
                      {symptom}
                    </Chip>
                  ))}
                </View>
                <Button 
                  mode="outlined" 
                  onPress={analyzeSymptoms} 
                  style={[styles.button, { borderColor: RespiCareColors.primary }]}
                  textColor={RespiCareColors.primary}
                  labelStyle={{ fontWeight: '600' }}
                >
                  Analizar Síntomas
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Resultados del Análisis ML */}
          {analysis && (
            <Card 
              style={[styles.card, { 
                backgroundColor: isDark ? RespiCareColors.dark.card : RespiCareColors.light.card,
                borderRadius: 24,
              }]}
              contentStyle={{ backgroundColor: 'transparent' }}
            >
              <Card.Content style={{ backgroundColor: 'transparent' }}>
                <Title style={{ color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>📊 Análisis ML</Title>
                
                <Paragraph style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                  <ThemedText style={[styles.bold, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>Enfermedad Predicha:</ThemedText> {analysis.disease || 'No disponible'}
                </Paragraph>
                
                <Paragraph style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                  <ThemedText style={[styles.bold, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>Confianza:</ThemedText> {analysis.confidence ? `${(analysis.confidence * 100).toFixed(1)}%` : 'No disponible'}
                </Paragraph>
                
                <Chip 
                  mode="outlined" 
                  style={[
                    styles.chip, 
                    { 
                      borderColor: analysis.urgency_level === 'critical' ? '#d32f2f' : 
                                   analysis.urgency_level === 'high' ? '#f57c00' : 
                                   analysis.urgency_level === 'medium' ? '#fbc02d' : '#388e3c'
                    }
                  ]}
                >
                  Urgencia: {analysis.urgency_level?.toUpperCase() || 'MEDIA'}
                </Chip>
                
                {/* Main Explanation (Friendly) */}
                {analysis.explanation?.friendly?.main_explanation && (
                  <Paragraph style={[styles.analysisText, { marginTop: 8, fontSize: 15, lineHeight: 22, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                    {analysis.explanation.friendly.main_explanation}
                  </Paragraph>
                )}
                
                {/* Key Factors (Friendly) */}
                {analysis.explanation?.friendly?.key_factors && analysis.explanation.friendly.key_factors.length > 0 && (
                  <>
                    <Title style={{ marginTop: 16, fontSize: 16, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>🔍 ¿Por qué este diagnóstico?</Title>
                    {analysis.explanation.friendly.key_factors.slice(0, 3).map((factor: string, idx: number) => (
                      <Paragraph key={idx} style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                        • {factor}
                      </Paragraph>
                    ))}
                  </>
                )}
                
                {/* Reasoning (Friendly) */}
                {analysis.explanation?.friendly?.reasoning && (
                  <>
                    <Title style={{ marginTop: 16, fontSize: 16, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>💭 Explicación:</Title>
                    <Paragraph style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                      {analysis.explanation.friendly.reasoning}
                    </Paragraph>
                  </>
                )}
                
                {/* Alternatives (Friendly) */}
                {analysis.explanation?.friendly?.alternatives ? (
                  <>
                    <Title style={{ marginTop: 16, fontSize: 16, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>💡 Otras Posibilidades:</Title>
                    <Paragraph style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                      {analysis.explanation.friendly.alternatives}
                    </Paragraph>
                  </>
                ) : analysis.top_3_predictions && analysis.top_3_predictions.length > 1 && (
                  <>
                    <Title style={{ marginTop: 16, fontSize: 16, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>💡 Otras Posibilidades:</Title>
                    {analysis.top_3_predictions.slice(1, 3).map((pred: any, idx: number) => (
                      <Paragraph key={idx} style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                        • {pred.disease} ({parseFloat(pred.confidence) * 100}% de probabilidad)
                      </Paragraph>
                    ))}
                  </>
                )}
                
                {/* Recommendations (Friendly or Personalized) */}
                {analysis.explanation?.friendly?.recommendations && analysis.explanation.friendly.recommendations.length > 0 ? (
                  <>
                    <Title style={{ marginTop: 16, fontSize: 16, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>✅ Recomendaciones:</Title>
                    {analysis.explanation.friendly.recommendations.slice(0, 4).map((rec: string, idx: number) => (
                      <Paragraph key={idx} style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                        {rec}
                      </Paragraph>
                    ))}
                  </>
                ) : analysis.personalized_recommendations && analysis.personalized_recommendations.length > 0 && (
                  <>
                    <Title style={{ marginTop: 16, fontSize: 16, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>✅ Recomendaciones:</Title>
                    {analysis.personalized_recommendations.slice(0, 4).map((rec: string, idx: number) => (
                      <Paragraph key={idx} style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                        {rec}
                      </Paragraph>
                    ))}
                  </>
                )}
                
                {/* Fallback: Technical factors if friendly not available */}
                {!analysis.explanation?.friendly && analysis.explanation?.decision_factors && (
                  <>
                    <Title style={{ marginTop: 16, fontSize: 16, color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>🔍 Factores Clave:</Title>
                    {analysis.explanation.decision_factors.slice(0, 3).map((factor: any, idx: number) => {
                      const factorText = typeof factor === 'string' ? factor : factor.feature_name || `Factor ${idx + 1}`;
                      return (
                        <Paragraph key={idx} style={[styles.analysisText, { color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }]}>
                          • {factorText}
                        </Paragraph>
                      );
                    })}
                  </>
                )}
                
                {analysis.needs_medical_attention && (
                  <Chip mode="flat" style={[styles.chip, { backgroundColor: '#ffebee' }]}>
                    ⚠️ Se recomienda atención médica
                  </Chip>
                )}
                
                <Button 
                  mode="contained" 
                  onPress={saveAnalysis} 
                  style={[styles.button, { backgroundColor: RespiCareColors.primary }]}
                  buttonColor={RespiCareColors.primary}
                  labelStyle={{ color: '#ffffff', fontWeight: '600' }}
                >
                  Guardar en Historial
                </Button>
              </Card.Content>
            </Card>
          )}

          {/* Información Adicional */}
          <Card 
            style={[styles.card, { 
              backgroundColor: isDark ? RespiCareColors.dark.card : RespiCareColors.light.card,
              borderRadius: 24,
            }]}
            contentStyle={{ backgroundColor: 'transparent' }}
          >
            <Card.Content style={{ backgroundColor: 'transparent' }}>
              <Title style={{ color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>Información Importante</Title>
              <Paragraph style={{ color: isDark ? RespiCareColors.textTertiary : RespiCareColors.textSecondary }}>
                Este análisis es solo informativo y no reemplaza la consulta médica profesional. 
                Si experimentas síntomas graves, consulta inmediatamente con un médico.
              </Paragraph>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Modal para más opciones */}
        <Portal>
          <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
            <Card style={[styles.modalCard, { backgroundColor: isDark ? RespiCareColors.dark.card : RespiCareColors.light.card }]}>
              <Card.Content>
                <Title style={{ color: isDark ? '#f8fafc' : RespiCareColors.textPrimary }}>Opciones Adicionales</Title>
                <Button 
                  mode="outlined" 
                  onPress={() => {}} 
                  style={[styles.modalButton, { borderColor: RespiCareColors.primary }]}
                  textColor={RespiCareColors.primary}
                >
                  Tomar Foto
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => {}} 
                  style={[styles.modalButton, { borderColor: RespiCareColors.primary }]}
                  textColor={RespiCareColors.primary}
                >
                  Grabar Audio
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowModal(false)} 
                  style={[styles.modalButton, { borderColor: RespiCareColors.primary }]}
                  textColor={RespiCareColors.primary}
                >
                  Cerrar
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0f172a', // FORZADO: Dark background moderno
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#f8fafc',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    color: '#94a3b8',
    lineHeight: 24,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
    backgroundColor: '#1e293b', // Slate 800
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#334155',
    borderRadius: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#14b8a6', // Teal primary
    borderRadius: 24,
    paddingVertical: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
    backgroundColor: '#334155',
    borderRadius: 16,
  },
  analysisText: {
    marginBottom: 8,
    lineHeight: 22,
  },
  bold: {
    fontWeight: 'bold',
  },
  modalCard: {
    margin: 20,
    backgroundColor: '#1e293b',
    borderRadius: 24,
  },
  modalButton: {
    marginVertical: 4,
    borderColor: '#14b8a6',
    borderRadius: 16,
  },
});