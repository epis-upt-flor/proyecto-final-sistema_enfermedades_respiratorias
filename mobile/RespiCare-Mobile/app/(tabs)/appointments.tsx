import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useAppointmentStore } from '@/stores/appointmentStore';

export default function AppointmentsScreen() {
  const { 
    appointments, 
    isLoading: loading, 
    isOffline,
    fetchAppointments,
    checkConnectivity 
  } = useAppointmentStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments().catch((err) => {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    });
  }, [fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      checkConnectivity().catch(() => undefined);
      fetchAppointments().catch((err) => {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      });
    }, [fetchAppointments, checkConnectivity])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await checkConnectivity();
      await fetchAppointments();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRefreshing(false);
    }
  }, [fetchAppointments, checkConnectivity]);

  const renderItem = ({ item }: { item: typeof appointments[0] }) => {
    const startDate = new Date(item.scheduledAt);
    const endDate = new Date(startDate.getTime() + item.durationMinutes * 60 * 1000);
    return (
      <View style={styles.card}>
        {item.syncStatus === 'pending' && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>⏳ Pendiente de sincronización</Text>
          </View>
        )}
        {item.syncStatus === 'error' && (
          <View style={[styles.offlineBadge, { backgroundColor: '#f44336' }]}>
            <Text style={styles.offlineText}>❌ Error al sincronizar</Text>
          </View>
        )}
        <Text style={styles.date}>
          {startDate.toLocaleDateString()} {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
          {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.detail}>Doctor: {item.doctorId}</Text>
        <Text style={styles.detail}>Paciente: {item.patientId}</Text>
        <Text style={[
          styles.status, 
          (styles as Record<string, any>)[`status_${item.status}`] || styles.status_default
        ]}>
          {item.status.toUpperCase()}
        </Text>
        {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Próximas Citas</Text>
        {isOffline && (
          <View style={styles.offlineIndicator}>
            <Text style={styles.offlineIndicatorText}>📴 Modo Offline</Text>
          </View>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={appointments.length === 0 ? styles.emptyContainer : undefined}
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>No tienes citas programadas.</Text> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0e1621', // Fondo estilo Telegram
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#ffffff', // Texto blanco
  },
  card: {
    backgroundColor: '#17212b', // Fondo de cards estilo Telegram
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#3390ec', // Azul estilo Telegram
  },
  detail: {
    fontSize: 14,
    color: '#b1bbc4', // Texto secundario
  },
  status: {
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  status_scheduled: {
    color: '#3390ec', // Azul estilo Telegram
  },
  status_rescheduled: {
    color: '#ff9800',
  },
  status_completed: {
    color: '#4caf50',
  },
  status_cancelled: {
    color: '#f44336',
  },
  status_default: {
    color: '#708499',
  },
  reason: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#b1bbc4',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#708499',
    textAlign: 'center',
  },
  error: {
    color: '#f44336',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  offlineIndicator: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  offlineIndicatorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  offlineBadge: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
});

