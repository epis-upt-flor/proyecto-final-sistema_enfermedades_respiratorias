/**
 * Wearable Controller
 * Controlador para manejar datos de wearables
 */

import { Request, Response } from 'express';
import WearableData, { IWearableData } from '../models/WearableData';
import { ApiResponse } from '../utils/ApiResponse';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

/**
 * Sincronizar datos de wearables
 */
export const syncWearableData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data } = req.body;
    const patientId = req.user?.userId;

    if (!patientId) {
      res.status(401).json(
        new ApiResponse(false, 'Usuario no autenticado', null, 401)
      );
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      res.status(400).json(
        new ApiResponse(false, 'Se requiere un array de datos de wearables', null, 400)
      );
      return;
    }

    // Validar y guardar datos
    const savedData = [];
    for (const item of data) {
      const wearableData = new WearableData({
        patientId,
        heartRate: item.heartRate,
        oxygenSaturation: item.oxygenSaturation,
        steps: item.steps,
        distance: item.distance,
        respiratoryRate: item.respiratoryRate,
        sleepHours: item.sleepHours,
        timestamp: new Date(item.timestamp),
        source: item.source || 'manual'
      });

      const saved = await wearableData.save();
      savedData.push(saved);
    }

    res.status(201).json(
      new ApiResponse(
        true,
        `${savedData.length} registros sincronizados exitosamente`,
        { count: savedData.length, data: savedData },
        201
      )
    );
  } catch (error: any) {
    console.error('Error syncing wearable data:', error);
    res.status(500).json(
      new ApiResponse(false, 'Error al sincronizar datos de wearables', null, 500, error.message)
    );
  }
};

/**
 * Obtener datos de wearables de un paciente
 */
export const getWearableData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId || req.user?.userId;
    const { startDate, endDate, limit = 100 } = req.query;

    if (!patientId) {
      res.status(400).json(
        new ApiResponse(false, 'ID de paciente requerido', null, 400)
      );
      return;
    }

    // Verificar permisos (solo puede ver sus propios datos a menos que sea doctor/admin)
    if (req.user?.userId !== patientId && req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
      res.status(403).json(
        new ApiResponse(false, 'No tienes permisos para ver estos datos', null, 403)
      );
      return;
    }

    const query: any = { patientId };

    // Filtrar por rango de fechas
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate as string);
      }
    }

    const data = await WearableData.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json(
      new ApiResponse(true, 'Datos de wearables obtenidos exitosamente', { data }, 200)
    );
  } catch (error: any) {
    console.error('Error getting wearable data:', error);
    res.status(500).json(
      new ApiResponse(false, 'Error al obtener datos de wearables', null, 500, error.message)
    );
  }
};

/**
 * Obtener métricas agregadas de wearables
 */
export const getWearableMetrics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId || req.user?.userId;
    const { hours = 24 } = req.query;

    if (!patientId) {
      res.status(400).json(
        new ApiResponse(false, 'ID de paciente requerido', null, 400)
      );
      return;
    }

    // Verificar permisos
    if (req.user?.userId !== patientId && req.user?.role !== 'doctor' && req.user?.role !== 'admin') {
      res.status(403).json(
        new ApiResponse(false, 'No tienes permisos para ver estos datos', null, 403)
      );
      return;
    }

    const startDate = new Date();
    startDate.setHours(startDate.getHours() - Number(hours));

    const data = await WearableData.find({
      patientId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 }).lean();

    // Calcular métricas
    const heartRates = data.filter(d => d.heartRate).map(d => d.heartRate!);
    const oxygenLevels = data.filter(d => d.oxygenSaturation).map(d => d.oxygenSaturation!);
    const respiratoryRates = data.filter(d => d.respiratoryRate).map(d => d.respiratoryRate!);
    
    const totalSteps = data.reduce((sum, d) => sum + (d.steps || 0), 0);
    const totalDistance = data.reduce((sum, d) => sum + (d.distance || 0), 0);

    const metrics = {
      heartRate: {
        current: heartRates[0] || 0,
        average: heartRates.length > 0 
          ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length 
          : 0,
        min: heartRates.length > 0 ? Math.min(...heartRates) : 0,
        max: heartRates.length > 0 ? Math.max(...heartRates) : 0,
      },
      oxygenSaturation: {
        current: oxygenLevels[0] || 0,
        average: oxygenLevels.length > 0 
          ? oxygenLevels.reduce((a, b) => a + b, 0) / oxygenLevels.length 
          : 0,
        min: oxygenLevels.length > 0 ? Math.min(...oxygenLevels) : 0,
      },
      activity: {
        steps: totalSteps,
        distance: totalDistance,
      },
      respiratoryRate: {
        current: respiratoryRates[0] || 0,
        average: respiratoryRates.length > 0 
          ? respiratoryRates.reduce((a, b) => a + b, 0) / respiratoryRates.length 
          : 0,
      },
      period: {
        hours: Number(hours),
        startDate,
        endDate: new Date(),
        dataPoints: data.length
      }
    };

    res.status(200).json(
      new ApiResponse(true, 'Métricas obtenidas exitosamente', { metrics }, 200)
    );
  } catch (error: any) {
    console.error('Error getting wearable metrics:', error);
    res.status(500).json(
      new ApiResponse(false, 'Error al obtener métricas de wearables', null, 500, error.message)
    );
  }
};

