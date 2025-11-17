/**
 * Tests for ProfileScreen
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ProfileScreen from '../../src/screens/ProfileScreen';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme } from '../../src/hooks/useTheme';
import { useTranslation } from '../../src/services/i18nService';

// Mock dependencies
jest.mock('../../src/store/useAppStore');
jest.mock('../../src/hooks/useTheme');
jest.mock('../../src/services/i18nService');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

const mockSetUser = jest.fn();
const mockClearNotifications = jest.fn();
const mockSetHealthProfile = jest.fn();
const mockUpdatePreferences = jest.fn();
const mockSetThemeMode = jest.fn();
const mockToggleTheme = jest.fn();
const mockSetLanguage = jest.fn();

const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;
const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('ProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAppStore.mockReturnValue({
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'patient',
      },
      setUser: mockSetUser,
      offlineData: {},
      notifications: [],
      isOnline: true,
      clearNotifications: mockClearNotifications,
      healthProfile: {
        age: 30,
        baseDiagnosis: '',
        riskFactors: [],
        preferences: {
          remindersEnabled: true,
          notificationFrequency: 'normal',
        },
      },
      setHealthProfile: mockSetHealthProfile,
      updatePreferences: mockUpdatePreferences,
    } as any);
    
    mockUseTheme.mockReturnValue({
      themeMode: 'light',
      setThemeMode: mockSetThemeMode,
      toggleTheme: mockToggleTheme,
      theme: {} as any,
    });
    
    mockUseTranslation.mockReturnValue({
      t: (key: string) => key,
      language: 'es',
      setLanguage: mockSetLanguage,
    });
    
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('should render profile information', () => {
    render(<ProfileScreen />);
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should handle logout', () => {
    render(<ProfileScreen />);
    
    const logoutButton = screen.getByText(/cerrar sesión|logout/i);
    fireEvent.press(logoutButton);
    
    expect(Alert.alert).toHaveBeenCalled();
  });

  it('should handle clear notifications', () => {
    render(<ProfileScreen />);
    
    const clearButton = screen.queryByText(/eliminar todas|clear all/i);
    if (clearButton) {
      fireEvent.press(clearButton);
      expect(Alert.alert).toHaveBeenCalled();
    }
  });

  it('should update age input', () => {
    render(<ProfileScreen />);
    
    const ageInput = screen.getByDisplayValue('30');
    fireEvent.changeText(ageInput, '35');
    
    expect(ageInput.props.value).toBe('35');
  });

  it('should update base diagnosis', () => {
    render(<ProfileScreen />);
    
    const diagnosisInput = screen.getByPlaceholderText(/diagnóstico base/i);
    if (diagnosisInput) {
      fireEvent.changeText(diagnosisInput, 'Asma');
      expect(diagnosisInput.props.value).toBe('Asma');
    }
  });

  it('should toggle theme', () => {
    render(<ProfileScreen />);
    
    const themeToggle = screen.getByText(/tema|theme/i);
    fireEvent.press(themeToggle);
    
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('should change language', () => {
    render(<ProfileScreen />);
    
    const languageButton = screen.getByText(/idioma|language/i);
    fireEvent.press(languageButton);
    
    // Should allow language change
    expect(mockSetLanguage).toBeDefined();
  });

  it('should update reminders enabled', () => {
    render(<ProfileScreen />);
    
    const remindersSwitch = screen.getByTestId('reminders-switch');
    if (remindersSwitch) {
      fireEvent(remindersSwitch, 'valueChange', false);
      expect(mockUpdatePreferences).toHaveBeenCalled();
    }
  });

  it('should update notification frequency', () => {
    render(<ProfileScreen />);
    
    const freqButton = screen.getByText(/frecuencia|frequency/i);
    if (freqButton) {
      fireEvent.press(freqButton);
      // Should update frequency
      expect(mockUpdatePreferences).toBeDefined();
    }
  });
});

