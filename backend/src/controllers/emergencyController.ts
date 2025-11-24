/**
 * Emergency Controller
 * Gestiona los endpoints para emergencias médicas
 */

import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../types';
import { emergencyService, EmergencyRequest } from '../services/emergencyService';
import { logger } from '../utils/logger';

/**
 * POST /api/v1/emergencies
 * Crear una solicitud de emergencia
 */
export const createEmergency = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      patientId,
      patientName,
      emergencyType,
      severity,
      description,
      location,
      symptoms,
      vitalSigns,
      contactInfo,
      metadata,
    } = req.body;

    // Validaciones básicas
    if (!emergencyType || !severity || !description || !location) {
      throw new AppError(
        'emergencyType, severity, description y location son requeridos',
        400
      );
    }

    if (!location.latitude || !location.longitude) {
      throw new AppError('Coordenadas GPS (latitude, longitude) son requeridas', 400);
    }

    const emergencyRequest: EmergencyRequest = {
      userId: req.user?._id?.toString() || req.body.userId,
      patientId: patientId || req.user?._id?.toString(),
      patientName: patientName || req.user?.name,
      emergencyType,
      severity,
      description,
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        address: location.address,
        district: location.district,
        accuracy: location.accuracy,
      },
      symptoms,
      vitalSigns,
      contactInfo,
      metadata,
    };

    const emergency = await emergencyService.createEmergency(emergencyRequest);

    logger.info('Emergencia creada desde controlador', {
      emergencyId: emergency.emergencyId,
      userId: emergencyRequest.userId,
      type: emergencyType,
    });

    res.status(201).json({
      success: true,
      message: 'Emergencia creada exitosamente',
      data: emergency,
    });
  }
);

/**
 * GET /api/v1/emergencies/:emergencyId
 * Obtener estado de una emergencia
 */
export const getEmergencyStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { emergencyId } = req.params;

    if (!emergencyId) {
      throw new AppError('emergencyId es requerido', 400);
    }

    const status = await emergencyService.getEmergencyStatus(emergencyId);

    if (!status) {
      throw new AppError('Emergencia no encontrada', 404);
    }

    res.status(200).json({
      success: true,
      data: status,
    });
  }
);

/**
 * POST /api/v1/emergencies/:emergencyId/cancel
 * Cancelar una emergencia
 */
export const cancelEmergency = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { emergencyId } = req.params;
    const { reason } = req.body;

    if (!emergencyId) {
      throw new AppError('emergencyId es requerido', 400);
    }

    const cancelled = await emergencyService.cancelEmergency(emergencyId, reason);

    if (!cancelled) {
      throw new AppError('No se pudo cancelar la emergencia', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Emergencia cancelada exitosamente',
    });
  }
);

/**
 * GET /api/v1/emergencies/active
 * Obtener emergencias activas del usuario
 */
export const getActiveEmergencies = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?._id?.toString();

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const activeEmergencies = emergencyService.getActiveEmergencies(userId);

    res.status(200).json({
      success: true,
      data: {
        emergencies: activeEmergencies,
        count: activeEmergencies.length,
      },
    });
  }
);

/**
 * POST /api/v1/emergencies/detect
 * Detectar emergencia automáticamente desde síntomas
 */
export const detectEmergency = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { symptoms, vitalSigns, location } = req.body;
    const userId = req.user?._id?.toString();
    const patientId = req.body.patientId || userId;

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      throw new AppError('symptoms es requerido y debe ser un array', 400);
    }

    if (!location || !location.latitude || !location.longitude) {
      throw new AppError('location con coordenadas GPS es requerido', 400);
    }

    const emergency = await emergencyService.detectEmergencyFromSymptoms(
      userId,
      patientId || userId,
      symptoms,
      vitalSigns,
      {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        address: location.address,
        district: location.district,
        accuracy: location.accuracy,
      }
    );

    if (!emergency) {
      res.status(200).json({
        success: true,
        message: 'No se detectó emergencia crítica',
        data: { emergencyDetected: false },
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Emergencia detectada y creada automáticamente',
      data: {
        emergencyDetected: true,
        emergency,
      },
    });
  }
);

