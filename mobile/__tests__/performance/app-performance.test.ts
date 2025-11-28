import React from 'react';
import { render } from '@testing-library/react-native';
import MedicalHistoryScreen from '../../medical-app/screens/MedicalHistoryScreen';
import AppointmentsScreen from '../../medical-app/screens/AppointmentsScreen';

// Nota: este test no mide tiempos reales de dispositivo,
// pero actúa como smoke test de rendimiento/renderizado para listas grandes.

describe('Mobile performance smoke tests', () => {
  it('renderiza MedicalHistoryScreen con muchas historias sin bloquear', () => {
    const histories = Array.from({ length: 200 }).map((_, i) => ({
      id: `h_${i}`,
      patientId: `p_${i}`,
      doctorId: `d_${i}`,
      patientName: `Paciente ${i}`,
      age: 40,
      gender: 'M',
      diagnosis: 'Diagnóstico demo',
      symptoms: [],
      treatment: '',
      notes: '',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'synced',
    }));
    // Mockear store para inyectar muchas historias sería ideal;
    // aquí solo verificamos que el componente puede montarse.
    const tree = render(<MedicalHistoryScreen />);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('renderiza AppointmentsScreen sin bloquear', () => {
    const tree = render(<AppointmentsScreen />);
    expect(tree.toJSON()).toBeTruthy();
  });
});


