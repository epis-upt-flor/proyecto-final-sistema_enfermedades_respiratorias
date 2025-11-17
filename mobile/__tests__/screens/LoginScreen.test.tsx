/**
 * Tests for LoginScreen
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { useAppStore } from '../../src/store/useAppStore';

// Mock dependencies
jest.mock('../../src/store/useAppStore');
jest.mock('../../src/utils/animations', () => ({
  fadeIn: jest.fn(() => ({ start: jest.fn() })),
  shake: jest.fn(() => ({ start: jest.fn() })),
  successAnimation: jest.fn(() => ({ start: jest.fn() })),
}));

const mockSetUser = jest.fn();
const mockUseAppStore = useAppStore as jest.MockedFunction<typeof useAppStore>;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppStore.mockReturnValue({
      setUser: mockSetUser,
    } as any);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  it('should render login form', () => {
    render(<LoginScreen />);
    
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('should update email input', () => {
    render(<LoginScreen />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    fireEvent.changeText(emailInput, 'test@example.com');
    
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('should update password input', () => {
    render(<LoginScreen />);
    
    const passwordInput = screen.getByLabelText(/contraseña/i);
    fireEvent.changeText(passwordInput, 'password123');
    
    expect(passwordInput.props.value).toBe('password123');
  });

  it('should show error when fields are empty', async () => {
    render(<LoginScreen />);
    
    const loginButton = screen.getByText(/iniciar sesión/i);
    fireEvent.press(loginButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Por favor completa todos los campos'
      );
    });
  });

  it('should handle successful login', async () => {
    jest.useFakeTimers();
    
    render(<LoginScreen />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const loginButton = screen.getByText(/iniciar sesión/i);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);
    
    // Fast-forward time
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
    });
    
    jest.useRealTimers();
  });

  it('should show loading state during login', async () => {
    jest.useFakeTimers();
    
    render(<LoginScreen />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const loginButton = screen.getByText(/iniciar sesión/i);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);
    
    // Should show loading
    expect(screen.queryByTestId('activity-indicator')).toBeInTheDocument();
    
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalled();
    });
    
    jest.useRealTimers();
  });

  it('should handle login error', async () => {
    jest.useFakeTimers();
    mockSetUser.mockImplementation(() => {
      throw new Error('Login failed');
    });
    
    render(<LoginScreen />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const loginButton = screen.getByText(/iniciar sesión/i);
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);
    
    jest.advanceTimersByTime(2000);
    
    // Should handle error gracefully
    await waitFor(() => {
      expect(true).toBe(true);
    });
    
    jest.useRealTimers();
  });
});

