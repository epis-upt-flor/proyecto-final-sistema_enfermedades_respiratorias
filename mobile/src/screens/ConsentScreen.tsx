/**
 * Consent Screen
 * 
 * Pantalla de consentimiento explícito para usuarios (GDPR/HIPAA)
 * Registra el consentimiento y lo almacena para auditoría
 */

import React, { useState, useCallback } from 'react';
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
  Checkbox,
  Button,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { localStorageService } from '../services/localStorage';
import { apiService } from '../services/api';
import { analyticsService } from '../services/analyticsService';

interface ConsentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  checked: boolean;
}

const ConsentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = useAppStore((s) => s.user);
  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      id: 'data_processing',
      title: 'Procesamiento de Datos de Salud',
      description:
        'Consiento que mis datos de salud sean procesados para proporcionar servicios médicos, análisis de síntomas y recomendaciones de salud. Estos datos se almacenan de forma segura y encriptada.',
      required: true,
      checked: false,
    },
    {
      id: 'analytics',
      title: 'Analytics y Mejora del Servicio',
      description:
        'Consiento que mis datos anonimizados sean utilizados para mejorar el servicio, análisis estadísticos y desarrollo de modelos de IA. Los datos personales identificables no se compartirán.',
      required: false,
      checked: false,
    },
    {
      id: 'notifications',
      title: 'Notificaciones y Recordatorios',
      description:
        'Consiento recibir notificaciones sobre citas médicas, recordatorios de medicamentos, alertas de salud y actualizaciones del servicio.',
      required: false,
      checked: false,
    },
    {
      id: 'data_sharing',
      title: 'Compartir con Médicos',
      description:
        'Consiento que mis datos de salud sean compartidos con los médicos asignados para proporcionar atención médica adecuada.',
      required: true,
      checked: false,
    },
  ]);

  const toggleConsent = useCallback((id: string) => {
    setConsents((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const handleAccept = useCallback(async () => {
    // Validar que los consentimientos requeridos estén marcados
    const requiredConsents = consents.filter((c) => c.required);
    const allRequiredChecked = requiredConsents.every((c) => c.checked);

    if (!allRequiredChecked) {
      Alert.alert(
        'Consentimiento Requerido',
        'Debes aceptar todos los consentimientos requeridos para continuar.'
      );
      return;
    }

    try {
      const consentData = {
        userId: user?.id,
        consents: consents.map((c) => ({
          id: c.id,
          accepted: c.checked,
          timestamp: new Date().toISOString(),
        })),
        version: '1.0',
        timestamp: new Date().toISOString(),
      };

      // Guardar localmente
      await localStorageService.setItem('user_consent', consentData);

      // Enviar al backend (si está online)
      try {
        const response = await apiService.post('/api/v1/consent', consentData);
        if (response.data?.success) {
          analyticsService.logEvent('consent.accepted', {
            userId: user?.id,
            consents: consents.filter((c) => c.checked).map((c) => c.id),
            version: consentData.version,
          });
          
          // Guardar ID del log de consentimiento para referencia
          if (response.data.data?.id) {
            await localStorageService.setItem('consent_log_id', response.data.data.id);
          }
        }
      } catch (error) {
        // Si falla, se guardará localmente y se sincronizará después
        console.warn('Error enviando consentimiento al servidor, guardado localmente', error);
        // Marcar para sincronización posterior
        await localStorageService.setItem('consent_pending_sync', 'true');
      }

      // Marcar consentimiento como completado
      await localStorageService.setItem('consent_completed', 'true');

      Alert.alert('Consentimiento Registrado', 'Tu consentimiento ha sido registrado correctamente.', [
        {
          text: 'Continuar',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error guardando consentimiento', error);
      Alert.alert('Error', 'No se pudo guardar el consentimiento. Por favor, intenta nuevamente.');
    }
  }, [consents, user?.id, navigation]);

  const handleDecline = useCallback(() => {
    Alert.alert(
      'Consentimiento Requerido',
      'Para usar RespiCare, es necesario aceptar los consentimientos requeridos. Puedes revisar nuestra política de privacidad en cualquier momento.',
      [
        {
          text: 'Revisar Política',
          onPress: () => {
            // Navegar a política de privacidad si existe
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Consentimiento Informado</Title>
            <Paragraph style={styles.headerDescription}>
              Para usar RespiCare, necesitamos tu consentimiento explícito para procesar tus datos de salud.
              Por favor, lee cuidadosamente cada sección y marca las casillas correspondientes.
            </Paragraph>
          </Card.Content>
        </Card>

        {consents.map((consent, index) => (
          <Card key={consent.id} style={styles.consentCard}>
            <Card.Content>
              <View style={styles.consentHeader}>
                <Title style={styles.consentTitle}>
                  {consent.title}
                  {consent.required && <Paragraph style={styles.required}> *</Paragraph>}
                </Title>
              </View>
              <Paragraph style={styles.consentDescription}>{consent.description}</Paragraph>
              <Checkbox
                status={consent.checked ? 'checked' : 'unchecked'}
                onPress={() => toggleConsent(consent.id)}
                disabled={consent.required && consents.find((c) => c.id === consent.id)?.checked === false}
              />
            </Card.Content>
            {index < consents.length - 1 && <Divider />}
          </Card>
        ))}

        <Card style={styles.footerCard}>
          <Card.Content>
            <Paragraph style={styles.footerText}>
              Puedes retirar tu consentimiento en cualquier momento desde la configuración de tu perfil.
              Para más información, consulta nuestra{' '}
              <Paragraph style={styles.linkText}>Política de Privacidad</Paragraph>.
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleDecline}
          style={styles.declineButton}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleAccept}
          style={styles.acceptButton}
        >
          Aceptar y Continuar
        </Button>
      </View>
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
  },
  content: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  consentCard: {
    marginBottom: 12,
    elevation: 2,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  required: {
    color: '#f44336',
    fontSize: 18,
  },
  consentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  footerCard: {
    marginTop: 8,
    marginBottom: 16,
    elevation: 1,
    backgroundColor: '#e3f2fd',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  linkText: {
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  declineButton: {
    flex: 1,
  },
  acceptButton: {
    flex: 1,
  },
});

export default ConsentScreen;

