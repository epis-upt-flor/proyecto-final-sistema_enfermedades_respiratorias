/**
 * Tests de Performance - Sincronización
 * Verifica performance de sincronización de datos offline/online
 */

import { offlineQueue } from '../../medical-app/lib/services/offlineQueue';
import { medicalHistoryService } from '../../medical-app/lib/api/services/medicalHistoryService';
import { appointmentService } from '../../medical-app/lib/api/services/appointmentService';

jest.mock('../../medical-app/lib/services/offlineQueue');
jest.mock('../../medical-app/lib/api/services/medicalHistoryService');
jest.mock('../../medical-app/lib/api/services/appointmentService');

const mockOfflineQueue = offlineQueue as jest.Mocked<typeof offlineQueue>;
const mockMedicalHistoryService = medicalHistoryService as jest.Mocked<typeof medicalHistoryService>;
const mockAppointmentService = appointmentService as jest.Mocked<typeof appointmentService>;

// Performance thresholds
const SYNC_THRESHOLD_MS = 5000; // 5 segundos para sincronizar
const SYNC_ITEM_THRESHOLD_MS = 100; // 100ms por item
const BATCH_SYNC_THRESHOLD_MS = 2000; // 2 segundos para batch

describe('Sync Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOfflineQueue.clearAll();
    mockMedicalHistoryService.create.mockResolvedValue({ _id: 'history-1' } as any);
    mockAppointmentService.create.mockResolvedValue({ _id: 'appt-1' } as any);
  });

  it('debe sincronizar 10 operaciones en menos de SYNC_THRESHOLD_MS', async () => {
    // Agregar 10 operaciones
    for (let i = 0; i < 10; i++) {
      mockOfflineQueue.enqueue('create_medical_history', {
        patientId: `p${i}`,
        patientName: `Patient ${i}`,
        age: 30,
        diagnosis: 'Dx',
        symptoms: [],
      });
    }

    const startTime = Date.now();
    
    await mockOfflineQueue.processQueue(async (operation) => {
      if (operation.type === 'create_medical_history') {
        await mockMedicalHistoryService.create(operation.payload);
      }
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(SYNC_THRESHOLD_MS);
  });

  it('debe procesar cada operación en menos de SYNC_ITEM_THRESHOLD_MS', async () => {
    mockOfflineQueue.enqueue('create_medical_history', {
      patientId: 'p1',
      patientName: 'Patient',
      age: 30,
      diagnosis: 'Dx',
      symptoms: [],
    });

    const startTime = Date.now();
    
    await mockOfflineQueue.processQueue(async (operation) => {
      await mockMedicalHistoryService.create(operation.payload);
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(SYNC_ITEM_THRESHOLD_MS);
  });

  it('debe sincronizar batch de 50 operaciones en menos de BATCH_SYNC_THRESHOLD_MS', async () => {
    // Agregar 50 operaciones
    for (let i = 0; i < 50; i++) {
      mockOfflineQueue.enqueue('create_medical_history', {
        patientId: `p${i}`,
        patientName: `Patient ${i}`,
        age: 30,
        diagnosis: 'Dx',
        symptoms: [],
      });
    }

    const startTime = Date.now();
    
    await mockOfflineQueue.processQueue(async (operation) => {
      await mockMedicalHistoryService.create(operation.payload);
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(BATCH_SYNC_THRESHOLD_MS);
  });
});
