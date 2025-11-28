import { Router } from 'express';
import {
  getLabResults,
  getPatientHistory,
  getAbnormalResults,
  getCriticalResults,
  getLatestResult,
  getPatientSummary,
  markAsReviewed,
  flagForReview,
  importAndSaveResults,
} from '../controllers/labController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

/**
 * Rutas de gestión de resultados de laboratorio
 * Requiere autenticación y permisos específicos
 */

// Obtener resultados con filtros
router.get(
  '/results',
  authenticate,
  requirePermission('fhir:read'),
  getLabResults,
);

// Historial de exámenes de un paciente
router.get(
  '/results/:patientId/history',
  authenticate,
  requirePermission('fhir:read'),
  getPatientHistory,
);

// Resultados anormales de un paciente
router.get(
  '/results/:patientId/abnormal',
  authenticate,
  requirePermission('fhir:read'),
  getAbnormalResults,
);

// Resultados críticos de un paciente
router.get(
  '/results/:patientId/critical',
  authenticate,
  requirePermission('fhir:read'),
  getCriticalResults,
);

// Último resultado de un examen específico
router.get(
  '/results/:patientId/latest/:testCode',
  authenticate,
  requirePermission('fhir:read'),
  getLatestResult,
);

// Resumen de resultados de un paciente
router.get(
  '/results/:patientId/summary',
  authenticate,
  requirePermission('fhir:read'),
  getPatientSummary,
);

// Marcar resultado como revisado
router.post(
  '/results/:resultId/review',
  authenticate,
  requirePermission('fhir:update'),
  markAsReviewed,
);

// Marcar resultado para revisión
router.post(
  '/results/:resultId/flag',
  authenticate,
  requirePermission('fhir:update'),
  flagForReview,
);

// Importar y guardar resultados automáticamente
router.post(
  '/results/import',
  authenticate,
  requirePermission('integrations:manage'),
  importAndSaveResults,
);

export default router;

