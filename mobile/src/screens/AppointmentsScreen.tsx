import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { telemedicineService } from '../services/telemedicineService';
import { useAppStore } from '../store/useAppStore';

const AppointmentsScreen: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<Array<{ id: string; scheduledAt?: string; status: string }>>([]);

  const load = useCallback(async () => {
    try {
      if (!user?.id) return;
      const calls = await telemedicineService.getPatientCalls(user.id);
      setAppointments(
        (calls || []).map((c) => ({ id: c.id, scheduledAt: c.scheduledAt, status: c.status }))
      );
    } catch {
      setAppointments([]);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Title style={styles.title}>Cita médica</Title>
                  <Paragraph style={styles.subtitle}>
                    {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'Por programar'}
                  </Paragraph>
                </View>
                <Chip mode="outlined">{item.status}</Chip>
              </View>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  card: { marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#666' },
});

export default AppointmentsScreen;


