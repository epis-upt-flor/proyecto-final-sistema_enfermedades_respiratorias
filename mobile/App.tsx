import React, { useEffect } from 'react';
import {
  AppState,
  AppStateStatus,
  InteractionManager,
  Platform,
  StatusBar,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { persistQueryClient } from 'react-query/persistQueryClient-experimental';
import { createAsyncStoragePersistor } from 'react-query/createAsyncStoragePersistor-experimental';
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
      cacheTime: 24 * 60 * 60 * 1000, // 24 horas
      refetchOnReconnect: true,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

const asyncStoragePersistor = createAsyncStoragePersistor({
  storage: AsyncStorage,
  key: 'respicare-mobile-query-cache',
  throttleTime: 1000,
});

persistQueryClient({
  queryClient,
  persistor: asyncStoragePersistor,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
});

onlineManager.setEventListener((setOnline) => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    setOnline?.(Boolean(state.isConnected && state.isInternetReachable !== false));
  });

  return () => {
    unsubscribe();
  };
});

focusManager.setEventListener((handleFocus) => {
  const onAppStateChange = (status: AppStateStatus) => {
    handleFocus(status === 'active');
  };

  const subscription = AppState.addEventListener('change', onAppStateChange);
  return () => subscription.remove();
});

const AppContent: React.FC = () => {
  const { setOnlineStatus, addNotification } = useAppStore();

  useEffect(() => {
    // Configurar servicio de notificaciones
    const notificationService = NotificationService.getInstance();
    notificationService.setStore(useAppStore);

    // Escuchar cambios en la conectividad
    const netInfoSubscription = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setOnlineStatus(isOnline);

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

    const interactionHandle = InteractionManager.runAfterInteractions(() => {
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
    });

    return () => {
      netInfoSubscription();
      interactionHandle.cancel();
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
