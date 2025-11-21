/**
 * Store de Historias Médicas con Soporte Offline usando SQLite
 * 
 * Este store maneja todas las operaciones de historias médicas,
 * usando SQLite para almacenamiento offline y sincronización automática.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { databaseService, MedicalHistoryRow } from '@/services/databaseService';
import { syncService } from '@/services/syncService';
import { API_ENDPOINTS } from '@/constants/config';

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
  createMedicalHistory: (history: Omit<MedicalHistory, 'id' | 'createdAt' | 'updatedAt' | 'isOffline' | 'syncStatus'>) => Promise<void>;
  updateMedicalHistory: (id: string, updates: Partial<MedicalHistory>) => Promise<void>;
  deleteMedicalHistory: (id: string) => Promise<void>;
  syncOfflineData: () => Promise<void>;
  checkConnectivity: () => Promise<void>;
}

/**
 * Convertir MedicalHistoryRow a MedicalHistory
 */
function rowToHistory(row: MedicalHistoryRow): MedicalHistory {
  return {
    id: row.id,
    patientId: row.patientId,
    doctorId: row.doctorId,
    patientName: row.patientName,
    age: row.age,
    diagnosis: row.diagnosis,
    symptoms: JSON.parse(row.symptoms),
    description: row.description || undefined,
    date: row.date,
    location: row.location ? JSON.parse(row.location) : undefined,
    images: row.images ? JSON.parse(row.images) : undefined,
    audioNotes: row.audioNotes || undefined,
    isOffline: row.syncStatus === 'pending',
    syncStatus: row.syncStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * Convertir MedicalHistory a MedicalHistoryRow
 */
function historyToRow(history: MedicalHistory): MedicalHistoryRow {
  return {
    id: history.id,
    patientId: history.patientId,
    doctorId: history.doctorId,
    patientName: history.patientName,
    age: history.age,
    diagnosis: history.diagnosis,
    symptoms: JSON.stringify(history.symptoms),
    description: history.description || null,
    date: history.date,
    location: history.location ? JSON.stringify(history.location) : null,
    images: history.images ? JSON.stringify(history.images) : null,
    audioNotes: history.audioNotes || null,
    syncStatus: history.syncStatus,
    createdAt: history.createdAt,
    updatedAt: history.updatedAt,
  };
}

export const useMedicalHistoryStore = create<MedicalHistoryState>((set, get) => ({
  medicalHistories: [],
  isLoading: false,
  isOffline: false,

  fetchMedicalHistories: async () => {
    set({ isLoading: true });
    try {
      // Asegurar que la base de datos esté inicializada
      await databaseService.initialize();

      const { isOffline } = get();
      
      if (isOffline) {
        // Cargar datos offline desde SQLite
        const rows = await databaseService.getMedicalHistories();
        const histories = rows.map(rowToHistory);
        set({ medicalHistories: histories });
      } else {
        // Intentar cargar desde API
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.MEDICAL_HISTORIES.LIST, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const histories = (data.data || []).map((h: any) => ({
              ...h,
              id: h._id || h.id,
              isOffline: false,
              syncStatus: 'synced' as const,
            }));

            // Guardar en SQLite
            for (const history of histories) {
              await databaseService.saveMedicalHistory(historyToRow(history));
            }

            set({ medicalHistories: histories });
          } else {
            throw new Error('Error cargando desde API');
          }
        } catch (error) {
          console.error('Error cargando desde API, usando datos offline:', error);
          // Si falla la API, cargar desde SQLite
          const rows = await databaseService.getMedicalHistories();
          const histories = rows.map(rowToHistory);
          set({ medicalHistories: histories, isOffline: true });
        }
      }
    } catch (error) {
      console.error('Error cargando historias médicas:', error);
      // En caso de error, intentar cargar datos offline
      try {
        const rows = await databaseService.getMedicalHistories();
        const histories = rows.map(rowToHistory);
        set({ medicalHistories: histories, isOffline: true });
      } catch (dbError) {
        console.error('Error cargando desde SQLite:', dbError);
        set({ medicalHistories: [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createMedicalHistory: async (historyData) => {
    try {
      // Asegurar que la base de datos esté inicializada
      await databaseService.initialize();

      const { isOffline } = get();
      const now = new Date().toISOString();
      
      const newHistory: MedicalHistory = {
        ...historyData,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        isOffline: isOffline,
        syncStatus: isOffline ? 'pending' : 'synced',
      };

      // Guardar en SQLite siempre (offline-first)
      await databaseService.saveMedicalHistory(historyToRow(newHistory));

      // Actualizar el estado
      const currentHistories = get().medicalHistories;
      set({ medicalHistories: [newHistory, ...currentHistories] });

      // Si hay conexión, intentar enviar a API
      if (!isOffline) {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.MEDICAL_HISTORIES.CREATE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(historyData),
          });

          if (response.ok) {
            const data = await response.json();
            const createdHistory = {
              ...newHistory,
              id: data.data._id || data.data.id || newHistory.id,
              syncStatus: 'synced' as const,
              isOffline: false,
            };

            // Actualizar en SQLite con el ID del servidor
            await databaseService.saveMedicalHistory(historyToRow(createdHistory));
            
            // Actualizar en el estado
            const updatedHistories = get().medicalHistories.map(h =>
              h.id === newHistory.id ? createdHistory : h
            );
            set({ medicalHistories: updatedHistories });
          } else {
            // Si falla, marcar como pendiente
            await databaseService.saveMedicalHistory(historyToRow({
              ...newHistory,
              syncStatus: 'pending',
              isOffline: true,
            }));
          }
        } catch (error) {
          console.error('Error enviando a API, guardado offline:', error);
          // Ya está guardado en SQLite como pending
        }
      }
    } catch (error) {
      console.error('Error creando historia médica:', error);
      throw error;
    }
  },

  updateMedicalHistory: async (id: string, updates: Partial<MedicalHistory>) => {
    try {
      await databaseService.initialize();

      const { isOffline } = get();
      const currentHistories = get().medicalHistories;
      const existingHistory = currentHistories.find(h => h.id === id);

      if (!existingHistory) {
        throw new Error('Historia médica no encontrada');
      }

      const updatedHistory: MedicalHistory = {
        ...existingHistory,
        ...updates,
        updatedAt: new Date().toISOString(),
        syncStatus: isOffline ? 'pending' : existingHistory.syncStatus,
        isOffline: isOffline || existingHistory.isOffline,
      };

      // Actualizar en SQLite
      await databaseService.saveMedicalHistory(historyToRow(updatedHistory));

      // Actualizar en el estado
      const updatedHistories = currentHistories.map(h =>
        h.id === id ? updatedHistory : h
      );
      set({ medicalHistories: updatedHistories });

      // Si hay conexión, intentar actualizar en API
      if (!isOffline && existingHistory.syncStatus === 'synced') {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.MEDICAL_HISTORIES.UPDATE(id), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            // Si falla, marcar como pendiente
            await databaseService.saveMedicalHistory(historyToRow({
              ...updatedHistory,
              syncStatus: 'pending',
              isOffline: true,
            }));
          }
        } catch (error) {
          console.error('Error actualizando en API:', error);
        }
      }
    } catch (error) {
      console.error('Error actualizando historia médica:', error);
      throw error;
    }
  },

  deleteMedicalHistory: async (id: string) => {
    try {
      await databaseService.initialize();

      const { isOffline } = get();
      const currentHistories = get().medicalHistories;
      const historyToDelete = currentHistories.find(h => h.id === id);

      // Eliminar de SQLite
      await databaseService.deleteMedicalHistory(id);

      // Actualizar estado
      const updatedHistories = currentHistories.filter(h => h.id !== id);
      set({ medicalHistories: updatedHistories });

      // Si hay conexión y estaba sincronizado, eliminar en API
      if (!isOffline && historyToDelete?.syncStatus === 'synced') {
        try {
          const token = await AsyncStorage.getItem('token');
          await fetch(API_ENDPOINTS.MEDICAL_HISTORIES.DELETE(id), {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (error) {
          console.error('Error eliminando en API:', error);
          // Si falla, la eliminación ya se hizo localmente
        }
      }
    } catch (error) {
      console.error('Error eliminando historia médica:', error);
      throw error;
    }
  },

  syncOfflineData: async () => {
    try {
      // Usar el servicio de sincronización centralizado
      await syncService.syncAll();
      
      // Recargar historias después de sincronizar
      await get().fetchMedicalHistories();
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
        // Si hay conexión, sincronizar datos offline automáticamente
        await get().syncOfflineData();
      }
    } catch (error) {
      console.error('Error verificando conectividad:', error);
      set({ isOffline: true });
    }
  },
}));
