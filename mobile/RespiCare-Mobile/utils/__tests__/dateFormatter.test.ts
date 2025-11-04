/**
 * Tests TDD para Date Formatter
 * Aplicando el ciclo RED -> GREEN -> REFACTOR
 */

import { formatDateForDisplay, getRelativeTime } from '../dateFormatter';

describe('DateFormatter', () => {
  
  describe('formatDateForDisplay', () => {
    
    // Test 1: Debe formatear fecha actual correctamente
    it('debe formatear fecha actual en formato DD/MM/YYYY', () => {
      const date = new Date('2025-11-04T10:30:00');
      const result = formatDateForDisplay(date);
      expect(result).toBe('04/11/2025');
    });

    // Test 2: Debe formatear fecha desde string ISO
    it('debe formatear fecha desde string ISO', () => {
      const dateStr = '2025-11-04T10:30:00Z';
      const result = formatDateForDisplay(dateStr);
      expect(result).toBe('04/11/2025');
    });

    // Test 3: Debe formatear con hora si se especifica
    it('debe incluir hora cuando se requiere', () => {
      const date = new Date('2025-11-04T14:30:00');
      const result = formatDateForDisplay(date, true);
      expect(result).toContain('14:30');
    });

    // Test 4: Debe manejar diferentes formatos de entrada
    it('debe manejar diferentes formatos de entrada', () => {
      const date1 = new Date('2025-11-04');
      const date2 = '2025-11-04';
      const result1 = formatDateForDisplay(date1);
      const result2 = formatDateForDisplay(date2);
      expect(result1).toBe('04/11/2025');
      expect(result2).toBe('04/11/2025');
    });

    // Test 5: Debe lanzar error para fecha inválida
    it('debe lanzar error para fecha inválida', () => {
      expect(() => formatDateForDisplay('invalid-date')).toThrow();
      expect(() => formatDateForDisplay(null as any)).toThrow();
    });
  });

  describe('getRelativeTime', () => {
    
    // Test 1: Debe retornar "hace unos momentos" para fecha reciente
    it('debe retornar "hace unos momentos" para fechas recientes (< 1 minuto)', () => {
      const date = new Date(Date.now() - 30 * 1000); // 30 segundos atrás
      const result = getRelativeTime(date);
      expect(result).toBe('hace unos momentos');
    });

    // Test 2: Debe retornar "hace X minutos"
    it('debe retornar "hace X minutos" para minutos recientes', () => {
      const date = new Date(Date.now() - 30 * 60 * 1000); // 30 minutos atrás
      const result = getRelativeTime(date);
      expect(result).toBe('hace 30 minutos');
    });

    // Test 3: Debe retornar "hace X horas"
    it('debe retornar "hace X horas" para horas recientes', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 horas atrás
      const result = getRelativeTime(date);
      expect(result).toBe('hace 3 horas');
    });

    // Test 4: Debe retornar "hace X días"
    it('debe retornar "hace X días" para días recientes', () => {
      const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 días atrás
      const result = getRelativeTime(date);
      expect(result).toBe('hace 2 días');
    });

    // Test 5: Debe retornar fecha formateada para fechas antiguas (> 7 días)
    it('debe retornar fecha formateada para fechas antiguas', () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 días atrás
      const result = getRelativeTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/); // Formato DD/MM/YYYY
    });
  });
});

