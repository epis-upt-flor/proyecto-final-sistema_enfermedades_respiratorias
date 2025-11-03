/**
 * Home Screen - Main dashboard with quick access to all features
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Avatar, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppStore } from '../store/useAppStore';
import { MedicalHistory, SymptomAnalysis, SyncStatus } from '../types';
import { localStorageService } from '../services/localStorage';
import { aiService } from '../services/aiService';

const HomeScreen: React.FC = () => {
  const { 
    user, 
    isOnline, 
    offlineData, 
    syncStatus, 
    isLoading,
    syncData,
    addNotification 
  } = useAppStore();

  const [recentHistories, setRecentHistories] = useState<MedicalHistory[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<SymptomAnalysis[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecentData();
  }, []);

  const loadRecentData = async () => {
    try {
      const histories = await localStorageService.getMedicalHistories();
      const analyses = await localStorageService.getSymptomAnalyses();
      
      // Get most recent 5 items
      setRecentHistories(histories.slice(-5).reverse());
      setRecentAnalyses(analyses.slice(-5).reverse());
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRecentData();
      if (isOnline) {
        await syncData();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'capture':
        // Navigate to data capture
        break;
      case 'analyze':
        // Navigate to AI analysis
        break;
      case 'chat':
        // Navigate to chatbot
        break;
      case 'history':
        // Navigate to history
        break;
      case 'sync':
        if (isOnline) {
          syncData();
        } else {
          Alert.alert(
            'Sin Conexión',
            'No hay conexión a internet. Los datos se sincronizarán automáticamente cuando se restablezca la conexión.',
            [{ text: 'OK' }]
          );
        }
        break;
    }
  };

  const getSyncStatusColor = (): string => {
    if (!isOnline) return '#f44336';
    if (syncStatus.isSyncing) return '#ff9800';
    if (syncStatus.pendingItems > 0) return '#ff9800';
    return '#4caf50';
  };

  const getSyncStatusText = (): string => {
    if (!isOnline) return 'Sin conexión';
    if (syncStatus.isSyncing) return 'Sincronizando...';
    if (syncStatus.pendingItems > 0) return `${syncStatus.pendingItems} pendientes`;
    return 'Sincronizado';
  };

  const QuickActionCard = ({ 
    title, 
    description, 
    icon, 
    color, 
    onPress 
  }: {
    title: string;
    description: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionCard}>
      <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Avatar.Icon 
              size={40} 
              icon={icon} 
              style={{ backgroundColor: color }} 
            />
            <View style={styles.cardText}>
              <Title style={styles.cardTitle}>{title}</Title>
              <Paragraph style={styles.cardDescription}>{description}</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const RecentItemCard = ({ 
    item, 
    type 
  }: {
    item: MedicalHistory | SymptomAnalysis;
    type: 'history' | 'analysis';
  }) => {
    const isHistory = type === 'history';
    const history = item as MedicalHistory;
    const analysis = item as SymptomAnalysis;

    return (
      <Card style={styles.recentCard}>
        <Card.Content>
          <View style={styles.recentItemHeader}>
            <View style={styles.recentItemInfo}>
              <Title style={styles.recentItemTitle}>
                {isHistory ? history.patientName : 'Análisis de Síntomas'}
              </Title>
              <Paragraph style={styles.recentItemSubtitle}>
                {isHistory 
                  ? `${history.diagnosis} • ${new Date(history.date).toLocaleDateString()}`
                  : `Urgencia: ${analysis.urgencyLevel} • ${new Date(analysis.analyzedAt).toLocaleDateString()}`
                }
              </Paragraph>
            </View>
            <Chip 
              mode="outlined" 
              style={[
                styles.statusChip,
                { 
                  backgroundColor: isHistory 
                    ? '#e3f2fd' 
                    : analysis.urgencyLevel === 'high' 
                      ? '#ffebee' 
                      : analysis.urgencyLevel === 'medium'
                        ? '#fff3e0'
                        : '#e8f5e8'
                }
              ]}
              textStyle={{
                color: isHistory 
                  ? '#1976d2' 
                  : analysis.urgencyLevel === 'high'
                    ? '#d32f2f'
                    : analysis.urgencyLevel === 'medium'
                      ? '#f57c00'
                      : '#388e3c'
              }}
            >
              {isHistory ? 'Historia' : analysis.urgencyLevel}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <View style={styles.welcomeHeader}>
              <Avatar.Text 
                size={60} 
                label={user?.firstName?.[0] || 'U'} 
                style={{ backgroundColor: '#1976d2' }}
              />
              <View style={styles.welcomeText}>
                <Title style={styles.welcomeTitle}>
                  ¡Hola, {user?.firstName || 'Usuario'}!
                </Title>
                <Paragraph style={styles.welcomeSubtitle}>
                  Bienvenido a RespiCare Mobile
                </Paragraph>
              </View>
            </View>
            
            {/* Sync Status */}
            <View style={styles.syncStatusContainer}>
              <View style={styles.syncStatus}>
                <Icon 
                  name={isOnline ? 'wifi' : 'wifi-off'} 
                  size={16} 
                  color={getSyncStatusColor()} 
                />
                <Text style={[styles.syncStatusText, { color: getSyncStatusColor() }]}>
                  {getSyncStatusText()}
                </Text>
              </View>
              {syncStatus.lastSyncTime && (
                <Text style={styles.lastSyncText}>
                  Última sincronización: {new Date(syncStatus.lastSyncTime).toLocaleString()}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Acciones Rápidas</Title>
          
          <QuickActionCard
            title="Capturar Datos"
            description="Registrar nueva historia médica"
            icon="add-circle"
            color="#4caf50"
            onPress={() => handleQuickAction('capture')}
          />
          
          <QuickActionCard
            title="Análisis IA"
            description="Analizar síntomas con inteligencia artificial"
            icon="psychology"
            color="#9c27b0"
            onPress={() => handleQuickAction('analyze')}
          />
          
          <QuickActionCard
            title="Chat Médico"
            description="Consultar con asistente médico virtual"
            icon="chat"
            color="#2196f3"
            onPress={() => handleQuickAction('chat')}
          />
          
          <QuickActionCard
            title="Ver Historial"
            description="Revisar historias médicas anteriores"
            icon="history"
            color="#ff9800"
            onPress={() => handleQuickAction('history')}
          />
        </View>

        {/* Recent Data */}
        {recentHistories.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Historiales Recientes</Title>
            {recentHistories.slice(0, 3).map((history, index) => (
              <RecentItemCard key={history.id} item={history} type="history" />
            ))}
          </View>
        )}

        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Análisis Recientes</Title>
            {recentAnalyses.slice(0, 3).map((analysis, index) => (
              <RecentItemCard key={analysis.id} item={analysis} type="analysis" />
            ))}
          </View>
        )}

        {/* Statistics */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Estadísticas</Title>
          <Card style={styles.statsCard}>
            <Card.Content>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{offlineData.medicalHistories.length}</Text>
                  <Text style={styles.statLabel}>Historiales</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{offlineData.symptomAnalyses.length}</Text>
                  <Text style={styles.statLabel}>Análisis</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{offlineData.pendingSync}</Text>
                  <Text style={styles.statLabel}>Pendientes</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {isOnline ? '100%' : '0%'}
                  </Text>
                  <Text style={styles.statLabel}>Conectado</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Card style={[styles.card, { backgroundColor: '#ffebee' }]}>
            <Card.Content>
              <View style={styles.emergencyHeader}>
                <Icon name="emergency" size={24} color="#d32f2f" />
                <Title style={[styles.emergencyTitle, { color: '#d32f2f' }]}>
                  Emergencia Médica
                </Title>
              </View>
              <Paragraph style={styles.emergencyText}>
                En caso de emergencia médica, llama inmediatamente al 911 o acude al servicio de urgencias más cercano.
              </Paragraph>
              <Button 
                mode="contained" 
                style={styles.emergencyButton}
                onPress={() => Alert.alert('Emergencia', '¿Necesitas llamar al 911?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Llamar 911', style: 'destructive', onPress: () => {
                    // Implement emergency call functionality
                    Alert.alert('Llamada de Emergencia', 'Redirigiendo a servicios de emergencia...');
                  }}
                ])}
              >
                Llamar 911
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => handleQuickAction('capture')}
        label="Nueva Historia"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 2,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  syncStatusContainer: {
    marginTop: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionCard: {
    marginBottom: 12,
  },
  card: {
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    marginLeft: 16,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  recentCard: {
    marginBottom: 8,
    elevation: 1,
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentItemInfo: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statusChip: {
    marginLeft: 8,
  },
  statsCard: {
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  emergencyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emergencyButton: {
    backgroundColor: '#d32f2f',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1976d2',
  },
});

export default HomeScreen;
