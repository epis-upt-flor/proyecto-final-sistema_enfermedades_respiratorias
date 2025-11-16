import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '100' as const,
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
  android: {
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal' as const,
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal' as const,
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal' as const,
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal' as const,
    },
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90caf9',
    primaryContainer: '#1565c0',
    secondary: '#03dac6',
    secondaryContainer: '#018786',
    tertiary: '#ff6b6b',
    tertiaryContainer: '#c62828',
    surface: '#1e1e1e',
    surfaceVariant: '#2d2d2d',
    background: '#121212',
    error: '#ef5350',
    errorContainer: '#c62828',
    onPrimary: '#000000',
    onPrimaryContainer: '#e3f2fd',
    onSecondary: '#000000',
    onSecondaryContainer: '#a7f3d0',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#ffebee',
    onSurface: '#e0e0e0',
    onSurfaceVariant: '#b0b0b0',
    onBackground: '#e0e0e0',
    onError: '#ffffff',
    onErrorContainer: '#ffebee',
    outline: '#616161',
    outlineVariant: '#424242',
    inverseSurface: '#e0e0e0',
    inverseOnSurface: '#1e1e1e',
    inversePrimary: '#1976d2',
    shadow: '#000000',
    scrim: '#000000',
    surfaceDisabled: 'rgba(255, 255, 255, 0.12)',
    onSurfaceDisabled: 'rgba(255, 255, 255, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

export default darkTheme;

