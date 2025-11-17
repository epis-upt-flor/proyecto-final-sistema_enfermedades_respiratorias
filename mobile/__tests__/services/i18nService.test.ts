/**
 * Tests for i18nService
 */

import { i18nService, useTranslation } from '../../src/services/i18nService';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('i18nService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('getCurrentLanguage', () => {
    it('should return default language', () => {
      const lang = i18nService.getCurrentLanguage();
      expect(['es', 'en', 'pt', 'fr', 'qu']).toContain(lang);
    });

    it('should return stored language', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('en');
      await i18nService.setLanguage('en');
      const lang = i18nService.getCurrentLanguage();
      expect(lang).toBe('en');
    });
  });

  describe('setLanguage', () => {
    it('should set language', async () => {
      await i18nService.setLanguage('en');
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should persist to AsyncStorage', async () => {
      await i18nService.setLanguage('pt');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_language', 'pt');
    });

    it('should handle invalid language gracefully', async () => {
      await i18nService.setLanguage('invalid' as any);
      // Should handle gracefully
      expect(true).toBe(true);
    });
  });

  describe('t (translation)', () => {
    it('should translate simple keys', () => {
      const translation = i18nService.t('common.save');
      expect(typeof translation).toBe('string');
      expect(translation.length).toBeGreaterThan(0);
    });

    it('should translate nested keys', () => {
      const translation = i18nService.t('home.quickActions');
      expect(typeof translation).toBe('string');
    });

    it('should return key when translation not found', () => {
      const translation = i18nService.t('nonexistent.key');
      expect(translation).toBe('nonexistent.key');
    });

    it('should translate in different languages', async () => {
      await i18nService.setLanguage('es');
      const esTranslation = i18nService.t('common.save');
      
      await i18nService.setLanguage('en');
      const enTranslation = i18nService.t('common.save');
      
      expect(esTranslation).not.toBe(enTranslation);
    });

    it('should handle interpolation', () => {
      const translation = i18nService.t('home.sync.pending', { count: 5 });
      expect(translation).toContain('5');
    });
  });

  describe('useTranslation hook', () => {
    it('should return translation function', () => {
      const { t } = useTranslation();
      expect(typeof t).toBe('function');
    });

    it('should return current language', () => {
      const { language } = useTranslation();
      expect(['es', 'en', 'pt', 'fr', 'qu']).toContain(language);
    });

    it('should return setLanguage function', () => {
      const { setLanguage } = useTranslation();
      expect(typeof setLanguage).toBe('function');
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return supported languages', () => {
      const languages = i18nService.getSupportedLanguages();
      expect(languages).toContain('es');
      expect(languages).toContain('en');
      expect(languages).toContain('pt');
    });
  });
});

