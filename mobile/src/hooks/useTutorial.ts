/**
 * useTutorial Hook
 * 
 * Hook para gestionar el tutorial interactivo
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TutorialStep } from '../components/Tutorial/TutorialOverlay';

const TUTORIAL_COMPLETED_KEY = 'tutorial_completed';

export const useTutorial = (steps: TutorialStep[]) => {
  const [visible, setVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY);
      setHasCompleted(completed === 'true');
      
      // Mostrar tutorial si no se ha completado
      if (completed !== 'true') {
        setVisible(true);
      }
    } catch (error) {
      console.error('Error checking tutorial status', error);
    }
  };

  const startTutorial = useCallback(() => {
    setVisible(true);
  }, []);

  const completeTutorial = useCallback(async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      setHasCompleted(true);
      setVisible(false);
    } catch (error) {
      console.error('Error completing tutorial', error);
    }
  }, []);

  const skipTutorial = useCallback(async () => {
    try {
      await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
      setHasCompleted(true);
      setVisible(false);
    } catch (error) {
      console.error('Error skipping tutorial', error);
    }
  }, []);

  const resetTutorial = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TUTORIAL_COMPLETED_KEY);
      setHasCompleted(false);
      setVisible(true);
    } catch (error) {
      console.error('Error resetting tutorial', error);
    }
  }, []);

  return {
    visible,
    hasCompleted,
    startTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorial,
  };
};

