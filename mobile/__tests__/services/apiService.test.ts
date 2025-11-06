/**
 * Tests unitarios para API Service
 * Cubre autenticación, CRUD de historias médicas, y manejo de errores
 */

import { apiService } from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';

// Mocks
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe('login', () => {
    it('debe hacer login exitosamente y guardar tokens', async () => {
      const mockResponse = {
        data: {
          data: {
            user: {
              id: 'user-1',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              role: 'patient',
            },
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            expiresIn: 3600,
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      // Necesitamos recrear el servicio después del mock
      const { apiService: freshService } = require('../../src/services/api');
      const result = await freshService.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('test@example.com');
    });

    it('debe manejar errores de login incorrecto', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {
            message: 'Credenciales inválidas',
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockRejectedValue(mockError),
      } as any);

      const { apiService: freshService } = require('../../src/services/api');
      const result = await freshService.login('test@example.com', 'wrong-password');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getMedicalHistories', () => {
    it('debe obtener historias médicas exitosamente', async () => {
      const mockHistories = [
        {
          id: 'history-1',
          patientId: 'patient-1',
          diagnosis: 'Bronquitis',
          symptoms: [],
          treatment: 'Reposo',
          date: '2025-11-01',
        },
      ];

      const mockResponse = {
        data: {
          data: {
            histories: mockHistories,
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockResponse),
      } as any);

      const { apiService: freshService } = require('../../src/services/api');
      const result = await freshService.getMedicalHistories();

      expect(result.success).toBe(true);
      expect(result.data?.histories.length).toBe(1);
    });

    it('debe manejar errores de red cuando está offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue({
          request: {},
        }),
      } as any);

      const { apiService: freshService } = require('../../src/services/api');
      const result = await freshService.getMedicalHistories();

      expect(result.success).toBe(false);
      expect(result.error).toContain('internet');
    });
  });

  describe('analyzeSymptoms', () => {
    it('debe analizar síntomas exitosamente', async () => {
      const mockSymptoms = [
        {
          symptom: 'Tos',
          severity: 'moderate' as const,
          duration: '3 días',
        },
      ];

      const mockResponse = {
        data: {
          id: 'analysis-1',
          patientId: 'patient-1',
          symptoms: mockSymptoms,
          urgencyLevel: 'medium',
          severityScore: 0.6,
          classification: {
            categories: ['respiratory'],
            confidence: 0.8,
            urgency: 'medium',
          },
          recommendations: [],
          warningSigns: [],
          followUpRequired: true,
          confidenceScore: 0.8,
          analyzedAt: new Date().toISOString(),
          processingTimeMs: 100,
        },
      };

      mockedAxios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse }),
      } as any);

      const { apiService: freshService } = require('../../src/services/api');
      const result = await freshService.analyzeSymptoms(mockSymptoms, 'patient-1');

      expect(result.success).toBe(true);
      expect(result.data?.urgencyLevel).toBe('medium');
    });
  });

  describe('isAuthenticated', () => {
    it('debe retornar true cuando hay tokens válidos', async () => {
      const mockTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Date.now() + 3600000, // 1 hora en el futuro
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockTokens));

      const isAuth = await apiService.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('debe retornar false cuando los tokens expiraron', async () => {
      const mockTokens = {
        accessToken: 'token',
        refreshToken: 'refresh',
        expiresAt: Date.now() - 1000, // En el pasado
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockTokens));

      const isAuth = await apiService.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });
});

