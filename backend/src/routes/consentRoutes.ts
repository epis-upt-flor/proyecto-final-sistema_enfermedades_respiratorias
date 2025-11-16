/**
 * Consent Routes
 * 
 * Endpoints para gestión de consentimientos (GDPR/HIPAA)
 */

import { Router, Request, Response } from 'express';
import ConsentLog from '../models/ConsentLog';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

const router = Router();

/**
 * POST /api/v1/consent
 * Registrar consentimiento de usuario
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const { consents, version } = req.body;

    if (!consents || !Array.isArray(consents)) {
      return res.status(400).json({
        success: false,
        message: 'Los consentimientos son obligatorios y deben ser un array',
      });
    }

    const consentLog = new ConsentLog({
      userId: user.id,
      consents: consents.map((c: any) => ({
        id: c.id,
        accepted: c.accepted,
        timestamp: c.timestamp ? new Date(c.timestamp) : new Date(),
      })),
      version: version || '1.0',
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      timestamp: new Date(),
    });

    await consentLog.save();

    logger.info(`Consentimiento registrado para usuario ${user.id}`, {
      userId: user.id,
      consents: consents.map((c: any) => c.id),
    });

    res.status(201).json({
      success: true,
      message: 'Consentimiento registrado correctamente',
      data: {
        id: consentLog._id,
        timestamp: consentLog.timestamp,
      },
    });
  } catch (error: any) {
    logger.error('Error registrando consentimiento', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al registrar consentimiento',
    });
  }
});

/**
 * GET /api/v1/consent
 * Obtener consentimiento actual del usuario
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const latestConsent = await ConsentLog.getLatestConsent(user.id);

    if (!latestConsent) {
      return res.json({
        success: true,
        data: null,
        message: 'No se encontró consentimiento registrado',
      });
    }

    res.json({
      success: true,
      data: {
        id: latestConsent._id,
        consents: latestConsent.consents,
        version: latestConsent.version,
        timestamp: latestConsent.timestamp,
        revokedAt: latestConsent.revokedAt,
      },
    });
  } catch (error: any) {
    logger.error('Error obteniendo consentimiento', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener consentimiento',
    });
  }
});

/**
 * POST /api/v1/consent/revoke
 * Revocar consentimiento del usuario
 */
router.post('/revoke', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }

    const { reason } = req.body;

    await ConsentLog.revokeConsent(user.id, reason);

    logger.info(`Consentimiento revocado para usuario ${user.id}`, {
      userId: user.id,
      reason,
    });

    res.json({
      success: true,
      message: 'Consentimiento revocado correctamente',
    });
  } catch (error: any) {
    logger.error('Error revocando consentimiento', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al revocar consentimiento',
    });
  }
});

export default router;

