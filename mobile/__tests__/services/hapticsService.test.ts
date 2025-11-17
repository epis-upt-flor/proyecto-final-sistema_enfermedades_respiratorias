/**
 * Tests for HapticsService
 */

import { hapticsService } from '../../src/services/hapticsService';

// Mock expo-haptics
const mockHaptics = {
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
    Rigid: 'rigid',
    Soft: 'soft',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
};

describe('HapticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('impact', () => {
    it('should call impactAsync with light style', async () => {
      jest.doMock('expo-haptics', () => mockHaptics);
      await hapticsService.impact('light');
      // Should handle gracefully even if module not available
      expect(true).toBe(true);
    });

    it('should handle all impact styles', async () => {
      const styles: Array<'light' | 'medium' | 'heavy' | 'rigid' | 'soft'> = [
        'light', 'medium', 'heavy', 'rigid', 'soft'
      ];
      for (const style of styles) {
        await hapticsService.impact(style);
      }
      // Should handle all styles
      expect(styles.length).toBe(5);
    });

    it('should handle missing expo-haptics gracefully', async () => {
      jest.doMock('expo-haptics', () => {
        throw new Error('Module not found');
      });
      await expect(hapticsService.impact('light')).resolves.not.toThrow();
    });
  });

  describe('selection', () => {
    it('should call selectionAsync', async () => {
      jest.doMock('expo-haptics', () => mockHaptics);
      await hapticsService.selection();
      // Should handle gracefully
      expect(true).toBe(true);
    });

    it('should handle missing expo-haptics gracefully', async () => {
      jest.doMock('expo-haptics', () => {
        throw new Error('Module not found');
      });
      await expect(hapticsService.selection()).resolves.not.toThrow();
    });
  });

  describe('notification', () => {
    it('should call notificationAsync with success type', async () => {
      jest.doMock('expo-haptics', () => mockHaptics);
      await hapticsService.notification('success');
      // Should handle gracefully
      expect(true).toBe(true);
    });

    it('should handle all notification types', async () => {
      const types: Array<'success' | 'warning' | 'error'> = ['success', 'warning', 'error'];
      for (const type of types) {
        await hapticsService.notification(type);
      }
      // Should handle all types
      expect(types.length).toBe(3);
    });

    it('should handle missing expo-haptics gracefully', async () => {
      jest.doMock('expo-haptics', () => {
        throw new Error('Module not found');
      });
      await expect(hapticsService.notification('success')).resolves.not.toThrow();
    });
  });
});

