/**
 * Cola de operaciones offline
 * Gestiona operaciones que se realizan sin conexión y las sincroniza cuando vuelve la conexión
 */

export type OperationType = 
  | 'create_medical_history'
  | 'update_medical_history'
  | 'create_appointment'
  | 'update_appointment'
  | 'cancel_appointment'
  | 'reschedule_appointment'
  | 'acknowledge_alert'
  | 'upload_images'
  | 'upload_audio'

export interface OfflineOperation {
  id: string
  type: OperationType
  payload: any
  timestamp: number
  retries: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

const STORAGE_KEY = 'respicare_offline_queue'
const MAX_RETRIES = 3
const MAX_OPERATIONS = 100

class OfflineQueue {
  private operations: OfflineOperation[] = []
  private isProcessing = false
  private listeners: Array<(operations: OfflineOperation[]) => void> = []

  constructor() {
    this.loadFromStorage()
  }

  /**
   * Cargar operaciones desde localStorage
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.operations = JSON.parse(stored)
        // Limpiar operaciones completadas antiguas (más de 7 días)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        this.operations = this.operations.filter(
          op => op.status !== 'completed' || op.timestamp > sevenDaysAgo
        )
        this.saveToStorage()
      }
    } catch (error) {
      console.error('Error al cargar cola offline:', error)
      this.operations = []
    }
  }

  /**
   * Guardar operaciones en localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return

    try {
      // Limitar número de operaciones
      const toSave = this.operations.slice(0, MAX_OPERATIONS)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
      this.notifyListeners()
    } catch (error) {
      console.error('Error al guardar cola offline:', error)
    }
  }

  /**
   * Notificar a los listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.operations]))
  }

  /**
   * Suscribirse a cambios en la cola
   */
  subscribe(listener: (operations: OfflineOperation[]) => void): () => void {
    this.listeners.push(listener)
    listener([...this.operations]) // Notificar estado actual
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Agregar operación a la cola
   */
  enqueue(type: OperationType, payload: any): string {
    const operation: OfflineOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending'
    }

    this.operations.unshift(operation) // Agregar al inicio
    this.saveToStorage()
    
    return operation.id
  }

  /**
   * Obtener operaciones pendientes
   */
  getPendingOperations(): OfflineOperation[] {
    return this.operations.filter(op => op.status === 'pending')
  }

  /**
   * Obtener todas las operaciones
   */
  getAllOperations(): OfflineOperation[] {
    return [...this.operations]
  }

  /**
   * Obtener número de operaciones pendientes
   */
  getPendingCount(): number {
    return this.getPendingOperations().length
  }

  /**
   * Marcar operación como procesando
   */
  markAsProcessing(id: string): void {
    const operation = this.operations.find(op => op.id === id)
    if (operation) {
      operation.status = 'processing'
      this.saveToStorage()
    }
  }

  /**
   * Marcar operación como completada
   */
  markAsCompleted(id: string): void {
    const operation = this.operations.find(op => op.id === id)
    if (operation) {
      operation.status = 'completed'
      this.saveToStorage()
      
      // Limpiar operaciones completadas después de 1 hora
      setTimeout(() => {
        this.operations = this.operations.filter(op => op.id !== id)
        this.saveToStorage()
      }, 60 * 60 * 1000)
    }
  }

  /**
   * Marcar operación como fallida
   */
  markAsFailed(id: string, error: string): void {
    const operation = this.operations.find(op => op.id === id)
    if (operation) {
      operation.retries++
      operation.error = error
      
      if (operation.retries >= MAX_RETRIES) {
        operation.status = 'failed'
      } else {
        operation.status = 'pending' // Reintentar
      }
      
      this.saveToStorage()
    }
  }

  /**
   * Eliminar operación
   */
  remove(id: string): void {
    this.operations = this.operations.filter(op => op.id !== id)
    this.saveToStorage()
  }

  /**
   * Limpiar todas las operaciones completadas
   */
  clearCompleted(): void {
    this.operations = this.operations.filter(op => op.status !== 'completed')
    this.saveToStorage()
  }

  /**
   * Limpiar todas las operaciones
   */
  clearAll(): void {
    this.operations = []
    this.saveToStorage()
  }

  /**
   * Procesar cola de operaciones
   */
  async processQueue(processor: (operation: OfflineOperation) => Promise<void>): Promise<void> {
    if (this.isProcessing) {
      return
    }

    this.isProcessing = true
    const pending = this.getPendingOperations()

    for (const operation of pending) {
      try {
        this.markAsProcessing(operation.id)
        await processor(operation)
        this.markAsCompleted(operation.id)
      } catch (error: any) {
        console.error(`Error procesando operación ${operation.id}:`, error)
        this.markAsFailed(operation.id, error?.message || 'Error desconocido')
      }
    }

    this.isProcessing = false
  }

  /**
   * Obtener estadísticas de la cola
   */
  getStats(): {
    total: number
    pending: number
    processing: number
    completed: number
    failed: number
  } {
    return {
      total: this.operations.length,
      pending: this.operations.filter(op => op.status === 'pending').length,
      processing: this.operations.filter(op => op.status === 'processing').length,
      completed: this.operations.filter(op => op.status === 'completed').length,
      failed: this.operations.filter(op => op.status === 'failed').length
    }
  }
}

export const offlineQueue = new OfflineQueue()

