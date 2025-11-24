import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { RespiCareColors } from '@/constants/Colors';
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
import { databaseService } from '@/services/databaseService';
import { syncService } from '@/services/syncService';

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
        // 1. Inicializar base de datos SQLite (primero, es crítico)
        console.log('📦 Inicializando base de datos SQLite...');
        await databaseService.initialize();
        console.log('✅ Base de datos SQLite inicializada');
        
        // 2. Inicializar servicio de sincronización
        console.log('🔄 Inicializando servicio de sincronización...');
        await syncService.initialize();
        console.log('✅ Servicio de sincronización inicializado');
        
        // 3. Verificar autenticación
        await checkAuth();
        
        // 4. Verificar conectividad (esto también sincroniza automáticamente)
        await checkConnectivity();
        
        // 5. Configurar notificaciones (solo en plataformas nativas)
        if (Platform.OS !== 'web') {
          const notificationService = NotificationService.getInstance();
          notificationService.createNotificationChannels();
          
          // Verificar permisos de notificación
          const hasPermissions = await notificationService.checkPermissions();
          if (!hasPermissions) {
            await notificationService.requestPermissions();
          }
        }
        
        console.log('✅ Aplicación inicializada correctamente');
      } catch (error) {
        console.error('❌ Error inicializando app:', error);
      }
    };

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  if (!loaded) {
    return null;
  }

  // Tema personalizado moderno RespiCare para Paper (basado en CSS oklch)
  const respiCarePaperTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      primary: colorScheme === 'dark' ? '#2dd4bf' : '#14b8a6', // oklch(0.65 0.18 195) dark / oklch(0.55 0.18 195) light
      background: colorScheme === 'dark' ? '#0f172a' : '#f8fafc', // oklch(0.1 0.02 240) / oklch(0.98 0.01 200)
      surface: colorScheme === 'dark' ? '#1e293b' : '#ffffff', // oklch(0.15 0.04 240) / oklch(1 0 0)
      surfaceVariant: colorScheme === 'dark' ? '#334155' : '#f5f7fa', // oklch(0.25 0.05 240) / muted
      onBackground: colorScheme === 'dark' ? '#f8fafc' : '#0f172a', // oklch(0.98 0.01 200) / oklch(0.2 0.03 200)
      onSurface: colorScheme === 'dark' ? '#f8fafc' : '#0f172a',
      onSurfaceVariant: colorScheme === 'dark' ? '#94a3b8' : '#64748b', // oklch(0.7 0.05 200) / muted-foreground
      outline: colorScheme === 'dark' ? '#334155' : '#e8f0f5', // oklch(0.25 0.05 240) / oklch(0.92 0.02 200)
    },
  };

  // Tema personalizado moderno RespiCare para Navigation (basado en CSS oklch)
  const respiCareNavTheme = {
    ...(colorScheme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(colorScheme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      primary: colorScheme === 'dark' ? '#2dd4bf' : '#14b8a6', // oklch(0.65 0.18 195) / oklch(0.55 0.18 195)
      background: colorScheme === 'dark' ? '#0f172a' : '#f8fafc', // oklch(0.1 0.02 240) / oklch(0.98 0.01 200)
      card: colorScheme === 'dark' ? '#1e293b' : '#ffffff', // oklch(0.15 0.04 240) / oklch(1 0 0)
      text: colorScheme === 'dark' ? '#f8fafc' : '#0f172a', // oklch(0.98 0.01 200) / oklch(0.2 0.03 200)
      border: colorScheme === 'dark' ? '#334155' : '#e8f0f5', // oklch(0.25 0.05 240) / oklch(0.92 0.02 200)
      notification: colorScheme === 'dark' ? '#2dd4bf' : '#14b8a6',
    },
  };

  // Forzar estilos en web de manera AGRESIVA (basado en CSS oklch)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const applyStyles = () => {
        // Eliminar estilos anteriores
        const oldStyle = document.getElementById('respicare-forced-styles');
        if (oldStyle) oldStyle.remove();

        const style = document.createElement('style');
        style.id = 'respicare-forced-styles';
        const isDark = colorScheme === 'dark';
        const bgColor = isDark ? '#0f172a' : '#f8fafc';
        const cardColor = isDark ? '#1e293b' : '#ffffff';
        const textColor = isDark ? '#f8fafc' : '#0f172a';
        const primaryColor = isDark ? '#2dd4bf' : '#14b8a6';
        const borderColor = isDark ? '#334155' : '#e8f0f5';
        
        style.textContent = `
          * {
            box-sizing: border-box;
          }
          body, html, #root, [data-reactroot], div[style*="background"] {
            background-color: ${bgColor} !important;
            color: ${textColor} !important;
          }
          /* Forzar todos los View con backgroundColor */
          div[style*="background-color"] {
            background-color: ${bgColor} !important;
          }
          /* Cards */
          div[style*="borderRadius"], [class*="Card"], [data-testid*="card"] {
            background-color: ${cardColor} !important;
            border-radius: 24px !important;
            border: 1px solid ${borderColor} !important;
          }
          /* Botones */
          button, [role="button"], div[onclick], div[style*="TouchableOpacity"] {
            border-radius: 24px !important;
          }
          button[style*="background"] {
            background-color: ${primaryColor} !important;
            color: #ffffff !important;
          }
          /* Inputs */
          input, textarea {
            border-radius: 24px !important;
            background-color: ${cardColor} !important;
            border: 1px solid ${borderColor} !important;
            color: ${textColor} !important;
          }
          /* Textos */
          span, p, div[style*="color"] {
            color: ${textColor} !important;
          }
        `;
        document.head.appendChild(style);
        
        // También forzar directamente en el body
        if (document.body) {
          document.body.style.backgroundColor = bgColor;
          document.body.style.color = textColor;
        }
        
        // Forzar en el root
        const root = document.getElementById('root');
        if (root) {
          root.style.backgroundColor = bgColor;
          root.style.color = textColor;
        }
        
        console.log('✅✅✅ ESTILOS FORZADOS APLICADOS AGRESIVAMENTE', { bgColor, cardColor, primaryColor });
      };

      // Aplicar inmediatamente
      applyStyles();
      
      // Re-aplicar después de delays para asegurar que se apliquen
      setTimeout(applyStyles, 100);
      setTimeout(applyStyles, 500);
      setTimeout(applyStyles, 1000);
      
      // Observer para cambios en el DOM
      const observer = new MutationObserver(() => {
        applyStyles();
      });
      
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class'],
        });
      }
      
      return () => {
        observer.disconnect();
      };
    }
  }, [colorScheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={respiCarePaperTheme}>
        <ThemeProvider value={respiCareNavTheme}>
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