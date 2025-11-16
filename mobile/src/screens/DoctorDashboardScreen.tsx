import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Linking, Share } from 'react-native';
import { Card, Title, Paragraph, Text, Searchbar, Chip, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { apiService } from '../services/api';
import { MedicalHistory as ApiMedicalHistory, ApiResponse } from '../services/api';
import { Symptom } from '../types';

interface PatientSummary {
  patientId: string;
  patientName: string;
  lastDiagnosis: string;
  lastDate: string;
  visits: number;
}

const DoctorDashboardScreen: React.FC = () => {
  const user = useAppStore((s) => s.user);
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();

  const isDoctor = user?.role === 'doctor';

  const loadData = useCallback(async () => {
    if (!isDoctor) return;
    setLoading(true);
    try {
      const [dashRes, historiesRes]: [ApiResponse<any>, ApiResponse<{ histories: ApiMedicalHistory[] }>] = await Promise.all([
        apiService.getDashboardData('doctor'),
        apiService.getMedicalHistories({ page: 1, limit: 200 }),
      ]);

      if (dashRes.success) {
        setDashboard(dashRes.data);
      }

      const histories = historiesRes.success && historiesRes.data?.histories ? historiesRes.data.histories : [];
      const byPatient = new Map<string, PatientSummary>();
      histories.forEach((h) => {
        const existing = byPatient.get(h.patientId);
        if (!existing) {
          byPatient.set(h.patientId, {
            patientId: h.patientId,
            patientName: h.patientName,
            lastDiagnosis: h.diagnosis,
            lastDate: h.date,
            visits: 1,
          });
        } else {
          const isNewer = new Date(h.date).getTime() > new Date(existing.lastDate).getTime();
          byPatient.set(h.patientId, {
            ...existing,
            lastDiagnosis: isNewer ? h.diagnosis : existing.lastDiagnosis,
            lastDate: isNewer ? h.date : existing.lastDate,
            visits: existing.visits + 1,
          });
        }
      });
      const list = Array.from(byPatient.values()).sort(
        (a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
      );
      setPatients(list);
    } catch (e) {
      console.error('Error loading doctor dashboard:', e);
    } finally {
      setLoading(false);
    }
  }, [isDoctor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const filteredPatients = useMemo(
    () =>
      patients.filter(
        (p) =>
          p.patientName.toLowerCase().includes(search.toLowerCase()) ||
          p.lastDiagnosis.toLowerCase().includes(search.toLowerCase())
      ),
    [patients, search]
  );

  const handleOpenReports = (patientId: string) => {
    // Enlace a consola web de reportes firmados (ajustar dominio según entorno)
    const base = __DEV__ ? 'http://localhost:3000' : 'https://app.respicare.com';
    const url = `${base}/reports?patientId=${encodeURIComponent(patientId)}`;
    Linking.openURL(url).catch((e) => console.error('Error abriendo reportes:', e));
  };

  const handleShareReport = async (patientId: string, patientName: string) => {
    const base = __DEV__ ? 'http://localhost:3000' : 'https://app.respicare.com';
    const url = `${base}/reports?patientId=${encodeURIComponent(patientId)}`;
    try {
      await Share.share({
        message: `Reporte médico de ${patientName} - RespiCare\n${url}`,
        url,
        title: `Reporte médico de ${patientName}`,
      });
    } catch (e) {
      console.error('Error compartiendo reporte:', e);
    }
  };

  const handleQuickPrescription = (patientId: string, patientName: string) => {
    // Placeholder: en una iteración posterior se puede abrir un formulario completo.
    // Por ahora se redirige a la consola web de prescripciones para ese paciente.
    const base = __DEV__ ? 'http://localhost:3000' : 'https://app.respicare.com';
    const url = `${base}/prescriptions/new?patientId=${encodeURIComponent(patientId)}&patientName=${encodeURIComponent(
      patientName
    )}`;
    Linking.openURL(url).catch((e) => console.error('Error abriendo prescripción rápida:', e));
  };

  if (!isDoctor) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>
          Esta vista está disponible solo para médicos. Inicia sesión con un usuario con rol "doctor".
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar pacientes o diagnósticos..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator animating={true} />
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.patientId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />}
          ListHeaderComponent={
            dashboard ? (
              <View>
                <Card style={styles.dashboardCard}>
                  <Card.Content>
                    <Title>Casos del día</Title>
                    <Paragraph>
                      Historias recientes: {dashboard.overview?.recentHistories ?? 0}
                    </Paragraph>
                    <Paragraph>
                      Pacientes totales: {dashboard.overview?.totalPatients ?? 0} · Visitas/paciente:{' '}
                      {dashboard.overview?.avgVisitsPerPatient ?? 0}
                    </Paragraph>
                    <Paragraph>Pendientes de sync: {dashboard.overview?.pendingSync ?? 0}</Paragraph>
                  </Card.Content>
                </Card>
                <Divider style={styles.headerDivider} />
                <Title style={styles.sectionTitle}>Pacientes</Title>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Card style={styles.patientCard}>
              <Card.Content>
                <View style={styles.patientHeader}>
                  <View style={{ flex: 1 }}>
                    <Title>{item.patientName}</Title>
                    <Paragraph style={styles.diagnosis}>{item.lastDiagnosis}</Paragraph>
                    <Text style={styles.date}>
                      Última visita: {new Date(item.lastDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <Chip compact style={styles.visitsChip}>
                    {item.visits} visitas
                  </Chip>
                </View>
                <View style={styles.actionsRow}>
                  <Button
                    mode="text"
                    onPress={() =>
                      navigation.navigate('DirectChat', {
                        patientId: item.patientId,
                        patientName: item.patientName,
                      })
                    }
                    icon="chat-processing"
                    compact
                  >
                    Chat
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleOpenReports(item.patientId)}
                    icon="file-document-outline"
                    compact
                  >
                    Reportes firmados
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleQuickPrescription(item.patientId, item.patientName)}
                    icon="prescription"
                    compact
                  >
                    Prescripción rápida
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => handleShareReport(item.patientId, item.patientName)}
                    icon="share-variant"
                    compact
                  >
                    Compartir
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
  },
  dashboardCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  headerDivider: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  patientCard: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  diagnosis: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  visitsChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoText: {
    textAlign: 'center',
    color: '#555',
  },
});

export default DoctorDashboardScreen;


