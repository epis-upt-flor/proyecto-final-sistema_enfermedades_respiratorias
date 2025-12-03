import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Linking,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Snackbar,
  Divider,
  List,
  IconButton,
  Portal,
  Dialog,
  Switch,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { RootStackParamList } from '../types';
import {
  telemedicineService,
  WaitingRoomParticipant,
  RecordingStatus,
} from '../services/telemedicineService';
import { localStorageService } from '../services/localStorage';

type Props = {
  route: RouteProp<RootStackParamList, 'AppointmentDetail'>;
};

const AppointmentDetailScreen: React.FC<Props> = ({ route }) => {
  const { appointmentId, fromError } = route.params || { appointmentId: '' } as any;
  const navigation = useNavigation<any>();
  
  // Estados principales
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  });
  const [refreshing, setRefreshing] = useState(false);

  // Estados de telemedicina
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [inWaitingRoom, setInWaitingRoom] = useState(false);
  const [waitingRoomParticipants, setWaitingRoomParticipants] = useState<WaitingRoomParticipant[]>([]);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus | null>(null);
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [showWaitingRoom, setShowWaitingRoom] = useState(false);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'doctor'>('patient');

  // Cargar información de la cita y llamada
  useEffect(() => {
    loadAppointmentData();
    loadCallData();
  }, [appointmentId]);

  // Polling para sala de espera
  useEffect(() => {
    if (inWaitingRoom && currentCall) {
      const interval = setInterval(() => {
        loadWaitingRoomParticipants();
      }, 3000); // Actualizar cada 3 segundos

      return () => clearInterval(interval);
    }
  }, [inWaitingRoom, currentCall]);

  const loadAppointmentData = async () => {
    try {
      // Obtener información del usuario actual para determinar el rol
      const user = await localStorageService.getUser();
      if (user?.role === 'doctor') {
        setUserRole('doctor');
      } else {
        setUserRole('patient');
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
    }
  };

  const loadCallData = async () => {
    try {
      const call = telemedicineService.getCurrentCall();
      if (call && call.appointmentId === appointmentId) {
        setCurrentCall(call);
        setInWaitingRoom(call.status === 'waiting');
        setScreenShareActive(telemedicineService.getScreenShareStatus()?.enabled || false);
        setRecordingStatus(telemedicineService.getRecordingStatus());
      }
    } catch (error) {
      console.error('Error loading call data:', error);
    }
  };

  const loadWaitingRoomParticipants = async () => {
    if (!currentCall) return;

    try {
      const participants = await telemedicineService.getWaitingRoomParticipants(currentCall.id);
      setWaitingRoomParticipants(participants);
    } catch (error) {
      console.error('Error loading waiting room participants:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadAppointmentData(), loadCallData()]);
    setRefreshing(false);
  }, []);

  /**
   * Iniciar consulta de telemedicina
   */
  const startConsultation = useCallback(async () => {
    try {
      setStarting(true);

      // Crear o obtener la llamada
      let call = currentCall;
      if (!call) {
        const user = await localStorageService.getUser();
        call = await telemedicineService.createCall({
          appointmentId,
          doctorId: '', // Se obtendrá del backend
          patientId: user?.id || '',
          provider: 'jitsi',
          waitingRoomEnabled: true,
          screenSharingEnabled: true,
          recordingEnabled: recordingEnabled,
        });

        if (!call) {
          Alert.alert('Error', 'No se pudo crear la llamada de telemedicina');
          return;
        }
      }

      setCurrentCall(call);

      // Si la sala de espera está habilitada, entrar primero ahí
      if (call.waitingRoomEnabled) {
        const user = await localStorageService.getUser();
        const joined = await telemedicineService.joinWaitingRoom(call.id, {
          id: user?.id || '',
          name: user?.name || 'Usuario',
          role: userRole,
          isReady: false,
        });

        if (joined) {
          setInWaitingRoom(true);
          setShowWaitingRoom(true);
          await loadWaitingRoomParticipants();
        } else {
          Alert.alert('Error', 'No se pudo entrar a la sala de espera');
        }
      } else {
        // Ir directamente a la videollamada
        await joinVideoCall(call);
      }
    } catch (e) {
      console.error('Error starting consultation:', e);
      Alert.alert('Error', 'Fallo al iniciar la consulta');
    } finally {
      setStarting(false);
    }
  }, [appointmentId, currentCall, userRole, recordingEnabled]);

  /**
   * Unirse a la videollamada
   */
  const joinVideoCall = async (call: any) => {
    try {
      const started = await telemedicineService.startCall(call.id);
      if (started) {
        const joined = await telemedicineService.joinCall(call, userRole);
        if (joined) {
          setInWaitingRoom(false);
          setShowWaitingRoom(false);
        } else {
          Alert.alert('Error', 'No se pudo abrir la videollamada');
        }
      } else {
        Alert.alert('Error', 'No se pudo iniciar la llamada');
      }
    } catch (error) {
      console.error('Error joining video call:', error);
      Alert.alert('Error', 'Fallo al unirse a la videollamada');
    }
  };

  /**
   * Marcar como listo en la sala de espera
   */
  const markReady = async () => {
    if (!currentCall) return;

    try {
      const user = await localStorageService.getUser();
      const success = await telemedicineService.markReady(
        currentCall.id,
        user?.id || '',
        true
      );

      if (success) {
        setSnackbar({
          visible: true,
          message: 'Marcado como listo. Esperando admisión del doctor...',
        });
        await loadWaitingRoomParticipants();
      }
    } catch (error) {
      console.error('Error marking ready:', error);
      Alert.alert('Error', 'No se pudo marcar como listo');
    }
  };

  /**
   * Admitir participante (solo doctor)
   */
  const admitParticipant = async (participantId: string) => {
    if (!currentCall || userRole !== 'doctor') return;

    try {
      const success = await telemedicineService.admitParticipant(
        currentCall.id,
        participantId
      );

      if (success) {
        setSnackbar({
          visible: true,
          message: 'Participante admitido',
        });
        await loadWaitingRoomParticipants();

        // Si es el último participante, iniciar la llamada
        const remaining = waitingRoomParticipants.filter(
          p => p.id !== participantId && !p.isReady
        );
        if (remaining.length === 0) {
          setTimeout(() => {
            joinVideoCall(currentCall);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error admitting participant:', error);
      Alert.alert('Error', 'No se pudo admitir al participante');
    }
  };

  /**
   * Compartir pantalla
   */
  const handleScreenShare = async () => {
    if (!currentCall) return;

    try {
      const user = await localStorageService.getUser();
      if (screenShareActive) {
        const success = await telemedicineService.stopScreenShare(
          currentCall.id,
          user?.id || ''
        );
        if (success) {
          setScreenShareActive(false);
          setSnackbar({
            visible: true,
            message: 'Compartir pantalla detenido',
          });
        }
      } else {
        const success = await telemedicineService.startScreenShare(
          currentCall.id,
          user?.id || ''
        );
        if (success) {
          setScreenShareActive(true);
          setSnackbar({
            visible: true,
            message: 'Compartir pantalla iniciado',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de compartir pantalla');
    }
  };

  /**
   * Iniciar grabación
   */
  const handleStartRecording = async () => {
    if (!currentCall) return;

    try {
      const success = await telemedicineService.startRecording(currentCall.id, {
        enabled: true,
        quality: 'high',
        includeAudio: true,
        includeVideo: true,
      });

      if (success) {
        setRecordingStatus('recording');
        setShowRecordingDialog(false);
        setSnackbar({
          visible: true,
          message: 'Grabación iniciada',
        });
      } else {
        Alert.alert('Error', 'No se pudo iniciar la grabación');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Fallo al iniciar la grabación');
    }
  };

  /**
   * Pausar/Reanudar grabación
   */
  const handlePauseResumeRecording = async () => {
    if (!currentCall) return;

    try {
      if (recordingStatus === 'recording') {
        const success = await telemedicineService.pauseRecording(currentCall.id);
        if (success) {
          setRecordingStatus('paused');
          setSnackbar({
            visible: true,
            message: 'Grabación pausada',
          });
        }
      } else if (recordingStatus === 'paused') {
        const success = await telemedicineService.resumeRecording(currentCall.id);
        if (success) {
          setRecordingStatus('recording');
          setSnackbar({
            visible: true,
            message: 'Grabación reanudada',
          });
        }
      }
    } catch (error) {
      console.error('Error pausing/resuming recording:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado de la grabación');
    }
  };

  /**
   * Detener grabación
   */
  const handleStopRecording = async () => {
    if (!currentCall) return;

    try {
      const recordingUrl = await telemedicineService.stopRecording(currentCall.id);
      if (recordingUrl) {
        setRecordingStatus('stopped');
        setSnackbar({
          visible: true,
          message: 'Grabación detenida. URL: ' + recordingUrl.substring(0, 50) + '...',
        });
      } else {
        Alert.alert('Error', 'No se pudo detener la grabación');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Fallo al detener la grabación');
    }
  };

  /**
   * Finalizar llamada
   */
  const handleEndCall = async () => {
    if (!currentCall) return;

    Alert.alert(
      'Finalizar Llamada',
      '¿Está seguro de que desea finalizar la llamada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await telemedicineService.endCall(currentCall.id);
              if (success) {
                setCurrentCall(null);
                setInWaitingRoom(false);
                setShowWaitingRoom(false);
                setScreenShareActive(false);
                setRecordingStatus(null);
                setSnackbar({
                  visible: true,
                  message: 'Llamada finalizada',
                });
              }
            } catch (error) {
              console.error('Error ending call:', error);
              Alert.alert('Error', 'No se pudo finalizar la llamada');
            }
          },
        },
      ]
    );
  };

  const retrySave = useCallback(async () => {
    try {
      setSaving(true);
      await localStorageService.retrySyncNow();
      const cached = await localStorageService.getCachedAppointments<any>();
      const appt = cached.find((a: any) => a._id === appointmentId || a.id === appointmentId);
      if (!appt || (appt.syncStatus !== 'pending' && appt.syncStatus !== 'error')) {
        navigation.goBack();
        return;
      }
      setSnackbar({ visible: true, message: 'Sincronización en curso. La cita sigue pendiente.' });
    } catch (e) {
      setSnackbar({ visible: true, message: 'No fue posible reintentar en este momento.' });
    } finally {
      setSaving(false);
    }
  }, [appointmentId, navigation]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {fromError && (
        <Card style={styles.banner}>
          <Card.Content>
            <Paragraph style={{ color: '#f44336' }}>
              Esta cita no se sincronizó. Guarda nuevamente para reintentar la sincronización.
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <Title>Detalle de Cita</Title>
          <Paragraph>ID: {appointmentId || 'N/A'}</Paragraph>
          <Chip mode="outlined" style={{ marginTop: 8 }}>
            {currentCall ? currentCall.status : 'Programada'}
          </Chip>

          {/* Estado de la llamada */}
          {currentCall && (
            <View style={styles.callStatusContainer}>
              <Divider style={styles.divider} />
              <Title style={styles.sectionTitle}>Estado de la Llamada</Title>
              
              {inWaitingRoom && (
                <Card style={styles.waitingRoomCard}>
                  <Card.Content>
                    <Paragraph style={styles.waitingRoomText}>
                      ⏳ En sala de espera...
                    </Paragraph>
                    <Button
                      mode="contained"
                      onPress={markReady}
                      style={styles.readyButton}
                    >
                      Marcar como Listo
                    </Button>
                  </Card.Content>
                </Card>
              )}

              {currentCall.status === 'active' && (
                <View style={styles.activeCallControls}>
                  <Button
                    mode={screenShareActive ? 'contained' : 'outlined'}
                    onPress={handleScreenShare}
                    icon={screenShareActive ? 'monitor-off' : 'monitor-share'}
                  >
                    {screenShareActive ? 'Detener Pantalla' : 'Compartir Pantalla'}
                  </Button>

                  {currentCall.recordingEnabled && (
                    <View style={styles.recordingControls}>
                      {recordingStatus === null && (
                        <Button
                          mode="outlined"
                          onPress={() => setShowRecordingDialog(true)}
                          icon="record"
                        >
                          Iniciar Grabación
                        </Button>
                      )}

                      {recordingStatus === 'recording' && (
                        <>
                          <Chip icon="record" style={styles.recordingChip}>
                            Grabando...
                          </Chip>
                          <IconButton
                            icon="pause"
                            onPress={handlePauseResumeRecording}
                          />
                          <IconButton
                            icon="stop"
                            onPress={handleStopRecording}
                          />
                        </>
                      )}

                      {recordingStatus === 'paused' && (
                        <>
                          <Chip icon="pause" style={styles.recordingChip}>
                            Pausado
                          </Chip>
                          <IconButton
                            icon="play"
                            onPress={handlePauseResumeRecording}
                          />
                          <IconButton
                            icon="stop"
                            onPress={handleStopRecording}
                          />
                        </>
                      )}

                      {recordingStatus === 'stopped' && currentCall.recordingUrl && (
                        <Button
                          mode="outlined"
                          onPress={() => Linking.openURL(currentCall.recordingUrl!)}
                          icon="download"
                        >
                          Ver Grabación
                        </Button>
                      )}
                    </View>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleEndCall}
                    buttonColor="#f44336"
                    style={styles.endCallButton}
                  >
                    Finalizar Llamada
                  </Button>
                </View>
              )}
            </View>
          )}

          {/* Controles principales */}
          <View style={styles.actionsContainer}>
            {!currentCall && (
              <>
                <View style={styles.recordingToggle}>
                  <Text>Habilitar grabación:</Text>
                  <Switch
                    value={recordingEnabled}
                    onValueChange={setRecordingEnabled}
                  />
                </View>
                <Button
                  mode="outlined"
                  onPress={retrySave}
                  loading={saving}
                  style={styles.actionButton}
                >
                  Guardar
                </Button>
                <Button
                  mode="contained"
                  onPress={startConsultation}
                  loading={starting}
                  style={styles.actionButton}
                  icon="video"
                >
                  Iniciar Consulta
                </Button>
              </>
            )}

            {currentCall && currentCall.status === 'waiting' && (
              <Button
                mode="outlined"
                onPress={() => setShowWaitingRoom(true)}
                icon="account-group"
              >
                Ver Sala de Espera
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Dialog de Sala de Espera */}
      <Portal>
        <Dialog
          visible={showWaitingRoom}
          onDismiss={() => setShowWaitingRoom(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Sala de Espera</Dialog.Title>
          <Dialog.Content>
            <ScrollView style={styles.waitingRoomList}>
              {waitingRoomParticipants.length === 0 ? (
                <Paragraph>No hay participantes en la sala de espera</Paragraph>
              ) : (
                waitingRoomParticipants.map((participant) => (
                  <Card key={participant.id} style={styles.participantCard}>
                    <Card.Content>
                      <View style={styles.participantRow}>
                        <View style={styles.participantInfo}>
                          <Paragraph style={styles.participantName}>
                            {participant.name}
                          </Paragraph>
                          <Chip mode="outlined" style={styles.roleChip}>
                            {participant.role === 'doctor' ? 'Doctor' : 'Paciente'}
                          </Chip>
                          {participant.isReady && (
                            <Chip icon="check" style={styles.readyChip}>
                              Listo
                            </Chip>
                          )}
                        </View>
                        {userRole === 'doctor' && !participant.isReady && (
                          <Button
                            mode="contained"
                            onPress={() => admitParticipant(participant.id)}
                            compact
                          >
                            Admitir
                          </Button>
                        )}
                      </View>
                    </Card.Content>
                  </Card>
                ))
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowWaitingRoom(false)}>Cerrar</Button>
            {userRole === 'doctor' &&
              waitingRoomParticipants.filter((p) => p.isReady).length > 0 && (
                <Button
                  mode="contained"
                  onPress={() => {
                    setShowWaitingRoom(false);
                    joinVideoCall(currentCall);
                  }}
                >
                  Iniciar Llamada
                </Button>
              )}
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Dialog de Grabación */}
      <Portal>
        <Dialog
          visible={showRecordingDialog}
          onDismiss={() => setShowRecordingDialog(false)}
        >
          <Dialog.Title>Iniciar Grabación</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              ¿Desea iniciar la grabación de esta sesión? La grabación incluirá audio y video.
            </Paragraph>
            <Paragraph style={styles.warningText}>
              ⚠️ Asegúrese de tener el consentimiento de todos los participantes.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRecordingDialog(false)}>Cancelar</Button>
            <Button mode="contained" onPress={handleStartRecording}>
              Iniciar Grabación
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  banner: {
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  card: {
    elevation: 2,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  callStatusContainer: {
    marginTop: 16,
  },
  waitingRoomCard: {
    backgroundColor: '#fff3cd',
    marginBottom: 12,
  },
  waitingRoomText: {
    fontSize: 16,
    marginBottom: 8,
  },
  readyButton: {
    marginTop: 8,
  },
  activeCallControls: {
    gap: 12,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  recordingChip: {
    backgroundColor: '#f44336',
  },
  endCallButton: {
    marginTop: 16,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    marginTop: 8,
  },
  recordingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
  },
  dialog: {
    maxHeight: '80%',
  },
  waitingRoomList: {
    maxHeight: 300,
  },
  participantCard: {
    marginBottom: 8,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    fontWeight: 'bold',
  },
  roleChip: {
    height: 24,
  },
  readyChip: {
    height: 24,
    backgroundColor: '#4caf50',
  },
  warningText: {
    color: '#f44336',
    marginTop: 8,
    fontSize: 12,
  },
});

export default AppointmentDetailScreen;
