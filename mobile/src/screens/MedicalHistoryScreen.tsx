import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  List,
  Chip,
  Searchbar,
  FAB,
  Portal,
  Modal,
  Button,
  Text,
} from 'react-native-paper';
import { useAppStore } from '../../store/useAppStore';
import { MedicalHistory } from '../../types';

const MedicalHistoryScreen: React.FC = () => {
  const { offlineData, deleteMedicalHistory } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistory | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredHistories = offlineData.medicalHistories.filter(history =>
    history.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    history.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDeleteHistory = (historyId: string) => {
    deleteMedicalHistory(historyId);
    setShowDetailModal(false);
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return 'check-circle';
      case 'pending':
        return 'clock';
      case 'error':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const renderHistoryItem = ({ item }: { item: MedicalHistory }) => (
    <Card 
      style={styles.historyCard}
      onPress={() => {
        setSelectedHistory(item);
        setShowDetailModal(true);
      }}
    >
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
              style={[styles.statusChip, { borderColor: getSyncStatusColor(item.syncStatus) }]}
              textStyle={{ color: getSyncStatusColor(item.syncStatus) }}
              icon={getSyncStatusIcon(item.syncStatus)}
            >
              {item.syncStatus === 'synced' ? 'Sincronizado' : 'Pendiente'}
            </Chip>
          </View>
        </View>

        {item.symptoms && item.symptoms.length > 0 && (
          <View style={styles.symptomsContainer}>
            <Text style={styles.symptomsTitle}>Síntomas:</Text>
            <View style={styles.symptomsList}>
              {item.symptoms.slice(0, 3).map((symptom, index) => (
                <Chip
                  key={index}
                  compact
                  style={styles.symptomChip}
                >
                  {symptom.name}
                </Chip>
              ))}
              {item.symptoms.length > 3 && (
                <Chip compact style={styles.moreChip}>
                  +{item.symptoms.length - 3} más
                </Chip>
              )}
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
              📷 {item.images.length} imagen(es)
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Buscar por nombre o diagnóstico..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Lista de historias */}
      {filteredHistories.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Title style={styles.emptyTitle}>
              {searchQuery ? 'No se encontraron resultados' : 'No hay historias médicas'}
            </Title>
            <Paragraph style={styles.emptyMessage}>
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda'
                : 'Las historias médicas capturadas aparecerán aquí'
              }
            </Paragraph>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={filteredHistories}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1976d2']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* FAB para agregar nueva historia */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          // Navegar a captura de datos
        }}
      />

      {/* Modal de detalles */}
      <Portal>
        <Modal
          visible={showDetailModal}
          onDismiss={() => setShowDetailModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedHistory && (
            <Card>
              <Card.Content>
                <Title>Detalles de la Historia Médica</Title>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Paciente:</Text>
                  <Text style={styles.detailValue}>{selectedHistory.patientName}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Edad:</Text>
                  <Text style={styles.detailValue}>{selectedHistory.age} años</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Diagnóstico:</Text>
                  <Text style={styles.detailValue}>{selectedHistory.diagnosis}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedHistory.date).toLocaleString()}
                  </Text>
                </View>

                {selectedHistory.symptoms && selectedHistory.symptoms.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Síntomas:</Text>
                    <View style={styles.symptomsList}>
                      {selectedHistory.symptoms.map((symptom, index) => (
                        <Chip
                          key={index}
                          compact
                          style={styles.symptomChip}
                        >
                          {symptom.name} ({symptom.severity})
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {selectedHistory.location && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ubicación:</Text>
                    <Text style={styles.detailValue}>
                      {selectedHistory.location.address || 'Ubicación registrada'}
                    </Text>
                    <Text style={styles.coordinatesText}>
                      Lat: {selectedHistory.location.latitude.toFixed(4)}, 
                      Lng: {selectedHistory.location.longitude.toFixed(4)}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => setShowDetailModal(false)}
                    style={styles.modalButton}
                  >
                    Cerrar
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => handleDeleteHistory(selectedHistory.id)}
                    style={[styles.modalButton, styles.deleteButton]}
                    buttonColor="#f44336"
                  >
                    Eliminar
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
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
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    padding: 16,
  },
  historyCard: {
    marginBottom: 12,
    elevation: 2,
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
  moreChip: {
    margin: 2,
    backgroundColor: '#f0f0f0',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
  modalContainer: {
    margin: 20,
    maxHeight: '80%',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
  },
  modalButton: {
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
});

export default MedicalHistoryScreen;
