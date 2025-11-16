import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert, Linking } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, Chip, Button, Snackbar } from 'react-native-paper';
import { RootStackParamList } from '../types';
import { telemedicineService } from '../services/telemedicineService';
import { localStorageService } from '../services/localStorage';

type Props = {
  route: RouteProp<RootStackParamList, 'AppointmentDetail'>;
};

const AppointmentDetailScreen: React.FC<Props> = ({ route }) => {
  const { appointmentId, fromError } = route.params || { appointmentId: '' } as any;
  const navigation = useNavigation<any>();
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const startConsultation = useCallback(async () => {
    try {
      setStarting(true);
      const started = await telemedicineService.startCall(appointmentId);
      if (started) {
        const token = await telemedicineService.getCallToken(appointmentId);
        if (token) {
          const room = `RespiCare-${appointmentId}`;
          const url = `https://meet.jit.si/${encodeURIComponent(room)}#config.token=${encodeURIComponent(token)}`;
          const supported = await Linking.canOpenURL(url);
          if (supported) {
            await Linking.openURL(url);
          } else {
            Alert.alert('Teleconsulta', 'Conexión iniciada, pero no se pudo abrir el proveedor de video.');
          }
        } else {
          Alert.alert('Teleconsulta', 'Conexión iniciada (sin token de video disponible)');
        }
      } else {
        Alert.alert('Error', 'No se pudo iniciar la consulta');
      }
    } catch (e) {
      Alert.alert('Error', 'Fallo al iniciar la consulta');
    } finally {
      setStarting(false);
    }
  }, [appointmentId]);

  const retrySave = useCallback(async () => {
    try {
      setSaving(true);
      await localStorageService.retrySyncNow();
      const cached = await localStorageService.getCachedAppointments<any>();
      const appt = cached.find((a: any) => a._id === appointmentId || a.id === appointmentId);
      if (!appt || (appt.syncStatus !== 'pending' && appt.syncStatus !== 'error')) {
        navigation.goBack();
        return;
      }
      setSnackbar({ visible: true, message: 'Sincronización en curso. La cita sigue pendiente.' });
    } catch (e) {
      setSnackbar({ visible: true, message: 'No fue posible reintentar en este momento.' });
    } finally {
      setSaving(false);
    }
  }, [appointmentId, navigation]);

  return (
    <View style={styles.container}>
      {fromError && (
        <Card style={styles.banner}>
          <Card.Content>
            <Paragraph style={{ color: '#f44336' }}>
              Esta cita no se sincronizó. Guarda nuevamente para reintentar la sincronización.
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Detalle de Cita</Title>
          <Paragraph>ID: {appointmentId || 'N/A'}</Paragraph>
          <Chip mode="outlined" style={{ marginTop: 8 }}>Programada</Chip>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
            <Button mode="outlined" onPress={retrySave} loading={saving} style={{ marginRight: 8 }}>
              Guardar
            </Button>
            <Button mode="contained" onPress={startConsultation} loading={starting}>
              Iniciar consulta
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  banner: { marginBottom: 8, borderLeftWidth: 4, borderLeftColor: '#f44336' },
  card: { elevation: 2 },
});

export default AppointmentDetailScreen;


