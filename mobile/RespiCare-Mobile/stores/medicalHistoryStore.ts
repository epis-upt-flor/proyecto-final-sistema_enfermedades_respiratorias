import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface Symptom {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  description?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  age: number;
  diagnosis: string;
  symptoms: Symptom[];
  description?: string;
  date: string;
  location?: Location;
  images?: string[];
  audioNotes?: string;
  isOffline: boolean;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
  updatedAt: string;
}

interface MedicalHistoryState {
  medicalHistories: MedicalHistory[];
  isLoading: boolean;
  isOffline: boolean;
  fetchMedicalHistories: () => Promise<void>;
  createMedicalHistory: (history: Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateMedicalHistory: (id: string, updates: Partial<MedicalHistory>) => Promise<void>;
  deleteMedicalHistory: (id: string) => Promise<void>;
  syncOfflineData: () => Promise<void>;
  checkConnectivity: () => Promise<void>;
}

export const useMedicalHistoryStore = create<MedicalHistoryState>((set, get) => ({
  medicalHistories: [],
  isLoading: false,
  isOffline: false,

  fetchMedicalHistories: async () => {
    set({ isLoading: true });
    try {
      const { isOffline } = get();
      
      if (isOffline) {
        // Cargar datos offline desde AsyncStorage
        const offlineData = await AsyncStorage.getItem('medicalHistories');
        if (offlineData) {
          set({ medicalHistories: JSON.parse(offlineData) });
        }
      } else {
        // Cargar datos desde API
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/v1/medical-histories', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const histories = data.data || [];
          
          // Guardar en AsyncStorage para uso offline
          await AsyncStorage.setItem('medicalHistories', JSON.stringify(histories));
          set({ medicalHistories: histories });
        }
      }
    } catch (error) {
      console.error('Error cargando historias médicas:', error);
      // En caso de error, intentar cargar datos offline
      const offlineData = await AsyncStorage.getItem('medicalHistories');
      if (offlineData) {
        set({ medicalHistories: JSON.parse(offlineData) });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createMedicalHistory: async (historyData) => {
    try {
      const { isOffline } = get();
      const newHistory: MedicalHistory = {
        ...historyData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOffline: isOffline,
        syncStatus: isOffline ? 'pending' : 'synced',
      };

      if (isOffline) {
        // Guardar offline
        const currentHistories = get().medicalHistories;
        const updatedHistories = [...currentHistories, newHistory];
        
        await AsyncStorage.setItem('medicalHistories', JSON.stringify(updatedHistories));
        set({ medicalHistories: updatedHistories });
      } else {
        // Enviar a API
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/v1/medical-histories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(historyData),
        });

        if (response.ok) {
          const data = await response.json();
          const createdHistory = data.data;
          
          const currentHistories = get().medicalHistories;
          const updatedHistories = [...currentHistories, createdHistory];
          
          await AsyncStorage.setItem('medicalHistories', JSON.stringify(updatedHistories));
          set({ medicalHistories: updatedHistories });
        } else {
          throw new Error('Error creando historia médica');
        }
      }
    } catch (error) {
      console.error('Error creando historia médica:', error);
      throw error;
    }
  },

  updateMedicalHistory: async (id: string, updates: Partial<MedicalHistory>) => {
    try {
      const { isOffline } = get();
      const currentHistories = get().medicalHistories;
      const updatedHistories = currentHistories.map(history =>
        history.id === id
          ? { ...history, ...updates, updatedAt: new Date().toISOString() }
          : history
      );

      if (isOffline) {
        // Actualizar offline
        await AsyncStorage.setItem('medicalHistories', JSON.stringify(updatedHistories));
        set({ medicalHistories: updatedHistories });
      } else {
        // Enviar actualización a API
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/v1/medical-histories/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (response.ok) {
          await AsyncStorage.setItem('medicalHistories', JSON.stringify(updatedHistories));
          set({ medicalHistories: updatedHistories });
        } else {
          throw new Error('Error actualizando historia médica');
        }
      }
    } catch (error) {
      console.error('Error actualizando historia médica:', error);
      throw error;
    }
  },

  deleteMedicalHistory: async (id: string) => {
    try {
      const { isOffline } = get();
      const currentHistories = get().medicalHistories;
      const updatedHistories = currentHistories.filter(history => history.id !== id);

      if (isOffline) {
        // Eliminar offline
        await AsyncStorage.setItem('medicalHistories', JSON.stringify(updatedHistories));
        set({ medicalHistories: updatedHistories });
      } else {
        // Eliminar en API
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/v1/medical-histories/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          await AsyncStorage.setItem('medicalHistories', JSON.stringify(updatedHistories));
          set({ medicalHistories: updatedHistories });
        } else {
          throw new Error('Error eliminando historia médica');
        }
      }
    } catch (error) {
      console.error('Error eliminando historia médica:', error);
      throw error;
    }
  },

  syncOfflineData: async () => {
    try {
      const { isOffline } = get();
      if (isOffline) return;

      const token = await AsyncStorage.getItem('token');
      const pendingHistories = get().medicalHistories.filter(h => h.syncStatus === 'pending');

      for (const history of pendingHistories) {
        try {
          const response = await fetch('http://localhost:3000/api/v1/medical-histories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(history),
          });

          if (response.ok) {
            // Marcar como sincronizado
            await get().updateMedicalHistory(history.id, { syncStatus: 'synced' });
          }
        } catch (error) {
          console.error(`Error sincronizando historia ${history.id}:`, error);
          await get().updateMedicalHistory(history.id, { syncStatus: 'error' });
        }
      }
    } catch (error) {
      console.error('Error sincronizando datos offline:', error);
    }
  },

  checkConnectivity: async () => {
    try {
      const netInfo = await NetInfo.fetch();
      const isOffline = !netInfo.isConnected || !netInfo.isInternetReachable;
      set({ isOffline });

      if (!isOffline) {
        // Si hay conexión, sincronizar datos offline
        await get().syncOfflineData();
      }
    } catch (error) {
      console.error('Error verificando conectividad:', error);
      set({ isOffline: true });
    }
  },
}));
