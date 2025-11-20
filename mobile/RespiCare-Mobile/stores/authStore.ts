import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '@/constants/config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Llamada a API
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();
      const user = data.data.user;
      const token = data.data.token;

      // Guardar en AsyncStorage para persistencia offline
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Error en el registro');
      }

      const data = await response.json();
      const user = data.data.user;
      const token = data.data.token;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');

      if (user && token) {
        // Verificar token con el backend
        const response = await fetch(API_ENDPOINTS.AUTH.ME, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = JSON.parse(user);
          set({ user: userData, isAuthenticated: true });
        } else {
          // Token inválido, limpiar storage
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('token');
          set({ user: null, isAuthenticated: false });
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));
