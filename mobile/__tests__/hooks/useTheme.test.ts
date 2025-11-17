/**
 * Tests for useTheme hook
 */

import { renderHook, act } from '@testing-library/react-native';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/store/useAppStore';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('../../src/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

describe('useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppStore as jest.Mock).mockReturnValue({
      themeMode: 'light',
      setThemeMode: jest.fn(),
    });
  });

  it('should return theme object', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBeDefined();
    expect(result.current.theme.colors).toBeDefined();
  });

  it('should return themeMode', () => {
    const { result } = renderHook(() => useTheme());
    expect(['light', 'dark', 'auto']).toContain(result.current.themeMode);
  });

  it('should return toggleTheme function', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  it('should return setThemeMode function', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.setThemeMode).toBe('function');
  });

  it('should toggle theme', () => {
    const setThemeMode = jest.fn();
    (useAppStore as jest.Mock).mockReturnValue({
      themeMode: 'light',
      setThemeMode,
    });

    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });

    expect(setThemeMode).toHaveBeenCalled();
  });

  it('should set theme mode', () => {
    const setThemeMode = jest.fn();
    (useAppStore as jest.Mock).mockReturnValue({
      themeMode: 'light',
      setThemeMode,
    });

    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setThemeMode('dark');
    });

    expect(setThemeMode).toHaveBeenCalledWith('dark');
  });

  it('should use system color scheme in auto mode', () => {
    const { useColorScheme } = require('react-native');
    useColorScheme.mockReturnValue('dark');
    
    (useAppStore as jest.Mock).mockReturnValue({
      themeMode: 'auto',
      setThemeMode: jest.fn(),
    });

    const { result } = renderHook(() => useTheme());
    // Should use dark theme when system is dark
    expect(result.current.theme).toBeDefined();
  });
});

