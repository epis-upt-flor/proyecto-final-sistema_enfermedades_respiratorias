// Store global con Zustand para manejo de estado
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppState,
  User,
  MedicalHistory,
  NotificationData,
  OfflineData,
  SymptomAnalysis,
  SyncStatus,
  Alert,
  AlertStatus,
  AlertPriority,
  AlertCategory,
  ThemeMode,
  SupportedLanguage,
  NetworkStatus,
} from '../types';
import { apiService } from '../services/api';
import { localStorageService } from '../services/localStorage';
import { aiService } from '../services/aiService';

// Slices por dominio para una arquitectura más clara
interface UserSlice {
  user: AppState['user'];
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
}

interface NetworkSlice {
  isOnline: boolean;
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  setOnlineStatus: (isOnline: boolean) => void;
  getSyncStatus: () => SyncStatus;
}

interface MedicalHistorySlice {
  offlineData: OfflineData;
  addMedicalHistory: (history: MedicalHistory) => void;
  updateMedicalHistory: (id: string, updates: Partial<MedicalHistory>) => void;
  deleteMedicalHistory: (id: string) => void;
  addSymptomAnalysis: (analysis: SymptomAnalysis) => void;
  updateOfflineData: (data: Partial<OfflineData>) => void;
  analyzeSymptoms: (
    symptoms: any[],
    patientId: string,
    context?: string
  ) => Promise<SymptomAnalysis | null>;
}

interface NotificationSlice {
  notifications: NotificationData[];
  alerts: Alert[];
  addNotification: (notification: NotificationData) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  fetchAlerts: (filters?: {
    status?: AlertStatus[];
    priority?: AlertPriority[];
    category?: AlertCategory[];
  }) => Promise<void>;
  acknowledgeAlertById: (alertId: string) => Promise<boolean>;
}

interface UiSlice {
  isLoading: boolean;
  themeMode?: ThemeMode;
  language?: SupportedLanguage;
  setLoading: (loading: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (language: SupportedLanguage) => void;
}

type AppStore = UserSlice &
  NetworkSlice &
  MedicalHistorySlice &
  NotificationSlice &
  UiSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isOnline: true,
      networkStatus: 'online',
      offlineData: {
        medicalHistories: [],
        symptomAnalyses: [],
        lastSync: new Date().toISOString(),
        pendingSync: 0,
      },
      notifications: [],
      alerts: [],
      isLoading: false,
      syncStatus: {
        isOnline: true,
        isSyncing: false,
        pendingItems: 0,
        lastSyncTime: null,
        syncErrors: [],
      },
      themeMode: 'auto',
      language: 'es',

      // Actions: User
      setUser: (user) => set({ user }),

      // Actions: Network
      setOnlineStatus: (isOnline) =>
        set((state) => ({
          isOnline,
          networkStatus: isOnline
            ? state.syncStatus.isSyncing
              ? 'syncing'
              : 'online'
            : 'offline',
          syncStatus: {
            ...state.syncStatus,
            isOnline,
          },
        })),
      
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

        set((state) => ({
          isLoading: true,
          networkStatus: 'syncing',
          syncStatus: {
            ...state.syncStatus,
            isSyncing: true,
          },
        }));

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
              isOnline: state.isOnline,
            },
            networkStatus: state.isOnline ? 'online' : 'offline',
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
          set((state) => ({
            networkStatus: state.isOnline ? 'online' : 'offline',
            syncStatus: {
              ...state.syncStatus,
              isSyncing: false,
              syncErrors: [
                ...state.syncStatus.syncErrors,
                'Error durante la sincronización',
              ],
            },
          }));
        } finally {
          set({ isLoading: false });
        }
      },

      fetchAlerts: async (filters) => {
        try {
          const response = await apiService.getAlerts(filters);
          if (response.success && response.data) {
            set({ alerts: response.data });
          }
        } catch (error) {
          console.error('Error fetching alerts:', error);
        }
      },

      acknowledgeAlertById: async (alertId) => {
        try {
          const response = await apiService.acknowledgeAlert(alertId);
          if (response.success && response.data) {
            const updatedAlert = response.data;
            set((state) => ({
              alerts: state.alerts.map((alert) =>
                alert.id === alertId ? updatedAlert : alert
              ),
            }));
            return true;
          }
        } catch (error) {
          console.error('Error acknowledging alert:', error);
        }
        return false;
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

      setThemeMode: (mode) => set({ themeMode: mode }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'respicare-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        offlineData: state.offlineData,
        notifications: state.notifications,
        themeMode: state.themeMode,
        language: state.language,
      }),
    }
  )
);
