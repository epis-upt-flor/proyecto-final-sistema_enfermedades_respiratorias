/**
 * Store de Citas Médicas con Soporte Offline usando SQLite
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { databaseService, AppointmentRow } from '@/services/databaseService';
import { syncService } from '@/services/syncService';
import { API_ENDPOINTS } from '@/constants/config';

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reason?: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
  updatedAt: string;
}

interface AppointmentState {
  appointments: Appointment[];
  isLoading: boolean;
  isOffline: boolean;
  fetchAppointments: () => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  checkConnectivity: () => Promise<void>;
}

function rowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    doctorId: row.doctorId,
    patientId: row.patientId,
    scheduledAt: row.scheduledAt,
    durationMinutes: row.durationMinutes,
    status: row.status,
    reason: row.reason || undefined,
    syncStatus: row.syncStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function appointmentToRow(appointment: Appointment): AppointmentRow {
  return {
    id: appointment.id,
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    scheduledAt: appointment.scheduledAt,
    durationMinutes: appointment.durationMinutes,
    status: appointment.status,
    reason: appointment.reason || null,
    syncStatus: appointment.syncStatus,
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt,
  };
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isLoading: false,
  isOffline: false,

  fetchAppointments: async () => {
    set({ isLoading: true });
    try {
      await databaseService.initialize();
      const { isOffline } = get();

      if (isOffline) {
        // Cargar desde SQLite
        const rows = await databaseService.getAppointments();
        const appointments = rows.map(rowToAppointment);
        set({ appointments });
      } else {
        // Intentar cargar desde API
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.APPOINTMENTS.LIST, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const appointments = (data.data || []).map((a: any) => ({
              ...a,
              id: a._id || a.id,
              syncStatus: 'synced' as const,
            }));

            // Guardar en SQLite
            for (const appointment of appointments) {
              await databaseService.saveAppointment(appointmentToRow(appointment));
            }

            set({ appointments });
          } else {
            throw new Error('Error cargando desde API');
          }
        } catch (error) {
          console.error('Error cargando desde API, usando datos offline:', error);
          const rows = await databaseService.getAppointments();
          const appointments = rows.map(rowToAppointment);
          set({ appointments, isOffline: true });
        }
      }
    } catch (error) {
      console.error('Error cargando citas:', error);
      try {
        const rows = await databaseService.getAppointments();
        const appointments = rows.map(rowToAppointment);
        set({ appointments, isOffline: true });
      } catch (dbError) {
        console.error('Error cargando desde SQLite:', dbError);
        set({ appointments: [] });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createAppointment: async (appointmentData) => {
    try {
      await databaseService.initialize();
      const { isOffline } = get();
      const now = new Date().toISOString();

      const newAppointment: Appointment = {
        ...appointmentData,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        syncStatus: isOffline ? 'pending' : 'synced',
        createdAt: now,
        updatedAt: now,
      };

      // Guardar en SQLite
      await databaseService.saveAppointment(appointmentToRow(newAppointment));

      // Actualizar estado
      set({ appointments: [newAppointment, ...get().appointments] });

      // Si hay conexión, enviar a API
      if (!isOffline) {
        try {
          const token = await AsyncStorage.getItem('token');
          const response = await fetch(API_ENDPOINTS.APPOINTMENTS.CREATE, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(appointmentData),
          });

          if (response.ok) {
            const data = await response.json();
            const createdAppointment = {
              ...newAppointment,
              id: data.data._id || data.data.id || newAppointment.id,
              syncStatus: 'synced' as const,
            };

            await databaseService.saveAppointment(appointmentToRow(createdAppointment));
            set({ appointments: get().appointments.map(a => a.id === newAppointment.id ? createdAppointment : a) });
          }
        } catch (error) {
          console.error('Error enviando a API:', error);
        }
      }
    } catch (error) {
      console.error('Error creando cita:', error);
      throw error;
    }
  },

  updateAppointment: async (id: string, updates: Partial<Appointment>) => {
    try {
      await databaseService.initialize();
      const { isOffline } = get();
      const existing = get().appointments.find(a => a.id === id);

      if (!existing) throw new Error('Cita no encontrada');

      const updated: Appointment = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
        syncStatus: isOffline ? 'pending' : existing.syncStatus,
      };

      await databaseService.saveAppointment(appointmentToRow(updated));
      set({ appointments: get().appointments.map(a => a.id === id ? updated : a) });

      if (!isOffline && existing.syncStatus === 'synced') {
        try {
          const token = await AsyncStorage.getItem('token');
          await fetch(API_ENDPOINTS.APPOINTMENTS.UPDATE(id), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });
        } catch (error) {
          console.error('Error actualizando en API:', error);
        }
      }
    } catch (error) {
      console.error('Error actualizando cita:', error);
      throw error;
    }
  },

  deleteAppointment: async (id: string) => {
    try {
      await databaseService.initialize();
      const { isOffline } = get();
      const existing = get().appointments.find(a => a.id === id);

      await databaseService.deleteAppointment(id);
      set({ appointments: get().appointments.filter(a => a.id !== id) });

      if (!isOffline && existing?.syncStatus === 'synced') {
        try {
          const token = await AsyncStorage.getItem('token');
          await fetch(API_ENDPOINTS.APPOINTMENTS.DELETE(id), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Error eliminando en API:', error);
        }
      }
    } catch (error) {
      console.error('Error eliminando cita:', error);
      throw error;
    }
  },

  checkConnectivity: async () => {
    try {
      const netInfo = await NetInfo.fetch();
      const isOffline = !netInfo.isConnected || !netInfo.isInternetReachable;
      set({ isOffline });

      if (!isOffline) {
        await syncService.syncAll();
        await get().fetchAppointments();
      }
    } catch (error) {
      console.error('Error verificando conectividad:', error);
      set({ isOffline: true });
    }
  },
}));

