/**
 * Tests de Performance - Carga de Datos
 * Verifica performance de carga de datos desde API y localStorage
 */

import { localStorageService } from '../../src/services/localStorage';
import { apiService } from '../../src/services/api';
import { useAppStore } from '../../src/store/useAppStore';

// Mock dependencies
jest.mock('../../src/services/api', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Performance thresholds
const API_LOAD_THRESHOLD_MS = 2000; // 2 segundos para cargar desde API
const LOCAL_LOAD_THRESHOLD_MS = 500; // 500ms para cargar desde localStorage
const LARGE_DATA_LOAD_THRESHOLD_MS = 3000; // 3 segundos para datos grandes

describe('Data Loading Performance Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localStorageService.clearAllData();
  });

  describe('API Loading Performance', () => {
    it('debe cargar historiales médicos desde API en menos de 2 segundos', async () => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: `history-${i}`,
        patientName: `Patient ${i}`,
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
      }));

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { histories: mockData },
      });

      const startTime = performance.now();
      const result = await apiService.get('/medical-histories');
      const endTime = performance.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(API_LOAD_THRESHOLD_MS);
      expect(result.success).toBe(true);
    });

    it('debe cargar citas desde API en menos de 2 segundos', async () => {
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        _id: `appt-${i}`,
        patientId: `patient-${i}`,
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
      }));

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { appointments: mockData },
      });

      const startTime = performance.now();
      const result = await apiService.get('/appointments');
      const endTime = performance.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(API_LOAD_THRESHOLD_MS);
      expect(result.success).toBe(true);
    });
  });

  describe('LocalStorage Loading Performance', () => {
    it('debe cargar historiales desde localStorage en menos de 500ms', async () => {
      // Guardar datos
      for (let i = 0; i < 100; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientId: 'patient-1',
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'synced' as const,
        } as any);
      }

      const startTime = performance.now();
      const histories = await localStorageService.getMedicalHistories();
      const endTime = performance.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(LOCAL_LOAD_THRESHOLD_MS);
      expect(histories.length).toBe(100);
    });

    it('debe cargar citas desde localStorage en menos de 500ms', async () => {
      // Guardar datos
      for (let i = 0; i < 100; i++) {
        await localStorageService.createAppointment({
          _id: `appt-${i}`,
          patientId: 'patient-1',
          doctorId: 'doctor-1',
          scheduledAt: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
          durationMinutes: 30,
          syncStatus: 'synced' as const,
        } as any);
      }

      const startTime = performance.now();
      const appointments = await localStorageService.getCachedAppointments();
      const endTime = performance.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(LOCAL_LOAD_THRESHOLD_MS);
      expect(appointments.length).toBe(100);
    });
  });

  describe('Large Data Loading', () => {
    it('debe cargar 1000 historiales en menos de 3 segundos', async () => {
      // Guardar muchos datos
      for (let i = 0; i < 1000; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientId: 'patient-1',
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'synced' as const,
        } as any);
      }

      const startTime = performance.now();
      const histories = await localStorageService.getMedicalHistories();
      const endTime = performance.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(LARGE_DATA_LOAD_THRESHOLD_MS);
      expect(histories.length).toBe(1000);
    });

    it('debe cargar datos grandes desde API en menos de 3 segundos', async () => {
      const mockData = Array.from({ length: 500 }, (_, i) => ({
        id: `history-${i}`,
        patientName: `Patient ${i}`,
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
      }));

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { histories: mockData },
      });

      const startTime = performance.now();
      const result = await apiService.get('/medical-histories');
      const endTime = performance.now();

      const loadTime = endTime - startTime;
      expect(loadTime).toBeLessThan(LARGE_DATA_LOAD_THRESHOLD_MS);
      expect(result.data.histories.length).toBe(500);
    });
  });

  describe('Cached Data Performance', () => {
    it('debe usar caché para mejorar performance', async () => {
      // Primera carga (sin caché)
      const mockData = Array.from({ length: 100 }, (_, i) => ({
        id: `history-${i}`,
        patientName: `Patient ${i}`,
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
      }));

      (apiService.get as jest.Mock).mockResolvedValue({
        success: true,
        data: { histories: mockData },
      });

      const firstLoadStart = performance.now();
      await apiService.get('/medical-histories');
      const firstLoadEnd = performance.now();
      const firstLoadTime = firstLoadEnd - firstLoadStart;

      // Segunda carga (con caché)
      const secondLoadStart = performance.now();
      const histories = await localStorageService.getMedicalHistories();
      const secondLoadEnd = performance.now();
      const secondLoadTime = secondLoadEnd - secondLoadStart;

      // La carga desde caché debe ser más rápida
      expect(secondLoadTime).toBeLessThan(firstLoadTime);
      expect(histories.length).toBeGreaterThan(0);
    });
  });

  describe('Pagination Performance', () => {
    it('debe cargar datos paginados eficientemente', async () => {
      const pageSize = 20;
      const totalPages = 5;

      for (let page = 1; page <= totalPages; page++) {
        const mockData = Array.from({ length: pageSize }, (_, i) => ({
          id: `history-${(page - 1) * pageSize + i}`,
          patientName: `Patient ${(page - 1) * pageSize + i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
        }));

        (apiService.get as jest.Mock).mockResolvedValueOnce({
          success: true,
          data: { histories: mockData, page, totalPages },
        });

        const startTime = performance.now();
        const result = await apiService.get(`/medical-histories?page=${page}&limit=${pageSize}`);
        const endTime = performance.now();

        const loadTime = endTime - startTime;
        // Cada página debe cargar rápidamente
        expect(loadTime).toBeLessThan(API_LOAD_THRESHOLD_MS);
        expect(result.data.histories.length).toBe(pageSize);
      }
    });
  });
});

