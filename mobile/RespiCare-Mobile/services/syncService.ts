/**
 * Servicio de Sincronización Offline
 * 
 * Este servicio maneja la sincronización automática de datos offline
 * cuando se restaura la conexión a internet.
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { databaseService, MedicalHistoryRow, AppointmentRow, WearableDataRow } from './databaseService';
import { API_ENDPOINTS } from '@/constants/config';

class SyncService {
  private syncInProgress: boolean = false;
  private syncListeners: Array<() => void> = [];

  /**
   * Inicializar el servicio de sincronización
   */
  async initialize(): Promise<void> {
    // Inicializar base de datos
    await databaseService.initialize();

    // Configurar listener de conectividad
    NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        // Cuando hay conexión, sincronizar automáticamente
        this.syncAll().catch(error => {
          console.error('Error en sincronización automática:', error);
        });
      }
    });

    // Sincronizar al iniciar si hay conexión
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      await this.syncAll();
    }
  }

  /**
   * Sincronizar todos los datos pendientes
   */
  async syncAll(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sincronización ya en progreso, omitiendo...');
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected || !netInfo.isInternetReachable) {
      console.log('Sin conexión a internet, no se puede sincronizar');
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Iniciando sincronización de datos offline...');

    try {
      // Sincronizar historias médicas
      await this.syncMedicalHistories();

      // Sincronizar citas
      await this.syncAppointments();

      // Sincronizar datos de wearables
      await this.syncWearableData();

      console.log('✅ Sincronización completada exitosamente');
      
      // Notificar a los listeners
      this.syncListeners.forEach(listener => listener());
    } catch (error) {
      console.error('❌ Error durante la sincronización:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sincronizar historias médicas pendientes
   */
  private async syncMedicalHistories(): Promise<void> {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No hay token de autenticación, omitiendo sincronización de historias médicas');
      return;
    }

    const pendingHistories = await databaseService.getPendingMedicalHistories();
    console.log(`📋 Sincronizando ${pendingHistories.length} historias médicas...`);

    for (const history of pendingHistories) {
      try {
        // Convertir JSON strings de vuelta a objetos
        const historyData = {
          ...history,
          symptoms: JSON.parse(history.symptoms),
          location: history.location ? JSON.parse(history.location) : undefined,
          images: history.images ? JSON.parse(history.images) : undefined,
        };

        const response = await fetch(API_ENDPOINTS.MEDICAL_HISTORY.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(historyData),
        });

        if (response.ok) {
          const data = await response.json();
          const syncedHistory = data.data;

          // Actualizar en la base de datos local con el ID del servidor
          const syncedHistoryData = {
            ...history,
            id: syncedHistory._id || syncedHistory.id || history.id,
            syncStatus: 'synced' as const,
            updatedAt: new Date().toISOString(),
          };
          await databaseService.saveMedicalHistory({
            ...syncedHistoryData,
            symptoms: typeof syncedHistoryData.symptoms === 'string' 
              ? syncedHistoryData.symptoms 
              : JSON.stringify(syncedHistoryData.symptoms),
            location: syncedHistoryData.location 
              ? (typeof syncedHistoryData.location === 'string' 
                  ? syncedHistoryData.location 
                  : JSON.stringify(syncedHistoryData.location))
              : null,
            images: syncedHistoryData.images
              ? (typeof syncedHistoryData.images === 'string'
                  ? syncedHistoryData.images
                  : JSON.stringify(syncedHistoryData.images))
              : null,
          });

          console.log(`✅ Historia médica ${history.id} sincronizada`);
        } else {
          // Marcar como error
          await databaseService.saveMedicalHistory({
            ...history,
            syncStatus: 'error',
            updatedAt: new Date().toISOString(),
          });
          console.error(`❌ Error sincronizando historia ${history.id}: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error sincronizando historia ${history.id}:`, error);
        // Marcar como error
        await databaseService.saveMedicalHistory({
          ...history,
          syncStatus: 'error',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Sincronizar citas pendientes
   */
  private async syncAppointments(): Promise<void> {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No hay token de autenticación, omitiendo sincronización de citas');
      return;
    }

    const pendingAppointments = await databaseService.getPendingAppointments();
    console.log(`📅 Sincronizando ${pendingAppointments.length} citas...`);

    for (const appointment of pendingAppointments) {
      try {
        const response = await fetch(API_ENDPOINTS.APPOINTMENTS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: appointment.doctorId,
            patientId: appointment.patientId,
            scheduledAt: appointment.scheduledAt,
            durationMinutes: appointment.durationMinutes,
            status: appointment.status,
            reason: appointment.reason,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const syncedAppointment = data.data;

          await databaseService.saveAppointment({
            ...appointment,
            id: syncedAppointment._id || syncedAppointment.id || appointment.id,
            syncStatus: 'synced',
            updatedAt: new Date().toISOString(),
          });

          console.log(`✅ Cita ${appointment.id} sincronizada`);
        } else {
          await databaseService.saveAppointment({
            ...appointment,
            syncStatus: 'error',
            updatedAt: new Date().toISOString(),
          });
          console.error(`❌ Error sincronizando cita ${appointment.id}: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error sincronizando cita ${appointment.id}:`, error);
        await databaseService.saveAppointment({
          ...appointment,
          syncStatus: 'error',
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Sincronizar datos de wearables pendientes (en lotes)
   */
  private async syncWearableData(): Promise<void> {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('No hay token de autenticación, omitiendo sincronización de wearables');
      return;
    }

    const pendingData = await databaseService.getPendingWearableData();
    if (pendingData.length === 0) {
      return;
    }

    console.log(`⌚ Sincronizando ${pendingData.length} registros de wearables...`);

    // Agrupar datos para enviar en lotes (máximo 100 por lote)
    const batchSize = 100;
    for (let i = 0; i < pendingData.length; i += batchSize) {
      const batch = pendingData.slice(i, i + batchSize);
      
      try {
        // Preparar datos del lote
        const dataToSync = batch.map(row => ({
          heartRate: row.heartRate,
          steps: row.steps,
          spo2: row.spo2,
          timestamp: row.timestamp,
          source: row.source,
        }));

        const response = await fetch(API_ENDPOINTS.WEARABLES.SYNC, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ data: dataToSync }),
        });

        if (response.ok) {
          // Marcar todo el lote como sincronizado
          for (const data of batch) {
            await databaseService.saveWearableData({
              ...data,
              syncStatus: 'synced' as const,
              updatedAt: new Date().toISOString(),
            });
          }
          console.log(`✅ Lote de ${batch.length} registros de wearables sincronizado`);
        } else {
          // Marcar todo el lote como error
          for (const data of batch) {
            await databaseService.saveWearableData({
              ...data,
              syncStatus: 'error' as const,
              updatedAt: new Date().toISOString(),
            });
          }
          console.error(`❌ Error sincronizando lote de wearables: ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Error sincronizando lote de wearables:`, error);
        // Marcar todo el lote como error
        for (const data of batch) {
          await databaseService.saveWearableData({
            ...data,
            syncStatus: 'error' as const,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  /**
   * Agregar listener para eventos de sincronización
   */
  addSyncListener(listener: () => void): void {
    this.syncListeners.push(listener);
  }

  /**
   * Remover listener
   */
  removeSyncListener(listener: () => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  /**
   * Verificar si hay sincronización en progreso
   */
  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

// Exportar instancia singleton
export const syncService = new SyncService();

