/**
 * Pantalla de Monitoreo de Wearables
 * 
 * Muestra datos de salud sincronizados con Apple HealthKit o Google Fit
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { wearableService, WearableMetrics, WearableAlerts } from '@/services/wearableService';
import { WearableMetricsCard } from '@/components/WearableMetricsCard';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';

export default function WearablesScreen() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<WearableMetrics | null>(null);
  const [alerts, setAlerts] = useState<WearableAlerts | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const loadMetrics = React.useCallback(async () => {
    try {
      // Verificar conectividad
      const netInfo = await NetInfo.fetch();
      const offline = !netInfo.isConnected || !netInfo.isInternetReachable;
      setIsOffline(offline);
      
      const currentMetrics = await wearableService.getMetrics();
      if (currentMetrics) {
        setMetrics(currentMetrics);
        const currentAlerts = await wearableService.checkAlerts(currentMetrics);
        setAlerts(currentAlerts);
      }
      
      // Si hay conexión, sincronizar datos pendientes
      if (!offline) {
        await wearableService.syncToBackend();
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, []);

  const initializeWearables = React.useCallback(async () => {
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
  }, [loadMetrics]);

  useEffect(() => {
    initializeWearables();
    return () => {
      // Limpiar al desmontar
      wearableService.stopSync();
    };
  }, [initializeWearables]);

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
      <ThemedView style={{ flex: 1, backgroundColor: '#0f172a' }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={{
            backgroundColor: '#1e293b',
            borderRadius: 24,
            padding: 24,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#f8fafc', marginBottom: 12 }}>
              💓 Monitoreo de Salud
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20, lineHeight: 20 }}>
              Conecta tu dispositivo wearable (Apple Watch, Fitbit, etc.) o permite el acceso
              a los datos de salud de tu teléfono para monitorear:
            </ThemedText>
            <View style={{ gap: 8, marginBottom: 24 }}>
              <ThemedText style={{ fontSize: 14, color: '#f8fafc' }}>• Ritmo cardíaco</ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#f8fafc' }}>• Oxigenación (SpO2)</ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#f8fafc' }}>• Actividad física</ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#f8fafc' }}>• Frecuencia respiratoria</ThemedText>
              <ThemedText style={{ fontSize: 14, color: '#f8fafc' }}>• Horas de sueño</ThemedText>
            </View>
            <TouchableOpacity
              onPress={handleRequestPermissions}
              style={{
                backgroundColor: '#14b8a6',
                borderRadius: 24,
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#14b8a6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <ThemedText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
                Conectar con HealthKit / Google Fit
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#0f172a' }]}>
      {isOffline && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineIndicatorText}>📴 Modo Offline - Datos locales</Text>
        </View>
      )}
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
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 24,
              padding: 20,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 16 }}>
                📊 Resumen del Día
              </ThemedText>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <ThemedText style={{ fontSize: 14, color: '#94a3b8' }}>Rango cardíaco:</ThemedText>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc' }}>
                  {metrics.heartRate.min} - {metrics.heartRate.max} bpm
                </ThemedText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <ThemedText style={{ fontSize: 14, color: '#94a3b8' }}>Oxigenación mínima:</ThemedText>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: metrics.oxygenSaturation.min < 95 ? '#f59e0b' : '#10b981' }}>
                  {metrics.oxygenSaturation.min.toFixed(1)}%
                </ThemedText>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <ThemedText style={{ fontSize: 14, color: '#94a3b8' }}>Actividad total:</ThemedText>
                <ThemedText style={{ fontSize: 16, fontWeight: 'bold', color: '#f8fafc' }}>
                  {metrics.activity.steps.toLocaleString()} pasos
                </ThemedText>
              </View>
            </View>

            {/* Recomendaciones */}
            <View style={{
              backgroundColor: '#1e293b',
              borderRadius: 24,
              padding: 20,
              marginBottom: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 16 }}>
                💡 Recomendaciones
              </ThemedText>
              {alerts && alerts.alertMessages.length > 0 ? (
                <View style={{ gap: 8 }}>
                  {alerts.alertMessages.map((msg, idx) => (
                    <View key={idx} style={{
                      backgroundColor: 'rgba(20, 184, 166, 0.2)',
                      borderRadius: 16,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(20, 184, 166, 0.3)',
                    }}>
                      <ThemedText style={{ fontSize: 14, color: '#f8fafc' }}>
                        {msg}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              ) : (
                <ThemedText style={{ fontSize: 14, color: '#94a3b8', lineHeight: 20 }}>
                  ✅ Tus métricas de salud están dentro de rangos normales.
                  Continúa monitoreando tu salud regularmente.
                </ThemedText>
              )}
            </View>
          </>
        ) : (
          <View style={{
            backgroundColor: '#1e293b',
            borderRadius: 24,
            padding: 24,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            alignItems: 'center',
          }}>
            <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: '#f8fafc', marginBottom: 12, textAlign: 'center' }}>
              No hay datos disponibles
            </ThemedText>
            <ThemedText style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, textAlign: 'center', lineHeight: 20 }}>
              Asegúrate de que tu dispositivo wearable esté conectado y sincronizado.
            </ThemedText>
            <TouchableOpacity
              onPress={handleSync}
              style={{
                borderWidth: 2,
                borderColor: '#14b8a6',
                borderRadius: 24,
                paddingVertical: 14,
                paddingHorizontal: 32,
              }}
            >
              <ThemedText style={{ color: '#14b8a6', fontSize: 16, fontWeight: '600' }}>
                Sincronizar ahora
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark background moderno
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
    color: '#94a3b8',
  },
  card: {
    margin: 16,
    elevation: 4,
    backgroundColor: '#1e293b', // Slate 800
    borderRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#ffffff',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
    color: '#94a3b8',
  },
  featuresList: {
    marginBottom: 24,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 24,
    color: '#94a3b8',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#14b8a6', // Teal primary
    borderRadius: 24,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#94a3b8', // Texto secundario estilo Telegram
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recommendationChip: {
    marginVertical: 4,
    backgroundColor: '#fff3e0',
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#94a3b8', // Slate 400
  },
});

