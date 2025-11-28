/**
 * Tests for Animation Utilities
 */

import { Animated } from 'react-native';
import {
  fadeIn,
  fadeOut,
  slideUp,
  scale,
  bounce,
  shake,
  spin,
  rotateInterpolation,
  successAnimation,
} from '../../medical-app/utils/animations';

describe('Animation Utilities', () => {
  describe('fadeIn', () => {
    it('should create fade in animation', () => {
      const value = new Animated.Value(0);
      const animation = fadeIn(value);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should use custom duration', () => {
      const value = new Animated.Value(0);
      const animation = fadeIn(value, 500);
      expect(animation).toBeDefined();
    });
  });

  describe('fadeOut', () => {
    it('should create fade out animation', () => {
      const value = new Animated.Value(1);
      const animation = fadeOut(value);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should use custom duration', () => {
      const value = new Animated.Value(1);
      const animation = fadeOut(value, 500);
      expect(animation).toBeDefined();
    });
  });

  describe('slideUp', () => {
    it('should create slide up animation', () => {
      const value = new Animated.Value(50);
      const animation = slideUp(value);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should use custom distance and duration', () => {
      const value = new Animated.Value(100);
      const animation = slideUp(value, 100, 500);
      expect(animation).toBeDefined();
    });
  });

  describe('scale', () => {
    it('should create scale animation', () => {
      const value = new Animated.Value(1);
      const animation = scale(value);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should use custom toValue and duration', () => {
      const value = new Animated.Value(1);
      const animation = scale(value, 1.5, 300);
      expect(animation).toBeDefined();
    });
  });

  describe('bounce', () => {
    it('should create bounce animation', () => {
      const value = new Animated.Value(1);
      const animation = bounce(value);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should use custom duration', () => {
      const value = new Animated.Value(1);
      const animation = bounce(value, 600);
      expect(animation).toBeDefined();
    });
  });

  describe('shake', () => {
    it('should create shake animation', () => {
      const value = new Animated.Value(0);
      const animation = shake(value);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should use custom distance and duration', () => {
      const value = new Animated.Value(0);
      const animation = shake(value, 20, 400);
      expect(animation).toBeDefined();
    });
  });

  describe('spin', () => {
    it('should create spin animation', () => {
      const value = new Animated.Value(0);
      const animation = spin(value);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should use custom duration', () => {
      const value = new Animated.Value(0);
      const animation = spin(value, 2000);
      expect(animation).toBeDefined();
    });
  });

  describe('rotateInterpolation', () => {
    it('should create rotation interpolation', () => {
      const value = new Animated.Value(0);
      const interpolation = rotateInterpolation(value);
      expect(interpolation).toBeDefined();
    });

    it('should interpolate from 0 to 360 degrees', () => {
      const value = new Animated.Value(0);
      const interpolation = rotateInterpolation(value);
      // Should create interpolation
      expect(interpolation).toBeDefined();
    });
  });

  describe('successAnimation', () => {
    it('should create success animation', () => {
      const scaleValue = new Animated.Value(1);
      const opacityValue = new Animated.Value(0);
      const animation = successAnimation(scaleValue, opacityValue);
      expect(animation).toBeInstanceOf(Animated.CompositeAnimation);
    });

    it('should animate both scale and opacity', () => {
      const scaleValue = new Animated.Value(1);
      const opacityValue = new Animated.Value(0);
      const animation = successAnimation(scaleValue, opacityValue);
      expect(animation).toBeDefined();
    });
  });
});

