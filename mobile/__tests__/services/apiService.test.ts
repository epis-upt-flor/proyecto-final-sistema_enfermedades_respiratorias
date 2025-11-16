import axios from 'axios';
import { apiService } from '../../src/services/api';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('apiService - manejo de éxito/error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('login devuelve success=true al autenticar', async () => {
    mockedAxios.create.mockReturnValueOnce(mockedAxios as any);
    (mockedAxios.post as any).mockResolvedValueOnce({
      data: { data: { accessToken: 'a', refreshToken: 'r', expiresIn: 3600, user: { id: 'u1' } } },
    });

    const resp = await apiService.login('a@b.com', 'x');
    expect(resp.success).toBe(true);
    expect(resp.data?.user).toBeDefined();
  });

  it('login devuelve success=false ante error de red', async () => {
    mockedAxios.create.mockReturnValueOnce(mockedAxios as any);
    (mockedAxios.post as any).mockRejectedValueOnce({ request: {} });

    const resp = await apiService.login('a@b.com', 'x');
    expect(resp.success).toBe(false);
    expect(resp.error).toBeDefined();
  });

  it('getAlerts normaliza lista de alertas', async () => {
    mockedAxios.create.mockReturnValueOnce(mockedAxios as any);
    (mockedAxios.get as any).mockResolvedValueOnce({
      data: { data: [{ _id: '1', userId: 'u', title: 't', message: 'm', category: 'system', priority: 'low', status: 'sent', channels: [], createdAt: '' }] },
    });

    const resp = await apiService.getAlerts();
    expect(resp.success).toBe(true);
    expect(resp.data?.[0].id).toBe('1');
  });
});

/**
 * Tests unitarios para API Service
 * Cubre autenticación, CRUD de historias médicas, y manejo de errores
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { __getMockAxiosInstance, __resetMockAxiosInstance } from 'axios';
import NetInfo from '@react-native-community/netinfo';

// Mocks
jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

type ApiServiceType = typeof import('../../src/services/api')['apiService'];

const loadApiService = (): ApiServiceType => {
  const axiosInstance = __resetMockAxiosInstance();
  axiosInstance.get.mockReset();
  axiosInstance.post.mockReset();
  axiosInstance.put.mockReset();
  axiosInstance.delete.mockReset();

  let service: ApiServiceType;
  jest.isolateModules(() => {
    service = require('../../src/services/api').apiService;
  });

  const netInfo = require('@react-native-community/netinfo').default;
  (netInfo.fetch as jest.Mock).mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return service!;
};

const getAxiosInstance = () => __getMockAxiosInstance();
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

      const apiService = loadApiService();
      const axiosInstance = getAxiosInstance();
      axiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiService.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.data?.user.email).toBe('test@example.com');
      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
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

      const apiService = loadApiService();
      const axiosInstance = getAxiosInstance();
      axiosInstance.post.mockRejectedValue(mockError);

      const result = await apiService.login('test@example.com', 'wrong-password');

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

      const apiService = loadApiService();
      const axiosInstance = getAxiosInstance();
      axiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiService.getMedicalHistories();

      expect(result.success).toBe(true);
      expect(result.data?.histories.length).toBe(1);
      expect(axiosInstance.get).toHaveBeenCalledWith('/medical-histories', {
        params: undefined,
      });
    });

    it('debe manejar errores de red cuando está offline', async () => {
      const apiService = loadApiService();
      const axiosInstance = getAxiosInstance();
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
      });
      axiosInstance.get.mockRejectedValue({
        request: {},
      });

      const result = await apiService.getMedicalHistories();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
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
      };

      const apiService = loadApiService();
      const axiosInstance = getAxiosInstance();
      axiosInstance.post.mockResolvedValue({ data: mockResponse });

      const result = await apiService.analyzeSymptoms(mockSymptoms, 'patient-1');

      expect(result.success).toBe(true);
      expect(result.data?.urgencyLevel).toBe('medium');
      expect(axiosInstance.post).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    let apiService: ApiServiceType;

    beforeEach(() => {
      apiService = loadApiService();
    });

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

