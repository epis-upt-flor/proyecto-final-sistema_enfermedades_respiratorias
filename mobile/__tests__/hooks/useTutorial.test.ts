/**
 * Tests for useTutorial hook
 */

import { renderHook, act } from '@testing-library/react-native';
// Nota: useTutorial puede no existir en medical-app, verificar si es necesario
// import { useTutorial } from '../../medical-app/hooks/useTutorial';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('useTutorial', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should return tutorial state', () => {
    const { result } = renderHook(() => useTutorial());
    
    expect(result.current.isTutorialComplete).toBeDefined();
    expect(result.current.currentStep).toBeDefined();
    expect(typeof result.current.markStepComplete).toBe('function');
    expect(typeof result.current.resetTutorial).toBe('function');
  });

  it('should mark step as complete', async () => {
    const { result } = renderHook(() => useTutorial());
    
    act(() => {
      result.current.markStepComplete('step1');
    });
    
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should reset tutorial', async () => {
    const { result } = renderHook(() => useTutorial());
    
    act(() => {
      result.current.resetTutorial();
    });
    
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should load tutorial state from storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({
      isComplete: true,
      completedSteps: ['step1', 'step2'],
    }));
    
    const { result } = renderHook(() => useTutorial());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.isTutorialComplete).toBe(true);
  });
});

