import { Router } from 'express';
import {
  createMedicalHistory,
  getMedicalHistories,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory,
  syncOfflineHistories,
  getMedicalHistoryStats,
  getTopDiagnoses,
  getAgeStats,
  getMedicalHistoriesByLocation,
  getMedicalHistoriesByDateRange,
  exportMedicalHistories
} from '../controllers/medicalHistoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { 
  createMedicalHistorySchema,
  updateMedicalHistorySchema,
  syncOfflineHistoriesSchema
} from '../validators/medicalHistoryValidators';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas CRUD básicas
router.post('/', 
  authorize('doctor', 'admin'), 
  validateRequest(createMedicalHistorySchema), 
  createMedicalHistory
);

router.get('/', getMedicalHistories);
router.get('/stats', getMedicalHistoryStats);
router.get('/top-diagnoses', getTopDiagnoses);
router.get('/age-stats', getAgeStats);
router.get('/export', exportMedicalHistories);

// Rutas de búsqueda
router.get('/location', getMedicalHistoriesByLocation);
router.get('/date-range', getMedicalHistoriesByDateRange);

// Rutas por ID
router.get('/:id', getMedicalHistoryById);
router.put('/:id', 
  authorize('doctor', 'admin'), 
  validateRequest(updateMedicalHistorySchema), 
  updateMedicalHistory
);
router.delete('/:id', 
  authorize('doctor', 'admin'), 
  deleteMedicalHistory
);

// Ruta especial para sincronización offline
router.post('/sync', 
  authorize('doctor', 'admin'), 
  validateRequest(syncOfflineHistoriesSchema), 
  syncOfflineHistories
);

export default router;
