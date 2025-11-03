import { MD3LightTheme, configureFonts } from 'react-native-paper';
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

export const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    primaryContainer: '#e3f2fd',
    secondary: '#03dac6',
    secondaryContainer: '#a7f3d0',
    tertiary: '#ff6b6b',
    tertiaryContainer: '#ffebee',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    background: '#fafafa',
    error: '#d32f2f',
    errorContainer: '#ffebee',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#0d47a1',
    onSecondary: '#000000',
    onSecondaryContainer: '#064e3b',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#b71c1c',
    onSurface: '#1c1b1f',
    onSurfaceVariant: '#49454f',
    onBackground: '#1c1b1f',
    onError: '#ffffff',
    onErrorContainer: '#b71c1c',
    outline: '#79747e',
    outlineVariant: '#cac4d0',
    inverseSurface: '#313033',
    inverseOnSurface: '#f4eff4',
    inversePrimary: '#90caf9',
    shadow: '#000000',
    scrim: '#000000',
    surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

export default theme;
