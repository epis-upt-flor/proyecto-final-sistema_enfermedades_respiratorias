import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  List,
  Chip,
  Button,
  ProgressBar,
  FAB,
  Portal,
  Modal,
  Text,
  Divider,
} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';
import { useAppStore } from '../../store/useAppStore';
import { MedicalHistory } from '../../types';

const OfflineDataScreen: React.FC = () => {
  const { 
    offlineData, 
    isOnline, 
    setOnlineStatus, 
    syncData, 
    isLoading,
    deleteMedicalHistory 
  } = useAppStore();
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    // Escuchar cambios en la conectividad
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnlineStatus(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, [setOnlineStatus]);

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert('Sin Conexión', 'No hay conexión a internet para sincronizar');
      return;
    }

    setShowSyncModal(true);
    setSyncProgress(0);

    try {
      // Simular progreso de sincronización
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      await syncData();
      
      setTimeout(() => {
        setShowSyncModal(false);
        setSyncProgress(0);
      }, 2000);

    } catch (error) {
      setShowSyncModal(false);
      setSyncProgress(0);
      Alert.alert('Error', 'No se pudo sincronizar los datos');
    }
  };

  const handleDeleteOfflineData = (historyId: string) => {
    Alert.alert(
      'Eliminar Datos',
      '¿Estás seguro de que deseas eliminar esta entrada offline?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deleteMedicalHistory(historyId)
        },
      ]
    );
  };

  const renderOfflineHistory = ({ item }: { item: MedicalHistory }) => (
    <Card style={styles.historyCard}>
      <Card.Content>
        <View style={styles.historyHeader}>
          <View style={styles.historyInfo}>
            <Title style={styles.patientName}>{item.patientName}</Title>
            <Paragraph style={styles.diagnosis}>{item.diagnosis}</Paragraph>
            <Text style={styles.date}>
              📅 {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.historyActions}>
            <Chip
              mode="outlined"
              compact
              style={[
                styles.statusChip,
                { borderColor: item.syncStatus === 'synced' ? '#4caf50' : '#ff9800' }
              ]}
              textStyle={{ 
                color: item.syncStatus === 'synced' ? '#4caf50' : '#ff9800' 
              }}
            >
              {item.syncStatus === 'synced' ? 'Sincronizado' : 'Pendiente'}
            </Chip>
            {item.isOffline && (
              <Button
                mode="text"
                onPress={() => handleDeleteOfflineData(item.id)}
                textColor="#d32f2f"
                compact
              >
                Eliminar
              </Button>
            )}
          </View>
        </View>

        {item.symptoms && item.symptoms.length > 0 && (
          <View style={styles.symptomsContainer}>
            <Text style={styles.symptomsTitle}>Síntomas:</Text>
            <View style={styles.symptomsList}>
              {item.symptoms.map((symptom, index) => (
                <Chip
                  key={index}
                  compact
                  style={styles.symptomChip}
                >
                  {symptom.name}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {item.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              📍 {item.location.address || 'Ubicación registrada'}
            </Text>
          </View>
        )}

        {item.images && item.images.length > 0 && (
          <View style={styles.imagesContainer}>
            <Text style={styles.imagesText}>
              📷 {item.images.length} imagen(es) adjunta(s)
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const getConnectionStatus = () => {
    if (isOnline) {
      return { text: '🟢 Conectado', color: '#4caf50' };
    } else {
      return { text: '🔴 Sin Conexión', color: '#f44336' };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <View style={styles.container}>
      {/* Header con estado de conexión */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <View>
              <Title>Estado de Conexión</Title>
              <Text style={[styles.statusText, { color: connectionStatus.color }]}>
                {connectionStatus.text}
              </Text>
            </View>
            <Chip
              mode="outlined"
              style={[styles.pendingChip, { borderColor: '#ff9800' }]}
            >
              {offlineData.pendingSync} pendientes
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{offlineData.medicalHistories.length}</Text>
              <Text style={styles.statLabel}>Historias</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{offlineData.symptoms.length}</Text>
              <Text style={styles.statLabel}>Síntomas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {new Date(offlineData.lastSync).toLocaleDateString()}
              </Text>
              <Text style={styles.statLabel}>Última Sync</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de datos offline */}
      {offlineData.medicalHistories.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Title style={styles.emptyTitle}>No hay datos offline</Title>
            <Paragraph style={styles.emptyMessage}>
              Los datos capturados sin conexión aparecerán aquí
            </Paragraph>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={offlineData.medicalHistories}
          renderItem={renderOfflineHistory}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* FAB para sincronizar */}
      {isOnline && offlineData.pendingSync > 0 && (
        <FAB
          icon="sync"
          style={styles.syncFab}
          onPress={handleSync}
          label={`Sincronizar (${offlineData.pendingSync})`}
        />
      )}

      {/* Modal de sincronización */}
      <Portal>
        <Modal
          visible={showSyncModal}
          onDismiss={() => setShowSyncModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title>Sincronizando Datos</Title>
              <Paragraph>
                Sincronizando {offlineData.pendingSync} elementos...
              </Paragraph>
              <ProgressBar
                progress={syncProgress / 100}
                color="#1976d2"
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(syncProgress)}% completado
              </Text>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusCard: {
    margin: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingChip: {
    backgroundColor: '#fff3e0',
  },
  divider: {
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  historyCard: {
    marginBottom: 12,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
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
  historyActions: {
    alignItems: 'flex-end',
  },
  statusChip: {
    marginBottom: 8,
  },
  symptomsContainer: {
    marginTop: 12,
  },
  symptomsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  symptomsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  symptomChip: {
    margin: 2,
    backgroundColor: '#e3f2fd',
  },
  locationContainer: {
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  imagesContainer: {
    marginTop: 8,
  },
  imagesText: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    margin: 16,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#757575',
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#999',
    textAlign: 'center',
  },
  syncFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
  modalContainer: {
    margin: 20,
  },
  progressBar: {
    marginVertical: 16,
  },
  progressText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default OfflineDataScreen;
