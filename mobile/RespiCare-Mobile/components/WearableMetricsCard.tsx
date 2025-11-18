/**
 * Componente para mostrar métricas de wearables
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip, Divider } from 'react-native-paper';
import { WearableMetrics, WearableAlerts } from '../services/wearableService';
import { ThemedText } from './ThemedText';

interface WearableMetricsCardProps {
  metrics: WearableMetrics;
  alerts?: WearableAlerts;
  onViewDetails?: () => void;
}

export const WearableMetricsCard: React.FC<WearableMetricsCardProps> = ({
  metrics,
  alerts,
  onViewDetails,
}) => {
  const getHeartRateColor = (hr: number) => {
    if (hr > 100) return '#f57c00'; // Orange
    if (hr < 50) return '#d32f2f'; // Red
    return '#388e3c'; // Green
  };

  const getOxygenColor = (spO2: number) => {
    if (spO2 < 90) return '#d32f2f'; // Red
    if (spO2 < 95) return '#f57c00'; // Orange
    return '#388e3c'; // Green
  };

  const hasAlerts = alerts && alerts.alertMessages.length > 0;

  return (
    <Card style={styles.card} onPress={onViewDetails}>
      <Card.Content>
        <View style={styles.header}>
          <ThemedText style={styles.title}>💓 Monitoreo de Salud</ThemedText>
          {hasAlerts && (
            <Chip mode="flat" style={[styles.alertChip, { backgroundColor: '#ffebee' }]}>
              ⚠️ {alerts.alertMessages.length} alerta{alerts.alertMessages.length > 1 ? 's' : ''}
            </Chip>
          )}
        </View>

        <Divider style={styles.divider} />

        {/* Ritmo Cardíaco */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabel}>
            <Text style={styles.metricIcon}>💓</Text>
            <Text style={styles.metricName}>Ritmo Cardíaco</Text>
          </View>
          <View style={styles.metricValue}>
            <Text style={[styles.value, { color: getHeartRateColor(metrics.heartRate.current) }]}>
              {metrics.heartRate.current} bpm
            </Text>
            <Text style={styles.subValue}>
              En reposo: {metrics.heartRate.resting} bpm
            </Text>
          </View>
        </View>

        {/* Oxigenación */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabel}>
            <Text style={styles.metricIcon}>🫁</Text>
            <Text style={styles.metricName}>Oxigenación</Text>
          </View>
          <View style={styles.metricValue}>
            <Text style={[styles.value, { color: getOxygenColor(metrics.oxygenSaturation.current) }]}>
              {metrics.oxygenSaturation.current}%
            </Text>
            <Text style={styles.subValue}>
              Promedio: {metrics.oxygenSaturation.average.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Actividad */}
        <View style={styles.metricRow}>
          <View style={styles.metricLabel}>
            <Text style={styles.metricIcon}>🚶</Text>
            <Text style={styles.metricName}>Actividad</Text>
          </View>
          <View style={styles.metricValue}>
            <Text style={styles.value}>{metrics.activity.steps.toLocaleString()} pasos</Text>
            <Text style={styles.subValue}>
              {(metrics.activity.distance / 1000).toFixed(2)} km
            </Text>
          </View>
        </View>

        {/* Frecuencia Respiratoria */}
        {metrics.respiratoryRate.current > 0 && (
          <View style={styles.metricRow}>
            <View style={styles.metricLabel}>
              <Text style={styles.metricIcon}>🌬️</Text>
              <Text style={styles.metricName}>Respiración</Text>
            </View>
            <View style={styles.metricValue}>
              <Text style={styles.value}>
                {metrics.respiratoryRate.current} resp/min
              </Text>
              <Text style={styles.subValue}>
                Promedio: {metrics.respiratoryRate.average.toFixed(1)} resp/min
              </Text>
            </View>
          </View>
        )}

        {/* Alertas */}
        {hasAlerts && (
          <>
            <Divider style={styles.divider} />
            <View style={styles.alertsContainer}>
              {alerts.alertMessages.map((msg, idx) => (
                <Chip
                  key={idx}
                  mode="flat"
                  style={[styles.alertMessage, { backgroundColor: '#fff3e0' }]}
                  textStyle={styles.alertText}
                >
                  {msg}
                </Chip>
              ))}
            </View>
          </>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertChip: {
    height: 28,
  },
  divider: {
    marginVertical: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  metricLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metricIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  metricName: {
    fontSize: 16,
    fontWeight: '500',
  },
  metricValue: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subValue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  alertsContainer: {
    marginTop: 8,
  },
  alertMessage: {
    marginVertical: 4,
  },
  alertText: {
    fontSize: 12,
  },
});

