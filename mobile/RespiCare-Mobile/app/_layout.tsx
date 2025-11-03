import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated/lib/reanimated2/js-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';
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
        
        // Configurar notificaciones
        const notificationService = NotificationService.getInstance();
        notificationService.createNotificationChannels();
        
        // Verificar permisos de notificación
        const hasPermissions = await notificationService.checkPermissions();
        if (!hasPermissions) {
          await notificationService.requestPermissions();
        }
      } catch (error) {
        console.error('Error inicializando app:', error);
      }
    };

    initializeApp();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}