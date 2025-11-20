import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
// Reanimated se inicializa automáticamente con Expo
// import 'react-native-reanimated/lib/reanimated2/js-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore';
import NotificationService from '@/services/notificationService';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { checkAuth } = useAuthStore();
  const { checkConnectivity } = useMedicalHistoryStore();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Inicializar servicios
    const initializeApp = async () => {
      try {
        // Verificar autenticación
        await checkAuth();
        
        // Verificar conectividad
        await checkConnectivity();
        
        // Configurar notificaciones (solo en plataformas nativas)
        if (Platform.OS !== 'web') {
          const notificationService = NotificationService.getInstance();
          notificationService.createNotificationChannels();
          
          // Verificar permisos de notificación
          const hasPermissions = await notificationService.checkPermissions();
          if (!hasPermissions) {
            await notificationService.requestPermissions();
          }
        }
      } catch (error) {
        console.error('Error inicializando app:', error);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  if (!loaded) {
    return null;
  }

  // Tema personalizado estilo Telegram para Paper
  const telegramPaperTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: '#3390ec',
      background: '#0e1621',
      surface: '#17212b',
      surfaceVariant: '#1e2732',
      onBackground: '#ffffff',
      onSurface: '#ffffff',
      onSurfaceVariant: '#b1bbc4',
      outline: '#1e2732',
    },
  };

  // Tema personalizado estilo Telegram para Navigation
  const telegramNavTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#3390ec',
      background: '#0e1621',
      card: '#17212b',
      text: '#ffffff',
      border: '#1e2732',
      notification: '#3390ec',
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={telegramPaperTheme}>
        <ThemeProvider value={telegramNavTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}