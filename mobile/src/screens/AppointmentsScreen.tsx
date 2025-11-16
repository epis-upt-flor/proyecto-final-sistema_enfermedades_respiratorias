import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';
import { telemedicineService } from '../services/telemedicineService';
import { useAppStore } from '../store/useAppStore';
import { AppointmentDTO } from '../types';
import { useNavigation } from '@react-navigation/native';

const AppointmentsScreen: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const addNotification = useAppStore((s) => s.addNotification);
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);

  const load = useCallback(async () => {
    try {
      if (!user?.id) return;
      const list = await telemedicineService.getAppointments(user.id);
      setAppointments(list);
    } catch {
      setAppointments([]);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
    // Recordatorios in-app: notificar citas en <60 minutos
    const now = Date.now();
    (appointments || [])
      .filter((a) => a.scheduledAt)
      .forEach((a) => {
        const when = new Date(a.scheduledAt as any).getTime();
        const ms = when - now;
        if (ms > 0 && ms <= 60 * 60 * 1000) {
          addNotification({
            id: `appt_${a._id}`,
            title: 'Recordatorio de cita',
            message: `Tienes una cita a las ${new Date(when).toLocaleTimeString()}`,
            type: 'reminder',
            isRead: false,
          });
        }
      });
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const upcoming = useMemo(
    () => appointments.filter((a) => a.scheduledAt && new Date(a.scheduledAt as any).getTime() >= Date.now())
      .sort((a, b) => new Date(a.scheduledAt as any).getTime() - new Date(b.scheduledAt as any).getTime()),
    [appointments]
  );
  const past = useMemo(
    () => appointments.filter((a) => a.scheduledAt && new Date(a.scheduledAt as any).getTime() < Date.now())
      .sort((a, b) => new Date(b.scheduledAt as any).getTime() - new Date(a.scheduledAt as any).getTime()),
    [appointments]
  );

  const createMockAppointment = async () => {
    if (!user) return;
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const appt = await telemedicineService.createAppointment({
      patientId: user.id,
      doctorId: 'doctor_demo',
      createdBy: user.id,
      scheduledAt: inTwoHours as any,
      durationMinutes: 30,
      status: 'scheduled',
      reason: 'Consulta de prueba',
      createdAt: new Date().toISOString() as any,
      updatedAt: new Date().toISOString() as any,
    } as any);
    if (appt) {
      await load();
      Alert.alert('Cita creada', 'Se creó una cita de demostración en 2 horas');
    } else {
      Alert.alert('Error', 'No se pudo crear la cita');
    }
  };

  const confirmCancel = async (id: string) => {
    Alert.alert('Cancelar cita', '¿Deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: async () => {
        const ok = await telemedicineService.cancelAppointment(id, 'cancel by user');
        ok ? (await load(), Alert.alert('Cita cancelada')) : Alert.alert('Error', 'No se pudo cancelar');
      } },
    ]);
  };

  const rescheduleAppointment = async (id: string) => {
    Alert.alert(
      'Reprogramar cita',
      'Selecciona una nueva hora',
      [
        { text: '+1 hora', onPress: async () => {
          const ok = await telemedicineService.rescheduleAppointment(id, new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString());
          ok ? (await load(), Alert.alert('Cita reprogramada', 'Movida +1 hora')) : Alert.alert('Error', 'No se pudo reprogramar');
        }},
        { text: '+4 horas', onPress: async () => {
          const ok = await telemedicineService.rescheduleAppointment(id, new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString());
          ok ? (await load(), Alert.alert('Cita reprogramada', 'Movida +4 horas')) : Alert.alert('Error', 'No se pudo reprogramar');
        }},
        { text: 'Mañana', onPress: async () => {
          const ok = await telemedicineService.rescheduleAppointment(id, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
          ok ? (await load(), Alert.alert('Cita reprogramada', 'Movida a mañana')) : Alert.alert('Error', 'No se pudo reprogramar');
        }},
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={upcoming}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
            <Title>Próximas citas</Title>
            <Button mode="contained" style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={createMockAppointment}>
              Crear cita demo
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id })}>
            <Card.Content>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Title style={styles.title}>Cita médica</Title>
                  <Paragraph style={styles.subtitle}>
                    {item.scheduledAt ? new Date(item.scheduledAt as any).toLocaleString() : 'Por programar'}
                  </Paragraph>
                </View>
                <Chip mode="outlined">{item.status}</Chip>
              </View>
              <View style={styles.actions}>
                <Button mode="outlined" onPress={() => rescheduleAppointment(item._id)}>Reprogramar</Button>
                <Button mode="text" onPress={() => confirmCancel(item._id)} textColor="#f44336">Cancelar</Button>
              </View>
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={
          <View style={{ paddingTop: 16 }}>
            <Title>Citas pasadas</Title>
            {past.map((item) => (
              <Card key={item._id} style={styles.card}>
                <Card.Content>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Title style={styles.title}>Cita médica</Title>
                      <Paragraph style={styles.subtitle}>
                        {item.scheduledAt ? new Date(item.scheduledAt as any).toLocaleString() : 'Sin fecha'}
                      </Paragraph>
                    </View>
                    <Chip mode="outlined">{item.status}</Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        }
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
  actions: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
});

export default AppointmentsScreen;


