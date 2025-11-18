import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type Appointment = {
  _id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reason?: string;
};

export default function AppointmentsScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/me/upcoming`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener las citas');
      }

      const data = await response.json();
      setAppointments(data.data ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments().catch(() => undefined);
  }, [fetchAppointments]);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments().catch(() => undefined);
    }, [fetchAppointments])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const renderItem = ({ item }: { item: Appointment }) => {
    const startDate = new Date(item.scheduledAt);
    const endDate = new Date(startDate.getTime() + item.durationMinutes * 60 * 1000);
    return (
      <View style={styles.card}>
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
      <Text style={styles.title}>Próximas Citas</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
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
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.light.tint,
  },
  card: {
    backgroundColor: '#ffffff',
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
    color: '#0d47a1',
  },
  detail: {
    fontSize: 14,
    color: '#455a64',
  },
  status: {
    marginTop: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  status_scheduled: {
    color: '#1e88e5',
  },
  status_rescheduled: {
    color: '#fb8c00',
  },
  status_completed: {
    color: '#2e7d32',
  },
  status_cancelled: {
    color: '#c62828',
  },
  status_default: {
    color: '#546e7a',
  },
  reason: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#546e7a',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#78909c',
    textAlign: 'center',
  },
  error: {
    color: '#c62828',
    marginBottom: 12,
  },
});

