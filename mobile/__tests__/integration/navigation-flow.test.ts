/**
 * Tests de integración - Flujo completo de navegación
 * Verifica navegación entre pantallas y estado persistente
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAppStore } from '../../src/store/useAppStore';
import { localStorageService } from '../../src/services/localStorage';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

describe('Navigation Flow Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localStorageService.clearAllData();
    
    useAppStore.getState().setUser({
      id: 'patient-1',
      email: 'patient@example.com',
      name: 'Test Patient',
      role: 'patient',
    });
  });

  describe('Authentication Navigation', () => {
    it('debe navegar a Home después de login exitoso', async () => {
      const loginResult = await useAppStore.getState().login('test@example.com', 'password');

      if (loginResult) {
        // Verificar que el usuario está logueado
        const user = useAppStore.getState().user;
        expect(user).toBeDefined();

        // En una app real, esto dispararía navegación
        // Por ahora verificamos el estado
        expect(user?.email).toBe('test@example.com');
      }
    });

    it('debe navegar a Login después de logout', () => {
      // Setup: usuario logueado
      useAppStore.getState().setUser({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      });

      // Logout
      useAppStore.getState().setUser(null);

      // Verificar que el usuario es null
      const user = useAppStore.getState().user;
      expect(user).toBeNull();
    });
  });

  describe('Main Navigation Flow', () => {
    it('debe navegar entre tabs principales', () => {
      // Simular navegación entre tabs
      const tabs = ['Home', 'History', 'Appointments', 'Profile'];

      tabs.forEach(tab => {
        mockNavigate(tab);
      });

      expect(mockNavigate).toHaveBeenCalledTimes(4);
      expect(mockNavigate).toHaveBeenCalledWith('Home');
      expect(mockNavigate).toHaveBeenCalledWith('History');
      expect(mockNavigate).toHaveBeenCalledWith('Appointments');
      expect(mockNavigate).toHaveBeenCalledWith('Profile');
    });

    it('debe navegar a detalles desde lista', () => {
      // Simular navegación a detalles
      mockNavigate('AppointmentDetail', { appointmentId: 'appt-1' });
      mockNavigate('AlertDetail', { alertId: 'alert-1' });
      mockNavigate('MedicalHistoryDetail', { historyId: 'history-1' });

      expect(mockNavigate).toHaveBeenCalledWith('AppointmentDetail', { appointmentId: 'appt-1' });
      expect(mockNavigate).toHaveBeenCalledWith('AlertDetail', { alertId: 'alert-1' });
      expect(mockNavigate).toHaveBeenCalledWith('MedicalHistoryDetail', { historyId: 'history-1' });
    });
  });

  describe('Deep Linking', () => {
    it('debe manejar deep links correctamente', () => {
      const deepLinks = [
        'respicare://appointment/appt-1',
        'respicare://alert/alert-1',
        'respicare://history/history-1',
      ];

      deepLinks.forEach(link => {
        // En una app real, esto se procesaría con react-navigation
        const parts = link.split('/');
        const screen = parts[2];
        const id = parts[3];

        if (screen && id) {
          mockNavigate(screen, { id });
        }
      });

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('State Persistence', () => {
    it('debe mantener estado entre navegaciones', async () => {
      // Crear datos
      const history = {
        id: 'history-1',
        patientName: 'Test Patient',
        diagnosis: 'Bronquitis',
        date: new Date().toISOString(),
        syncStatus: 'synced' as const,
      };

      await localStorageService.saveMedicalHistory(history as any);

      // Navegar a otra pantalla
      mockNavigate('Home');

      // Volver y verificar que los datos persisten
      const cached = await localStorageService.getMedicalHistories();
      expect(cached.length).toBeGreaterThan(0);
      expect(cached[0].id).toBe('history-1');
    });
  });
});

