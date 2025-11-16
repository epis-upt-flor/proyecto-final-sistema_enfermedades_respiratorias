import React, { useState } from 'react';
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
  TextInput,
} from 'react-native-paper';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../services/i18nService';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
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
  const { healthProfile, setHealthProfile, updatePreferences } = useAppStore();
  const [ageInput, setAgeInput] = useState(healthProfile?.age ? String(healthProfile.age) : '');
  const [baseDiagnosis, setBaseDiagnosis] = useState(healthProfile?.baseDiagnosis || '');
  const [riskFactors, setRiskFactors] = useState<string[]>(healthProfile?.riskFactors || []);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(healthProfile?.preferences?.remindersEnabled ?? true);
  const [notifFreq, setNotifFreq] = useState<'low' | 'normal' | 'high'>(healthProfile?.preferences?.notificationFrequency || 'normal');

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

      {/* Perfil de Salud */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>{t('profile.healthProfile')}</Title>
          <TextInput
            label={t('profile.age')}
            keyboardType="numeric"
            value={ageInput}
            onChangeText={setAgeInput}
            style={{ marginTop: 8 }}
            mode="outlined"
          />
          <TextInput
            label={t('profile.baseDiagnosis')}
            value={baseDiagnosis}
            onChangeText={setBaseDiagnosis}
            style={{ marginTop: 8 }}
            mode="outlined"
          />
          <Paragraph style={{ marginTop: 12, marginBottom: 4 }}>{t('profile.riskFactors')}</Paragraph>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {['Tabaquismo', 'Asma', 'EPOC', 'Alergias', 'Cardiopatías'].map((f) => {
              const selected = riskFactors.includes(f);
              return (
                <Chip
                  key={f}
                  selected={selected}
                  style={{ marginRight: 6, marginBottom: 6 }}
                  onPress={() => {
                    setRiskFactors((prev) =>
                      selected ? prev.filter((x) => x !== f) : [...prev, f]
                    );
                  }}
                >
                  {f}
                </Chip>
              );
            })}
          </View>

          <Divider style={{ marginVertical: 12 }} />

          <Title>{t('profile.preferences')}</Title>
          <List.Item
            title={t('profile.reminders')}
            description={remindersEnabled ? 'Activados' : 'Desactivados'}
            left={(props) => <List.Icon {...props} icon="bell-ring" />}
            right={() => (
              <Switch
                value={remindersEnabled}
                onValueChange={(v) => setRemindersEnabled(v)}
              />
            )}
          />
          <List.Item
            title={t('profile.notificationsFrequency')}
            description={notifFreq === 'low' ? t('profile.low') : notifFreq === 'high' ? t('profile.high') : t('profile.normal')}
            left={(props) => <List.Icon {...props} icon="tune" />}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Chip style={{ marginRight: 6 }} selected={notifFreq === 'low'} onPress={() => setNotifFreq('low')}>
                  {t('profile.low')}
                </Chip>
                <Chip style={{ marginRight: 6 }} selected={notifFreq === 'normal'} onPress={() => setNotifFreq('normal')}>
                  {t('profile.normal')}
                </Chip>
                <Chip selected={notifFreq === 'high'} onPress={() => setNotifFreq('high')}>
                  {t('profile.high')}
                </Chip>
              </View>
            )}
          />

          <Button
            mode="contained"
            style={{ marginTop: 12 }}
            onPress={() => {
              const age = ageInput ? parseInt(ageInput, 10) : undefined;
              setHealthProfile({
                age,
                baseDiagnosis: baseDiagnosis || undefined,
                riskFactors,
              });
              updatePreferences({
                remindersEnabled,
                notificationFrequency: notifFreq,
              });
              Alert.alert(t('profile.healthProfile'), t('profile.saved'));
            }}
          >
            {t('profile.saveProfile')}
          </Button>
        </Card.Content>
      </Card>

      {/* Privacidad y Consentimiento */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Privacidad y Consentimiento</Title>
          <List.Item
            title="Consentimiento Informado"
            description="Gestionar tu consentimiento para el procesamiento de datos"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            onPress={() => navigation.navigate('Consent')}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
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
