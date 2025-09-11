import React from 'react';
import { StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Card, Title, Paragraph, Button, FAB, Portal, Provider } from 'react-native-paper';
import { useTheme } from 'react-native-paper';
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
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>RespiCare Tacna</ThemedText>
        <ThemedText style={styles.subtitle}>Sistema de Gestión de Enfermedades Respiratorias</ThemedText>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Bienvenido</Title>
            <Paragraph>Inicia sesión para acceder a tu historial médico y análisis de síntomas.</Paragraph>
            <Button mode="contained" onPress={() => {}} style={styles.button}>
              Iniciar Sesión
            </Button>
          </Card.Content>
        </Card>
      </ThemedView>
    );
  }

  return (
    <Provider theme={theme}>
      <ThemedView style={styles.container}>
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
              <Title>Resumen de Salud</Title>
              <Paragraph>Total de historias: {dashboardData?.totalHistories || 0}</Paragraph>
              <Paragraph>Alertas pendientes: {dashboardData?.alerts || 0}</Paragraph>
            </Card.Content>
          </Card>

          {/* Síntomas Recientes */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Síntomas Recientes</Title>
              {dashboardData?.recentSymptoms?.map((history, index) => (
                <Paragraph key={index}>
                  {history.symptoms?.map(s => s.name).join(', ')}
                </Paragraph>
              )) || <Paragraph>No hay síntomas recientes</Paragraph>}
            </Card.Content>
          </Card>

          {/* Acciones Rápidas */}
          <Card style={styles.card}>
            <Card.Content>
              <Title>Acciones Rápidas</Title>
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
      </ThemedView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    opacity: 0.7,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  button: {
    marginTop: 16,
  },
  actionButton: {
    marginVertical: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});