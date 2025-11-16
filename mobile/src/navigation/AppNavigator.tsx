import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Provider as PaperProvider } from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { RootStackParamList, MainTabParamList } from '../types';
import { shallow } from 'zustand/shallow';
import { useTheme } from '../hooks/useTheme';

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
import { featureFlags } from '../config/environment';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  const unreadCount = useAppStore(
    (state) => state.notifications.filter((n) => !n.isRead).length,
    (a, b) => a === b
  );

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
            case 'Capture':
              iconName = focused ? 'plus-circle' : 'plus-circle-outline';
              break;
            case 'History':
              iconName = focused ? 'history' : 'history';
              break;
            case 'AI':
              iconName = focused ? 'robot' : 'robot-outline';
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

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
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
        {isAuthenticated ? (
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
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
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default AppNavigator;
