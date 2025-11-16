import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { RootStackParamList } from '../types';

type Props = {
  route: RouteProp<RootStackParamList, 'AppointmentDetail'>;
};

const AppointmentDetailScreen: React.FC<Props> = ({ route }) => {
  const { appointmentId } = route.params || { appointmentId: '' };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Detalle de Cita</Title>
          <Paragraph>ID: {appointmentId || 'N/A'}</Paragraph>
          <Chip mode="outlined" style={{ marginTop: 8 }}>Programada</Chip>
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


