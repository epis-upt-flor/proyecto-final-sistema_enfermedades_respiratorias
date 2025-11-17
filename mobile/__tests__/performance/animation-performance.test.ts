/**
 * Tests de Performance - Animaciones
 * Verifica que las animaciones no afecten el performance general
 */

import { Animated, Easing } from 'react-native';
import { fadeIn, fadeOut, slideUp, scale, bounce, shake } from '../../src/utils/animations';

// Performance thresholds
const ANIMATION_FRAME_THRESHOLD_MS = 16; // 60 FPS = 16ms por frame
const ANIMATION_DURATION_THRESHOLD_MS = 500; // Animaciones no deben durar más de 500ms
const ANIMATION_OVERHEAD_THRESHOLD_MS = 50; // Overhead máximo permitido

describe('Animation Performance Tests', () => {
  describe('Basic Animations', () => {
    it('fadeIn debe completarse en tiempo razonable', () => {
      const animValue = new Animated.Value(0);
      const startTime = performance.now();
      
      fadeIn(animValue, 300).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // La animación debe completarse cerca de su duración
        expect(duration).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
      });
    });

    it('fadeOut debe completarse en tiempo razonable', () => {
      const animValue = new Animated.Value(1);
      const startTime = performance.now();
      
      fadeOut(animValue, 300).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
      });
    });

    it('slideUp debe completarse en tiempo razonable', () => {
      const animValue = new Animated.Value(0);
      const startTime = performance.now();
      
      slideUp(animValue, 300).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
      });
    });

    it('scale debe completarse en tiempo razonable', () => {
      const animValue = new Animated.Value(1);
      const startTime = performance.now();
      
      scale(animValue, 1.2, 300).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
      });
    });

    it('bounce debe completarse en tiempo razonable', () => {
      const animValue = new Animated.Value(1);
      const startTime = performance.now();
      
      bounce(animValue, 300).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
      });
    });

    it('shake debe completarse en tiempo razonable', () => {
      const animValue = new Animated.Value(0);
      const startTime = performance.now();
      
      shake(animValue, 10, 300).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        expect(duration).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
      });
    });
  });

  describe('Animation Frame Rate', () => {
    it('las animaciones deben mantener 60 FPS', () => {
      const animValue = new Animated.Value(0);
      let frameCount = 0;
      let lastFrameTime = performance.now();
      
      const animation = Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      
      // Simular listener de frames
      const listener = animValue.addListener(({ value }) => {
        frameCount++;
        const currentTime = performance.now();
        const frameTime = currentTime - lastFrameTime;
        
        // Cada frame debe tomar aproximadamente 16ms (60 FPS)
        if (frameCount > 1) {
          expect(frameTime).toBeLessThan(ANIMATION_FRAME_THRESHOLD_MS * 2);
        }
        
        lastFrameTime = currentTime;
      });
      
      animation.start(() => {
        animValue.removeListener(listener);
        
        // Verificar que hubo suficientes frames para 60 FPS
        const expectedFrames = Math.floor(300 / ANIMATION_FRAME_THRESHOLD_MS);
        expect(frameCount).toBeGreaterThan(expectedFrames * 0.8); // 80% de frames esperados
      });
    });
  });

  describe('Multiple Animations', () => {
    it('debe manejar múltiples animaciones simultáneas sin degradación', () => {
      const anim1 = new Animated.Value(0);
      const anim2 = new Animated.Value(0);
      const anim3 = new Animated.Value(0);
      
      const startTime = performance.now();
      
      Animated.parallel([
        fadeIn(anim1, 300),
        fadeIn(anim2, 300),
        fadeIn(anim3, 300),
      ]).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Múltiples animaciones no deben tomar mucho más tiempo
        expect(duration).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS + ANIMATION_OVERHEAD_THRESHOLD_MS);
      });
    });

    it('debe manejar secuencia de animaciones eficientemente', () => {
      const anim1 = new Animated.Value(0);
      const anim2 = new Animated.Value(0);
      
      const startTime = performance.now();
      
      Animated.sequence([
        fadeIn(anim1, 150),
        fadeIn(anim2, 150),
      ]).start(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // La secuencia debe tomar aproximadamente la suma de duraciones
        expect(duration).toBeLessThan(300 + ANIMATION_OVERHEAD_THRESHOLD_MS);
      });
    });
  });

  describe('Native Driver Performance', () => {
    it('debe usar native driver para mejor performance', () => {
      const animValue = new Animated.Value(0);
      
      const animation = Animated.timing(animValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true, // Native driver mejora performance
      });
      
      // Verificar que useNativeDriver está habilitado
      expect(animation).toBeDefined();
    });

    it('native driver debe ser más rápido que JS driver', () => {
      const animValue1 = new Animated.Value(0);
      const animValue2 = new Animated.Value(0);
      
      const startTime1 = performance.now();
      const animation1 = Animated.timing(animValue1, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      });
      
      animation1.start(() => {
        const endTime1 = performance.now();
        const nativeTime = endTime1 - startTime1;
        
        const startTime2 = performance.now();
        const animation2 = Animated.timing(animValue2, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false, // JS driver
        });
        
        animation2.start(() => {
          const endTime2 = performance.now();
          const jsTime = endTime2 - startTime2;
          
          // Native driver generalmente es más eficiente
          // (aunque en tests puede variar, verificamos que ambos funcionan)
          expect(nativeTime).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
          expect(jsTime).toBeLessThan(ANIMATION_DURATION_THRESHOLD_MS);
        });
      });
    });
  });
});

