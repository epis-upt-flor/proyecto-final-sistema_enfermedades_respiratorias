import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from 'react-query';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';

// Store y servicios
import { useAppStore } from './src/store/useAppStore';
import NotificationService from './src/components/Notifications/NotificationService';

// Navegación
import AppNavigator from './src/navigation/AppNavigator';

// Tema personalizado
import { theme } from './src/theme/theme';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

const AppContent: React.FC = () => {
  const { setOnlineStatus, addNotification } = useAppStore();

  useEffect(() => {
    // Configurar servicio de notificaciones
    const notificationService = NotificationService.getInstance();
    notificationService.setStore(useAppStore);

    // Escuchar cambios en la conectividad
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = state.isConnected ?? false;
      setOnlineStatus(isOnline);

      // Notificar cambio de estado
      if (isOnline) {
        addNotification({
          id: Date.now().toString(),
          title: 'Conexión Restablecida',
          message: 'Se ha restablecido la conexión a internet',
          type: 'sync',
          isRead: false,
        });
      } else {
        addNotification({
          id: Date.now().toString(),
          title: 'Sin Conexión',
          message: 'La aplicación funciona en modo offline',
          type: 'alert',
          isRead: false,
        });
      }
    });

    // Configurar notificaciones de bienvenida
    addNotification({
      id: 'welcome-1',
      title: '¡Bienvenido a RespiCare Mobile!',
      message: 'Sistema de gestión de enfermedades respiratorias',
      type: 'reminder',
      isRead: false,
    });

    addNotification({
      id: 'welcome-2',
      title: 'Funcionalidades Disponibles',
      message: 'Captura de datos, análisis con IA, notificaciones y modo offline',
      type: 'reminder',
      isRead: false,
    });

    return () => {
      unsubscribe();
    };
  }, [setOnlineStatus, addNotification]);

  return (
    <>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor={theme.colors.primary}
      />
      <AppNavigator />
      <Toast />
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AppContent />
      </PaperProvider>
    </QueryClientProvider>
  );
};

export default App;
