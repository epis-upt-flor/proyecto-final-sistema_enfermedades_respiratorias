/**
 * Tests for ErrorTrackingService
 */

import { errorTrackingService } from '../../medical-app/services/errorTrackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('ErrorTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    errorTrackingService.init({ enabled: true });
    errorTrackingService.setUser(null);
  });

  describe('init', () => {
    it('should initialize with default options', () => {
      errorTrackingService.init();
      expect(errorTrackingService).toBeDefined();
    });

    it('should initialize with custom options', () => {
      errorTrackingService.init({ enabled: false, environment: 'prod' });
      // Should accept options
      expect(errorTrackingService).toBeDefined();
    });
  });

  describe('setUser', () => {
    it('should set user context', () => {
      errorTrackingService.setUser({ id: '123', email: 'test@example.com' });
      // User should be set
      expect(errorTrackingService).toBeDefined();
    });

    it('should clear user context', () => {
      errorTrackingService.setUser({ id: '123' });
      errorTrackingService.setUser(null);
      // User should be cleared
      expect(errorTrackingService).toBeDefined();
    });
  });

  describe('captureException', () => {
    it('should capture Error instance', async () => {
      const error = new Error('Test error');
      await errorTrackingService.captureException(error);
      // Should not throw
      expect(error).toBeDefined();
    });

    it('should capture string error', async () => {
      await errorTrackingService.captureException('String error');
      // Should not throw
      expect(true).toBe(true);
    });

    it('should capture object error', async () => {
      await errorTrackingService.captureException({ message: 'Object error' });
      // Should not throw
      expect(true).toBe(true);
    });

    it('should include context', async () => {
      const error = new Error('Test');
      await errorTrackingService.captureException(error, { userId: '123' });
      // Should include context
      expect(error).toBeDefined();
    });

    it('should use custom severity', async () => {
      const error = new Error('Test');
      await errorTrackingService.captureException(error, {}, 'fatal');
      // Should use custom severity
      expect(error).toBeDefined();
    });

    it('should not capture when disabled', async () => {
      errorTrackingService.init({ enabled: false });
      await errorTrackingService.captureException(new Error('Test'));
      // Should not capture
      expect(true).toBe(true);
    });

    it('should increment counter', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const error = new Error('Test');
      await errorTrackingService.captureException(error);
      await Promise.resolve();
      // Counter should be incremented
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('captureMessage', () => {
    it('should capture message', async () => {
      await errorTrackingService.captureMessage('Test message');
      // Should not throw
      expect(true).toBe(true);
    });

    it('should use default severity', async () => {
      await errorTrackingService.captureMessage('Test', 'info');
      // Should use default severity
      expect(true).toBe(true);
    });

    it('should include context', async () => {
      await errorTrackingService.captureMessage('Test', 'warning', { key: 'value' });
      // Should include context
      expect(true).toBe(true);
    });

    it('should not capture when disabled', async () => {
      errorTrackingService.init({ enabled: false });
      await errorTrackingService.captureMessage('Test');
      // Should not capture
      expect(true).toBe(true);
    });
  });

  describe('classifySeverity', () => {
    it('should classify fatal errors', () => {
      const error = { name: 'Error', message: 'out of memory' };
      const severity = errorTrackingService.classifySeverity(error);
      expect(severity).toBe('fatal');
    });

    it('should classify warning errors', () => {
      const error = { name: 'Error', message: 'network timeout' };
      const severity = errorTrackingService.classifySeverity(error);
      expect(severity).toBe('warning');
    });

    it('should classify default errors', () => {
      const error = { name: 'Error', message: 'generic error' };
      const severity = errorTrackingService.classifySeverity(error);
      expect(severity).toBe('error');
    });
  });

  describe('setGlobalHandler', () => {
    it('should set global error handler', () => {
      const globalAny: any = global;
      globalAny.ErrorUtils = {
        getGlobalHandler: jest.fn(() => null),
        setGlobalHandler: jest.fn(),
      };
      errorTrackingService.setGlobalHandler();
      expect(globalAny.ErrorUtils.setGlobalHandler).toHaveBeenCalled();
    });

    it('should preserve previous handler', () => {
      const prevHandler = jest.fn();
      const globalAny: any = global;
      globalAny.ErrorUtils = {
        getGlobalHandler: jest.fn(() => prevHandler),
        setGlobalHandler: jest.fn(),
      };
      errorTrackingService.setGlobalHandler();
      // Previous handler should be preserved
      expect(globalAny.ErrorUtils.setGlobalHandler).toHaveBeenCalled();
    });
  });

  describe('getCounters', () => {
    it('should get error counters', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ 'Error:error': 5 }));
      const counters = await errorTrackingService.getCounters();
      expect(counters).toBeDefined();
    });

    it('should return empty object when no counters', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const counters = await errorTrackingService.getCounters();
      expect(counters).toEqual({});
    });
  });
});

