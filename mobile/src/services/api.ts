/**
 * API Service - Centralized API client for RespiCare Mobile
 * Handles all backend communication with proper error handling and authentication
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Alert, AlertCategory, AlertPriority, AlertStatus } from '../types';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'doctor' | 'patient' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  age: number;
  gender: 'M' | 'F';
  diagnosis: string;
  symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
  }>;
  treatment: string;
  notes: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  attachments?: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface SymptomAnalysis {
  id: string;
  patientId: string;
  symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
  }>;
  urgencyLevel: 'low' | 'medium' | 'high';
  severityScore: number;
  classification: {
    categories: string[];
    confidence: number;
    urgency: string;
  };
  recommendations: string[];
  warningSigns: string[];
  followUpRequired: boolean;
  confidenceScore: number;
  analyzedAt: string;
  processingTimeMs: number;
}

export interface SymptomTrend {
  patientId: string;
  period: string;
  trendData: Array<{
    date: string;
    urgencyLevel: string;
    severityScore: number;
    symptomCount: number;
  }>;
  overallTrend: 'improving' | 'worsening' | 'stable' | 'insufficient_data';
  recommendations: string[];
}

// Configuration
const API_CONFIG = {
  baseURL: __DEV__ 
    ? 'http://localhost:3001/api/v1' 
    : 'https://api.respicare.com/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

class ApiService {
  private client: AxiosInstance;
  private isOnline: boolean = true;
  private retryQueue: Array<() => Promise<void>> = [];
  private normalizeAlert = (raw: any): Alert => ({
    id: raw.id || raw._id,
    userId: raw.userId,
    patientId: raw.patientId,
    doctorId: raw.doctorId,
    title: raw.title,
    message: raw.message,
    category: raw.category,
    priority: raw.priority,
    status: raw.status,
    channels: raw.channels ?? [],
    createdAt: raw.createdAt,
    scheduledAt: raw.scheduledAt,
    acknowledgedAt: raw.acknowledgedAt,
    dispatchedAt: raw.dispatchedAt,
    metadata: raw.metadata,
  });

  constructor() {
    this.client = this.createClient();
    this.setupInterceptors();
    this.setupNetworkListener();
  }

  private createClient(): AxiosInstance {
    return axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const tokens = await this.getStoredTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh and retries
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newTokens = await this.refreshTokens();
            if (newTokens) {
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        // Handle network errors and retries
        if (!error.response && this.isOnline) {
          if (originalRequest._retryCount < API_CONFIG.retryAttempts) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            
            await new Promise(resolve => 
              setTimeout(resolve, API_CONFIG.retryDelay * originalRequest._retryCount)
            );
            
            return this.client(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // If we just came back online, process retry queue
      if (wasOffline && this.isOnline) {
        this.processRetryQueue();
      }
    });
  }

  private async processRetryQueue(): Promise<void> {
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const retryFn of queue) {
      try {
        await retryFn();
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  }

  // Token management
  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokens = await AsyncStorage.getItem('auth_tokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      console.error('Error getting stored tokens:', error);
      return null;
    }
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  private async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_tokens');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  private async refreshTokens(): Promise<AuthTokens | null> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens?.refreshToken) return null;

      const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh-token`, {
        refreshToken: tokens.refreshToken,
      });

      const newTokens: AuthTokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        expiresAt: Date.now() + (response.data.data.expiresIn * 1000),
      };

      await this.storeTokens(newTokens);
      return newTokens;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return null;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      
      const tokens: AuthTokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        expiresAt: Date.now() + (response.data.data.expiresIn * 1000),
      };

      await this.storeTokens(tokens);
      
      return {
        success: true,
        data: {
          user: response.data.data.user,
          tokens,
        },
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'doctor' | 'patient';
  }): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await this.client.post('/auth/register', userData);
      
      const tokens: AuthTokens = {
        accessToken: response.data.data.accessToken,
        refreshToken: response.data.data.refreshToken,
        expiresAt: Date.now() + (response.data.data.expiresIn * 1000),
      };

      await this.storeTokens(tokens);
      
      return {
        success: true,
        data: {
          user: response.data.data.user,
          tokens,
        },
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get('/auth/profile');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Medical History methods
  async getMedicalHistories(params?: {
    page?: number;
    limit?: number;
    patientId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{ histories: MedicalHistory[]; total: number; page: number; limit: number }>> {
    try {
      const response = await this.client.get('/medical-histories', { params });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getMedicalHistory(id: string): Promise<ApiResponse<MedicalHistory>> {
    try {
      const response = await this.client.get(`/medical-histories/${id}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async createMedicalHistory(historyData: Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MedicalHistory>> {
    try {
      const response = await this.client.post('/medical-histories', historyData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async updateMedicalHistory(id: string, historyData: Partial<MedicalHistory>): Promise<ApiResponse<MedicalHistory>> {
    try {
      const response = await this.client.put(`/medical-histories/${id}`, historyData);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async deleteMedicalHistory(id: string): Promise<ApiResponse<void>> {
    try {
      await this.client.delete(`/medical-histories/${id}`);
      return { success: true };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Symptom Analysis methods
  async analyzeSymptoms(symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration: string;
  }>, patientId: string, context?: string): Promise<ApiResponse<SymptomAnalysis>> {
    try {
      const response = await this.client.post('/symptom-analyzer/analyze', {
        patientId,
        symptoms,
        context,
        severity: 'medium',
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getSymptomTrends(patientId: string, period: string = '30d'): Promise<ApiResponse<SymptomTrend>> {
    try {
      const response = await this.client.get(`/symptom-analyzer/trends/${patientId}`, {
        params: { period },
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getGeneralRecommendations(): Promise<ApiResponse<Record<string, string[]>>> {
    try {
      const response = await this.client.get('/symptom-analyzer/recommendations');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async getAlerts(params?: {
    status?: AlertStatus[];
    priority?: AlertPriority[];
    category?: AlertCategory[];
    from?: string;
    to?: string;
  }): Promise<ApiResponse<Alert[]>> {
    try {
      const response = await this.client.get('/alerts', {
        params: {
          ...params,
        },
      });

      const alerts: Alert[] = Array.isArray(response.data.data)
        ? response.data.data.map(this.normalizeAlert)
        : [];

      return {
        success: true,
        data: alerts,
        message: response.data.message,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<Alert>> {
    try {
      const response = await this.client.post(`/alerts/${alertId}/acknowledge`);
      const alert = this.normalizeAlert(response.data.data);

      return {
        success: true,
        data: alert,
        message: response.data.message,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Dashboard methods
  async getDashboardData(role: 'admin' | 'doctor' | 'patient'): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get(`/dashboard/${role}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // File upload methods
  async uploadMedicalFile(file: FormData): Promise<ApiResponse<{ filePath: string; fileInfo: any }>> {
    try {
      const response = await this.client.post('/upload/medical-files', file, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: any): ApiResponse {
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || 'Server error occurred',
        message: error.response.data?.message || 'An error occurred',
      };
    } else if (error.request) {
      // Network error
      if (!this.isOnline) {
        return {
          success: false,
          error: 'No internet connection',
          message: 'Please check your internet connection and try again',
        };
      }
      
      return {
        success: false,
        error: 'Network error',
        message: 'Unable to connect to server. Please try again later.',
      };
    } else {
      // Other error
      return {
        success: false,
        error: error.message || 'Unknown error',
        message: 'An unexpected error occurred',
      };
    }
  }

  // Utility methods
  isAuthenticated(): Promise<boolean> {
    return this.getStoredTokens().then(tokens => {
      if (!tokens) return false;
      return Date.now() < tokens.expiresAt;
    });
  }

  getCurrentUser(): Promise<User | null> {
    return AsyncStorage.getItem('current_user').then(userData => {
      return userData ? JSON.parse(userData) : null;
    });
  }

  setCurrentUser(user: User): Promise<void> {
    return AsyncStorage.setItem('current_user', JSON.stringify(user));
  }

  clearCurrentUser(): Promise<void> {
    return AsyncStorage.removeItem('current_user');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
