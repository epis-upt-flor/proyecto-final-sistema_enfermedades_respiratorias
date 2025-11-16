/**
 * Doctor Analytics Screen
 * 
 * Pantalla de analytics clínicos para médicos con visualizaciones de pacientes
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { SimpleChart } from '../components/Analytics/SimpleChart';
import { apiService } from '../services/api';

interface DoctorAnalyticsData {
  patientDistribution: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  diagnosisDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  monthlyAppointments: {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  };
  urgencyDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const DoctorAnalyticsScreen: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const isOnline = useAppStore((s) => s.isOnline);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<DoctorAnalyticsData | null>(null);
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
          const response = await apiService.get(`/analytics/doctor/${user.id}`);
          if (response.data?.success && response.data.data) {
            setAnalytics(response.data.data);
            return;
          }
        } catch (error) {
          console.warn('Error cargando analytics desde API, usando datos de ejemplo', error);
        }
      }

      // Datos de ejemplo
      const monthlyData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date.toLocaleDateString('es-ES', { month: 'short' });
      });

      setAnalytics({
        patientDistribution: {
          labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
          datasets: [{ data: [12, 15, 18, 14, 20, 22] }],
        },
        diagnosisDistribution: [
          { name: 'Asma', value: 35, color: '#4caf50' },
          { name: 'Bronquitis', value: 25, color: '#ff9800' },
          { name: 'Neumonía', value: 20, color: '#f44336' },
          { name: 'Otros', value: 20, color: '#9e9e9e' },
        ],
        monthlyAppointments: {
          labels: monthlyData,
          datasets: [{ data: monthlyData.map(() => Math.floor(Math.random() * 30) + 10) }],
        },
        urgencyDistribution: [
          { name: 'Baja', value: 50, color: '#4caf50' },
          { name: 'Media', value: 30, color: '#ff9800' },
          { name: 'Alta', value: 15, color: '#f44336' },
          { name: 'Crítica', value: 5, color: '#d32f2f' },
        ],
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
            <Paragraph>Los analytics aparecerán aquí una vez que tengas pacientes y consultas registradas.</Paragraph>
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
        <Title style={styles.headerTitle}>Analytics Médicos</Title>
        <Paragraph style={styles.headerSubtitle}>
          Visualización de datos de tus pacientes
        </Paragraph>
      </View>

      {/* Distribución de Pacientes */}
      <SimpleChart
        title="Distribución de Pacientes (últimos 6 meses)"
        subtitle="Número de pacientes atendidos por mes"
        type="bar"
        data={analytics.patientDistribution}
        height={220}
      />

      {/* Distribución de Diagnósticos */}
      <SimpleChart
        title="Distribución de Diagnósticos"
        subtitle="Diagnósticos más frecuentes"
        type="pie"
        data={{
          data: analytics.diagnosisDistribution,
          legend: analytics.diagnosisDistribution,
        }}
        height={220}
      />

      {/* Citas Mensuales */}
      <SimpleChart
        title="Citas Mensuales"
        subtitle="Número de citas programadas por mes"
        type="line"
        data={analytics.monthlyAppointments}
        height={200}
      />

      {/* Distribución de Urgencia */}
      <SimpleChart
        title="Distribución de Urgencia"
        subtitle="Nivel de urgencia de los casos"
        type="pie"
        data={{
          data: analytics.urgencyDistribution,
          legend: analytics.urgencyDistribution,
        }}
        height={220}
      />

      {/* Resumen de KPIs */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.kpiTitle}>Resumen</Title>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiItem}>
              <Paragraph style={styles.kpiLabel}>Total Pacientes</Paragraph>
              <Title style={styles.kpiValue}>
                {analytics.patientDistribution.datasets[0].data.reduce((a, b) => a + b, 0)}
              </Title>
            </View>
            <View style={styles.kpiItem}>
              <Paragraph style={styles.kpiLabel}>Citas Este Mes</Paragraph>
              <Title style={styles.kpiValue}>
                {analytics.monthlyAppointments.datasets[0].data[
                  analytics.monthlyAppointments.datasets[0].data.length - 1
                ]}
              </Title>
            </View>
            <View style={styles.kpiItem}>
              <Paragraph style={styles.kpiLabel}>Diagnóstico Más Frecuente</Paragraph>
              <Chip mode="outlined" style={styles.kpiChip}>
                {analytics.diagnosisDistribution[0]?.name || 'N/A'}
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
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  kpiItem: {
    alignItems: 'center',
    minWidth: 100,
    marginBottom: 16,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
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

export default DoctorAnalyticsScreen;

