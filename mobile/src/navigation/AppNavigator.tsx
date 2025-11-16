import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { AppState, View, Text, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Provider as PaperProvider } from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList, MainTabParamList } from '../types';
import { shallow } from 'zustand/shallow';
import { useTheme } from '../hooks/useTheme';
import { i18nService } from '../services/i18nService';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import DataCaptureScreen from '../components/DataCapture/DataCaptureScreen';
import NotificationScreen from '../components/Notifications/NotificationScreen';
import OfflineDataScreen from '../components/Offline/OfflineDataScreen';
import AIAnalysisScreen from '../components/AI/AIAnalysisScreen';
import MedicalChatbot from '../components/ChatBot/MedicalChatbot';
import MedicalHistoryScreen from '../screens/MedicalHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AppointmentsScreen from '../screens/AppointmentsScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';
import AppointmentDetailScreen from '../screens/AppointmentDetailScreen';
import ARTrainingScreen from '../screens/ARTrainingScreen';
import SymptomAnalysesScreen from '../screens/SymptomAnalysesScreen';
import DoctorDashboardScreen from '../screens/DoctorDashboardScreen';
import DirectChatScreen from '../screens/DirectChatScreen';
import PatientAnalyticsScreen from '../screens/PatientAnalyticsScreen';
import DoctorAnalyticsScreen from '../screens/DoctorAnalyticsScreen';
import ConsentScreen from '../screens/ConsentScreen';
import { featureFlags } from '../config/environment';
import OnboardingScreen from '../screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../services/analyticsService';
import { errorTrackingService } from '../services/errorTrackingService';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const unreadCount = useAppStore(
    (state) => state.notifications.filter((n) => !n.isRead).length,
    (a, b) => a === b
  );
  const role = useAppStore((state) => state.user?.role, shallow);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        lazy: true,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'DoctorDashboard':
              iconName = focused ? 'stethoscope' : 'stethoscope';
              break;
            case 'Capture':
              iconName = focused ? 'plus-circle' : 'plus-circle-outline';
              break;
            case 'History':
              iconName = focused ? 'history' : 'history';
              break;
            case 'AI':
              iconName = focused ? 'robot' : 'robot-outline';
              break;
            case 'Alerts':
              iconName = focused ? 'bell' : 'bell-outline';
              break;
            case 'Appointments':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'ChatBot':
              iconName = focused ? 'chat' : 'chat-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: '#1976d2',
          elevation: 4,
        },
        headerTintColor: 'white',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          headerTitle: 'RespiCare Mobile',
        }}
      />
      {role === 'doctor' && (
        <Tab.Screen
          name="DoctorDashboard"
          component={DoctorDashboardScreen}
          options={{
            title: 'Médico',
            headerTitle: 'Panel Médico',
          }}
        />
      )}
      <Tab.Screen
        name="Capture"
        component={DataCaptureScreen}
        options={{
          title: 'Capturar',
          headerTitle: 'Captura de Datos',
        }}
      />
      <Tab.Screen
        name="History"
        component={MedicalHistoryScreen}
        options={{
          title: 'Historial',
          headerTitle: 'Historial Médico',
        }}
      />
      <Tab.Screen
        name="AI"
        component={AIAnalysisScreen}
        options={{
          title: 'IA',
          headerTitle: 'Análisis con IA',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationScreen}
        options={{
          title: 'Alertas',
          headerTitle: 'Alertas',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'Citas',
          headerTitle: 'Citas Médicas',
          tabBarButton: featureFlags.enableAppointmentsCard ? undefined : () => null,
        }}
      />
      <Tab.Screen
        name="ChatBot"
        component={MedicalChatbot}
        options={{
          title: 'Chat',
          headerTitle: 'Asistente Médico',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          headerTitle: 'Mi Perfil',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const isAuthenticated = useAppStore((state) => Boolean(state.user), shallow);
  const { theme } = useTheme();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const navRef = React.useRef(createNavigationContainerRef<any>());

  const setScreenCapture = React.useCallback(async (block: boolean) => {
    try {
      // @ts-ignore dependencia opcional
      const ScreenCapture = require('expo-screen-capture');
      if (block && ScreenCapture?.preventScreenCaptureAsync) {
        await ScreenCapture.preventScreenCaptureAsync();
      } else if (!block && ScreenCapture?.allowScreenCaptureAsync) {
        await ScreenCapture.allowScreenCaptureAsync();
      }
    } catch {}
  }, []);

  useEffect(() => {
    i18nService.initialize();
    // Iniciar auto-flush de analytics con persistencia periódica
    analyticsService.startAutoFlush(30000);
    // Inicializar tracking de errores y handler global
    errorTrackingService.init({ enabled: true, environment: __DEV__ ? 'dev' : 'prod' });
    errorTrackingService.setGlobalHandler();
    return () => {
      analyticsService.stopAutoFlush();
      // Revertir bloqueo de capturas al salir
      setScreenCapture(false);
    };
  }, [setScreenCapture]);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const v = await AsyncStorage.getItem('onboarding_completed');
        setHasSeenOnboarding(Boolean(v));
      } catch {
        setHasSeenOnboarding(true);
      }
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      // Mostrar overlay cuando la app no está activa para ocultar contenido en multitarea
      setPrivacyVisible(state !== 'active');
    });
    return () => sub.remove();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer
        ref={navRef}
        onReady={() => {
          try {
            const route = navRef.current?.getCurrentRoute();
            const name = route?.name || '';
            const sensitive = ['History', 'AI', 'Appointments', 'AppointmentDetail', 'AlertDetail'].includes(name);
            void setScreenCapture(Boolean(isAuthenticated && sensitive));
          } catch {}
        }}
        onStateChange={() => {
          try {
            const route = navRef.current?.getCurrentRoute();
            const name = route?.name || '';
            const sensitive = ['History', 'AI', 'Appointments', 'AppointmentDetail', 'AlertDetail'].includes(name);
            void setScreenCapture(Boolean(isAuthenticated && sensitive));
          } catch {}
        }}
      >
        <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1976d2',
            elevation: 4,
          },
          headerTintColor: 'white',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : hasSeenOnboarding === false ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
        )}
        <Stack.Screen
          name="AlertDetail"
          component={AlertDetailScreen}
          options={{ title: 'Detalle de Alerta' }}
        />
        <Stack.Screen
          name="AppointmentDetail"
          component={AppointmentDetailScreen}
          options={{ title: 'Detalle de Cita' }}
        />
        <Stack.Screen
          name="ARTraining"
          component={ARTrainingScreen}
          options={{ title: 'Entrenamiento AR' }}
        />
        <Stack.Screen
          name="SymptomAnalyses"
          component={SymptomAnalysesScreen}
          options={{ title: 'Historial de Análisis' }}
        />
        <Stack.Screen
          name="DirectChat"
          component={DirectChatScreen}
          options={({ route }) => ({
            title: route.params?.patientName
              ? `Chat con ${route.params.patientName}`
              : 'Chat médico',
          })}
        />
        <Stack.Screen
          name="PatientAnalytics"
          component={PatientAnalyticsScreen}
          options={{ title: 'Analytics Clínicos' }}
        />
        <Stack.Screen
          name="DoctorAnalytics"
          component={DoctorAnalyticsScreen}
          options={{ title: 'Analytics Médicos' }}
        />
        <Stack.Screen
          name="Consent"
          component={ConsentScreen}
          options={{ title: 'Consentimiento Informado' }}
        />
        </Stack.Navigator>
        {privacyVisible && (
          <View style={styles.privacyOverlay}>
            <Text style={styles.privacyText}>RespiCare</Text>
          </View>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  privacyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
});
