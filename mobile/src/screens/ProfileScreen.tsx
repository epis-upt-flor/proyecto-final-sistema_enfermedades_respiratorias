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

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          style: 'destructive',
          onPress: () => setUser(null)
        },
      ]
    );
  };

  const handleClearNotifications = () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Deseas eliminar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpiar', 
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
            <Title>No hay usuario logueado</Title>
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

      {/* Notificaciones */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Notificaciones</Title>
          <List.Item
            title="Notificaciones No Leídas"
            description={`${unreadNotifications} notificaciones`}
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
            title="Limpiar Notificaciones"
            description="Eliminar todas las notificaciones"
            left={(props) => <List.Icon {...props} icon="delete-sweep" />}
            onPress={handleClearNotifications}
          />
        </Card.Content>
      </Card>

      {/* Configuración */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Configuración</Title>
          <List.Item
            title="Notificaciones Push"
            description="Recibir notificaciones importantes"
            left={(props) => <List.Icon {...props} icon="bell-ring" />}
            right={() => <Switch value={true} onValueChange={() => {}} />}
          />
          <List.Item
            title="Sincronización Automática"
            description="Sincronizar datos automáticamente"
            left={(props) => <List.Icon {...props} icon="sync" />}
            right={() => <Switch value={true} onValueChange={() => {}} />}
          />
          <List.Item
            title="Modo de Tema"
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

      {/* Información de la App */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Información de la App</Title>
          <List.Item
            title="Versión"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <List.Item
            title="Última Sincronización"
            description={new Date(offlineData.lastSync).toLocaleString()}
            left={(props) => <List.Icon {...props} icon="clock" />}
          />
          <List.Item
            title="Soporte Técnico"
            description="Contactar soporte"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={() => Alert.alert('Soporte', 'Contacto: soporte@respicare.com')}
          />
        </Card.Content>
      </Card>

      {/* Botón de Cerrar Sesión */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            buttonColor="#f44336"
          >
            Cerrar Sesión
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
  logoutButtonContent: {
    paddingVertical: 8,
  },
});

export default ProfileScreen;
