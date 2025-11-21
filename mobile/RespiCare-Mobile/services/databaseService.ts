/**
 * Servicio de Base de Datos SQLite para Funcionalidad Offline
 * 
 * Este servicio maneja todas las operaciones de base de datos local usando SQLite,
 * permitiendo que la aplicación funcione completamente offline.
 * 
 * NOTA: En web, SQLite puede no estar disponible, por lo que se usa AsyncStorage como fallback.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importar SQLite - Metro resolverá automáticamente al mock en web
let SQLite: any = null;
try {
  SQLite = require('expo-sqlite');
} catch (error) {
  console.warn('expo-sqlite no disponible:', error);
}

// Tipos para las entidades
export interface MedicalHistoryRow {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  age: number;
  diagnosis: string;
  symptoms: string; // JSON string
  description?: string;
  date: string;
  location?: string; // JSON string
  images?: string; // JSON string
  audioNotes?: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRow {
  id: string;
  doctorId: string;
  patientId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  reason?: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface ChatbotMessageRow {
  id: string;
  sessionId: string;
  text: string;
  type: 'user' | 'assistant';
  urgencyLevel?: string;
  symptomCount?: number;
  needsMedicalAttention?: number; // 0 o 1 (boolean)
  imageUri?: string;
  audioUri?: string;
  timestamp: string;
}

export interface WearableDataRow {
  id: string;
  userId: string;
  heartRate?: number;
  steps?: number;
  spo2?: number;
  timestamp: string;
  source: string;
  syncStatus: 'pending' | 'synced' | 'error';
  createdAt: string;
  updatedAt?: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized: boolean = false;
  private isWeb: boolean = Platform.OS === 'web';

  /**
   * Inicializar la base de datos
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    // En web, SQLite no está disponible, usar AsyncStorage como fallback
    if (this.isWeb) {
      console.log('⚠️ Web detectado: SQLite no disponible, usando AsyncStorage como fallback');
      this.isInitialized = true;
      return;
    }

    if (!SQLite) {
      console.warn('⚠️ expo-sqlite no disponible, usando AsyncStorage como fallback');
      this.isInitialized = true;
      return;
    }

    try {
      // Abrir o crear la base de datos
      this.db = await SQLite.openDatabaseAsync('respicare.db');
      
      // Crear tablas
      await this.createTables();
      
      this.isInitialized = true;
      console.log('✅ Base de datos SQLite inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      console.warn('⚠️ Usando AsyncStorage como fallback');
      this.isInitialized = true; // Marcar como inicializado para evitar loops
    }
  }

  /**
   * Crear todas las tablas necesarias
   */
  private async createTables(): Promise<void> {
    if (!this.db || this.isWeb) {
      return; // No crear tablas en web
    }

    // Tabla de historias médicas
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS medical_histories (
        id TEXT PRIMARY KEY,
        patientId TEXT NOT NULL,
        doctorId TEXT NOT NULL,
        patientName TEXT NOT NULL,
        age INTEGER NOT NULL,
        diagnosis TEXT NOT NULL,
        symptoms TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        location TEXT,
        images TEXT,
        audioNotes TEXT,
        syncStatus TEXT NOT NULL DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Tabla de citas médicas
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        doctorId TEXT NOT NULL,
        patientId TEXT NOT NULL,
        scheduledAt TEXT NOT NULL,
        durationMinutes INTEGER NOT NULL,
        status TEXT NOT NULL,
        reason TEXT,
        syncStatus TEXT NOT NULL DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    // Tabla de mensajes del chatbot
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS chatbot_messages (
        id TEXT PRIMARY KEY,
        sessionId TEXT NOT NULL,
        text TEXT NOT NULL,
        type TEXT NOT NULL,
        urgencyLevel TEXT,
        symptomCount INTEGER,
        needsMedicalAttention INTEGER DEFAULT 0,
        imageUri TEXT,
        audioUri TEXT,
        timestamp TEXT NOT NULL
      );
    `);

    // Tabla de datos de wearables
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS wearable_data (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        heartRate REAL,
        steps INTEGER,
        spo2 REAL,
        timestamp TEXT NOT NULL,
        source TEXT NOT NULL,
        syncStatus TEXT NOT NULL DEFAULT 'pending',
        createdAt TEXT NOT NULL,
        updatedAt TEXT
      );
    `);

    // Índices para mejorar el rendimiento
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_medical_histories_patient ON medical_histories(patientId);
      CREATE INDEX IF NOT EXISTS idx_medical_histories_sync ON medical_histories(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patientId);
      CREATE INDEX IF NOT EXISTS idx_appointments_sync ON appointments(syncStatus);
      CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session ON chatbot_messages(sessionId);
      CREATE INDEX IF NOT EXISTS idx_wearable_data_user ON wearable_data(userId);
      CREATE INDEX IF NOT EXISTS idx_wearable_data_sync ON wearable_data(syncStatus);
    `);

    console.log('✅ Tablas creadas correctamente');
  }

  /**
   * Obtener instancia de la base de datos
   */
  private getDb(): SQLite.SQLiteDatabase | null {
    if (this.isWeb || !SQLite) {
      return null; // En web, retornar null para usar AsyncStorage
    }
    if (!this.db) {
      throw new Error('Base de datos no inicializada. Llama a initialize() primero.');
    }
    return this.db;
  }

  // ==================== MÉDICAL HISTORIES ====================

  /**
   * Obtener todas las historias médicas
   */
  async getMedicalHistories(patientId?: string): Promise<MedicalHistoryRow[]> {
    if (this.isWeb || !this.db) {
      // Fallback a AsyncStorage en web
      const key = patientId ? `medical_histories_${patientId}` : 'medical_histories';
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }

    const db = this.getDb();
    if (!db) return [];
    
    let query = 'SELECT * FROM medical_histories';
    const params: any[] = [];
    
    if (patientId) {
      query += ' WHERE patientId = ?';
      params.push(patientId);
    }
    
    query += ' ORDER BY date DESC';
    
    const result = await db.getAllAsync<MedicalHistoryRow>(query, params);
    return result;
  }

  /**
   * Obtener una historia médica por ID
   */
  async getMedicalHistoryById(id: string): Promise<MedicalHistoryRow | null> {
    if (this.isWeb || !this.db) {
      const key = `medical_history_${id}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }

    const db = this.getDb();
    if (!db) return null;
    const result = await db.getFirstAsync<MedicalHistoryRow>(
      'SELECT * FROM medical_histories WHERE id = ?',
      [id]
    );
    return result || null;
  }

  /**
   * Insertar o actualizar una historia médica
   */
  async saveMedicalHistory(history: MedicalHistoryRow): Promise<void> {
    if (this.isWeb || !this.db) {
      // Fallback a AsyncStorage en web
      const key = `medical_history_${history.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(history));
      // También guardar en lista
      const histories = await this.getMedicalHistories(history.patientId);
      const index = histories.findIndex(h => h.id === history.id);
      if (index >= 0) {
        histories[index] = history;
      } else {
        histories.push(history);
      }
      await AsyncStorage.setItem(`medical_histories_${history.patientId}`, JSON.stringify(histories));
      return;
    }

    const db = this.getDb();
    if (!db) return;
    
    await db.runAsync(
      `INSERT OR REPLACE INTO medical_histories 
       (id, patientId, doctorId, patientName, age, diagnosis, symptoms, description, 
        date, location, images, audioNotes, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        history.id,
        history.patientId,
        history.doctorId,
        history.patientName,
        history.age,
        history.diagnosis,
        history.symptoms,
        history.description || null,
        history.date,
        history.location || null,
        history.images || null,
        history.audioNotes || null,
        history.syncStatus,
        history.createdAt,
        history.updatedAt,
      ]
    );
  }

  /**
   * Eliminar una historia médica
   */
  async deleteMedicalHistory(id: string): Promise<void> {
    if (this.isWeb || !this.db) {
      await AsyncStorage.removeItem(`medical_history_${id}`);
      return;
    }

    const db = this.getDb();
    if (!db) return;
    await db.runAsync('DELETE FROM medical_histories WHERE id = ?', [id]);
  }

  /**
   * Obtener historias médicas pendientes de sincronización
   */
  async getPendingMedicalHistories(): Promise<MedicalHistoryRow[]> {
    if (this.isWeb || !this.db) {
      const histories = await this.getMedicalHistories();
      return histories.filter(h => h.syncStatus === 'pending');
    }

    const db = this.getDb();
    if (!db) return [];
    return await db.getAllAsync<MedicalHistoryRow>(
      'SELECT * FROM medical_histories WHERE syncStatus = ?',
      ['pending']
    );
  }

  // ==================== APPOINTMENTS ====================

  /**
   * Obtener todas las citas
   */
  async getAppointments(patientId?: string): Promise<AppointmentRow[]> {
    if (this.isWeb || !this.db) {
      const key = patientId ? `appointments_${patientId}` : 'appointments';
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }

    const db = this.getDb();
    if (!db) return [];
    
    let query = 'SELECT * FROM appointments';
    const params: any[] = [];
    
    if (patientId) {
      query += ' WHERE patientId = ?';
      params.push(patientId);
    }
    
    query += ' ORDER BY scheduledAt ASC';
    
    return await db.getAllAsync<AppointmentRow>(query, params);
  }

  /**
   * Guardar una cita
   */
  async saveAppointment(appointment: AppointmentRow): Promise<void> {
    if (this.isWeb || !this.db) {
      const key = `appointment_${appointment.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(appointment));
      const appointments = await this.getAppointments(appointment.patientId);
      const index = appointments.findIndex(a => a.id === appointment.id);
      if (index >= 0) {
        appointments[index] = appointment;
      } else {
        appointments.push(appointment);
      }
      await AsyncStorage.setItem(`appointments_${appointment.patientId}`, JSON.stringify(appointments));
      return;
    }

    const db = this.getDb();
    if (!db) return;
    
    await db.runAsync(
      `INSERT OR REPLACE INTO appointments 
       (id, doctorId, patientId, scheduledAt, durationMinutes, status, reason, 
        syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        appointment.id,
        appointment.doctorId,
        appointment.patientId,
        appointment.scheduledAt,
        appointment.durationMinutes,
        appointment.status,
        appointment.reason || null,
        appointment.syncStatus,
        appointment.createdAt,
        appointment.updatedAt,
      ]
    );
  }

  /**
   * Eliminar una cita
   */
  async deleteAppointment(id: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync('DELETE FROM appointments WHERE id = ?', [id]);
  }

  /**
   * Obtener citas pendientes de sincronización
   */
  async getPendingAppointments(): Promise<AppointmentRow[]> {
    const db = this.getDb();
    return await db.getAllAsync<AppointmentRow>(
      'SELECT * FROM appointments WHERE syncStatus = ?',
      ['pending']
    );
  }

  // ==================== CHATBOT MESSAGES ====================

  /**
   * Guardar un mensaje del chatbot
   */
  async saveChatbotMessage(message: ChatbotMessageRow): Promise<void> {
    if (this.isWeb || !this.db) {
      const messages = await this.getChatbotMessages(message.sessionId);
      const index = messages.findIndex(m => m.id === message.id);
      if (index >= 0) {
        messages[index] = message;
      } else {
        messages.push(message);
      }
      await AsyncStorage.setItem(`chatbot_messages_${message.sessionId}`, JSON.stringify(messages));
      return;
    }

    const db = this.getDb();
    if (!db) return;
    
    await db.runAsync(
      `INSERT OR REPLACE INTO chatbot_messages 
       (id, sessionId, text, type, urgencyLevel, symptomCount, needsMedicalAttention, 
        imageUri, audioUri, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.sessionId,
        message.text,
        message.type,
        message.urgencyLevel || null,
        message.symptomCount || null,
        message.needsMedicalAttention ? 1 : 0,
        message.imageUri || null,
        message.audioUri || null,
        message.timestamp,
      ]
    );
  }

  /**
   * Obtener mensajes de una sesión
   */
  async getChatbotMessages(sessionId: string): Promise<ChatbotMessageRow[]> {
    if (this.isWeb || !this.db) {
      const key = `chatbot_messages_${sessionId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }

    const db = this.getDb();
    if (!db) return [];
    return await db.getAllAsync<ChatbotMessageRow>(
      'SELECT * FROM chatbot_messages WHERE sessionId = ? ORDER BY timestamp ASC',
      [sessionId]
    );
  }

  /**
   * Eliminar mensajes de una sesión
   */
  async deleteChatbotMessages(sessionId: string): Promise<void> {
    const db = this.getDb();
    await db.runAsync('DELETE FROM chatbot_messages WHERE sessionId = ?', [sessionId]);
  }

  // ==================== WEARABLE DATA ====================

  /**
   * Guardar datos de wearable
   */
  async saveWearableData(data: WearableDataRow): Promise<void> {
    const db = this.getDb();
    
    const updatedAt = data.updatedAt || data.createdAt;
    
    await db.runAsync(
      `INSERT OR REPLACE INTO wearable_data 
       (id, userId, heartRate, steps, spo2, timestamp, source, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.userId,
        data.heartRate || null,
        data.steps || null,
        data.spo2 || null,
        data.timestamp,
        data.source,
        data.syncStatus,
        data.createdAt,
        updatedAt,
      ]
    );
  }

  /**
   * Obtener datos de wearable de un usuario
   */
  async getWearableData(userId: string, limit?: number): Promise<WearableDataRow[]> {
    const db = this.getDb();
    
    let query = 'SELECT * FROM wearable_data WHERE userId = ? ORDER BY timestamp DESC';
    const params: any[] = [userId];
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    return await db.getAllAsync<WearableDataRow>(query, params);
  }

  /**
   * Obtener datos de wearable pendientes de sincronización
   */
  async getPendingWearableData(): Promise<WearableDataRow[]> {
    const db = this.getDb();
    return await db.getAllAsync<WearableDataRow>(
      'SELECT * FROM wearable_data WHERE syncStatus = ?',
      ['pending']
    );
  }

  // ==================== UTILIDADES ====================

  /**
   * Limpiar todos los datos (útil para testing o reset)
   */
  async clearAllData(): Promise<void> {
    const db = this.getDb();
    await db.execAsync(`
      DELETE FROM medical_histories;
      DELETE FROM appointments;
      DELETE FROM chatbot_messages;
      DELETE FROM wearable_data;
    `);
  }

  /**
   * Obtener estadísticas de sincronización
   */
  async getSyncStats(): Promise<{
    medicalHistories: { pending: number; synced: number; error: number };
    appointments: { pending: number; synced: number; error: number };
    wearableData: { pending: number; synced: number; error: number };
  }> {
    const db = this.getDb();
    
    const [medicalHistories] = await db.getAllAsync<{ count: number; syncStatus: string }>(
      `SELECT syncStatus, COUNT(*) as count FROM medical_histories GROUP BY syncStatus`
    );
    
    const [appointments] = await db.getAllAsync<{ count: number; syncStatus: string }>(
      `SELECT syncStatus, COUNT(*) as count FROM appointments GROUP BY syncStatus`
    );
    
    const [wearableData] = await db.getAllAsync<{ count: number; syncStatus: string }>(
      `SELECT syncStatus, COUNT(*) as count FROM wearable_data GROUP BY syncStatus`
    );
    
    return {
      medicalHistories: {
        pending: medicalHistories?.syncStatus === 'pending' ? medicalHistories.count : 0,
        synced: medicalHistories?.syncStatus === 'synced' ? medicalHistories.count : 0,
        error: medicalHistories?.syncStatus === 'error' ? medicalHistories.count : 0,
      },
      appointments: {
        pending: appointments?.syncStatus === 'pending' ? appointments.count : 0,
        synced: appointments?.syncStatus === 'synced' ? appointments.count : 0,
        error: appointments?.syncStatus === 'error' ? appointments.count : 0,
      },
      wearableData: {
        pending: wearableData?.syncStatus === 'pending' ? wearableData.count : 0,
        synced: wearableData?.syncStatus === 'synced' ? wearableData.count : 0,
        error: wearableData?.syncStatus === 'error' ? wearableData.count : 0,
      },
    };
  }

  /**
   * Cerrar la conexión a la base de datos
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Exportar instancia singleton
export const databaseService = new DatabaseService();

