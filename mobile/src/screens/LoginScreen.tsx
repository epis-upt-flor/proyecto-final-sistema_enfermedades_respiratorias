import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  Surface,
  ActivityIndicator,
} from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { User } from '../types';

const LoginScreen: React.FC = () => {
  const { setUser } = useAppStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      // Simular autenticación
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear usuario simulado
      const mockUser: User = {
        id: '1',
        name: 'Dr. Juan Pérez',
        email: formData.email,
        role: 'doctor',
        avatar: 'https://via.placeholder.com/100',
      };

      setUser(mockUser);
      
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const mockUser: User = {
      id: '1',
      name: 'Dr. Juan Pérez',
      email: 'demo@respicare.com',
      role: 'doctor',
      avatar: 'https://via.placeholder.com/100',
    };

    setUser(mockUser);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Surface style={styles.logoContainer}>
          <Title style={styles.logo}>🏥</Title>
          <Title style={styles.appName}>RespiCare Mobile</Title>
          <Paragraph style={styles.subtitle}>
            Sistema de Gestión de Enfermedades Respiratorias
          </Paragraph>
        </Surface>

        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.loginTitle}>Iniciar Sesión</Title>
            
            <TextInput
              label="Correo Electrónico"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
            />

            <TextInput
              label="Contraseña"
              value={formData.password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>

            <Button
              mode="outlined"
              onPress={handleDemoLogin}
              style={styles.demoButton}
              contentStyle={styles.demoButtonContent}
            >
              🚀 Modo Demo
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Title style={styles.infoTitle}>Características de la App</Title>
            <Paragraph>📱 Captura de datos médicos en campo</Paragraph>
            <Paragraph>🔔 Notificaciones inteligentes</Paragraph>
            <Paragraph>📱 Funcionalidad offline completa</Paragraph>
            <Paragraph>🤖 Análisis con IA básica</Paragraph>
            <Paragraph>🔄 Sincronización automática</Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: 'white',
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loginCard: {
    marginBottom: 24,
    elevation: 4,
  },
  loginTitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#1976d2',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  demoButton: {
    borderColor: '#1976d2',
  },
  demoButtonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    elevation: 2,
  },
  infoTitle: {
    color: '#1976d2',
    marginBottom: 16,
  },
});

export default LoginScreen;
