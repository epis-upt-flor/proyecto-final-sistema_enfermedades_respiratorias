import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Card, Title, Paragraph, Chip, Button } from 'react-native-paper';
import { RootStackParamList } from '../types';
import { telemedicineService } from '../services/telemedicineService';

type Props = {
  route: RouteProp<RootStackParamList, 'AppointmentDetail'>;
};

const AppointmentDetailScreen: React.FC<Props> = ({ route }) => {
  const { appointmentId } = route.params || { appointmentId: '' };
  const [starting, setStarting] = useState(false);

  const startConsultation = useCallback(async () => {
    try {
      setStarting(true);
      const started = await telemedicineService.startCall(appointmentId);
      if (started) {
        const token = await telemedicineService.getCallToken(appointmentId);
        Alert.alert('Teleconsulta', token ? 'Conexión iniciada (mock de video)' : 'Conexión iniciada');
      } else {
        Alert.alert('Error', 'No se pudo iniciar la consulta');
      }
    } catch (e) {
      Alert.alert('Error', 'Fallo al iniciar la consulta');
    } finally {
      setStarting(false);
    }
  }, [appointmentId]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Detalle de Cita</Title>
          <Paragraph>ID: {appointmentId || 'N/A'}</Paragraph>
          <Chip mode="outlined" style={{ marginTop: 8 }}>Programada</Chip>
          <Button mode="contained" style={{ marginTop: 16 }} onPress={startConsultation} loading={starting}>
            Iniciar consulta
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { elevation: 2 },
});

export default AppointmentDetailScreen;


