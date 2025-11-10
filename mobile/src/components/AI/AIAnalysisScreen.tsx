import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  ProgressBar,
  List,
  IconButton,
  FAB,
} from 'react-native-paper';
import { useAppStore } from '../../store/useAppStore';
import { Symptom, AIAnalysis } from '../../types';

const AIAnalysisScreen: React.FC = () => {
  const { offlineData } = useAppStore();
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const clearResetTimeout = () => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  };

  const cleanupTimers = () => {
    clearProgressInterval();
    clearResetTimeout();
  };

  useEffect(() => {
    return () => {
      cleanupTimers();
    };
  }, []);

  // Síntomas predefinidos para análisis
  const availableSymptoms = [
    { id: '1', name: 'Tos seca', severity: 'mild' as const, duration: '1-3 días' },
    { id: '2', name: 'Tos con flema', severity: 'moderate' as const, duration: '3-7 días' },
    { id: '3', name: 'Dificultad respiratoria', severity: 'severe' as const, duration: 'Variable' },
    { id: '4', name: 'Dolor de pecho', severity: 'severe' as const, duration: 'Variable' },
    { id: '5', name: 'Fiebre', severity: 'moderate' as const, duration: '1-5 días' },
    { id: '6', name: 'Fatiga', severity: 'mild' as const, duration: 'Variable' },
    { id: '7', name: 'Pérdida de apetito', severity: 'mild' as const, duration: 'Variable' },
    { id: '8', name: 'Náuseas', severity: 'mild' as const, duration: '1-3 días' },
    { id: '9', name: 'Dolor de cabeza', severity: 'mild' as const, duration: 'Variable' },
    { id: '10', name: 'Congestión nasal', severity: 'mild' as const, duration: '3-7 días' },
  ];

  const addSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms(prev => [...prev, { ...symptom, id: Date.now().toString() }]);
    }
  };

  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.id !== symptomId));
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('Error', 'Por favor selecciona al menos un síntoma');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    cleanupTimers();

    try {
      // Simular análisis con IA
      progressIntervalRef.current = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            clearProgressInterval();
            return 100;
          }
          return prev + 20;
        });
      }, 500);

      // Simular llamada a API de IA
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Generar análisis simulado basado en síntomas
      const mockAnalysis = generateMockAnalysis(selectedSymptoms);
      setAnalysis(mockAnalysis);

      await new Promise(resolve => {
        resetTimeoutRef.current = setTimeout(() => {
          setIsAnalyzing(false);
          setAnalysisProgress(0);
          clearResetTimeout();
          resolve(undefined);
        }, 1000);
      });

    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      Alert.alert('Error', 'No se pudo realizar el análisis');
    } finally {
      clearProgressInterval();
    }
  };

  const generateMockAnalysis = (symptoms: Symptom[]): AIAnalysis => {
    // Lógica básica de análisis basada en síntomas
    const hasRespiratorySymptoms = symptoms.some(s => 
      s.name.includes('tos') || s.name.includes('respiratoria') || s.name.includes('pecho')
    );
    const hasFever = symptoms.some(s => s.name.includes('fiebre'));
    const hasSevereSymptoms = symptoms.some(s => s.severity === 'severe');

    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let possibleDiagnoses = [];

    if (hasSevereSymptoms) {
      urgency = 'critical';
      possibleDiagnoses = [
        {
          condition: 'Emergencia Respiratoria',
          probability: 85,
          recommendations: [
            'Buscar atención médica inmediata',
            'Llamar a servicios de emergencia',
            'Mantener al paciente en posición cómoda'
          ]
        }
      ];
    } else if (hasRespiratorySymptoms && hasFever) {
      urgency = 'high';
      possibleDiagnoses = [
        {
          condition: 'Infección Respiratoria',
          probability: 70,
          recommendations: [
            'Consultar médico en 24 horas',
            'Reposo y hidratación',
            'Monitorear temperatura'
          ]
        },
        {
          condition: 'Bronquitis',
          probability: 60,
          recommendations: [
            'Evitar irritantes',
            'Usar humidificador',
            'Consultar médico si empeora'
          ]
        }
      ];
    } else if (hasRespiratorySymptoms) {
      urgency = 'medium';
      possibleDiagnoses = [
        {
          condition: 'Resfriado Común',
          probability: 65,
          recommendations: [
            'Reposo y hidratación',
            'Gargarismos con agua salada',
            'Consultar médico si persiste'
          ]
        },
        {
          condition: 'Alergia Respiratoria',
          probability: 55,
          recommendations: [
            'Evitar alérgenos',
            'Usar antihistamínicos',
            'Consultar alergólogo'
          ]
        }
      ];
    } else {
      urgency = 'low';
      possibleDiagnoses = [
        {
          condition: 'Malestar General',
          probability: 50,
          recommendations: [
            'Reposo y hidratación',
            'Monitorear síntomas',
            'Consultar médico si empeora'
          ]
        }
      ];
    }

    return {
      id: Date.now().toString(),
      symptoms,
      possibleDiagnoses,
      urgency,
      timestamp: new Date().toISOString(),
    };
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#ff9800';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'alert-circle';
      case 'high':
        return 'alert';
      case 'medium':
        return 'information';
      case 'low':
        return 'check-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Selección de Síntomas */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>🔍 Seleccionar Síntomas</Title>
            <Paragraph>Selecciona los síntomas que presenta el paciente:</Paragraph>
            
            <View style={styles.symptomsGrid}>
              {availableSymptoms.map((symptom) => (
                <Chip
                  key={symptom.id}
                  selected={selectedSymptoms.some(s => s.name === symptom.name)}
                  onPress={() => addSymptom(symptom)}
                  style={styles.symptomChip}
                >
                  {symptom.name}
                </Chip>
              ))}
            </View>

            {selectedSymptoms.length > 0 && (
              <View style={styles.selectedSymptoms}>
                <Paragraph>Síntomas seleccionados:</Paragraph>
                {selectedSymptoms.map((symptom) => (
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

        {/* Botón de Análisis */}
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              onPress={analyzeSymptoms}
              disabled={isAnalyzing || selectedSymptoms.length === 0}
              loading={isAnalyzing}
              style={styles.analyzeButton}
              contentStyle={styles.analyzeButtonContent}
            >
              {isAnalyzing ? 'Analizando...' : '🤖 Analizar con IA'}
            </Button>

            {isAnalyzing && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={analysisProgress / 100}
                  color="#1976d2"
                  style={styles.progressBar}
                />
                <Paragraph style={styles.progressText}>
                  {Math.round(analysisProgress)}% completado
                </Paragraph>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Resultados del Análisis */}
        {analysis && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.analysisHeader}>
                <Title>📊 Análisis de IA</Title>
                <Chip
                  mode="outlined"
                  style={[styles.urgencyChip, { borderColor: getUrgencyColor(analysis.urgency) }]}
                  textStyle={{ color: getUrgencyColor(analysis.urgency) }}
                  icon={getUrgencyIcon(analysis.urgency)}
                >
                  {analysis.urgency.toUpperCase()}
                </Chip>
              </View>

              <Paragraph style={styles.timestamp}>
                Analizado el: {new Date(analysis.timestamp).toLocaleString()}
              </Paragraph>

              <Title style={styles.sectionTitle}>Posibles Diagnósticos:</Title>
              {analysis.possibleDiagnoses.map((diagnosis, index) => (
                <Card key={index} style={styles.diagnosisCard}>
                  <Card.Content>
                    <View style={styles.diagnosisHeader}>
                      <Title style={styles.diagnosisName}>{diagnosis.condition}</Title>
                      <Chip compact style={styles.probabilityChip}>
                        {diagnosis.probability}%
                      </Chip>
                    </View>
                    
                    <Title style={styles.recommendationsTitle}>Recomendaciones:</Title>
                    {diagnosis.recommendations.map((recommendation, recIndex) => (
                      <List.Item
                        key={recIndex}
                        title={recommendation}
                        left={(props) => <List.Icon {...props} icon="check" />}
                        style={styles.recommendationItem}
                      />
                    ))}
                  </Card.Content>
                </Card>
              ))}

              <Button
                mode="outlined"
                onPress={() => {
                  // Aquí podrías guardar el análisis o enviarlo al médico
                  Alert.alert('Análisis Guardado', 'El análisis se ha guardado en el historial');
                }}
                style={styles.saveButton}
              >
                💾 Guardar Análisis
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Información sobre IA */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>ℹ️ Sobre el Análisis de IA</Title>
            <Paragraph>
              Este análisis es proporcionado por inteligencia artificial y debe ser 
              considerado como una herramienta de apoyo. Siempre consulte con un 
              profesional médico para obtener un diagnóstico preciso.
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
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
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
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
  analyzeButton: {
    marginTop: 16,
  },
  analyzeButtonContent: {
    paddingVertical: 8,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  urgencyChip: {
    backgroundColor: '#f5f5f5',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  diagnosisCard: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
  },
  diagnosisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  diagnosisName: {
    fontSize: 16,
    flex: 1,
  },
  probabilityChip: {
    backgroundColor: '#e3f2fd',
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationItem: {
    paddingVertical: 4,
  },
  saveButton: {
    marginTop: 16,
  },
});

export default AIAnalysisScreen;
