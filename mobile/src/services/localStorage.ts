/**
 * Local Storage Service - Handles offline data storage and synchronization
 * Implements queue-based sync for offline-first functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from './api';
import { MedicalHistory, SymptomAnalysis } from './api';
import { telemedicineService } from './telemedicineService';

// Types
export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'medical_history' | 'symptom_analysis' | 'user_profile' | 'appointment' | 'alert';
  data: any;
  timestamp: number;
  retryCount: number;
  operation?: 'RESCHEDULE' | 'CANCEL' | 'ACK';
}

export interface OfflineData {
  medicalHistories: MedicalHistory[];
  symptomAnalyses: SymptomAnalysis[];
  pendingSync: SyncQueueItem[];
  lastSyncTimestamp: number;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingItems: number;
  lastSyncTime: string | null;
  syncErrors: string[];
}

class LocalStorageService {
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing: boolean = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];
  private readonly SECURE_PREFIX = 'secure_';

  // Storage keys
  private readonly KEYS = {
    MEDICAL_HISTORIES: 'medical_histories',
    SYMPTOM_ANALYSES: 'symptom_analyses',
    SYNC_QUEUE: 'sync_queue',
    LAST_SYNC: 'last_sync_timestamp',
    USER_DATA: 'user_data',
    SETTINGS: 'app_settings',
    LAST_PREDICTIONS: 'last_predictions',
    AUTH_TOKENS: 'auth_tokens',
    CURRENT_USER: 'current_user',
    APPOINTMENTS: 'appointments_cache',
    ALERTS_CACHE: 'alerts_cache',
  };

  constructor() {
    this.initializeSyncListener();
    this.loadSyncQueue();
  }

  // Initialize network listener for auto-sync
  private initializeSyncListener(): void {
    NetInfo.addEventListener(state => {
      const isOnline = state.isConnected ?? false;
      
      if (isOnline && this.syncQueue.length > 0) {
        this.syncPendingData();
      }
    });
  }

  // Load sync queue from storage
  private async loadSyncQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(this.KEYS.SYNC_QUEUE);
      if (queueData) {
        this.syncQueue = JSON.parse(queueData);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  // Save sync queue to storage
  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  // Add item to sync queue
  private async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const syncItem: SyncQueueItem = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      ...item,
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();
    this.notifySyncListeners();
  }

  // Medical History methods
  async getMedicalHistories(): Promise<MedicalHistory[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.MEDICAL_HISTORIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting medical histories:', error);
      return [];
    }
  }

  async saveMedicalHistory(history: MedicalHistory): Promise<void> {
    try {
      const histories = await this.getMedicalHistories();
      const existingIndex = histories.findIndex(h => h.id === history.id);
      
      if (existingIndex >= 0) {
        histories[existingIndex] = history;
      } else {
        histories.push(history);
      }

      await AsyncStorage.setItem(this.KEYS.MEDICAL_HISTORIES, JSON.stringify(histories));
      
      // Add to sync queue if online, otherwise queue for later
      const isOnline = (await NetInfo.fetch()).isConnected ?? false;
      if (isOnline) {
        try {
          if (existingIndex >= 0) {
            await apiService.put(`/medical-histories/${history.id}`, history);
          } else {
            await apiService.post('/medical-histories', history);
          }
        } catch (error) {
          await this.addToSyncQueue({
            type: existingIndex >= 0 ? 'UPDATE' : 'CREATE',
            entity: 'medical_history',
            data: history,
          });
        }
      } else {
        await this.addToSyncQueue({
          type: existingIndex >= 0 ? 'UPDATE' : 'CREATE',
          entity: 'medical_history',
          data: history,
        });
      }
    } catch (error) {
      console.error('Error saving medical history:', error);
      throw error;
    }
  }

  async deleteMedicalHistory(id: string): Promise<void> {
    try {
      const histories = await this.getMedicalHistories();
      const filteredHistories = histories.filter(h => h.id !== id);
      
      await AsyncStorage.setItem(this.KEYS.MEDICAL_HISTORIES, JSON.stringify(filteredHistories));
      
      // Add to sync queue
      const isOnline = (await NetInfo.fetch()).isConnected ?? false;
      if (isOnline) {
        try {
          await apiService.delete(`/medical-histories/${id}`);
        } catch (error) {
          await this.addToSyncQueue({
            type: 'DELETE',
            entity: 'medical_history',
            data: { id },
          });
        }
      } else {
        await this.addToSyncQueue({
          type: 'DELETE',
          entity: 'medical_history',
          data: { id },
        });
      }
    } catch (error) {
      console.error('Error deleting medical history:', error);
      throw error;
    }
  }

  // Symptom Analysis methods
  async getSymptomAnalyses(): Promise<SymptomAnalysis[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SYMPTOM_ANALYSES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting symptom analyses:', error);
      return [];
    }
  }

  async saveSymptomAnalysis(analysis: SymptomAnalysis): Promise<void> {
    try {
      const analyses = await this.getSymptomAnalyses();
      analyses.push(analysis);
      
      await AsyncStorage.setItem(this.KEYS.SYMPTOM_ANALYSES, JSON.stringify(analyses));
      // Analyses are typically read-only after creation; no server sync mandatory here
    } catch (error) {
      console.error('Error saving symptom analysis:', error);
      throw error;
    }
  }

  // Appointments cache & offline operations
  async getCachedAppointments<T = any>(): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.APPOINTMENTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error getting appointments cache:', e);
      return [];
    }
  }

  private async setCachedAppointments(list: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.APPOINTMENTS, JSON.stringify(list));
    } catch (e) {
      console.error('Error setting appointments cache:', e);
    }
  }

  async createAppointment(payload: any): Promise<boolean> {
    const isOnline = (await NetInfo.fetch()).isConnected ?? false;
    if (isOnline) {
      const created = await telemedicineService.createAppointment(payload);
      if (created) {
        const list = await this.getCachedAppointments();
        await this.setCachedAppointments([created, ...list]);
        return true;
      }
    }
    // queue for later
    await this.addToSyncQueue({ type: 'CREATE', entity: 'appointment', data: payload });
    const list = await this.getCachedAppointments();
    await this.setCachedAppointments([{ ...payload, _id: `local_${Date.now()}`, status: 'scheduled', syncStatus: 'pending' }, ...list]);
    return true;
  }

  async rescheduleAppointment(appointmentId: string, scheduledAt: string): Promise<boolean> {
    const isOnline = (await NetInfo.fetch()).isConnected ?? false;
    if (isOnline) {
      const ok = await telemedicineService.rescheduleAppointment(appointmentId, scheduledAt);
      if (ok) return true;
    }
    await this.addToSyncQueue({ type: 'UPDATE', entity: 'appointment', operation: 'RESCHEDULE', data: { appointmentId, scheduledAt } });
    const list = await this.getCachedAppointments();
    const updated = list.map((a: any) => (a._id === appointmentId ? { ...a, scheduledAt, syncStatus: 'pending' } : a));
    await this.setCachedAppointments(updated);
    return true;
  }

  async cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    const isOnline = (await NetInfo.fetch()).isConnected ?? false;
    if (isOnline) {
      const ok = await telemedicineService.cancelAppointment(appointmentId, reason);
      if (ok) return true;
    }
    await this.addToSyncQueue({ type: 'UPDATE', entity: 'appointment', operation: 'CANCEL', data: { appointmentId, reason } });
    const list = await this.getCachedAppointments();
    const updated = list.map((a: any) => (a._id === appointmentId ? { ...a, status: 'cancelled', syncStatus: 'pending' } : a));
    await this.setCachedAppointments(updated);
    return true;
  }

  // Alerts cache & offline ack
  async cacheAlerts(alerts: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.ALERTS_CACHE, JSON.stringify(alerts));
    } catch (e) {
      console.error('Error caching alerts:', e);
    }
  }

  async getCachedAlerts<T = any>(): Promise<T[]> {
    try {
      const raw = await AsyncStorage.getItem(this.KEYS.ALERTS_CACHE);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error reading alerts cache:', e);
      return [];
    }
  }

  async ackAlert(alertId: string): Promise<boolean> {
    const isOnline = (await NetInfo.fetch()).isConnected ?? false;
    if (isOnline) {
      const res = await apiService.post(`/alerts/${alertId}/acknowledge`);
      return !!res.success;
    }
    await this.addToSyncQueue({ type: 'UPDATE', entity: 'alert', operation: 'ACK', data: { alertId } });
    const list = await this.getCachedAlerts();
    const updated = list.map((a: any) => (a.id === alertId ? { ...a, status: 'acknowledged' } : a));
    await this.cacheAlerts(updated);
    return true;
  }

  // Sync methods
  async syncPendingData(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notifySyncListeners();

    try {
      const isOnline = (await NetInfo.fetch()).isConnected ?? false;
      if (!isOnline) {
        return;
      }

      const queueCopy = [...this.syncQueue];
      const failedItems: SyncQueueItem[] = [];

      for (const item of queueCopy) {
        try {
          await this.processSyncItem(item);
          
          // Remove successful item from queue
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
        } catch (error) {
          console.error('Sync item failed:', error);
          
          // Increment retry count
          item.retryCount++;
          
          // If max retries reached, mark error and remove from queue
          if (item.retryCount >= 3) {
            console.warn('Max retries reached for sync item:', item.id);
            if (item.entity === 'medical_history') {
              try {
                const raw = await AsyncStorage.getItem(this.KEYS.MEDICAL_HISTORIES);
                const list = raw ? JSON.parse(raw) : [];
                const updated = list.map((h: any) => (h.id === item.data.id ? { ...h, syncStatus: 'error' } : h));
                await AsyncStorage.setItem(this.KEYS.MEDICAL_HISTORIES, JSON.stringify(updated));
              } catch {}
            }
            if (item.entity === 'appointment') {
              try {
                const raw = await AsyncStorage.getItem(this.KEYS.APPOINTMENTS);
                const list = raw ? JSON.parse(raw) : [];
                const apptId = item.data?.appointmentId || item.data?._id;
                const updated = list.map((a: any) => (a._id === apptId ? { ...a, syncStatus: 'error' } : a));
                await this.setCachedAppointments(updated);
              } catch {}
            }
          } else {
            failedItems.push(item);
          }
        }
      }

      // Update queue with failed items
      this.syncQueue = failedItems;
      await this.saveSyncQueue();
      
      // Update last sync timestamp
      await AsyncStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());
      
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      this.isSyncing = false;
      this.notifySyncListeners();
    }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    switch (item.entity) {
      case 'medical_history': {
        switch (item.type) {
          case 'CREATE':
            await apiService.post('/medical-histories', item.data);
            break;
          case 'UPDATE':
            await apiService.put(`/medical-histories/${item.data.id}`, item.data);
            break;
          case 'DELETE':
            await apiService.delete(`/medical-histories/${item.data.id}`);
            break;
        }
        // mark as synced in local cache
        try {
          const historiesRaw = await AsyncStorage.getItem(this.KEYS.MEDICAL_HISTORIES);
          const histories = historiesRaw ? JSON.parse(historiesRaw) : [];
          const updated = histories.map((h: any) => (h.id === item.data.id ? { ...h, syncStatus: 'synced' } : h));
          await AsyncStorage.setItem(this.KEYS.MEDICAL_HISTORIES, JSON.stringify(updated));
        } catch {}
        break;
      }
      case 'user_profile': {
        // Implement as needed
        break;
      }
      case 'appointment': {
        if (item.type === 'CREATE') {
          await telemedicineService.createAppointment(item.data);
        } else if (item.operation === 'RESCHEDULE') {
          await telemedicineService.rescheduleAppointment(item.data.appointmentId, item.data.scheduledAt);
        } else if (item.operation === 'CANCEL') {
          await telemedicineService.cancelAppointment(item.data.appointmentId, item.data.reason);
        }
        // mark appointment as synced in cache when we have an id
        try {
          if (item.data?.appointmentId) {
            const raw = await AsyncStorage.getItem(this.KEYS.APPOINTMENTS);
            const list = raw ? JSON.parse(raw) : [];
            const updated = list.map((a: any) => (a._id === item.data.appointmentId ? { ...a, syncStatus: 'synced' } : a));
            await this.setCachedAppointments(updated);
          }
        } catch {}
        break;
      }
      case 'alert': {
        if (item.operation === 'ACK') {
          await apiService.post(`/alerts/${item.data.alertId}/acknowledge`);
        }
        break;
      }
      default:
        console.warn('Unknown sync entity:', item.entity);
    }
  }

  // Data synchronization from server
  async syncFromServer(): Promise<void> {
    try {
      const isOnline = (await NetInfo.fetch()).isConnected ?? false;
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      // Sync medical histories
      const historiesResponse = await apiService.get('/medical-histories');
      if (historiesResponse.success && historiesResponse.data) {
        await AsyncStorage.setItem(
          this.KEYS.MEDICAL_HISTORIES,
          JSON.stringify(historiesResponse.data.histories || historiesResponse.data)
        );
      }

      // update last sync timestamp
      await AsyncStorage.setItem(this.KEYS.LAST_SYNC, Date.now().toString());
      
    } catch (error) {
      console.error('Error syncing from server:', error);
      throw error;
    }
  }

  // Sync status methods
  getSyncStatus(): SyncStatus {
    const isOnline = NetInfo.fetch().then(state => state.isConnected ?? false);
    
    return {
      isOnline: false, // Will be updated by NetInfo listener
      isSyncing: this.isSyncing,
      pendingItems: this.syncQueue.length,
      lastSyncTime: null, // Will be loaded from storage
      syncErrors: [],
    };
  }

  async getLastSyncTime(): Promise<string | null> {
    try {
      const timestamp = await AsyncStorage.getItem(this.KEYS.LAST_SYNC);
      return timestamp ? new Date(parseInt(timestamp)).toISOString() : null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }

  // Sync listeners
  addSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners.push(listener);
  }

  removeSyncListener(listener: (status: SyncStatus) => void): void {
    this.syncListeners = this.syncListeners.filter(l => l !== listener);
  }

  private notifySyncListeners(): void {
    const status = this.getSyncStatus();
    this.syncListeners.forEach(listener => listener(status));
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.MEDICAL_HISTORIES,
        this.KEYS.SYMPTOM_ANALYSES,
        this.KEYS.SYNC_QUEUE,
        this.KEYS.LAST_SYNC,
        this.KEYS.USER_DATA,
        this.KEYS.APPOINTMENTS,
        this.KEYS.ALERTS_CACHE,
      ]);
      
      this.syncQueue = [];
      this.notifySyncListeners();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async getStorageSize(): Promise<{ used: number; available: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);
      
      let used = 0;
      data.forEach(([key, value]) => {
        if (value) {
          used += value.length;
        }
      });

      return {
        used,
        available: 0, // AsyncStorage doesn't provide available space info
      };
    } catch (error) {
      console.error('Error getting storage size:', error);
      return { used: 0, available: 0 };
    }
  }

  // Settings management
  async getSettings(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // ---- Secure-ish storage helpers (fallback a AsyncStorage) ----
  async setSecureItem(key: string, value: string): Promise<void> {
    try {
      // @ts-ignore optional dependency
      const SecureStore = require('expo-secure-store');
      if (SecureStore?.setItemAsync) {
        await SecureStore.setItemAsync(this.SECURE_PREFIX + key, value, { keychainAccessible: 'whenUnlocked' });
        return;
      }
    } catch {}
    await AsyncStorage.setItem(this.SECURE_PREFIX + key, value);
  }

  async getSecureItem(key: string): Promise<string | null> {
    try {
      // @ts-ignore optional dependency
      const SecureStore = require('expo-secure-store');
      if (SecureStore?.getItemAsync) {
        return await SecureStore.getItemAsync(this.SECURE_PREFIX + key);
      }
    } catch {}
    return AsyncStorage.getItem(this.SECURE_PREFIX + key);
  }

  async removeSecureItem(key: string): Promise<void> {
    try {
      // @ts-ignore optional dependency
      const SecureStore = require('expo-secure-store');
      if (SecureStore?.deleteItemAsync) {
        await SecureStore.deleteItemAsync(this.SECURE_PREFIX + key);
        return;
      }
    } catch {}
    await AsyncStorage.removeItem(this.SECURE_PREFIX + key);
  }

  // ---- User & Auth cache (coordinado con apiService) ----
  async getCachedUser<T = any>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(this.KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  async setCachedUser(user: any): Promise<void> {
    const json = JSON.stringify(user);
    await AsyncStorage.setItem(this.KEYS.CURRENT_USER, json);
    // Guardar copia mínima en almacenamiento seguro
    try { await this.setSecureItem(this.KEYS.CURRENT_USER, json); } catch {}
  }

  async getAuthTokens<T = any>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(this.KEYS.AUTH_TOKENS);
    return raw ? JSON.parse(raw) : null;
  }

  async setAuthTokens(tokens: any): Promise<void> {
    const json = JSON.stringify(tokens);
    await AsyncStorage.setItem(this.KEYS.AUTH_TOKENS, json);
    try { await this.setSecureItem(this.KEYS.AUTH_TOKENS, json); } catch {}
  }

  async clearAuth(): Promise<void> {
    await AsyncStorage.multiRemove([this.KEYS.AUTH_TOKENS, this.KEYS.CURRENT_USER, this.SECURE_PREFIX + this.KEYS.AUTH_TOKENS, this.SECURE_PREFIX + this.KEYS.CURRENT_USER]);
    try { await this.removeSecureItem(this.KEYS.AUTH_TOKENS); } catch {}
    try { await this.removeSecureItem(this.KEYS.CURRENT_USER); } catch {}
  }

  // ---- Últimas predicciones (cache útil para dashboard/home) ----
  async saveLastPredictions(predictions: Array<{ id: string; analyzedAt: string } & Record<string, any>>): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.LAST_PREDICTIONS, JSON.stringify(predictions.slice(0, 20)));
    } catch (error) {
      console.error('Error saving last predictions:', error);
    }
  }

  async getLastPredictions<T = any>(): Promise<T[]> {
    try {
      const raw = await AsyncStorage.getItem(this.KEYS.LAST_PREDICTIONS);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error getting last predictions:', error);
      return [];
    }
  }

  // Public manual retry
  async retrySyncNow(): Promise<void> {
    await this.syncPendingData();
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;
