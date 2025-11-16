/**
 * Animation Utilities
 * 
 * Utilidades para animaciones suaves en flujos críticos
 */

import { Animated, Easing } from 'react-native';

/**
 * Animación de fade in
 */
export const fadeIn = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animación de fade out
 */
export const fadeOut = (value: Animated.Value, duration: number = 300) => {
  return Animated.timing(value, {
    toValue: 0,
    duration,
    easing: Easing.in(Easing.ease),
    useNativeDriver: true,
  });
};

/**
 * Animación de slide up
 */
export const slideUp = (value: Animated.Value, distance: number = 50, duration: number = 300) => {
  return Animated.parallel([
    Animated.timing(value, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(
      new Animated.Value(distance),
      {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }
    ),
  ]);
};

/**
 * Animación de scale (pulse)
 */
export const scale = (value: Animated.Value, toValue: number = 1.1, duration: number = 200) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Animación de bounce
 */
export const bounce = (value: Animated.Value, duration: number = 400) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: 1.2,
      duration: duration * 0.3,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0.9,
      duration: duration * 0.2,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1.05,
      duration: duration * 0.2,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 1,
      duration: duration * 0.3,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Animación de shake (para errores)
 */
export const shake = (value: Animated.Value, distance: number = 10, duration: number = 300) => {
  return Animated.sequence([
    Animated.timing(value, {
      toValue: distance,
      duration: duration / 4,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: -distance,
      duration: duration / 2,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: distance,
      duration: duration / 4,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
    Animated.timing(value, {
      toValue: 0,
      duration: duration / 4,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ]);
};

/**
 * Animación de loading (spinner)
 */
export const spin = (value: Animated.Value, duration: number = 1000) => {
  return Animated.loop(
    Animated.timing(value, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

/**
 * Interpolación para rotación
 */
export const rotateInterpolation = (value: Animated.Value) => {
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

/**
 * Animación de éxito (checkmark)
 */
export const successAnimation = (scaleValue: Animated.Value, opacityValue: Animated.Value) => {
  return Animated.parallel([
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
  ]);
};

