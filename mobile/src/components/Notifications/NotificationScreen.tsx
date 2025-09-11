import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  FAB,
  Portal,
  Modal,
  Button,
  Text,
} from 'react-native-paper';
import { useAppStore } from '../../store/useAppStore';
import { NotificationData } from '../../types';

const NotificationScreen: React.FC = () => {
  const { notifications, markNotificationAsRead, clearNotifications } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

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

  const handleRefresh = () => {
    setRefreshing(true);
    // Simular refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

      {notifications.length === 0 ? (
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
      ) : (
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
        />
      )}

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
});

export default NotificationScreen;
