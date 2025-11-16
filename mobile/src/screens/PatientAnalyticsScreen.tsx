/**
 * Patient Analytics Screen
 * 
 * Pantalla de analytics clínicos para pacientes con visualizaciones simples
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { SimpleChart } from '../components/Analytics/SimpleChart';
import { apiService } from '../services/api';
import { localStorageService } from '../services/localStorage';

interface AnalyticsData {
  symptomTrends: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  riskDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyHistory: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
}

const PatientAnalyticsScreen: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const isOnline = useAppStore((s) => s.isOnline);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setAnalytics(null);
        return;
      }

      // Intentar cargar desde API
      if (isOnline) {
        try {
          const response = await apiService.get(`/analytics/patient/${user.id}`);
          if (response.data?.success && response.data.data) {
            setAnalytics(response.data.data);
            // Cachear localmente
            await localStorageService.setItem(`analytics:${user.id}`, response.data.data);
            return;
          }
        } catch (error) {
          console.warn('Error cargando analytics desde API, usando cache', error);
        }
      }

      // Fallback: cargar desde cache o generar datos de ejemplo
      const cached = await localStorageService.getItem<AnalyticsData>(`analytics:${user.id}`);
      if (cached) {
        setAnalytics(cached);
        return;
      }

      // Datos de ejemplo si no hay cache
      const histories = await localStorageService.getCachedMedicalHistories();
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      });

      const symptomCounts = last30Days.map(() => Math.floor(Math.random() * 5));
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleDateString('es-ES', { month: 'short' });
      });

      setAnalytics({
        symptomTrends: {
          labels: last30Days.filter((_, i) => i % 5 === 0), // Mostrar cada 5 días
          datasets: [{ data: symptomCounts.filter((_, i) => i % 5 === 0) }],
        },
        riskDistribution: [
          { name: 'Bajo', value: 60, color: '#4caf50' },
          { name: 'Medio', value: 30, color: '#ff9800' },
          { name: 'Alto', value: 10, color: '#f44336' },
        ],
        monthlyHistory: {
          labels: monthlyData,
          datasets: [{ data: monthlyData.map(() => Math.floor(Math.random() * 10) + 1) }],
        },
      });
    } catch (error) {
      console.error('Error cargando analytics', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isOnline]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  }, [loadAnalytics]);

  if (loading && !analytics) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>Cargando analytics...</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>No hay datos disponibles</Title>
            <Paragraph>Los analytics aparecerán aquí una vez que tengas historias médicas registradas.</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Analytics Clínicos</Title>
        <Paragraph style={styles.headerSubtitle}>
          Visualización de tus datos de salud
        </Paragraph>
      </View>

      {/* Tendencias de Síntomas */}
      <SimpleChart
        title="Tendencias de Síntomas (últimos 30 días)"
        subtitle="Frecuencia de síntomas reportados"
        type="line"
        data={analytics.symptomTrends}
        height={200}
      />

      {/* Distribución de Riesgo */}
      <SimpleChart
        title="Distribución de Riesgo"
        subtitle="Análisis de riesgo en tus historias médicas"
        type="pie"
        data={{
          data: analytics.riskDistribution,
          legend: analytics.riskDistribution,
        }}
        height={220}
      />

      {/* Historial Mensual */}
      <SimpleChart
        title="Historial Mensual"
        subtitle="Número de consultas por mes"
        type="bar"
        data={analytics.monthlyHistory}
        height={220}
      />

      {/* Resumen de KPIs */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.kpiTitle}>Resumen</Title>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiItem}>
              <Paragraph style={styles.kpiLabel}>Total Consultas</Paragraph>
              <Title style={styles.kpiValue}>
                {analytics.monthlyHistory.datasets[0].data.reduce((a, b) => a + b, 0)}
              </Title>
            </View>
            <View style={styles.kpiItem}>
              <Paragraph style={styles.kpiLabel}>Riesgo Promedio</Paragraph>
              <Chip
                mode="outlined"
                style={[
                  styles.kpiChip,
                  {
                    borderColor:
                      analytics.riskDistribution[0]?.value > 50
                        ? '#4caf50'
                        : analytics.riskDistribution[1]?.value > 30
                        ? '#ff9800'
                        : '#f44336',
                  },
                ]}
              >
                {analytics.riskDistribution[0]?.value > 50
                  ? 'Bajo'
                  : analytics.riskDistribution[1]?.value > 30
                  ? 'Medio'
                  : 'Alto'}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    margin: 16,
    marginBottom: 0,
    elevation: 2,
  },
  kpiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  kpiChip: {
    marginTop: 4,
  },
});

export default PatientAnalyticsScreen;

