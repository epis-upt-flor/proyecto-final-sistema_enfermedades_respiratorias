/**
 * Tests de Performance - Uso de Memoria
 * Verifica uso de memoria y detección de memory leaks
 */

import { render, unmount } from '@testing-library/react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { localStorageService } from '../../src/services/localStorage';
import HomeScreen from '../../src/screens/HomeScreen';
import MedicalHistoryScreen from '../../src/screens/MedicalHistoryScreen';
import AppointmentsScreen from '../../src/screens/AppointmentsScreen';

// Mock dependencies
jest.mock('../../src/store/useAppStore');
jest.mock('../../src/services/localStorage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

// Memory thresholds (en MB)
const INITIAL_MEMORY_MB = 50; // Memoria inicial esperada
const MEMORY_LEAK_THRESHOLD_MB = 100; // Umbral para detectar memory leaks
const MEMORY_INCREASE_THRESHOLD_MB = 20; // Aumento máximo permitido

// Helper para estimar uso de memoria
const estimateMemoryUsage = (): number => {
  if (global.gc) {
    global.gc();
  }
  // Estimación básica basada en objetos en memoria
  return (process.memoryUsage?.()?.heapUsed || 0) / (1024 * 1024);
};

describe('Memory Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      },
      isOnline: true,
      offlineData: {
        medicalHistories: [],
        symptomAnalyses: [],
        appointments: [],
      },
      syncStatus: 'idle',
      notifications: [],
      alerts: [],
    });
  });

  describe('Screen Memory Usage', () => {
    it('HomeScreen no debe causar memory leaks', async () => {
      const initialMemory = estimateMemoryUsage();
      
      // Renderizar múltiples veces
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<HomeScreen />);
        unmount();
      }
      
      // Forzar garbage collection si está disponible
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = estimateMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(MEMORY_INCREASE_THRESHOLD_MB);
    });

    it('MedicalHistoryScreen no debe causar memory leaks', async () => {
      const initialMemory = estimateMemoryUsage();
      
      // Renderizar múltiples veces
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<MedicalHistoryScreen />);
        unmount();
      }
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = estimateMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(MEMORY_INCREASE_THRESHOLD_MB);
    });

    it('AppointmentsScreen no debe causar memory leaks', async () => {
      const initialMemory = estimateMemoryUsage();
      
      // Renderizar múltiples veces
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<AppointmentsScreen />);
        unmount();
      }
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = estimateMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(MEMORY_INCREASE_THRESHOLD_MB);
    });
  });

  describe('Large Data Memory Usage', () => {
    it('debe manejar listas grandes sin exceder memoria', async () => {
      const largeHistories = Array.from({ length: 1000 }, (_, i) => ({
        id: `history-${i}`,
        patientName: `Patient ${i}`,
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'synced' as const,
      }));

      (useAppStore as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'patient' },
        isOnline: true,
        offlineData: {
          medicalHistories: largeHistories,
          symptomAnalyses: [],
          appointments: [],
        },
        syncStatus: 'idle',
        notifications: [],
        alerts: [],
      });

      const initialMemory = estimateMemoryUsage();
      
      const { unmount } = render(<MedicalHistoryScreen />);
      
      const afterRenderMemory = estimateMemoryUsage();
      const memoryIncrease = afterRenderMemory - initialMemory;
      
      // No debe exceder el umbral
      expect(memoryIncrease).toBeLessThan(MEMORY_LEAK_THRESHOLD_MB);
      
      unmount();
    });

    it('debe liberar memoria al desmontar componentes', async () => {
      const initialMemory = estimateMemoryUsage();
      
      const { unmount } = render(<HomeScreen />);
      const afterRenderMemory = estimateMemoryUsage();
      
      unmount();
      
      if (global.gc) {
        global.gc();
      }
      
      const afterUnmountMemory = estimateMemoryUsage();
      
      // La memoria después de desmontar debe ser menor o similar a la inicial
      expect(afterUnmountMemory).toBeLessThanOrEqual(afterRenderMemory);
    });
  });

  describe('Store Memory Usage', () => {
    it('debe manejar actualizaciones de store sin memory leaks', async () => {
      const initialMemory = estimateMemoryUsage();
      
      // Simular múltiples actualizaciones de store
      for (let i = 0; i < 100; i++) {
        useAppStore.getState().setUser({
          id: `${i}`,
          email: `test${i}@example.com`,
          name: `Test User ${i}`,
          role: 'patient',
        });
      }
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = estimateMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(MEMORY_INCREASE_THRESHOLD_MB);
    });
  });

  describe('LocalStorage Memory Usage', () => {
    it('debe manejar datos en localStorage sin memory leaks', async () => {
      const initialMemory = estimateMemoryUsage();
      
      // Guardar múltiples datos
      for (let i = 0; i < 100; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'synced' as const,
        } as any);
      }
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = estimateMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(MEMORY_LEAK_THRESHOLD_MB);
    });

    it('debe liberar memoria al limpiar localStorage', async () => {
      // Llenar localStorage
      for (let i = 0; i < 50; i++) {
        await localStorageService.saveMedicalHistory({
          id: `history-${i}`,
          patientName: `Patient ${i}`,
          diagnosis: 'Bronquitis',
          date: new Date().toISOString(),
          syncStatus: 'synced' as const,
        } as any);
      }
      
      const memoryBeforeClear = estimateMemoryUsage();
      
      // Limpiar
      await localStorageService.clearAllData();
      
      if (global.gc) {
        global.gc();
      }
      
      const memoryAfterClear = estimateMemoryUsage();
      
      // La memoria después de limpiar debe ser menor
      expect(memoryAfterClear).toBeLessThanOrEqual(memoryBeforeClear);
    });
  });
});

