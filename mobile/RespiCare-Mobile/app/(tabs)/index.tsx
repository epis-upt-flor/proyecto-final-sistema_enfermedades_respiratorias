import React from 'react';
import { StyleSheet, ScrollView, RefreshControl, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Card, Title, Paragraph, Button, FAB, Provider, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useMedicalHistoryStore } from '@/stores/medicalHistoryStore';

export default function HomeScreen() {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuthStore();
  const { medicalHistories, fetchMedicalHistories } = useMedicalHistoryStore();

  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Simular datos del dashboard
      return {
        totalHistories: medicalHistories.length,
        recentSymptoms: medicalHistories.slice(0, 3),
        alerts: medicalHistories.filter(h => h.syncStatus === 'error').length
      };
    },
    enabled: isAuthenticated
  });

  const onRefresh = () => {
    refetch();
    fetchMedicalHistories();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>RespiCare Tacna</ThemedText>
        <ThemedText style={styles.subtitle}>Sistema de Gestión de Enfermedades Respiratorias</ThemedText>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={{ color: '#ffffff' }}>Bienvenido</Title>
            <Paragraph style={{ color: '#b1bbc4' }}>Inicia sesión para acceder a tu historial médico y análisis de síntomas.</Paragraph>
            <Button mode="contained" onPress={() => {}} style={styles.button}>
              Iniciar Sesión
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <Provider theme={theme}>
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          }
        >
          <ThemedText style={styles.title}>Dashboard</ThemedText>
          <ThemedText style={styles.subtitle}>Hola, {user?.name}</ThemedText>

          {/* Resumen de Salud */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={{ color: '#ffffff' }}>Resumen de Salud</Title>
              <Paragraph style={{ color: '#b1bbc4' }}>Total de historias: {dashboardData?.totalHistories || 0}</Paragraph>
              <Paragraph style={{ color: '#b1bbc4' }}>Alertas pendientes: {dashboardData?.alerts || 0}</Paragraph>
            </Card.Content>
          </Card>

          {/* Síntomas Recientes */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={{ color: '#ffffff' }}>Síntomas Recientes</Title>
              {dashboardData?.recentSymptoms?.map((history, index) => (
                <Paragraph key={index} style={{ color: '#b1bbc4' }}>
                  {history.symptoms?.map(s => s.name).join(', ')}
                </Paragraph>
              )) || <Paragraph style={{ color: '#b1bbc4' }}>No hay síntomas recientes</Paragraph>}
            </Card.Content>
          </Card>

          {/* Acciones Rápidas */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={{ color: '#ffffff' }}>Acciones Rápidas</Title>
              <Button 
                mode="outlined" 
                onPress={() => {}} 
                style={styles.actionButton}
                icon="plus"
              >
                Nueva Historia
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => {}} 
                style={styles.actionButton}
                icon="chart-line"
              >
                Análisis de Síntomas
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* FAB para acciones principales */}
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {}}
          label="Nueva Historia"
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0e1621', // Fondo estilo Telegram
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: '#b1bbc4',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#17212b', // Fondo de cards estilo Telegram
    borderRadius: 12,
  },
  button: {
    marginTop: 16,
    backgroundColor: '#3390ec', // Azul estilo Telegram
  },
  actionButton: {
    marginVertical: 4,
    borderColor: '#3390ec',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3390ec',
  },
});