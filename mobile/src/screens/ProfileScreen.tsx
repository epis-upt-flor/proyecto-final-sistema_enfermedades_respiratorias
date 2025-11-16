import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  List,
  Button,
  Avatar,
  Divider,
  Switch,
  Chip,
} from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../services/i18nService';

const ProfileScreen: React.FC = () => {
  const { 
    user, 
    setUser, 
    offlineData, 
    notifications, 
    isOnline,
    clearNotifications 
  } = useAppStore();
  const { themeMode, setThemeMode, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('auth.logout'), 
          style: 'destructive',
          onPress: () => setUser(null)
        },
      ]
    );
  };

  const handleClearNotifications = () => {
    Alert.alert(
      t('notifications.title'),
      '¿Deseas eliminar todas las notificaciones?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('notifications.clearAll'), 
          onPress: () => clearNotifications()
        },
      ]
    );
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  if (!user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>{t('auth.login')}</Title>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Información del Usuario */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={80} 
              label={user.name.split(' ').map(n => n[0]).join('')}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Title style={styles.userName}>{user.name}</Title>
              <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
              <Chip 
                mode="outlined" 
                style={styles.roleChip}
                textStyle={{ color: '#1976d2' }}
              >
                {user.role === 'doctor' ? '👨‍⚕️ Médico' : '👤 Usuario'}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Estado de Conexión */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>{t('settings.title')}</Title>
          <List.Item
            title={t('notifications.title')}
            description={`${unreadNotifications} ${t('notifications.title').toLowerCase()}`}
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              unreadNotifications > 0 && (
                <Chip style={styles.badgeChip}>
                  {unreadNotifications}
                </Chip>
              )
            )}
          />
          <List.Item
            title={t('settings.language')}
            description={language === 'en' ? 'English' : 'Español'}
            left={(props) => <List.Icon {...props} icon="translate" />}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip onPress={() => setLanguage('es')} style={{ marginRight: 8 }} selected={language === 'es'}>
                  ES
                </Chip>
                <Chip onPress={() => setLanguage('en')} selected={language === 'en'}>
                  EN
                </Chip>
              </View>
            )}
          />
          <List.Item
            title={t('settings.theme')}
            description={
              themeMode === 'auto' ? 'Automático (según sistema)' : themeMode === 'dark' ? 'Oscuro' : 'Claro'
            }
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip onPress={() => setThemeMode('light')} style={{ marginRight: 8 }} selected={themeMode === 'light'}>
                  Claro
                </Chip>
                <Chip onPress={() => setThemeMode('dark')} style={{ marginRight: 8 }} selected={themeMode === 'dark'}>
                  Oscuro
                </Chip>
                <Chip onPress={() => setThemeMode('auto')} selected={themeMode === 'auto'}>
                  Auto
                </Chip>
              </View>
            )}
          />
        </Card.Content>
      </Card>

      {/* Estado del Sistema */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Estado del Sistema</Title>
          <List.Item
            title="Conexión a Internet"
            description={isOnline ? 'Conectado' : 'Sin conexión'}
            left={(props) => <List.Icon {...props} icon={isOnline ? 'wifi' : 'wifi-off'} />}
            right={() => (
              <Chip 
                mode="outlined"
                style={[styles.statusChip, { borderColor: isOnline ? '#4caf50' : '#f44336' }]}
                textStyle={{ color: isOnline ? '#4caf50' : '#f44336' }}
              >
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </Chip>
            )}
          />
          <List.Item
            title="Datos Offline"
            description={`${offlineData.medicalHistories.length} historias médicas`}
            left={(props) => <List.Icon {...props} icon="database" />}
          />
          <List.Item
            title="Sincronización Pendiente"
            description={`${offlineData.pendingSync} elementos`}
            left={(props) => <List.Icon {...props} icon="sync" />}
          />
        </Card.Content>
      </Card>

      {/* Botones */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleClearNotifications}
            style={styles.logoutButton}
          >
            {t('notifications.clearAll')}
          </Button>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#f44336"
          >
            {t('auth.logout')}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#1976d2',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleChip: {
    alignSelf: 'flex-start',
  },
  statusChip: {
    backgroundColor: 'transparent',
  },
  badgeChip: {
    backgroundColor: '#ff5722',
  },
  logoutButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
