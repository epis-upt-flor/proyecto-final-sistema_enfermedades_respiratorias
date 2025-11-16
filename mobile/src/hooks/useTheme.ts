import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../theme/theme';
import { darkTheme } from '../theme/darkTheme';
import { MD3Theme } from 'react-native-paper';

export type ThemeMode = 'light' | 'dark' | 'auto';

export function useTheme(): { theme: MD3Theme; themeMode: ThemeMode; toggleTheme: () => void; setThemeMode: (mode: ThemeMode) => void } {
  const systemColorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useAppStore((state) => ({
    themeMode: state.themeMode || 'auto',
    setThemeMode: state.setThemeMode,
  }));

  const getCurrentTheme = (): MD3Theme => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark' ? darkTheme : theme;
    }
    return themeMode === 'dark' ? darkTheme : theme;
  };

  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'auto' : 'light';
    setThemeMode(newMode);
  };

  return {
    theme: getCurrentTheme(),
    themeMode,
    toggleTheme,
    setThemeMode,
  };
}

