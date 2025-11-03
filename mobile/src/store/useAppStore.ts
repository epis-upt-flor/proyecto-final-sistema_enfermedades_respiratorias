// Store global con Zustand para manejo de estado
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, MedicalHistory, NotificationData, OfflineData, SymptomAnalysis, SyncStatus } from '../types';
import { apiService } from '../services/api';
import { localStorageService } from '../services/localStorage';
import { aiService } from '../services/aiService';

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  addMedicalHistory: (history: MedicalHistory) => void;
  updateMedicalHistory: (id: string, updates: Partial<MedicalHistory>) => void;
  deleteMedicalHistory: (id: string) => void;
  addSymptomAnalysis: (analysis: SymptomAnalysis) => void;
  addNotification: (notification: NotificationData) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  updateOfflineData: (data: Partial<OfflineData>) => void;
  setLoading: (loading: boolean) => void;
  syncData: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  analyzeSymptoms: (symptoms: any[], patientId: string, context?: string) => Promise<SymptomAnalysis | null>;
  getSyncStatus: () => SyncStatus;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isOnline: true,
      offlineData: {
        medicalHistories: [],
        symptomAnalyses: [],
        lastSync: new Date().toISOString(),
        pendingSync: 0,
      },
      notifications: [],
      isLoading: false,
      syncStatus: {
        isOnline: true,
        isSyncing: false,
        pendingItems: 0,
        lastSyncTime: null,
        syncErrors: [],
      },

      // Actions
      setUser: (user) => set({ user }),
      
      setOnlineStatus: (isOnline) => set({ isOnline }),
      
      addMedicalHistory: async (history) => {
        try {
          await localStorageService.saveMedicalHistory(history);
          set((state) => ({
            offlineData: {
              ...state.offlineData,
              medicalHistories: [...state.offlineData.medicalHistories, history],
              pendingSync: state.offlineData.pendingSync + 1,
            },
          }));
        } catch (error) {
          console.error('Error adding medical history:', error);
        }
      },
      
      updateMedicalHistory: async (id, updates) => {
        try {
          const histories = await localStorageService.getMedicalHistories();
          const history = histories.find(h => h.id === id);
          if (history) {
            const updatedHistory = { ...history, ...updates };
            await localStorageService.saveMedicalHistory(updatedHistory);
            set((state) => ({
              offlineData: {
                ...state.offlineData,
                medicalHistories: state.offlineData.medicalHistories.map(h =>
                  h.id === id ? updatedHistory : h
                ),
              },
            }));
          }
        } catch (error) {
          console.error('Error updating medical history:', error);
        }
      },
      
      deleteMedicalHistory: async (id) => {
        try {
          await localStorageService.deleteMedicalHistory(id);
          set((state) => ({
            offlineData: {
              ...state.offlineData,
              medicalHistories: state.offlineData.medicalHistories.filter(h => h.id !== id),
            },
          }));
        } catch (error) {
          console.error('Error deleting medical history:', error);
        }
      },

      addSymptomAnalysis: async (analysis) => {
        try {
          await localStorageService.saveSymptomAnalysis(analysis);
          set((state) => ({
            offlineData: {
              ...state.offlineData,
              symptomAnalyses: [...state.offlineData.symptomAnalyses, analysis],
            },
          }));
        } catch (error) {
          console.error('Error adding symptom analysis:', error);
        }
      },
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, notification],
      })),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(notification =>
          notification.id === id ? { ...notification, isRead: true } : notification
        ),
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      updateOfflineData: (data) => set((state) => ({
        offlineData: { ...state.offlineData, ...data },
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      syncData: async () => {
        const { isOnline } = get();
        if (!isOnline) return;

        set({ isLoading: true });
        
        try {
          await localStorageService.syncPendingData();
          await localStorageService.syncFromServer();
          
          // Update sync status
          const lastSyncTime = await localStorageService.getLastSyncTime();
          set((state) => ({
            offlineData: {
              ...state.offlineData,
              lastSync: lastSyncTime || new Date().toISOString(),
              pendingSync: 0,
            },
            syncStatus: {
              ...state.syncStatus,
              isSyncing: false,
              pendingItems: 0,
              lastSyncTime,
            },
          }));
          
          get().addNotification({
            id: Date.now().toString(),
            title: 'Sincronización Exitosa',
            message: 'Los datos se han sincronizado correctamente',
            type: 'sync',
            isRead: false,
          });
          
        } catch (error) {
          console.error('Error en sincronización:', error);
          get().addNotification({
            id: Date.now().toString(),
            title: 'Error de Sincronización',
            message: 'No se pudo sincronizar los datos. Reintentando...',
            type: 'alert',
            isRead: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await apiService.login(email, password);
          if (response.success && response.data) {
            set({ user: response.data.user });
            await apiService.setCurrentUser(response.data.user);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await apiService.logout();
          await apiService.clearCurrentUser();
          set({ user: null });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await apiService.register(userData);
          if (response.success && response.data) {
            set({ user: response.data.user });
            await apiService.setCurrentUser(response.data.user);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Register error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      analyzeSymptoms: async (symptoms, patientId, context) => {
        try {
          const analysis = await aiService.analyzeSymptoms(symptoms, patientId, context);
          await get().addSymptomAnalysis(analysis);
          return analysis;
        } catch (error) {
          console.error('Symptom analysis error:', error);
          return null;
        }
      },

      getSyncStatus: () => {
        const state = get();
        return {
          ...state.syncStatus,
          isOnline: state.isOnline,
          pendingItems: state.offlineData.pendingSync,
        };
      },
    }),
    {
      name: 'respicare-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        offlineData: state.offlineData,
        notifications: state.notifications,
      }),
    }
  )
);
