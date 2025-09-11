// Store global con Zustand para manejo de estado
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, User, MedicalHistory, NotificationData, OfflineData } from '../types';

interface AppStore extends AppState {
  // Actions
  setUser: (user: User | null) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  addMedicalHistory: (history: MedicalHistory) => void;
  updateMedicalHistory: (id: string, updates: Partial<MedicalHistory>) => void;
  deleteMedicalHistory: (id: string) => void;
  addNotification: (notification: NotificationData) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  updateOfflineData: (data: Partial<OfflineData>) => void;
  setLoading: (loading: boolean) => void;
  syncData: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isOnline: true,
      offlineData: {
        medicalHistories: [],
        symptoms: [],
        lastSync: new Date().toISOString(),
        pendingSync: 0,
      },
      notifications: [],
      isLoading: false,

      // Actions
      setUser: (user) => set({ user }),
      
      setOnlineStatus: (isOnline) => set({ isOnline }),
      
      addMedicalHistory: (history) => set((state) => ({
        offlineData: {
          ...state.offlineData,
          medicalHistories: [...state.offlineData.medicalHistories, history],
          pendingSync: state.offlineData.pendingSync + 1,
        },
      })),
      
      updateMedicalHistory: (id, updates) => set((state) => ({
        offlineData: {
          ...state.offlineData,
          medicalHistories: state.offlineData.medicalHistories.map(history =>
            history.id === id ? { ...history, ...updates } : history
          ),
        },
      })),
      
      deleteMedicalHistory: (id) => set((state) => ({
        offlineData: {
          ...state.offlineData,
          medicalHistories: state.offlineData.medicalHistories.filter(history => history.id !== id),
        },
      })),
      
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
        const { offlineData, isOnline } = get();
        if (!isOnline) return;

        set({ isLoading: true });
        
        try {
          // Simular sincronización con el backend
          console.log('Sincronizando datos offline...');
          
          // Aquí iría la lógica real de sincronización
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          set((state) => ({
            offlineData: {
              ...state.offlineData,
              lastSync: new Date().toISOString(),
              pendingSync: 0,
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
