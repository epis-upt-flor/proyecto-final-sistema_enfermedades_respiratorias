/**
 * Tests for BatteryOptimizationService
 */

import { batteryOptimizationService } from '../../medical-app/services/batteryOptimizationService';
import { Platform } from 'react-native';

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
  },
  NativeModules: {
    BatteryOptimization: {
      isIgnoringBatteryOptimizations: jest.fn(),
      requestIgnoreBatteryOptimizations: jest.fn(),
    },
  },
}));

describe('BatteryOptimizationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isIgnoringBatteryOptimizations', () => {
    it('should check battery optimization status', async () => {
      const { NativeModules } = require('react-native');
      NativeModules.BatteryOptimization.isIgnoringBatteryOptimizations.mockResolvedValue(true);
      
      const result = await batteryOptimizationService.isIgnoringBatteryOptimizations();
      
      expect(result).toBe(true);
    });

    it('should return false on Android when not ignoring', async () => {
      const { NativeModules } = require('react-native');
      NativeModules.BatteryOptimization.isIgnoringBatteryOptimizations.mockResolvedValue(false);
      
      const result = await batteryOptimizationService.isIgnoringBatteryOptimizations();
      
      expect(result).toBe(false);
    });

    it('should return true on iOS (always optimized)', async () => {
      Platform.OS = 'ios';
      
      const result = await batteryOptimizationService.isIgnoringBatteryOptimizations();
      
      expect(result).toBe(true);
    });
  });

  describe('requestIgnoreBatteryOptimizations', () => {
    it('should request to ignore battery optimizations', async () => {
      const { NativeModules } = require('react-native');
      NativeModules.BatteryOptimization.requestIgnoreBatteryOptimizations.mockResolvedValue(true);
      
      const result = await batteryOptimizationService.requestIgnoreBatteryOptimizations();
      
      expect(result).toBe(true);
    });

    it('should handle request failure', async () => {
      const { NativeModules } = require('react-native');
      NativeModules.BatteryOptimization.requestIgnoreBatteryOptimizations.mockRejectedValue(
        new Error('Permission denied')
      );
      
      const result = await batteryOptimizationService.requestIgnoreBatteryOptimizations();
      
      expect(result).toBe(false);
    });

    it('should return true on iOS (no action needed)', async () => {
      Platform.OS = 'ios';
      
      const result = await batteryOptimizationService.requestIgnoreBatteryOptimizations();
      
      expect(result).toBe(true);
    });
  });
});

