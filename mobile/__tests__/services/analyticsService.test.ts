/**
 * Tests for AnalyticsService
 */

import { analyticsService } from '../../src/services/analyticsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    analyticsService.enable(true);
    analyticsService.drain();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    analyticsService.stopAutoFlush();
  });

  describe('enable/disable', () => {
    it('should enable analytics', () => {
      analyticsService.enable(true);
      analyticsService.logEvent('test_event');
      expect(analyticsService.drain().length).toBe(1);
    });

    it('should disable analytics', () => {
      analyticsService.enable(false);
      analyticsService.logEvent('test_event');
      expect(analyticsService.drain().length).toBe(0);
    });
  });

  describe('logEvent', () => {
    it('should log event with name', () => {
      analyticsService.logEvent('test_event');
      const events = analyticsService.drain();
      expect(events.length).toBe(1);
      expect(events[0].name).toBe('test_event');
      expect(events[0].props).toBeUndefined();
    });

    it('should log event with props', () => {
      analyticsService.logEvent('test_event', { key: 'value' });
      const events = analyticsService.drain();
      expect(events[0].props).toEqual({ key: 'value' });
    });

    it('should include timestamp', () => {
      const before = Date.now();
      analyticsService.logEvent('test_event');
      const after = Date.now();
      const events = analyticsService.drain();
      expect(events[0].ts).toBeGreaterThanOrEqual(before);
      expect(events[0].ts).toBeLessThanOrEqual(after);
    });

    it('should not log when disabled', () => {
      analyticsService.enable(false);
      analyticsService.logEvent('test_event');
      expect(analyticsService.drain().length).toBe(0);
    });
  });

  describe('logTiming', () => {
    it('should log timing event', () => {
      analyticsService.logTiming('api_call', 150);
      const events = analyticsService.drain();
      expect(events[0].name).toBe('timing.api_call');
      expect(events[0].props?.durationMs).toBe(150);
    });

    it('should log timing with additional props', () => {
      analyticsService.logTiming('api_call', 150, { endpoint: '/users' });
      const events = analyticsService.drain();
      expect(events[0].props?.endpoint).toBe('/users');
    });
  });

  describe('persistQueueToStorage', () => {
    it('should persist events to AsyncStorage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      analyticsService.logEvent('test_event');
      await analyticsService.persistQueueToStorage();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should merge with existing events', async () => {
      const existing = [{ name: 'old_event', ts: 1000 }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existing));
      analyticsService.logEvent('new_event');
      await analyticsService.persistQueueToStorage();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'analytics_events_buffer',
        expect.stringContaining('old_event')
      );
    });

    it('should limit to maxStoredEvents', async () => {
      const existing = Array.from({ length: 1000 }, (_, i) => ({ name: `event_${i}`, ts: i }));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existing));
      analyticsService.logEvent('new_event');
      await analyticsService.persistQueueToStorage();
      const call = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const stored = JSON.parse(call[1]);
      expect(stored.length).toBeLessThanOrEqual(1000);
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      analyticsService.logEvent('test_event');
      await expect(analyticsService.persistQueueToStorage()).resolves.not.toThrow();
    });

    it('should clear queue after persisting', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      analyticsService.logEvent('test_event');
      await analyticsService.persistQueueToStorage();
      expect(analyticsService.drain().length).toBe(0);
    });
  });

  describe('loadStoredEvents', () => {
    it('should load events from AsyncStorage', async () => {
      const events = [{ name: 'stored_event', ts: 1000 }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(events));
      const loaded = await analyticsService.loadStoredEvents();
      expect(loaded).toEqual(events);
    });

    it('should return empty array when no stored events', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const loaded = await analyticsService.loadStoredEvents();
      expect(loaded).toEqual([]);
    });

    it('should handle parse errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');
      const loaded = await analyticsService.loadStoredEvents();
      expect(loaded).toEqual([]);
    });
  });

  describe('exportToJSON', () => {
    it('should export stored and queued events', async () => {
      const stored = [{ name: 'stored', ts: 1000 }];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(stored));
      analyticsService.logEvent('queued');
      const json = await analyticsService.exportToJSON();
      const parsed = JSON.parse(json);
      expect(parsed.length).toBe(2);
      expect(parsed.some((e: any) => e.name === 'stored')).toBe(true);
      expect(parsed.some((e: any) => e.name === 'queued')).toBe(true);
    });

    it('should not clear queue after export', async () => {
      analyticsService.logEvent('test_event');
      await analyticsService.exportToJSON();
      expect(analyticsService.drain().length).toBe(1);
    });
  });

  describe('clearStorage', () => {
    it('should clear AsyncStorage', async () => {
      await analyticsService.clearStorage();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('analytics_events_buffer');
    });

    it('should handle errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Error'));
      await expect(analyticsService.clearStorage()).resolves.not.toThrow();
    });
  });

  describe('autoFlush', () => {
    it('should start auto flush', () => {
      analyticsService.startAutoFlush(1000);
      expect(analyticsService.drain().length).toBe(0);
    });

    it('should flush periodically', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      analyticsService.startAutoFlush(1000);
      analyticsService.logEvent('test_event');
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should not start multiple timers', () => {
      analyticsService.startAutoFlush(1000);
      analyticsService.startAutoFlush(1000);
      // Should not create duplicate timers
      expect(analyticsService.drain().length).toBe(0);
    });

    it('should stop auto flush', () => {
      analyticsService.startAutoFlush(1000);
      analyticsService.stopAutoFlush();
      analyticsService.logEvent('test_event');
      jest.advanceTimersByTime(1000);
      // Should not flush after stop
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('drain', () => {
    it('should return and clear queue', () => {
      analyticsService.logEvent('event1');
      analyticsService.logEvent('event2');
      const drained = analyticsService.drain();
      expect(drained.length).toBe(2);
      expect(analyticsService.drain().length).toBe(0);
    });
  });
});

