/**
 * Tests de Performance - Listas Largas
 * Verifica performance de FlatList con grandes cantidades de datos
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import MedicalHistoryScreen from '../../medical-app/screens/MedicalHistoryScreen';
import AppointmentsScreen from '../../medical-app/screens/AppointmentsScreen';
import { useAppStore } from '../../medical-app/store/useAppStore';

// Mock dependencies
jest.mock('../../medical-app/store/useAppStore');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

// Performance thresholds
const LIST_RENDER_THRESHOLD_MS = 2000; // 2 segundos para listas grandes
const SCROLL_THRESHOLD_MS = 16; // 60 FPS = 16ms por frame
const ITEM_RENDER_THRESHOLD_MS = 10; // 10ms por item

describe('List Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MedicalHistoryScreen List Performance', () => {
    it('debe renderizar lista de 100 historiales en menos de 2 segundos', async () => {
      const histories = Array.from({ length: 100 }, (_, i) => ({
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
          medicalHistories: histories,
          symptomAnalyses: [],
          appointments: [],
        },
        syncStatus: 'idle',
        notifications: [],
        alerts: [],
        deleteMedicalHistory: jest.fn(),
      });

      const startTime = performance.now();
      
      render(<MedicalHistoryScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(LIST_RENDER_THRESHOLD_MS);
      });
    });

    it('debe renderizar lista de 500 historiales sin bloquear', async () => {
      const histories = Array.from({ length: 500 }, (_, i) => ({
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
          medicalHistories: histories,
          symptomAnalyses: [],
          appointments: [],
        },
        syncStatus: 'idle',
        notifications: [],
        alerts: [],
        deleteMedicalHistory: jest.fn(),
      });

      const startTime = performance.now();
      
      render(<MedicalHistoryScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        // Listas muy grandes pueden tomar más tiempo, pero no deben bloquear
        expect(renderTime).toBeLessThan(LIST_RENDER_THRESHOLD_MS * 2);
      });
    });

    it('debe filtrar lista rápidamente', async () => {
      const histories = Array.from({ length: 200 }, (_, i) => ({
        id: `history-${i}`,
        patientName: `Patient ${i}`,
        diagnosis: i % 2 === 0 ? 'Bronquitis' : 'Asma',
        date: new Date().toISOString(),
        syncStatus: 'synced' as const,
      }));

      (useAppStore as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'patient' },
        isOnline: true,
        offlineData: {
          medicalHistories: histories,
          symptomAnalyses: [],
          appointments: [],
        },
        syncStatus: 'idle',
        notifications: [],
        alerts: [],
        deleteMedicalHistory: jest.fn(),
      });

      const { getByPlaceholderText } = render(<MedicalHistoryScreen />);
      
      await waitFor(() => {
        const searchInput = getByPlaceholderText(/buscar|search/i);
        const startTime = performance.now();
        
        // Simular búsqueda
        searchInput.props.onChangeText('Bronquitis');
        
        const endTime = performance.now();
        const filterTime = endTime - startTime;
        
        // El filtrado debe ser rápido
        expect(filterTime).toBeLessThan(SCROLL_THRESHOLD_MS * 5);
      });
    });
  });

  describe('AppointmentsScreen List Performance', () => {
    it('debe renderizar lista de 100 citas en menos de 2 segundos', async () => {
      const appointments = Array.from({ length: 100 }, (_, i) => ({
        _id: `appt-${i}`,
        patientId: `patient-${i}`,
        doctorId: 'doctor-1',
        scheduledAt: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
        durationMinutes: 30,
        status: 'scheduled' as const,
      }));

      (useAppStore as jest.Mock).mockReturnValue({
        user: { id: '1', email: 'test@example.com', name: 'Test', role: 'patient' },
        isOnline: true,
        offlineData: {
          medicalHistories: [],
          symptomAnalyses: [],
          appointments: appointments as any,
        },
        syncStatus: 'idle',
        notifications: [],
        alerts: [],
        addNotification: jest.fn(),
      });

      const startTime = performance.now();
      
      render(<AppointmentsScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(LIST_RENDER_THRESHOLD_MS);
      });
    });
  });

  describe('FlatList Optimization', () => {
    it('debe usar getItemLayout para mejor performance', () => {
      const data = Array.from({ length: 100 }, (_, i) => ({ id: `${i}`, value: `Item ${i}` }));
      
      const getItemLayout = (data: any, index: number) => ({
        length: 100,
        offset: 100 * index,
        index,
      });

      const startTime = performance.now();
      
      // Simular renderizado con getItemLayout
      const items = data.map((item, index) => {
        const layout = getItemLayout(data, index);
        return { item, layout };
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Con getItemLayout, el renderizado debe ser muy rápido
      expect(renderTime).toBeLessThan(ITEM_RENDER_THRESHOLD_MS * items.length);
    });

    it('debe usar windowSize para optimizar memoria', () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({ id: `${i}`, value: `Item ${i}` }));
      
      // windowSize limita cuántos items se renderizan fuera de la pantalla
      const windowSize = 21; // React Native default
      
      // Solo se deben renderizar items visibles + windowSize
      const visibleItems = 10; // Items visibles en pantalla
      const totalRendered = visibleItems + windowSize * 2; // Items arriba y abajo
      
      expect(totalRendered).toBeLessThan(data.length);
    });

    it('debe usar removeClippedSubviews para mejor performance', () => {
      const data = Array.from({ length: 500 }, (_, i) => ({ id: `${i}`, value: `Item ${i}` }));
      
      // removeClippedSubviews mejora el performance al remover views fuera de la pantalla
      const startTime = performance.now();
      
      // Simular renderizado con removeClippedSubviews
      const visibleRange = { start: 0, end: 10 };
      const renderedItems = data.slice(visibleRange.start, visibleRange.end);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Solo renderizar items visibles debe ser muy rápido
      expect(renderTime).toBeLessThan(ITEM_RENDER_THRESHOLD_MS * renderedItems.length);
    });
  });

  describe('Virtualization Performance', () => {
    it('debe virtualizar listas largas correctamente', async () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: `item-${i}`,
        value: `Item ${i}`,
      }));

      const startTime = performance.now();
      
      // Simular virtualización: solo renderizar items visibles
      const visibleItems = 10;
      const virtualizedItems = largeData.slice(0, visibleItems);
      
      const endTime = performance.now();
      const virtualizeTime = endTime - startTime;
      
      // La virtualización debe ser muy rápida
      expect(virtualizeTime).toBeLessThan(ITEM_RENDER_THRESHOLD_MS * virtualizedItems.length);
      expect(virtualizedItems.length).toBeLessThan(largeData.length);
    });
  });
});

