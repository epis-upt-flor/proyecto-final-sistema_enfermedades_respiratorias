/**
 * Home Screen - Main dashboard with quick access to all features
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  InteractionManager,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Avatar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppStore } from '../store/useAppStore';
import { MedicalHistory, SymptomAnalysis, SyncStatus } from '../types';
import { localStorageService } from '../services/localStorage';
import { telemedicineService } from '../services/telemedicineService';
import { featureFlags } from '../config/environment';
import type { AppointmentDTO } from '../types';
import { predictiveAnalysisService } from '../services/predictiveAnalysisService';
import { shallow } from 'zustand/shallow';
import { voiceRecognitionService } from '../services/voiceRecognitionService';
import { useTranslation } from '../services/i18nService';

type QuickAction = {
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
};

const QuickActionCard = React.memo(
  ({
    title,
    description,
    icon,
    color,
    action,
    onPress,
  }: QuickAction & { onPress: (action: string) => void }) => (
    <TouchableOpacity onPress={() => onPress(action)} style={styles.quickActionCard}>
      <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Avatar.Icon size={40} icon={icon} style={{ backgroundColor: color }} />
            <View style={styles.cardText}>
              <Title style={styles.cardTitle}>{title}</Title>
              <Paragraph style={styles.cardDescription}>{description}</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  )
);

QuickActionCard.displayName = 'QuickActionCard';

const RecentItemCard = React.memo(
  ({
    item,
    type,
  }: {
    item: MedicalHistory | SymptomAnalysis;
    type: 'history' | 'analysis';
  }) => {
    const isHistory = type === 'history';
    const history = item as MedicalHistory;
    const analysis = item as SymptomAnalysis;

    const urgencyConfig = useMemo(() => {
      if (isHistory) {
        return {
          background: '#e3f2fd',
          color: '#1976d2',
          label: 'Historia',
        };
      }

      switch (analysis.urgencyLevel) {
        case 'high':
          return { background: '#ffebee', color: '#d32f2f', label: 'high' };
        case 'medium':
          return { background: '#fff3e0', color: '#f57c00', label: 'medium' };
        default:
          return { background: '#e8f5e8', color: '#388e3c', label: 'low' };
      }
    }, [analysis, isHistory]);

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
                  : `Urgencia: ${analysis.urgencyLevel} • ${new Date(
                      analysis.analyzedAt
                    ).toLocaleDateString()}`}
              </Paragraph>
            </View>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { backgroundColor: urgencyConfig.background }]}
              textStyle={{ color: urgencyConfig.color }}
            >
              {isHistory ? urgencyConfig.label : analysis.urgencyLevel}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  }
);

RecentItemCard.displayName = 'RecentItemCard';

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const {
    user,
    isOnline,
    offlineData,
    syncStatus,
    syncData,
    addNotification,
    alerts,
    fetchAlerts,
  } = useAppStore(
    useCallback(
      (state) => ({
        user: state.user,
        isOnline: state.isOnline,
        offlineData: state.offlineData,
        syncStatus: state.syncStatus,
        syncData: state.syncData,
        addNotification: state.addNotification,
        alerts: state.alerts,
        fetchAlerts: state.fetchAlerts,
      }),
      []
    ),
    shallow
  );

  const [recentHistories, setRecentHistories] = useState<MedicalHistory[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<SymptomAnalysis[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Array<{ id: string; when: string; doctorId?: string }> | null>(null);
  const [predictiveSummary, setPredictiveSummary] = useState<{
    risk: 'low' | 'medium' | 'high';
    recommendations: string[];
    generatedAt: string;
  } | null>(null);
  const [alertsView, setAlertsView] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isVoiceCmd, setIsVoiceCmd] = useState(false);

  useEffect(() => {
    const interaction = InteractionManager.runAfterInteractions(() => {
      loadRecentData();
      (async () => {
        try {
          await fetchAlerts?.();
          if (alerts && alerts.length > 0) {
            await localStorageService.cacheAlerts(alerts);
            setAlertsView(alerts);
          } else {
            const cached = await localStorageService.getCachedAlerts();
            setAlertsView(cached);
          }
        } catch {
          const cached = await localStorageService.getCachedAlerts();
          setAlertsView(cached);
        }
      })();
      loadUpcomingAppointments().catch(() => {});
      loadPredictive().catch(() => {});
    });

    return () => interaction.cancel();
  }, [fetchAlerts]);

  useEffect(() => {
    // keep alertsView in sync when alerts store updates
    if (alerts && alerts.length > 0) {
      setAlertsView(alerts);
    }
  }, [alerts]);

  const loadUpcomingAppointments = useCallback(async () => {
    try {
      if (!featureFlags.enableAppointmentsCard || !user?.id) {
        setUpcomingAppointments(null);
        return;
      }
      // Duck-typing: solo intentar si el servicio expone el método
      const svc: any = telemedicineService as any;
      if (typeof svc.getPatientCalls !== 'function') {
        setUpcomingAppointments(null);
        return;
      }
      const calls = await svc.getPatientCalls(user.id);
      const now = Date.now();
      const upcoming = (calls || [])
        .filter((c: any) => c.status === 'scheduled' && c.scheduledAt)
        .map((c: any) => ({
          id: c.id,
          when: c.scheduledAt,
          doctorId: c.doctorId,
        }))
        .filter((c: any) => new Date(c.when).getTime() >= now)
        .sort((a: any, b: any) => new Date(a.when).getTime() - new Date(b.when).getTime())
        .slice(0, 2);

      setUpcomingAppointments(upcoming.length > 0 ? upcoming : []);
    } catch (e) {
      // Silenciar errores si la API aún no está disponible
      setUpcomingAppointments(null);
    }
  }, [user?.id]);

  const loadPredictive = useCallback(async () => {
    try {
      if (!user?.id) {
        setPredictiveSummary(null);
        return;
      }
      const analysis = await predictiveAnalysisService.getPredictiveAnalysis(user.id, '30d');
      if (analysis) {
        setPredictiveSummary({
          risk: analysis.riskAssessment.overallRisk,
          recommendations: analysis.recommendations.slice(0, 3),
          generatedAt: analysis.generatedAt,
        });
      } else {
        setPredictiveSummary(null);
      }
    } catch {
      setPredictiveSummary(null);
    }
  }, [user?.id]);

  const loadRecentData = useCallback(async () => {
    try {
      const histories = await localStorageService.getMedicalHistories();
      const analyses = await localStorageService.getSymptomAnalyses();
      
      // Get most recent 5 items
      setRecentHistories(histories.slice(-5).reverse());
      setRecentAnalyses(analyses.slice(-5).reverse());
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
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
  }, [isOnline, loadRecentData, syncData]);

  const handleQuickAction = useCallback(
    (action: string) => {
      switch (action) {
      case 'capture':
        // Navigate to data capture
        break;
      case 'analyze':
        // Navigate to AI analysis
        break;
      case 'ar_training':
        navigation.navigate('ARTraining', { mode: 'breathing' });
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
  },
    [isOnline, syncData, navigation]
  );

  const startVoiceCommand = useCallback(async () => {
    try {
      setIsVoiceCmd(true);
      const ok = await voiceRecognitionService.startListening(
        { language: 'es-ES', interimResults: false },
        (result) => {
          setIsVoiceCmd(false);
          const text = result.text?.toLowerCase() || '';
          if (text.includes('abrir citas') || text.includes('ver citas')) {
            navigation.navigate('Appointments');
            return;
          }
          if (text.includes('ver alertas') || text.includes('abrir alertas')) {
            navigation.navigate('Alerts');
            return;
          }
          if (text.includes('analizar') || text.includes('ia')) {
            navigation.navigate('AI');
            return;
          }
          Alert.alert('Comando no reconocido', 'Prueba con: "abrir citas" o "ver alertas"');
        },
        (error) => {
          setIsVoiceCmd(false);
          Alert.alert('Voz', error || 'No se pudo ejecutar el comando de voz');
        }
      );
      if (!ok) {
        setIsVoiceCmd(false);
        Alert.alert('Voz', 'No se pudo iniciar el reconocimiento');
      }
    } catch {
      setIsVoiceCmd(false);
      Alert.alert('Voz', 'Error al iniciar reconocimiento');
    }
  }, [navigation]);

  const syncStatusColor = useMemo((): string => {
    if (!isOnline) return '#f44336';
    if (syncStatus.isSyncing) return '#ff9800';
    if (syncStatus.pendingItems > 0) return '#ff9800';
    return '#4caf50';
  }, [isOnline, syncStatus]);

  const syncStatusText = useMemo((): string => {
    if (!isOnline) return t('home.sync.offline');
    if (syncStatus.isSyncing) return t('home.sync.syncing');
    if (syncStatus.pendingItems > 0) return t('home.sync.pending', { count: String(syncStatus.pendingItems) });
    return t('home.sync.synced');
  }, [isOnline, syncStatus, t]);

  const quickActionItems: QuickAction[] = useMemo(
    () => [
      {
        title: t('home.quickActions'),
        description: 'Registrar nueva historia médica',
        icon: 'add-circle',
        color: '#4caf50',
        action: 'capture',
      },
      {
        title: 'Análisis IA',
        description: 'Analizar síntomas con inteligencia artificial',
        icon: 'psychology',
        color: '#9c27b0',
        action: 'analyze',
      },
      {
        title: 'Ejercicios AR',
        description: 'Respiración guiada o uso de inhalador',
        icon: 'view-in-ar',
        color: '#607d8b',
        action: 'ar_training',
      },
      {
        title: 'Chat Médico',
        description: 'Consultar con asistente médico virtual',
        icon: 'chat',
        color: '#2196f3',
        action: 'chat',
      },
      {
        title: 'Ver Historial',
        description: 'Revisar historias médicas anteriores',
        icon: 'history',
        color: '#ff9800',
        action: 'history',
      },
      {
        title: isOnline ? 'Sincronizar' : t('home.sync.offline'),
        description: isOnline
          ? 'Sincronizar datos pendientes con la nube'
          : 'Se sincronizará automáticamente al volver a estar en línea',
        icon: 'sync',
        color: isOnline ? '#1976d2' : '#9e9e9e',
        action: 'sync',
      },
    ],
    [isOnline, t]
  );

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
                  {t('common.loading').replace('Cargando...', `¡Hola, ${user?.firstName || 'Usuario'}!`) }
                </Title>
                <Paragraph style={styles.welcomeSubtitle}>
                  RespiCare Mobile
                </Paragraph>
              </View>
              <Button mode="text" onPress={startVoiceCommand} loading={isVoiceCmd}>
                {isVoiceCmd ? 'Escuchando...' : '🎤 Voz'}
              </Button>
            </View>
            
            {/* Sync Status */}
            <View style={styles.syncStatusContainer}>
              <View style={styles.syncStatus}>
                <Icon 
                  name={isOnline ? 'wifi' : 'wifi-off'} 
                  size={16} 
                  color={syncStatusColor} 
                />
                <Text style={[styles.syncStatusText, { color: syncStatusColor }]}>
                  {syncStatusText}
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
          <Title style={styles.sectionTitle}>{t('home.quickActions')}</Title>
          
          {quickActionItems.map((item) => (
            <QuickActionCard key={item.action} {...item} onPress={handleQuickAction} />
          ))}
        </View>

        {/* Recent Data */}
        {recentHistories.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>{t('home.recentHistories')}</Title>
            {recentHistories.slice(0, 3).map((history, index) => (
              <RecentItemCard key={history.id} item={history} type="history" />
            ))}
          </View>
        )}

        {/* Predictive Insights */}
        {predictiveSummary && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>{t('home.predictiveAnalysis')}</Title>
            <Card style={styles.statsCard}>
              <Card.Content>
                <View style={styles.recentItemHeader}>
                  <View style={styles.recentItemInfo}>
                    <Title style={styles.recentItemTitle}>Riesgo general</Title>
                    <Paragraph style={styles.recentItemSubtitle}>
                      Generado: {new Date(predictiveSummary.generatedAt).toLocaleString()}
                    </Paragraph>
                  </View>
                  <Chip
                    mode="outlined"
                    style={styles.statusChip}
                    textStyle={{ color: predictiveSummary.risk === 'high' ? '#d32f2f' : predictiveSummary.risk === 'medium' ? '#f57c00' : '#388e3c' }}
                  >
                    {predictiveSummary.risk.toUpperCase()}
                  </Chip>
                </View>
                <View style={{ marginTop: 8 }}>
                  {predictiveSummary.recommendations.map((rec, idx) => (
                    <Paragraph key={idx}>• {rec}</Paragraph>
                  ))}
                </View>
              </Card.Content>
            </Card>
          </View>
        )}
        {/* Recent Analyses */}
        {recentAnalyses.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>{t('home.recentAnalyses')}</Title>
            {recentAnalyses.slice(0, 3).map((analysis, index) => (
              <RecentItemCard key={analysis.id} item={analysis} type="analysis" />
            ))}
          </View>
        )}

        {/* Alerts */}
        {/* Upcoming Appointments (feature-flagged) */}
        {featureFlags.enableAppointmentsCard && upcomingAppointments && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>{t('home.upcomingAppointments')}</Title>
            {upcomingAppointments.length === 0 ? (
              <Paragraph style={{ color: '#666' }}>No hay citas programadas próximamente.</Paragraph>
            ) : (
              upcomingAppointments.map((appt) => (
                <Card key={appt.id} style={styles.recentCard} onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: appt.id })}>
                  <Card.Content>
                    <View style={styles.recentItemHeader}>
                      <View style={styles.recentItemInfo}>
                        <Title style={styles.recentItemTitle}>Cita médica</Title>
                        <Paragraph style={styles.recentItemSubtitle}>
                          {new Date(appt.when).toLocaleString()}
                        </Paragraph>
                      </View>
                      <Chip mode="outlined" style={styles.statusChip}>Programada</Chip>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        )}
        {alertsView && alertsView.length > 0 && (
          <View style={styles.section}>
            <Title style={styles.sectionTitle}>{t('home.alerts')}</Title>
            {alertsView.slice(0, 3).map((a: any) => (
              <Card key={a.id || a._id} style={styles.recentCard}>
                <Card.Content>
                  <View style={styles.recentItemHeader}>
                    <View style={styles.recentItemInfo}>
                      <Title style={styles.recentItemTitle}>{a.title}</Title>
                      <Paragraph style={styles.recentItemSubtitle}>{a.message}</Paragraph>
                    </View>
                    <Chip mode="outlined" style={styles.statusChip} textStyle={{ color: '#1976d2' }}>
                      {(a.priority || 'info').toUpperCase?.() || 'INFO'}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Statistics */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>{t('home.statistics')}</Title>
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
                  {t('home.emergencyTitle')}
                </Title>
              </View>
              <Paragraph style={styles.emergencyText}>
                {t('home.emergencyDescription')}
              </Paragraph>
              <Button 
                mode="contained" 
                style={styles.emergencyButton}
                onPress={() => Alert.alert(t('home.emergencyTitle'), `${t('home.call911')}?`, [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('home.call911'), style: 'destructive', onPress: () => {
                    // Implement emergency call functionality
                    Alert.alert(t('home.emergencyTitle'), 'Redirigiendo a servicios de emergencia...');
                  }}
                ])}
              >
                {t('home.call911')}
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
