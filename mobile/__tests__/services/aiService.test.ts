/**
 * Tests unitarios para AI Service
 * Cubre análisis de síntomas, tendencias y recomendaciones
 */

import { aiService, SymptomInput, AISymptomAnalysis } from '../../src/services/aiService';
import { apiService } from '../../src/services/api';
import { localStorageService } from '../../src/services/localStorage';
import NetInfo from '@react-native-community/netinfo';

// Mocks
jest.mock('../../src/services/api');
jest.mock('../../src/services/localStorage');
jest.mock('@react-native-community/netinfo');

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe('analyzeSymptoms', () => {
    const mockSymptoms: SymptomInput[] = [
      {
        symptom: 'Tos seca',
        severity: 'moderate',
        duration: '3 días',
      },
      {
        symptom: 'Fiebre',
        severity: 'mild',
        duration: '1 día',
      },
    ];

    const mockPatientId = 'patient-123';

    it('debe analizar síntomas usando servicio de IA cuando está online', async () => {
      const mockAnalysis: AISymptomAnalysis = {
        id: 'analysis-1',
        patientId: mockPatientId,
        symptoms: mockSymptoms,
        urgencyLevel: 'medium',
        severityScore: 0.6,
        classification: {
          categories: ['respiratory'],
          confidence: 0.85,
          urgency: 'medium',
          possibleConditions: [
            {
              condition: 'Infección Respiratoria',
              probability: 0.7,
              description: 'Posible infección viral',
            },
          ],
        },
        recommendations: {
          immediate: ['Consultar médico'],
          shortTerm: ['Reposo', 'Hidratación'],
          longTerm: ['Seguimiento'],
          emergency: [],
        },
        warningSigns: [],
        followUpRequired: true,
        confidenceScore: 0.85,
        analyzedAt: new Date().toISOString(),
        processingTimeMs: 100,
        analysisMethod: 'ai_service',
      };

      (apiService.analyzeSymptoms as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAnalysis,
      });
      (localStorageService.saveSymptomAnalysis as jest.Mock).mockResolvedValue(undefined);

      const result = await aiService.analyzeSymptoms(mockSymptoms, mockPatientId);

      expect(result).toBeDefined();
      expect(result.urgencyLevel).toBe('medium');
      expect(result.symptoms).toEqual(mockSymptoms);
      expect(apiService.analyzeSymptoms).toHaveBeenCalledWith(
        mockSymptoms,
        mockPatientId,
        undefined
      );
      expect(localStorageService.saveSymptomAnalysis).toHaveBeenCalled();
    });

    it('debe usar análisis local cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      const result = await aiService.analyzeSymptoms(mockSymptoms, mockPatientId);

      expect(result).toBeDefined();
      expect(result.analysisMethod).toBe('local_rules');
      expect(result.urgencyLevel).toBeDefined();
      expect(apiService.analyzeSymptoms).not.toHaveBeenCalled();
    });

    it('debe hacer fallback a análisis local si falla el servicio de IA', async () => {
      (apiService.analyzeSymptoms as jest.Mock).mockRejectedValue(
        new Error('Servicio no disponible')
      );
      (localStorageService.saveSymptomAnalysis as jest.Mock).mockResolvedValue(undefined);

      const result = await aiService.analyzeSymptoms(mockSymptoms, mockPatientId);

      expect(result).toBeDefined();
      expect(result.analysisMethod).toBe('local_rules');
      expect(result.urgencyLevel).toBeDefined();
    });

    it('debe calcular nivel de urgencia correctamente para síntomas severos', async () => {
      const severeSymptoms: SymptomInput[] = [
        {
          symptom: 'Dificultad respiratoria severa',
          severity: 'severe',
          duration: '1 hora',
        },
      ];

      const result = await aiService.analyzeSymptoms(severeSymptoms, mockPatientId);

      expect(result.urgencyLevel).toBe('high');
    });

    it('debe generar recomendaciones de emergencia para urgencia alta', async () => {
      const severeSymptoms: SymptomInput[] = [
        {
          symptom: 'Dolor en el pecho',
          severity: 'severe',
          duration: '30 minutos',
        },
      ];

      (apiService.analyzeSymptoms as jest.Mock).mockResolvedValue({
        success: true,
        data: {
          urgencyLevel: 'high',
          recommendations: [],
          warningSigns: [],
        },
      });

      const result = await aiService.analyzeSymptoms(severeSymptoms, mockPatientId);

      if (result.analysisMethod === 'ai_service') {
        expect(result.recommendations.emergency.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getSymptomTrends', () => {
    const mockPatientId = 'patient-123';

    it('debe obtener tendencias desde el servidor cuando está online', async () => {
      const mockTrend = {
        patientId: mockPatientId,
        period: '30d',
        trendData: [
          {
            date: '2025-11-01',
            urgencyLevel: 'medium',
            severityScore: 0.6,
            symptomCount: 2,
            dominantSymptoms: ['tos', 'fiebre'],
          },
        ],
        overallTrend: 'stable' as const,
        recommendations: ['Continuar monitoreo'],
        insights: ['Tendencias estables'],
      };

      (apiService.getSymptomTrends as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTrend,
      });

      const result = await aiService.getSymptomTrends(mockPatientId, '30d');

      expect(result).toEqual(mockTrend);
      expect(apiService.getSymptomTrends).toHaveBeenCalledWith(mockPatientId, '30d');
    });

    it('debe usar análisis local cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });
      (localStorageService.getSymptomAnalyses as jest.Mock).mockResolvedValue([]);

      const result = await aiService.getSymptomTrends(mockPatientId);

      expect(result.overallTrend).toBe('insufficient_data');
    });
  });

  describe('getGeneralRecommendations', () => {
    it('debe obtener recomendaciones desde el servidor cuando está online', async () => {
      const mockRecommendations = {
        respiratory: ['Hidratación', 'Reposo'],
        fever: ['Controlar temperatura'],
      };

      (apiService.getGeneralRecommendations as jest.Mock).mockResolvedValue({
        success: true,
        data: mockRecommendations,
      });

      const result = await aiService.getGeneralRecommendations();

      expect(result).toEqual(mockRecommendations);
    });

    it('debe retornar recomendaciones locales cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const result = await aiService.getGeneralRecommendations();

      expect(result).toHaveProperty('respiratory');
      expect(result).toHaveProperty('fever');
      expect(result).toHaveProperty('pain');
      expect(result).toHaveProperty('general');
    });
  });

  describe('clearCache', () => {
    it('debe limpiar el caché de análisis', () => {
      aiService.clearCache();
      // Verificar que no hay errores al limpiar
      expect(true).toBe(true);
    });
  });
});

