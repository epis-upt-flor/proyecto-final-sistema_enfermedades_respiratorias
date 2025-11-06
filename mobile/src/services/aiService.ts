/**
 * AI Service - Handles AI-powered symptom analysis and medical recommendations
 * Integrates with backend AI services and provides local fallback capabilities
 */

import { apiService } from './api';
import { localStorageService } from './localStorage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface SymptomInput {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  notes?: string;
}

export interface AISymptomAnalysis {
  id: string;
  patientId: string;
  symptoms: SymptomInput[];
  urgencyLevel: 'low' | 'medium' | 'high';
  severityScore: number;
  classification: {
    categories: string[];
    confidence: number;
    urgency: string;
    possibleConditions: Array<{
      condition: string;
      probability: number;
      description: string;
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    emergency: string[];
  };
  warningSigns: string[];
  followUpRequired: boolean;
  confidenceScore: number;
  analyzedAt: string;
  processingTimeMs: number;
  analysisMethod: 'ai_service' | 'local_rules' | 'hybrid';
}

export interface SymptomTrend {
  patientId: string;
  period: string;
  trendData: Array<{
    date: string;
    urgencyLevel: string;
    severityScore: number;
    symptomCount: number;
    dominantSymptoms: string[];
  }>;
  overallTrend: 'improving' | 'worsening' | 'stable' | 'insufficient_data';
  recommendations: string[];
  insights: string[];
}

export interface MedicalRecommendation {
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  applicableSymptoms: string[];
}

class AIService {
  private isOnline: boolean = true;
  private localAnalysisCache: Map<string, AISymptomAnalysis> = new Map();

  constructor() {
    this.initializeNetworkListener();
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      this.isOnline = state.isConnected ?? false;
    });
  }

  // Main symptom analysis method
  async analyzeSymptoms(
    symptoms: SymptomInput[],
    patientId: string,
    context?: string
  ): Promise<AISymptomAnalysis> {
    const startTime = Date.now();

    try {
      let analysis: AISymptomAnalysis;

      if (this.isOnline) {
        // Try AI service first
        try {
          analysis = await this.analyzeWithAIService(symptoms, patientId, context);
        } catch (error) {
          console.warn('AI service failed, falling back to local analysis:', error);
          analysis = await this.analyzeWithLocalRules(symptoms, patientId, context);
        }
      } else {
        // Use local analysis when offline
        analysis = await this.analyzeWithLocalRules(symptoms, patientId, context);
      }

      // Add processing time
      analysis.processingTimeMs = Date.now() - startTime;

      // Save analysis locally
      await localStorageService.saveSymptomAnalysis(analysis);

      return analysis;
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      throw new Error('Failed to analyze symptoms. Please try again.');
    }
  }

  // AI Service analysis
  private async analyzeWithAIService(
    symptoms: SymptomInput[],
    patientId: string,
    context?: string
  ): Promise<AISymptomAnalysis> {
    const response = await apiService.analyzeSymptoms(symptoms, patientId, context);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'AI analysis failed');
    }

    const serverAnalysis = response.data;

    return {
      id: serverAnalysis.id,
      patientId: serverAnalysis.patientId,
      symptoms: serverAnalysis.symptoms,
      urgencyLevel: serverAnalysis.urgencyLevel,
      severityScore: serverAnalysis.severityScore,
      classification: {
        categories: serverAnalysis.classification.categories || [],
        confidence: serverAnalysis.classification.confidence || 0.8,
        urgency: serverAnalysis.classification.urgency || 'medium',
        possibleConditions: this.generatePossibleConditions(symptoms),
      },
      recommendations: {
        immediate: serverAnalysis.recommendations.slice(0, 3),
        shortTerm: serverAnalysis.recommendations.slice(3, 6),
        longTerm: serverAnalysis.recommendations.slice(6, 9),
        emergency: this.generateEmergencyRecommendations(serverAnalysis.urgencyLevel),
      },
      warningSigns: serverAnalysis.warningSigns,
      followUpRequired: serverAnalysis.followUpRequired,
      confidenceScore: serverAnalysis.confidenceScore,
      analyzedAt: serverAnalysis.analyzedAt,
      processingTimeMs: serverAnalysis.processingTimeMs,
      analysisMethod: 'ai_service',
    };
  }

  // Local rule-based analysis
  private async analyzeWithLocalRules(
    symptoms: SymptomInput[],
    patientId: string,
    context?: string
  ): Promise<AISymptomAnalysis> {
    const analysisId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Analyze urgency level
    const urgencyLevel = this.calculateUrgencyLevel(symptoms);
    const severityScore = this.calculateSeverityScore(symptoms);
    
    // Classify symptoms
    const classification = this.classifySymptoms(symptoms);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(symptoms, urgencyLevel);
    
    // Identify warning signs
    const warningSigns = this.identifyWarningSigns(symptoms, urgencyLevel);
    
    // Determine if follow-up is required
    const followUpRequired = this.determineFollowUpRequired(urgencyLevel, warningSigns);

    return {
      id: analysisId,
      patientId,
      symptoms,
      urgencyLevel,
      severityScore,
      classification: {
        categories: classification.categories,
        confidence: classification.confidence,
        urgency: urgencyLevel,
        possibleConditions: this.generatePossibleConditions(symptoms),
      },
      recommendations,
      warningSigns,
      followUpRequired,
      confidenceScore: classification.confidence,
      analyzedAt: new Date().toISOString(),
      processingTimeMs: 0, // Will be set by caller
      analysisMethod: 'local_rules',
    };
  }

  // Urgency level calculation
  private calculateUrgencyLevel(symptoms: SymptomInput[]): 'low' | 'medium' | 'high' {
    const highUrgencySymptoms = [
      'dificultad respiratoria severa',
      'dolor en el pecho',
      'fiebre muy alta',
      'confusión',
      'pérdida de conciencia',
      'sangrado',
      'convulsiones',
    ];

    const mediumUrgencySymptoms = [
      'tos persistente',
      'fiebre moderada',
      'dolor de cabeza intenso',
      'fatiga extrema',
      'náuseas persistentes',
    ];

    let highCount = 0;
    let mediumCount = 0;

    symptoms.forEach(symptom => {
      const symptomText = symptom.symptom.toLowerCase();
      
      if (highUrgencySymptoms.some(hs => symptomText.includes(hs))) {
        highCount++;
      } else if (mediumUrgencySymptoms.some(ms => symptomText.includes(ms))) {
        mediumCount++;
      }
    });

    if (highCount > 0 || symptoms.some(s => s.severity === 'severe')) {
      return 'high';
    } else if (mediumCount > 0 || symptoms.some(s => s.severity === 'moderate')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  // Severity score calculation
  private calculateSeverityScore(symptoms: SymptomInput[]): number {
    let totalScore = 0;
    let weightSum = 0;

    symptoms.forEach(symptom => {
      let severityWeight = 0;
      switch (symptom.severity) {
        case 'mild': severityWeight = 0.3; break;
        case 'moderate': severityWeight = 0.6; break;
        case 'severe': severityWeight = 1.0; break;
      }

      // Duration factor
      let durationFactor = 1.0;
      if (symptom.duration.includes('semana') || symptom.duration.includes('mes')) {
        durationFactor = 1.2;
      }

      totalScore += severityWeight * durationFactor;
      weightSum += durationFactor;
    });

    return weightSum > 0 ? Math.min(totalScore / weightSum, 1.0) : 0.5;
  }

  // Symptom classification
  private classifySymptoms(symptoms: SymptomInput[]): {
    categories: string[];
    confidence: number;
  } {
    const categories = new Set<string>();
    let confidence = 0.8;

    symptoms.forEach(symptom => {
      const symptomText = symptom.symptom.toLowerCase();

      if (symptomText.includes('tos') || symptomText.includes('respir') || symptomText.includes('pecho')) {
        categories.add('respiratory');
      }
      
      if (symptomText.includes('fiebre') || symptomText.includes('temperatura')) {
        categories.add('fever');
      }
      
      if (symptomText.includes('dolor') || symptomText.includes('molestia')) {
        categories.add('pain');
      }
      
      if (symptomText.includes('fatiga') || symptomText.includes('cansancio')) {
        categories.add('fatigue');
      }
      
      if (symptomText.includes('nausea') || symptomText.includes('vomito')) {
        categories.add('gastrointestinal');
      }
    });

    // Adjust confidence based on symptom count and specificity
    if (symptoms.length > 3) {
      confidence = Math.min(confidence + 0.1, 0.95);
    }

    return {
      categories: Array.from(categories),
      confidence,
    };
  }

  // Generate recommendations
  private generateRecommendations(
    symptoms: SymptomInput[],
    urgencyLevel: 'low' | 'medium' | 'high'
  ): {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    emergency: string[];
  } {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[],
      emergency: [] as string[],
    };

    // Urgency-based recommendations
    if (urgencyLevel === 'high') {
      recommendations.immediate.push(
        'Buscar atención médica inmediata',
        'Monitorear signos vitales constantemente',
        'Tener contacto de emergencia disponible'
      );
      recommendations.emergency.push(
        'Llamar al servicio de emergencias si empeora',
        'No quedarse solo',
        'Preparar información médica relevante'
      );
    } else if (urgencyLevel === 'medium') {
      recommendations.immediate.push(
        'Consultar médico en las próximas 24 horas',
        'Monitorear síntomas regularmente',
        'Evitar actividades extenuantes'
      );
    } else {
      recommendations.immediate.push(
        'Monitorear síntomas en casa',
        'Consultar si empeoran',
        'Mantener reposo relativo'
      );
    }

    // Symptom-specific recommendations
    symptoms.forEach(symptom => {
      const symptomText = symptom.symptom.toLowerCase();

      if (symptomText.includes('respir') || symptomText.includes('tos')) {
        recommendations.shortTerm.push(
          'Mantener hidratación adecuada',
          'Evitar irritantes respiratorios',
          'Usar técnicas de respiración profunda'
        );
      }

      if (symptomText.includes('fiebre')) {
        recommendations.shortTerm.push(
          'Controlar temperatura cada 4 horas',
          'Mantener reposo en cama',
          'Hidratación abundante'
        );
      }

      if (symptomText.includes('dolor')) {
        recommendations.shortTerm.push(
          'Aplicar calor o frío según el tipo de dolor',
          'Mantener postura correcta',
          'Evitar movimientos bruscos'
        );
      }
    });

    // General long-term recommendations
    recommendations.longTerm.push(
      'Seguir las indicaciones médicas',
      'Mantener un estilo de vida saludable',
      'Reportar cualquier empeoramiento',
      'No automedicarse sin supervisión médica'
    );

    return recommendations;
  }

  // Identify warning signs
  private identifyWarningSigns(
    symptoms: SymptomInput[],
    urgencyLevel: 'low' | 'medium' | 'high'
  ): string[] {
    const warningSigns: string[] = [];

    if (urgencyLevel === 'high') {
      warningSigns.push('Nivel de urgencia alto - requiere atención inmediata');
    }

    symptoms.forEach(symptom => {
      const symptomText = symptom.symptom.toLowerCase();

      if (symptomText.includes('dificultad respiratoria severa')) {
        warningSigns.push('Dificultad respiratoria severa detectada');
      }

      if (symptomText.includes('dolor en el pecho')) {
        warningSigns.push('Dolor en el pecho - puede ser signo de problema cardíaco');
      }

      if (symptomText.includes('fiebre muy alta')) {
        warningSigns.push('Fiebre muy alta - riesgo de complicaciones');
      }

      if (symptomText.includes('confusión')) {
        warningSigns.push('Confusión - puede indicar problema neurológico');
      }
    });

    return warningSigns;
  }

  // Determine if follow-up is required
  private determineFollowUpRequired(
    urgencyLevel: 'low' | 'medium' | 'high',
    warningSigns: string[]
  ): boolean {
    return urgencyLevel === 'high' || urgencyLevel === 'medium' || warningSigns.length > 0;
  }

  // Generate possible conditions
  private generatePossibleConditions(symptoms: SymptomInput[]): Array<{
    condition: string;
    probability: number;
    description: string;
  }> {
    const conditions: Array<{
      condition: string;
      probability: number;
      description: string;
    }> = [];

    const symptomTexts = symptoms.map(s => s.symptom.toLowerCase()).join(' ');

    // Respiratory conditions
    if (symptomTexts.includes('tos') && symptomTexts.includes('respir')) {
      conditions.push({
        condition: 'Infección Respiratoria',
        probability: 0.7,
        description: 'Posible infección viral o bacteriana del tracto respiratorio',
      });
    }

    if (symptomTexts.includes('dificultad respiratoria')) {
      conditions.push({
        condition: 'Problema Respiratorio Agudo',
        probability: 0.8,
        description: 'Requiere evaluación médica inmediata',
      });
    }

    // Fever conditions
    if (symptomTexts.includes('fiebre')) {
      conditions.push({
        condition: 'Síndrome Febril',
        probability: 0.6,
        description: 'Fiebre que puede ser causada por infección',
      });
    }

    // Pain conditions
    if (symptomTexts.includes('dolor') && symptomTexts.includes('pecho')) {
      conditions.push({
        condition: 'Dolor Torácico',
        probability: 0.5,
        description: 'Requiere evaluación para descartar problemas cardíacos',
      });
    }

    return conditions.slice(0, 3); // Limit to top 3 conditions
  }

  // Generate emergency recommendations
  private generateEmergencyRecommendations(urgencyLevel: string): string[] {
    if (urgencyLevel === 'high') {
      return [
        'Llamar al servicio de emergencias (911)',
        'No quedarse solo',
        'Preparar información médica relevante',
        'Mantener calma y seguir instrucciones médicas',
      ];
    }
    return [];
  }

  // Get symptom trends
  async getSymptomTrends(patientId: string, period: string = '30d'): Promise<SymptomTrend> {
    try {
      if (this.isOnline) {
        const response = await apiService.getSymptomTrends(patientId, period);
        if (response.success && response.data) {
          return response.data;
        }
      }

      // Fallback to local analysis
      return await this.analyzeLocalTrends(patientId, period);
    } catch (error) {
      console.error('Error getting symptom trends:', error);
      throw new Error('Failed to get symptom trends. Please try again.');
    }
  }

  // Local trend analysis
  private async analyzeLocalTrends(patientId: string, period: string): Promise<SymptomTrend> {
    const analyses = await localStorageService.getSymptomAnalyses();
    const patientAnalyses = analyses.filter(a => a.patientId === patientId);

    if (patientAnalyses.length < 2) {
      return {
        patientId,
        period,
        trendData: [],
        overallTrend: 'insufficient_data',
        recommendations: ['Se necesitan más datos para analizar tendencias'],
        insights: ['Insufficient data for trend analysis'],
      };
    }

    // Sort by date
    patientAnalyses.sort((a, b) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime());

    const trendData = patientAnalyses.map(analysis => ({
      date: analysis.analyzedAt,
      urgencyLevel: analysis.urgencyLevel,
      severityScore: analysis.severityScore,
      symptomCount: analysis.symptoms.length,
      dominantSymptoms: analysis.symptoms.map(s => s.symptom).slice(0, 3),
    }));

    const overallTrend = this.calculateOverallTrend(trendData);
    const recommendations = this.generateTrendRecommendations(overallTrend);
    const insights = this.generateTrendInsights(trendData, overallTrend);

    return {
      patientId,
      period,
      trendData,
      overallTrend,
      recommendations,
      insights,
    };
  }

  // Calculate overall trend
  private calculateOverallTrend(trendData: any[]): 'improving' | 'worsening' | 'stable' | 'insufficient_data' {
    if (trendData.length < 2) {
      return 'insufficient_data';
    }

    const scores = trendData.map(point => point.severityScore);
    const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);
    const earlierAvg = scores.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, scores.length);

    if (recentAvg > earlierAvg + 0.1) {
      return 'worsening';
    } else if (recentAvg < earlierAvg - 0.1) {
      return 'improving';
    } else {
      return 'stable';
    }
  }

  // Generate trend recommendations
  private generateTrendRecommendations(trend: string): string[] {
    switch (trend) {
      case 'worsening':
        return [
          'Los síntomas muestran tendencia a empeorar',
          'Se recomienda consulta médica urgente',
          'Monitorear más frecuentemente',
        ];
      case 'improving':
        return [
          'Los síntomas muestran mejoría',
          'Continuar con el tratamiento actual',
          'Mantener seguimiento regular',
        ];
      case 'stable':
        return [
          'Los síntomas se mantienen estables',
          'Continuar monitoreo regular',
          'Consultar si hay cambios significativos',
        ];
      default:
        return ['Se necesitan más datos para generar recomendaciones'];
    }
  }

  // Generate trend insights
  private generateTrendInsights(trendData: any[], trend: string): string[] {
    const insights: string[] = [];

    if (trendData.length >= 3) {
      insights.push(`Análisis basado en ${trendData.length} evaluaciones`);
    }

    if (trend === 'worsening') {
      insights.push('Tendencia preocupante que requiere atención médica');
    } else if (trend === 'improving') {
      insights.push('Progreso positivo en el manejo de síntomas');
    }

    return insights;
  }

  // Get general recommendations
  async getGeneralRecommendations(): Promise<Record<string, string[]>> {
    try {
      if (this.isOnline) {
        const response = await apiService.getGeneralRecommendations();
        if (response.success && response.data) {
          return response.data;
        }
      }

      // Fallback to local recommendations
      return {
        respiratory: [
          'Mantener hidratación adecuada',
          'Evitar irritantes como humo y polvo',
          'Usar humidificador si es necesario',
          'Practicar técnicas de respiración profunda',
        ],
        fever: [
          'Controlar temperatura regularmente',
          'Mantener reposo',
          'Hidratación abundante',
          'Usar ropa ligera y cómoda',
        ],
        pain: [
          'Aplicar calor o frío según el tipo de dolor',
          'Mantener postura correcta',
          'Evitar movimientos bruscos',
          'Considerar técnicas de relajación',
        ],
        general: [
          'Seguir las indicaciones médicas',
          'Mantener un estilo de vida saludable',
          'Reportar cualquier empeoramiento',
          'No automedicarse sin supervisión médica',
        ],
      };
    } catch (error) {
      console.error('Error getting general recommendations:', error);
      throw new Error('Failed to get recommendations. Please try again.');
    }
  }

  // Clear analysis cache
  clearCache(): void {
    this.localAnalysisCache.clear();
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;
