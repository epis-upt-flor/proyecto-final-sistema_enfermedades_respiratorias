import React, { useCallback, useEffect, useMemo, useState, useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert, Animated, Easing, Modal, Text, Platform } from 'react-native';
import { Card, Title, Paragraph, Chip, Button, Snackbar } from 'react-native-paper';
import { telemedicineService } from '../services/telemedicineService';
import { useAppStore } from '../store/useAppStore';
import { AppointmentDTO } from '../types';
import { useNavigation } from '@react-navigation/native';
import { localStorageService } from '../services/localStorage';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { analyticsService } from '../services/analyticsService';

const AppointmentsScreen: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const isOnline = useAppStore((s) => s.isOnline);
  const addNotification = useAppStore((s) => s.addNotification);
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentDTO[]>([]);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const actionScale = useRef(new Animated.Value(1)).current;
  const actionScale2 = useRef(new Animated.Value(1)).current;
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerApptId, setPickerApptId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 60 * 60 * 1000));

  const smallPressIn = (anim: Animated.Value) => {
    Animated.timing(anim, { toValue: 0.96, duration: 90, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
  };
  const smallPressOut = (anim: Animated.Value) => {
    Animated.timing(anim, { toValue: 1, duration: 120, useNativeDriver: true, easing: Easing.out(Easing.quad) }).start();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        !isOnline ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
            <Icon name="wifi-off" size={16} color="#f44336" />
            <Paragraph style={{ color: '#f44336', marginLeft: 6, marginBottom: 0 }}>Offline</Paragraph>
          </View>
        ) : null
      ),
    });
  }, [isOnline, navigation]);

  const load = useCallback(async () => {
    try {
      if (!user?.id) return;
      const list = await telemedicineService.getAppointments(user.id);
      const cache = await localStorageService.getCachedAppointments<AppointmentDTO>();
      setAppointments(list && list.length ? list : cache);
    } catch {
      const cache = await localStorageService.getCachedAppointments<AppointmentDTO>();
      setAppointments(cache);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
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

  const pendingCount = useMemo(() => appointments.filter((a: any) => a.syncStatus === 'pending' || (a._id || '').startsWith('local_')).length, [appointments]);
  const errorCount = useMemo(() => appointments.filter((a: any) => a.syncStatus === 'error').length, [appointments]);

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
    analyticsService.logEvent('appointment.create_click', { screen: 'Appointments' });
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const ok = await localStorageService.createAppointment({
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
    if (ok) {
      analyticsService.logEvent('appointment.created', { screen: 'Appointments', offline: !(await NetInfo.fetch()).isConnected });
      await load();
      Alert.alert('Cita creada', 'Se creó una cita de demostración en 2 horas');
    } else {
      analyticsService.logEvent('appointment.create_error', { screen: 'Appointments' });
      Alert.alert('Error', 'No se pudo crear la cita');
    }
  };

  const confirmCancel = async (id: string) => {
    const isOnline = (await NetInfo.fetch()).isConnected ?? false;
    Alert.alert('Cancelar cita', '¿Deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: async () => {
        const ok = await localStorageService.cancelAppointment(id, 'cancel by user');
        if (ok) {
          analyticsService.logEvent('appointment.cancel', { screen: 'Appointments', offline: !isOnline });
          await load();
          if (!isOnline) setSnackbar({ visible: true, message: 'Se encoló la cancelación; se sincronizará al volver online.' });
        } else {
          Alert.alert('Error', 'No se pudo cancelar');
        }
      } },
    ]);
  };

  const rescheduleAppointment = async (id: string) => {
    const isOnline = (await NetInfo.fetch()).isConnected ?? false;
    try {
      // Intentar DateTimePicker nativo si está disponible (instalación opcional)
      // @ts-ignore - dynamic require opcional
      const dt = require('@react-native-community/datetimepicker');
      if (dt?.DateTimePickerAndroid && Platform.OS === 'android') {
        dt.DateTimePickerAndroid.open({
          value: new Date(Date.now() + 60 * 60 * 1000),
          onChange: async (_: any, date?: Date) => {
            if (!date) return;
            const ok = await localStorageService.rescheduleAppointment(id, date.toISOString());
            if (ok) {
              analyticsService.logEvent('appointment.reschedule', { screen: 'Appointments', option: 'native_picker', offline: !isOnline });
              await load();
              !isOnline && setSnackbar({ visible: true, message: 'Se encoló la actualización; se sincronizará al volver online.' });
            } else {
              Alert.alert('Error', 'No se pudo reprogramar');
            }
          },
          mode: 'datetime',
          is24Hour: true,
        });
        return;
      }
    } catch {}
    // Fallback: modal selector simple
    setPickerApptId(id);
    setSelectedDate(new Date(Date.now() + 60 * 60 * 1000));
    setPickerVisible(true);
  };

  const retrySync = useCallback(async () => {
    const t0 = Date.now();
    await localStorageService.retrySyncNow();
    analyticsService.logTiming('appointments.retry_sync_ms', Date.now() - t0);
    setSnackbar({ visible: true, message: 'Reintento lanzado en segundo plano.' });
    await load();
  }, [load]);

  const getChipColor = (a: any) => {
    if (a.syncStatus === 'error') return '#f44336';
    if (a.syncStatus === 'pending' || (a._id || '').startsWith('local_')) return '#ff9800';
    return a.status === 'cancelled' ? '#f44336' : '#1976d2';
  };

  const getChipText = (a: any) => {
    if (a.syncStatus === 'error') return 'Error';
    if (a.syncStatus === 'pending' || (a._id || '').startsWith('local_')) return 'Pendiente';
    if (a.status === 'cancelled') return 'Cancelada';
    return 'Programada';
  };

  return (
    <View style={styles.container}>
      {(pendingCount > 0 || errorCount > 0) && (
        <Card style={styles.banner}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Paragraph>
                {pendingCount} pendientes · {errorCount} con error
              </Paragraph>
              <Button mode="outlined" onPress={retrySync} icon="refresh">Reintentar</Button>
            </View>
          </Card.Content>
        </Card>
      )}
      <FlatList
        data={upcoming}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        getItemLayout={(_, index) => ({
          length: 130,
          offset: 130 * index,
          index,
        })}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
            <Title>Próximas citas</Title>
            <Button mode="contained" style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={createMockAppointment}>
              Crear cita demo
            </Button>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id, fromError: (item as any).syncStatus === 'error' })}>
            <Card.Content>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Title style={styles.title}>Cita médica</Title>
                  <Paragraph style={styles.subtitle}>
                    {item.scheduledAt ? new Date(item.scheduledAt as any).toLocaleString() : 'Por programar'}
                  </Paragraph>
                </View>
                <Chip mode="outlined" style={{ borderColor: getChipColor(item) }} textStyle={{ color: getChipColor(item) }}>
                  {getChipText(item)}
                </Chip>
              </View>
              <View style={styles.actions}>
                <Animated.View style={{ transform: [{ scale: actionScale }] }} accessible accessibilityRole="button" accessibilityLabel="Reprogramar cita" testID={`btn-reschedule-${item._id}`}>
                  <Button
                    mode="outlined"
                    onPress={async () => { try { (await import('../services/hapticsService')).hapticsService.selection(); } catch {} ; rescheduleAppointment(item._id); }}
                    onPressIn={() => smallPressIn(actionScale)}
                    onPressOut={() => smallPressOut(actionScale)}
                  >
                    Reprogramar
                  </Button>
                </Animated.View>
                <Animated.View style={{ transform: [{ scale: actionScale2 }] }} accessible accessibilityRole="button" accessibilityLabel="Cancelar cita" testID={`btn-cancel-${item._id}`}>
                  <Button
                    mode="text"
                    onPress={async () => { try { (await import('../services/hapticsService')).hapticsService.impact('light'); } catch {} ; confirmCancel(item._id); }}
                    onPressIn={() => smallPressIn(actionScale2)}
                    onPressOut={() => smallPressOut(actionScale2)}
                    textColor="#f44336"
                  >
                    Cancelar
                  </Button>
                </Animated.View>
              </View>
              {item.syncStatus === 'error' && (
                <View style={{ marginTop: 8 }}>
                  <Paragraph style={{ color: '#f44336', marginBottom: 8 }}>
                    No se pudo sincronizar esta cita. Toca “Reintentar” para volver a intentar o edita la cita para corregirla.
                  </Paragraph>
                  <Button mode="outlined" onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id, fromError: true })}>
                    Editar
                  </Button>
                </View>
              )}
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
                    <Chip mode="outlined" style={{ borderColor: getChipColor(item) }} textStyle={{ color: getChipColor(item) }}>
                      {getChipText(item)}
                    </Chip>
                  </View>
                  {item.syncStatus === 'error' && (
                    <View style={{ marginTop: 8 }}>
                      <Paragraph style={{ color: '#f44336', marginBottom: 8 }}>
                        No se pudo sincronizar esta cita. Usa “Reintentar” o edítala para corregirla.
                      </Paragraph>
                      <Button mode="outlined" onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item._id, fromError: true })}>
                        Editar
                      </Button>
                    </View>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        }
      />

      {/* Modal selector de fecha/hora (fallback si no hay nativo) */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
            <Title>Seleccionar fecha y hora</Title>
            <Paragraph style={{ marginBottom: 12 }}>
              {selectedDate.toLocaleString()}
            </Paragraph>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
              <Button mode="outlined" onPress={() => setSelectedDate(new Date(selectedDate.getTime() - 60 * 60 * 1000))}>-1h</Button>
              <Button mode="outlined" onPress={() => setSelectedDate(new Date(selectedDate.getTime() + 60 * 60 * 1000))}>+1h</Button>
              <Button mode="outlined" onPress={() => setSelectedDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}>Mañana</Button>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Button onPress={() => setPickerVisible(false)}>Cancelar</Button>
              <Button
                mode="contained"
                onPress={async () => {
                  if (!pickerApptId) return;
                  const isOnlineNow = (await NetInfo.fetch()).isConnected ?? false;
                  const ok = await localStorageService.rescheduleAppointment(pickerApptId, selectedDate.toISOString());
                  setPickerVisible(false);
                  if (ok) {
                    analyticsService.logEvent('appointment.reschedule', { screen: 'Appointments', option: 'modal_picker', offline: !isOnlineNow });
                    await load();
                    !isOnlineNow && setSnackbar({ visible: true, message: 'Se encoló la actualización; se sincronizará al volver online.' });
                  } else {
                    Alert.alert('Error', 'No se pudo reprogramar');
                  }
                }}
                style={{ marginLeft: 8 }}
              >
                Confirmar
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={2500}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  banner: { marginHorizontal: 16, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  list: { padding: 16 },
  card: { marginBottom: 12, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: 'bold' },
  subtitle: { color: '#666' },
  actions: { marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
});

export default AppointmentsScreen;


