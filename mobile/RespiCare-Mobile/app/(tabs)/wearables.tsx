/**
 * Pantalla de Monitoreo de Wearables
 * 
 * Muestra datos de salud sincronizados con Apple HealthKit o Google Fit
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Button, Text, ActivityIndicator, Chip } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { wearableService, WearableMetrics, WearableAlerts } from '@/services/wearableService';
import { WearableMetricsCard } from '@/components/WearableMetricsCard';
import Toast from 'react-native-toast-message';

export default function WearablesScreen() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<WearableMetrics | null>(null);
  const [alerts, setAlerts] = useState<WearableAlerts | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeWearables();
    return () => {
      // Limpiar al desmontar
      wearableService.stopSync();
    };
  }, []);

  const initializeWearables = async () => {
    try {
      setIsLoading(true);
      const authorized = await wearableService.initialize();
      setIsAuthorized(authorized);

      if (authorized) {
        await loadMetrics();
        // Iniciar sincronización automática cada 15 minutos
        wearableService.startSync(15);
      }
    } catch (error) {
      console.error('Error initializing wearables:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo inicializar el servicio de wearables',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const currentMetrics = await wearableService.getMetrics();
      if (currentMetrics) {
        setMetrics(currentMetrics);
        const currentAlerts = await wearableService.checkAlerts(currentMetrics);
        setAlerts(currentAlerts);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleRequestPermissions = async () => {
    try {
      setIsLoading(true);
      const authorized = await wearableService.requestPermissions();
      setIsAuthorized(authorized);

      if (authorized) {
        await loadMetrics();
        wearableService.startSync(15);
        Toast.show({
          type: 'success',
          text1: 'Permisos otorgados',
          text2: 'Ahora puedes ver tus datos de salud',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Permisos denegados',
          text2: 'Necesitas otorgar permisos para acceder a datos de salud',
        });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron solicitar los permisos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setRefreshing(true);
      await wearableService.syncToBackend();
      await loadMetrics();
      Toast.show({
        type: 'success',
        text1: 'Sincronizado',
        text2: 'Datos actualizados correctamente',
      });
    } catch (error) {
      console.error('Error syncing:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudo sincronizar los datos',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = () => {
    // Navegar a pantalla de detalles
    Toast.show({
      type: 'info',
      text1: 'Próximamente',
      text2: 'Vista detallada de métricas en desarrollo',
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Cargando datos de salud...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!isAuthorized) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Card style={styles.card}>
            <Card.Content>
              <ThemedText style={styles.title}>💓 Monitoreo de Salud</ThemedText>
              <ThemedText style={styles.description}>
                Conecta tu dispositivo wearable (Apple Watch, Fitbit, etc.) o permite el acceso
                a los datos de salud de tu teléfono para monitorear:
              </ThemedText>
              <View style={styles.featuresList}>
                <Text style={styles.feature}>• Ritmo cardíaco</Text>
                <Text style={styles.feature}>• Oxigenación (SpO2)</Text>
                <Text style={styles.feature}>• Actividad física</Text>
                <Text style={styles.feature}>• Frecuencia respiratoria</Text>
                <Text style={styles.feature}>• Horas de sueño</Text>
              </View>
              <Button
                mode="contained"
                onPress={handleRequestPermissions}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Conectar con HealthKit / Google Fit
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleSync} />
        }
      >
        {metrics ? (
          <>
            <WearableMetricsCard
              metrics={metrics}
              alerts={alerts || undefined}
              onViewDetails={handleViewDetails}
            />

            {/* Información adicional */}
            <Card style={styles.card}>
              <Card.Content>
                <ThemedText style={styles.sectionTitle}>📊 Resumen del Día</ThemedText>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Rango cardíaco:</Text>
                  <Text style={styles.summaryValue}>
                    {metrics.heartRate.min} - {metrics.heartRate.max} bpm
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Oxigenación mínima:</Text>
                  <Text style={[styles.summaryValue, { color: metrics.oxygenSaturation.min < 95 ? '#f57c00' : '#388e3c' }]}>
                    {metrics.oxygenSaturation.min.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Actividad total:</Text>
                  <Text style={styles.summaryValue}>
                    {metrics.activity.steps.toLocaleString()} pasos
                  </Text>
                </View>
              </Card.Content>
            </Card>

            {/* Recomendaciones */}
            <Card style={styles.card}>
              <Card.Content>
                <ThemedText style={styles.sectionTitle}>💡 Recomendaciones</ThemedText>
                {alerts && alerts.alertMessages.length > 0 ? (
                  <View>
                    {alerts.alertMessages.map((msg, idx) => (
                      <Chip key={idx} mode="flat" style={styles.recommendationChip}>
                        {msg}
                      </Chip>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.recommendationText}>
                    ✅ Tus métricas de salud están dentro de rangos normales.
                    Continúa monitoreando tu salud regularmente.
                  </Text>
                )}
              </Card.Content>
            </Card>
          </>
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <ThemedText style={styles.title}>No hay datos disponibles</ThemedText>
              <ThemedText style={styles.description}>
                Asegúrate de que tu dispositivo wearable esté conectado y sincronizado.
              </ThemedText>
              <Button mode="outlined" onPress={handleSync} style={styles.button}>
                Sincronizar ahora
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
  },
  featuresList: {
    marginBottom: 24,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  recommendationChip: {
    marginVertical: 4,
    backgroundColor: '#fff3e0',
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
});

