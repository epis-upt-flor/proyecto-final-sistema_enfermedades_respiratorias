/**
 * Mock de expo-sqlite para uso en web
 * Este módulo reemplaza expo-sqlite cuando se ejecuta en web
 * 
 * NOTA: Este archivo es usado por Metro cuando se ejecuta en web
 * para evitar errores de resolución de módulos WASM.
 */

// Mock de SQLiteDatabase
class MockSQLiteDatabase {
  async execAsync(sql: string): Promise<void> {
    // No-op en web
  }

  async getAllAsync<T>(sql: string, params?: any[]): Promise<T[]> {
    return [];
  }

  async getFirstAsync<T>(sql: string, params?: any[]): Promise<T | null> {
    return null;
  }

  async runAsync(sql: string, params?: any[]): Promise<void> {
    // No-op en web
  }

  async closeAsync(): Promise<void> {
    // No-op en web
  }
}

export const openDatabaseAsync = async (name: string): Promise<MockSQLiteDatabase> => {
  console.warn('⚠️ SQLite no disponible en web, usando AsyncStorage como fallback');
  return new MockSQLiteDatabase();
};

// Exportar como módulo por defecto para compatibilidad
const sqliteMock = {
  openDatabaseAsync,
};

export default sqliteMock;
