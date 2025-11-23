import { Router } from 'express';
import {
  getFhirResource,
  createFhirResource,
  searchFhirResources,
  patchFhirResource,
  processFhirBundle,
  parseHl7ToFhir,
  getCapabilities,
} from '../controllers/fhirController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

/**
 * Rutas FHIR RESTful
 * Implementa estándar HL7 FHIR R4 para interoperabilidad con sistemas externos
 * 
 * Requiere autenticación y permisos específicos según operación
 */

// Capabilities statement (metadata del servidor FHIR)
router.get('/capabilities', authenticate, requirePermission('fhir:read'), getCapabilities);

// Operaciones CRUD estándar FHIR
router.get(
  '/:resourceType/:id',
  authenticate,
  requirePermission('fhir:read'),
  getFhirResource,
);

router.post(
  '/:resourceType',
  authenticate,
  requirePermission('fhir:create'),
  createFhirResource,
);

router.get(
  '/:resourceType',
  authenticate,
  requirePermission('fhir:read'),
  searchFhirResources,
);

router.patch(
  '/:resourceType/:id',
  authenticate,
  requirePermission('fhir:update'),
  patchFhirResource,
);

// Bundle operations (transacciones y batches)
router.post(
  '/bundle',
  authenticate,
  requirePermission('fhir:create'),
  processFhirBundle,
);

// Conversión HL7 a FHIR
router.post(
  '/hl7/parse',
  authenticate,
  requirePermission('fhir:create'),
  parseHl7ToFhir,
);

export default router;

