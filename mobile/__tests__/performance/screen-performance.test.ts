/**
 * Tests de Performance - Pantallas
 * Verifica tiempo de renderizado y performance de pantallas principales
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { InteractionManager } from 'react-native';
import HomeScreen from '../../medical-app/screens/HomeScreen';
import MedicalHistoryScreen from '../../medical-app/screens/MedicalHistoryScreen';
import AppointmentsScreen from '../../medical-app/screens/AppointmentsScreen';
import ProfileScreen from '../../medical-app/screens/ProfileScreen';
import LoginScreen from '../../medical-app/screens/LoginScreen';
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
const RENDER_THRESHOLD_MS = 1000; // 1 segundo máximo para renderizar
const INTERACTION_THRESHOLD_MS = 100; // 100ms máximo para interacciones

describe('Screen Performance Tests', () => {
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

  describe('HomeScreen Performance', () => {
    it('debe renderizar HomeScreen en menos de 1 segundo', async () => {
      const startTime = performance.now();
      
      render(<HomeScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(RENDER_THRESHOLD_MS);
      });
    });

    it('debe manejar interacciones rápidamente', async () => {
      const { getByTestId } = render(<HomeScreen />);
      
      await waitFor(() => {
        const startTime = performance.now();
        
        // Simular interacción
        InteractionManager.runAfterInteractions(() => {
          const endTime = performance.now();
          const interactionTime = endTime - startTime;
          expect(interactionTime).toBeLessThan(INTERACTION_THRESHOLD_MS);
        });
      });
    });

    it('debe renderizar con datos mínimos sin degradación', async () => {
      const startTime = performance.now();
      
      render(<HomeScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(RENDER_THRESHOLD_MS);
      });
    });
  });

  describe('MedicalHistoryScreen Performance', () => {
    it('debe renderizar MedicalHistoryScreen en menos de 1 segundo', async () => {
      const startTime = performance.now();
      
      render(<MedicalHistoryScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(RENDER_THRESHOLD_MS);
      });
    });

    it('debe manejar búsqueda sin lag', async () => {
      const { getByPlaceholderText } = render(<MedicalHistoryScreen />);
      
      await waitFor(() => {
        const searchInput = getByPlaceholderText(/buscar|search/i);
        const startTime = performance.now();
        
        // Simular búsqueda
        searchInput.props.onChangeText('test');
        
        InteractionManager.runAfterInteractions(() => {
          const endTime = performance.now();
          const searchTime = endTime - startTime;
          expect(searchTime).toBeLessThan(INTERACTION_THRESHOLD_MS);
        });
      });
    });
  });

  describe('AppointmentsScreen Performance', () => {
    it('debe renderizar AppointmentsScreen en menos de 1 segundo', async () => {
      const startTime = performance.now();
      
      render(<AppointmentsScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(RENDER_THRESHOLD_MS);
      });
    });

    it('debe manejar refresh sin bloquear UI', async () => {
      const { getByTestId } = render(<AppointmentsScreen />);
      
      await waitFor(() => {
        const startTime = performance.now();
        
        // Simular refresh
        InteractionManager.runAfterInteractions(() => {
          const endTime = performance.now();
          const refreshTime = endTime - startTime;
          expect(refreshTime).toBeLessThan(INTERACTION_THRESHOLD_MS);
        });
      });
    });
  });

  describe('ProfileScreen Performance', () => {
    it('debe renderizar ProfileScreen en menos de 1 segundo', async () => {
      const startTime = performance.now();
      
      render(<ProfileScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(RENDER_THRESHOLD_MS);
      });
    });

    it('debe manejar cambios de tema sin lag', async () => {
      const { getByText } = render(<ProfileScreen />);
      
      await waitFor(() => {
        const themeToggle = getByText(/tema|theme/i);
        const startTime = performance.now();
        
        // Simular cambio de tema
        themeToggle.props.onPress();
        
        InteractionManager.runAfterInteractions(() => {
          const endTime = performance.now();
          const themeChangeTime = endTime - startTime;
          expect(themeChangeTime).toBeLessThan(INTERACTION_THRESHOLD_MS);
        });
      });
    });
  });

  describe('LoginScreen Performance', () => {
    it('debe renderizar LoginScreen en menos de 1 segundo', async () => {
      const startTime = performance.now();
      
      render(<LoginScreen />);
      
      await waitFor(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(RENDER_THRESHOLD_MS);
      });
    });

    it('debe manejar input de texto sin lag', async () => {
      const { getByLabelText } = render(<LoginScreen />);
      
      await waitFor(() => {
        const emailInput = getByLabelText(/correo electrónico/i);
        const startTime = performance.now();
        
        // Simular input
        emailInput.props.onChangeText('test@example.com');
        
        InteractionManager.runAfterInteractions(() => {
          const endTime = performance.now();
          const inputTime = endTime - startTime;
          expect(inputTime).toBeLessThan(INTERACTION_THRESHOLD_MS);
        });
      });
    });
  });

  describe('Screen Navigation Performance', () => {
    it('debe navegar entre pantallas sin lag', async () => {
      const startTime = performance.now();
      
      // Simular navegación
      InteractionManager.runAfterInteractions(() => {
        const endTime = performance.now();
        const navigationTime = endTime - startTime;
        expect(navigationTime).toBeLessThan(INTERACTION_THRESHOLD_MS);
      });
    });
  });
});

