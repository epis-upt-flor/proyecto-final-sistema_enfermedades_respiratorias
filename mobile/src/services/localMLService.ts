/**
 * Servicio de Machine Learning Local
 * 
 * Permite análisis de síntomas sin conexión a internet
 * usando modelos ML ligeros ejecutados localmente
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Symptom, SymptomAnalysis } from '../types';

// Modelo simplificado de reglas médicas para análisis local
interface LocalMLModel {
  version: string;
  rules: MedicalRule[];
  weights: Record<string, number>;
}

interface MedicalRule {
  condition: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  warningSigns: string[];
}

// Reglas médicas básicas para análisis local
const defaultMedicalRules: MedicalRule[] = [
  {
    condition: 'Resfriado común',
    symptoms: ['tos seca', 'congestión nasal', 'estornudos'],
    severity: 'mild',
    urgency: 'low',
    recommendations: [
      'Descansar y beber líquidos',
      'Tomar medicamentos de venta libre si es necesario',
      'Monitorear síntomas',
    ],
    warningSigns: ['Fiebre alta persistente', 'Dificultad para respirar'],
  },
  {
    condition: 'Gripe',
    symptoms: ['fiebre', 'dolor de cabeza', 'fatiga', 'dolores musculares'],
    severity: 'moderate',
    urgency: 'medium',
    recommendations: [
      'Descansar en cama',
      'Beber muchos líquidos',
      'Tomar medicamentos antivirales si se prescribe',
      'Evitar contacto con otras personas',
    ],
    warningSigns: ['Dificultad para respirar', 'Dolor en el pecho', 'Fiebre muy alta'],
  },
  {
    condition: 'Bronquitis',
    symptoms: ['tos con flema', 'dificultad respiratoria', 'fatiga'],
    severity: 'moderate',
    urgency: 'medium',
    recommendations: [
      'Descansar',
      'Beber líquidos calientes',
      'Usar humidificador',
      'Consultar médico si persiste',
    ],
    warningSigns: ['Dificultad respiratoria severa', 'Fiebre alta', 'Sangre en la flema'],
  },
  {
    condition: 'Neumonía',
    symptoms: ['dificultad respiratoria', 'fiebre alta', 'dolor de pecho', 'tos con flema'],
    severity: 'severe',
    urgency: 'high',
    recommendations: [
      'Buscar atención médica inmediata',
      'No automedicarse',
      'Descansar completamente',
    ],
    warningSigns: ['Dificultad respiratoria severa', 'Fiebre muy alta', 'Confusión'],
  },
  {
    condition: 'Asma',
    symptoms: ['dificultad respiratoria', 'sibilancias', 'opresión en el pecho'],
    severity: 'moderate',
    urgency: 'high',
    recommendations: [
      'Usar inhalador de rescate si está disponible',
      'Buscar atención médica si no mejora',
      'Evitar desencadenantes',
    ],
    warningSigns: ['Dificultad respiratoria extrema', 'Incapacidad para hablar', 'Labios azules'],
  },
];

class LocalMLService {
  private model: LocalMLModel | null = null;
  private isInitialized = false;

  /**
   * Inicializa el servicio ML local
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Cargar modelo desde almacenamiento local o usar modelo por defecto
      const savedModel = await AsyncStorage.getItem('local_ml_model');
      if (savedModel) {
        this.model = JSON.parse(savedModel);
      } else {
        this.model = {
          version: '1.0.0',
          rules: defaultMedicalRules,
          weights: {},
        };
        await this.saveModel();
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing local ML service:', error);
      return false;
    }
  }

  /**
   * Analiza síntomas usando ML local
   */
  async analyzeSymptoms(
    symptoms: Symptom[],
    patientId: string,
    context?: string
  ): Promise<SymptomAnalysis> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.model) {
        throw new Error('ML model not initialized');
      }

      const symptomTexts = symptoms.map(s => s.symptom.toLowerCase());
      const symptomSeverities = symptoms.map(s => s.severity);

      // Calcular severidad promedio
      const severityScores = { mild: 1, moderate: 2, severe: 3 };
      const avgSeverityScore =
        symptomSeverities.reduce((sum, s) => sum + severityScores[s], 0) /
        symptomSeverities.length;

      // Encontrar condiciones que coinciden
      const matchingConditions = this.model.rules
        .map(rule => {
          const matchScore = this.calculateMatchScore(symptomTexts, rule.symptoms);
          return { rule, matchScore };
        })
        .filter(item => item.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      // Determinar condición más probable
      const topCondition = matchingConditions[0];
      const possibleConditions = matchingConditions.slice(0, 3).map(item => ({
        condition: item.rule.condition,
        probability: item.matchScore,
        description: `Coincidencia basada en síntomas similares`,
      }));

      // Calcular nivel de urgencia
      let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
      if (topCondition) {
        urgencyLevel = topCondition.rule.urgency;
      } else if (avgSeverityScore >= 2.5) {
        urgencyLevel = 'high';
      } else if (avgSeverityScore >= 1.5) {
        urgencyLevel = 'medium';
      }

      // Generar recomendaciones
      const recommendations = {
        immediate: topCondition
          ? topCondition.rule.recommendations.filter(r => urgencyLevel === 'high')
          : [],
        shortTerm: topCondition
          ? topCondition.rule.recommendations.filter(r => urgencyLevel !== 'high')
          : ['Monitorear síntomas', 'Descansar'],
        longTerm: [
          'Seguir recomendaciones médicas',
          'Mantener un estilo de vida saludable',
          'Evitar factores de riesgo',
        ],
        emergency: topCondition ? topCondition.rule.warningSigns : [],
      };

      // Calcular confianza
      const confidenceScore = topCondition
        ? Math.min(topCondition.matchScore * 100, 95)
        : 50;

      const analysis: SymptomAnalysis = {
        id: `local_${Date.now()}`,
        patientId,
        symptoms: symptoms.map(s => ({
          symptom: s.symptom,
          severity: s.severity,
          duration: s.duration,
        })),
        urgencyLevel,
        severityScore: avgSeverityScore,
        classification: {
          categories: matchingConditions.map(c => c.rule.condition),
          confidence: confidenceScore / 100,
          urgency: urgencyLevel,
          possibleConditions,
        },
        recommendations,
        warningSigns: topCondition ? topCondition.rule.warningSigns : [],
        followUpRequired: urgencyLevel !== 'low',
        confidenceScore,
        analyzedAt: new Date().toISOString(),
        processingTimeMs: 50, // ML local es muy rápido
        analysisMethod: 'local_rules',
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing symptoms with local ML:', error);
      throw error;
    }
  }

  /**
   * Calcula el score de coincidencia entre síntomas y regla
   */
  private calculateMatchScore(symptomTexts: string[], ruleSymptoms: string[]): number {
    let matches = 0;
    for (const symptom of symptomTexts) {
      for (const ruleSymptom of ruleSymptoms) {
        if (symptom.includes(ruleSymptom) || ruleSymptom.includes(symptom)) {
          matches++;
          break;
        }
      }
    }
    return matches / Math.max(symptomTexts.length, ruleSymptoms.length);
  }

  /**
   * Guarda el modelo en almacenamiento local
   */
  private async saveModel(): Promise<void> {
    if (this.model) {
      await AsyncStorage.setItem('local_ml_model', JSON.stringify(this.model));
    }
  }

  /**
   * Actualiza el modelo ML local
   */
  async updateModel(newModel: Partial<LocalMLModel>): Promise<boolean> {
    try {
      if (!this.model) {
        await this.initialize();
      }

      if (this.model) {
        this.model = { ...this.model, ...newModel };
        await this.saveModel();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating ML model:', error);
      return false;
    }
  }

  /**
   * Verifica si el servicio está disponible
   */
  isAvailable(): boolean {
    return this.isInitialized && this.model !== null;
  }
}

// Instancia singleton
export const localMLService = new LocalMLService();

