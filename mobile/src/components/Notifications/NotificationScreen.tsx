import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Chip,
  FAB,
  Portal,
  Modal,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useAppStore } from '../../store/useAppStore';
import { NotificationData, Alert } from '../../types';
import Toast from 'react-native-toast-message';

const NotificationScreen: React.FC = () => {
  const {
    notifications,
    alerts,
    markNotificationAsRead,
    clearNotifications,
    fetchAlerts,
    acknowledgeAlertById,
  } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'alert-circle';
      case 'alert':
        return 'alert';
      case 'reminder':
        return 'bell';
      case 'sync':
        return 'sync';
      default:
        return 'information';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return '#d32f2f';
      case 'alert':
        return '#ff9800';
      case 'reminder':
        return '#2196f3';
      case 'sync':
        return '#4caf50';
      default:
        return '#757575';
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#1976d2';
      default:
        return '#388e3c';
    }
  };

  const loadAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      await fetchAlerts();
    } finally {
      setLoadingAlerts(false);
    }
  }, [fetchAlerts]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      setAcknowledgingId(alertId);
      const success = await acknowledgeAlertById(alertId);
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Alerta reconocida',
          text2: 'La alerta ha sido marcada como atendida.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'No se pudo reconocer la alerta',
        });
      }
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleClearAll = () => {
    clearNotifications();
    setShowClearModal(false);
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <Card 
      style={[
        styles.notificationCard,
        !item.isRead && styles.unreadNotification
      ]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <Card.Content>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationTitleContainer}>
            <IconButton
              icon={getNotificationIcon(item.type)}
              size={20}
              iconColor={getNotificationColor(item.type)}
            />
            <View style={styles.notificationTextContainer}>
              <Title style={styles.notificationTitle}>{item.title}</Title>
              <Paragraph style={styles.notificationMessage}>
                {item.message}
              </Paragraph>
            </View>
          </View>
          <View style={styles.notificationActions}>
            <Chip
              mode="outlined"
              compact
              style={[styles.typeChip, { borderColor: getNotificationColor(item.type) }]}
              textStyle={{ color: getNotificationColor(item.type) }}
            >
              {item.type}
            </Chip>
            {!item.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>
        </View>
        
        {item.scheduledTime && (
          <Paragraph style={styles.scheduledTime}>
            📅 Programado para: {new Date(item.scheduledTime).toLocaleString()}
          </Paragraph>
        )}
      </Card.Content>
    </Card>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const pendingAlerts = alerts.filter((alert) => alert.status !== 'acknowledged').length;

  const renderAlertCard = (alert: Alert) => (
    <Card key={alert.id} style={styles.alertCard}>
      <Card.Content>
        <View style={styles.alertHeader}>
          <Title style={styles.alertTitle}>{alert.title}</Title>
          <Chip
            mode="outlined"
            compact
            style={[styles.alertPriorityChip, { borderColor: getAlertColor(alert.priority) }]}
            textStyle={{ color: getAlertColor(alert.priority) }}
          >
            {alert.priority.toUpperCase()}
          </Chip>
        </View>
        <Paragraph style={styles.alertMessage}>{alert.message}</Paragraph>
        <View style={styles.alertMetaRow}>
          <Chip mode="flat" compact icon="tag-text-outline" style={styles.alertMetaChip}>
            {alert.category.replace('_', ' ')}
          </Chip>
          <Chip mode="flat" compact icon="clock-outline" style={styles.alertMetaChip}>
            {new Date(alert.createdAt).toLocaleString()}
          </Chip>
        </View>
        {alert.scheduledAt && (
          <Paragraph style={styles.alertScheduled}>
            ⏰ Programada para {new Date(alert.scheduledAt).toLocaleString()}
          </Paragraph>
        )}
        <View style={styles.alertActions}>
          <Chip
            compact
            icon={alert.status === 'acknowledged' ? 'check-circle' : 'alert-circle-outline'}
            style={[
              styles.alertStatusChip,
              alert.status === 'acknowledged' && styles.alertStatusAcknowledged,
            ]}
          >
            {alert.status === 'acknowledged' ? 'Reconocida' : 'Pendiente'}
          </Chip>
          {alert.status !== 'acknowledged' && (
            <Button
              mode="contained"
              icon="check"
              onPress={() => handleAcknowledge(alert.id)}
              style={styles.alertButton}
              buttonColor="#1976d2"
              loading={acknowledgingId === alert.id}
              disabled={acknowledgingId === alert.id}
            >
              Reconocer
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderAlertsSection = () => (
    <View style={styles.alertSection}>
      <View style={styles.alertSectionHeader}>
        <Title style={styles.alertSectionTitle}>⚠️ Alertas del sistema</Title>
        {pendingAlerts > 0 && (
          <Chip style={styles.alertPendingChip}>{pendingAlerts} pendientes</Chip>
        )}
      </View>
      {loadingAlerts ? (
        <ActivityIndicator animating size="small" />
      ) : alerts.length === 0 ? (
        <Paragraph style={styles.alertEmptyMessage}>
          No hay alertas registradas para tu cuenta.
        </Paragraph>
      ) : (
        alerts.map(renderAlertCard)
      )}
    </View>
  );

  const renderEmptyNotifications = () => {
    if (alerts.length > 0) {
      return null;
    }

    return (
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <IconButton
            icon="bell-off"
            size={48}
            iconColor="#757575"
          />
          <Title style={styles.emptyTitle}>No hay notificaciones</Title>
          <Paragraph style={styles.emptyMessage}>
            Las notificaciones importantes aparecerán aquí
          </Paragraph>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title>🔔 Notificaciones</Title>
        {unreadCount > 0 && (
          <Chip style={styles.unreadChip}>
            {unreadCount} sin leer
          </Chip>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
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
        ListHeaderComponent={renderAlertsSection}
        ListEmptyComponent={renderEmptyNotifications}
      />

      {notifications.length > 0 && (
        <FAB
          icon="delete-sweep"
          style={styles.clearFab}
          onPress={() => setShowClearModal(true)}
          label="Limpiar"
        />
      )}

      <Portal>
        <Modal
          visible={showClearModal}
          onDismiss={() => setShowClearModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card>
            <Card.Content>
              <Title>Limpiar Notificaciones</Title>
              <Paragraph>
                ¿Estás seguro de que deseas eliminar todas las notificaciones?
                Esta acción no se puede deshacer.
              </Paragraph>
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowClearModal(false)}
                  style={styles.modalButton}
                >
                  Cancelar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleClearAll}
                  style={[styles.modalButton, styles.clearButton]}
                >
                  Limpiar Todo
                </Button>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  unreadChip: {
    backgroundColor: '#ff5722',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  notificationCard: {
    marginBottom: 8,
    elevation: 1,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    backgroundColor: '#f8f9fa',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  notificationTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
  },
  notificationActions: {
    alignItems: 'flex-end',
  },
  typeChip: {
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1976d2',
  },
  scheduledTime: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyCard: {
    margin: 16,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#757575',
    marginTop: 16,
  },
  emptyMessage: {
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  clearFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ff5722',
  },
  modalContainer: {
    margin: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: '#ff5722',
  },
  alertSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 1,
  },
  alertSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  alertPendingChip: {
    backgroundColor: '#ffcc80',
  },
  alertEmptyMessage: {
    color: '#757575',
    fontStyle: 'italic',
  },
  alertCard: {
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
    elevation: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertTitle: {
    flex: 1,
    fontSize: 16,
  },
  alertPriorityChip: {
    marginLeft: 8,
  },
  alertMessage: {
    marginTop: 8,
    color: '#424242',
  },
  alertMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  alertMetaChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  alertScheduled: {
    marginTop: 8,
    fontSize: 12,
    color: '#757575',
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  alertStatusChip: {
    backgroundColor: '#ffe0b2',
  },
  alertStatusAcknowledged: {
    backgroundColor: '#c8e6c9',
  },
  alertButton: {
    marginLeft: 8,
  },
});

export default NotificationScreen;
