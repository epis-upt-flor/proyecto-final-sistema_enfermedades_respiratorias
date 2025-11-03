/**
 * Local Storage Service - Handles offline data storage and synchronization
 * Implements queue-based sync for offline-first functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from './api';
import { MedicalHistory, SymptomAnalysis } from './api';

// Types
export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'medical_history' | 'symptom_analysis' | 'user_profile';
  data: any;
  timestamp: number;
  retryCount: number;
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

  // Storage keys
  private readonly KEYS = {
    MEDICAL_HISTORIES: 'medical_histories',
    SYMPTOM_ANALYSES: 'symptom_analyses',
    SYNC_QUEUE: 'sync_queue',
    LAST_SYNC: 'last_sync_timestamp',
    USER_DATA: 'user_data',
    SETTINGS: 'app_settings',
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
            await apiService.updateMedicalHistory(history.id, history);
          } else {
            await apiService.createMedicalHistory(history);
          }
        } catch (error) {
          // If sync fails, add to queue
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
          await apiService.deleteMedicalHistory(id);
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
      
      // Note: Symptom analyses are typically read-only after creation
      // They don't need to be synced back to server
    } catch (error) {
      console.error('Error saving symptom analysis:', error);
      throw error;
    }
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
          
          // If max retries reached, remove from queue
          if (item.retryCount >= 3) {
            console.warn('Max retries reached for sync item:', item.id);
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
      case 'medical_history':
        await this.processMedicalHistorySync(item);
        break;
      case 'user_profile':
        await this.processUserProfileSync(item);
        break;
      default:
        console.warn('Unknown sync entity:', item.entity);
    }
  }

  private async processMedicalHistorySync(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'CREATE':
        await apiService.createMedicalHistory(item.data);
        break;
      case 'UPDATE':
        await apiService.updateMedicalHistory(item.data.id, item.data);
        break;
      case 'DELETE':
        await apiService.deleteMedicalHistory(item.data.id);
        break;
    }
  }

  private async processUserProfileSync(item: SyncQueueItem): Promise<void> {
    // Implement user profile sync if needed
    console.log('User profile sync not implemented yet');
  }

  // Data synchronization from server
  async syncFromServer(): Promise<void> {
    try {
      const isOnline = (await NetInfo.fetch()).isConnected ?? false;
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      // Sync medical histories
      const historiesResponse = await apiService.getMedicalHistories();
      if (historiesResponse.success && historiesResponse.data) {
        await AsyncStorage.setItem(
          this.KEYS.MEDICAL_HISTORIES,
          JSON.stringify(historiesResponse.data.histories)
        );
      }

      // Update last sync timestamp
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
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
export default localStorageService;
