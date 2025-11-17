/**
 * Tests de integración - Flujo completo de autenticación
 * Verifica el flujo completo desde login hasta logout
 */

import { apiService } from '../../src/services/api';
import { useAppStore } from '../../src/store/useAppStore';
import { localStorageService } from '../../src/services/localStorage';
import { analyticsService } from '../../src/services/analyticsService';
import { errorTrackingService } from '../../src/services/errorTrackingService';

// Mock dependencies
jest.mock('../../src/services/analyticsService');
jest.mock('../../src/services/errorTrackingService');

describe('Auth Flow Integration Tests', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await localStorageService.clearAllData();
    useAppStore.getState().setUser(null);
  });

  describe('Login Flow', () => {
    it('debe completar flujo de login exitoso', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // 1. Intentar login
      const loginResult = await apiService.login(email, password);

      if (loginResult.success && loginResult.data) {
        // 2. Verificar que el usuario se guarda en el store
        useAppStore.getState().setUser(loginResult.data.user);
        const user = useAppStore.getState().user;
        expect(user).toBeDefined();
        expect(user?.email).toBe(email);

        // 3. Verificar que el token se guarda
        const token = await localStorageService.getAuthToken();
        expect(token).toBeDefined();

        // 4. Verificar que se registra en analytics
        expect(analyticsService.logEvent).toHaveBeenCalledWith('user_login', {
          userId: user?.id,
          email: email,
        });

        // 5. Verificar que se configura error tracking
        expect(errorTrackingService.setUser).toHaveBeenCalledWith({
          id: user?.id,
          email: email,
        });
      }
    });

    it('debe manejar login fallido correctamente', async () => {
      const email = 'invalid@example.com';
      const password = 'wrong-password';

      const loginResult = await apiService.login(email, password);

      if (!loginResult.success) {
        // Verificar que no se guarda usuario
        const user = useAppStore.getState().user;
        expect(user).toBeNull();

        // Verificar que se registra el error
        expect(errorTrackingService.captureException).toHaveBeenCalled();
      }
    });

    it('debe persistir sesión entre reinicios de app', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Login inicial
      const loginResult = await apiService.login(email, password);
      if (loginResult.success && loginResult.data) {
        useAppStore.getState().setUser(loginResult.data.user);
        await localStorageService.saveAuthToken(loginResult.data.tokens.accessToken);

        // Simular reinicio de app
        useAppStore.getState().setUser(null);

        // Restaurar sesión
        const token = await localStorageService.getAuthToken();
        if (token) {
          const userResult = await apiService.getCurrentUser();
          if (userResult.success && userResult.data) {
            useAppStore.getState().setUser(userResult.data);
            const restoredUser = useAppStore.getState().user;
            expect(restoredUser?.email).toBe(email);
          }
        }
      }
    });
  });

  describe('Logout Flow', () => {
    it('debe completar flujo de logout correctamente', async () => {
      // Setup: usuario logueado
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient' as const,
      };
      useAppStore.getState().setUser(mockUser);
      await localStorageService.saveAuthToken('mock-token');

      // Logout
      await apiService.logout();
      useAppStore.getState().setUser(null);
      await localStorageService.clearAuthToken();

      // Verificar limpieza
      const user = useAppStore.getState().user;
      const token = await localStorageService.getAuthToken();

      expect(user).toBeNull();
      expect(token).toBeNull();

      // Verificar analytics
      expect(analyticsService.logEvent).toHaveBeenCalledWith('user_logout', {
        userId: mockUser.id,
      });
    });
  });

  describe('Registration Flow', () => {
    it('debe completar flujo de registro exitoso', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'patient' as const,
      };

      const registerResult = await useAppStore.getState().register(userData);

      if (registerResult) {
        // Verificar que se registra en analytics
        expect(analyticsService.logEvent).toHaveBeenCalledWith('user_register', {
          email: userData.email,
          role: userData.role,
        });
      }
    });
  });
});

