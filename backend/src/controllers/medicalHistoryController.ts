import { Request, Response } from 'express';
import MedicalHistory from '../models/MedicalHistory';
import AIAnalysis from '../models/AIAnalysis';
import { ApiResponse, SearchQuery } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

// Crear nueva historia médica
export const createMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const medicalHistoryData = {
    ...req.body,
    doctorId: req.user?._id
  };

  const medicalHistory = await MedicalHistory.create(medicalHistoryData);

  logger.info(`Historia médica creada: ${medicalHistory.patientName}`, { 
    medicalHistoryId: medicalHistory._id,
    doctorId: req.user?._id 
  });

  const response: ApiResponse = {
    success: true,
    message: 'Historia médica creada exitosamente',
    data: medicalHistory
  };

  res.status(201).json(response);
});

// Obtener historias médicas con filtros y paginación
export const getMedicalHistories = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    sort = 'date', 
    order = 'desc',
    patientId,
    syncStatus,
    isOffline,
    startDate,
    endDate
  } = req.query as SearchQuery;

  const skip = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 1 : -1;

  // Construir filtros
  const filters: any = {};

  // Si no es admin, solo mostrar historias del doctor actual
  if (req.user?.role !== 'admin') {
    filters.doctorId = req.user?._id;
  }

  if (patientId) {
    filters.patientId = patientId;
  }

  if (syncStatus) {
    filters.syncStatus = syncStatus;
  }

  if (isOffline !== undefined) {
    filters.isOffline = isOffline === 'true';
  }

  if (startDate && endDate) {
    filters.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Búsqueda por texto
  if (search) {
    filters.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { diagnosis: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const medicalHistories = await MedicalHistory.find(filters)
    .sort({ [sort]: sortOrder })
    .skip(skip)
    .limit(Number(limit))
    .populate('doctorId', 'name email role');

  const total = await MedicalHistory.countDocuments(filters);

  const response: ApiResponse = {
    success: true,
    message: 'Historias médicas obtenidas exitosamente',
    data: medicalHistories,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };

  res.status(200).json(response);
});

// Obtener historia médica por ID
export const getMedicalHistoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const medicalHistory = await MedicalHistory.findById(id);
  if (!medicalHistory) {
    throw new AppError('Historia médica no encontrada', 404);
  }

  // Verificar permisos (solo el doctor que la creó o admin)
  if (req.user?.role !== 'admin' && medicalHistory.doctorId !== req.user?._id) {
    throw new AppError('No tienes permisos para ver esta historia médica', 403);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Historia médica obtenida exitosamente',
    data: medicalHistory
  };

  res.status(200).json(response);
});

// Actualizar historia médica
export const updateMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const medicalHistory = await MedicalHistory.findById(id);
  if (!medicalHistory) {
    throw new AppError('Historia médica no encontrada', 404);
  }

  // Verificar permisos
  if (req.user?.role !== 'admin' && medicalHistory.doctorId !== req.user?._id) {
    throw new AppError('No tienes permisos para actualizar esta historia médica', 403);
  }

  const updatedMedicalHistory = await MedicalHistory.findByIdAndUpdate(
    id,
    { ...req.body, syncStatus: 'pending' },
    { new: true, runValidators: true }
  );

  logger.info(`Historia médica actualizada: ${id}`, { 
    medicalHistoryId: id,
    doctorId: req.user?._id 
  });

  const response: ApiResponse = {
    success: true,
    message: 'Historia médica actualizada exitosamente',
    data: updatedMedicalHistory
  };

  res.status(200).json(response);
});

// Eliminar historia médica
export const deleteMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const medicalHistory = await MedicalHistory.findById(id);
  if (!medicalHistory) {
    throw new AppError('Historia médica no encontrada', 404);
  }

  // Verificar permisos
  if (req.user?.role !== 'admin' && medicalHistory.doctorId !== req.user?._id) {
    throw new AppError('No tienes permisos para eliminar esta historia médica', 403);
  }

  await MedicalHistory.findByIdAndDelete(id);

  // Eliminar análisis de IA relacionados
  await AIAnalysis.deleteMany({ medicalHistoryId: id });

  logger.info(`Historia médica eliminada: ${id}`, { 
    medicalHistoryId: id,
    doctorId: req.user?._id 
  });

  const response: ApiResponse = {
    success: true,
    message: 'Historia médica eliminada exitosamente'
  };

  res.status(200).json(response);
});

// Sincronizar historias médicas offline
export const syncOfflineHistories = asyncHandler(async (req: Request, res: Response) => {
  const { histories } = req.body;

  if (!Array.isArray(histories)) {
    throw new AppError('Las historias médicas deben ser un array', 400);
  }

  const syncedHistories = [];
  const errors = [];

  for (const historyData of histories) {
    try {
      const medicalHistory = await MedicalHistory.create({
        ...historyData,
        doctorId: req.user?._id,
        syncStatus: 'synced',
        isOffline: false
      });
      syncedHistories.push(medicalHistory);
    } catch (error) {
      errors.push({
        data: historyData,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  logger.info(`Sincronización completada: ${syncedHistories.length} exitosas, ${errors.length} errores`, {
    doctorId: req.user?._id,
    synced: syncedHistories.length,
    errors: errors.length
  });

  const response: ApiResponse = {
    success: true,
    message: `Sincronización completada: ${syncedHistories.length} historias sincronizadas`,
    data: {
      synced: syncedHistories,
      errors
    }
  };

  res.status(200).json(response);
});

// Obtener estadísticas de historias médicas
export const getMedicalHistoryStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await MedicalHistory.getStats();

  const response: ApiResponse = {
    success: true,
    message: 'Estadísticas obtenidas exitosamente',
    data: stats
  };

  res.status(200).json(response);
});

// Obtener diagnósticos más comunes
export const getTopDiagnoses = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const diagnoses = await MedicalHistory.getTopDiagnoses(limit);

  const response: ApiResponse = {
    success: true,
    message: 'Diagnósticos más comunes obtenidos exitosamente',
    data: diagnoses
  };

  res.status(200).json(response);
});

// Obtener estadísticas por edad
export const getAgeStats = asyncHandler(async (req: Request, res: Response) => {
  const ageStats = await MedicalHistory.getAgeStats();

  const response: ApiResponse = {
    success: true,
    message: 'Estadísticas por edad obtenidas exitosamente',
    data: ageStats
  };

  res.status(200).json(response);
});

// Buscar historias médicas por ubicación
export const getMedicalHistoriesByLocation = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radius = 10 } = req.query;

  if (!latitude || !longitude) {
    throw new AppError('Latitud y longitud son requeridas', 400);
  }

  const histories = await MedicalHistory.findByLocation(
    Number(latitude),
    Number(longitude),
    Number(radius)
  );

  const response: ApiResponse = {
    success: true,
    message: 'Historias médicas por ubicación obtenidas exitosamente',
    data: histories
  };

  res.status(200).json(response);
});

// Obtener historias médicas por rango de fechas
export const getMedicalHistoriesByDateRange = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new AppError('Fecha de inicio y fecha de fin son requeridas', 400);
  }

  const histories = await MedicalHistory.findByDateRange(
    new Date(startDate as string),
    new Date(endDate as string)
  );

  const response: ApiResponse = {
    success: true,
    message: 'Historias médicas por rango de fechas obtenidas exitosamente',
    data: histories
  };

  res.status(200).json(response);
});

// Exportar historias médicas
export const exportMedicalHistories = asyncHandler(async (req: Request, res: Response) => {
  const { format = 'json', startDate, endDate } = req.query;

  let histories;
  if (startDate && endDate) {
    histories = await MedicalHistory.findByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
  } else {
    histories = await MedicalHistory.find().sort({ date: -1 });
  }

  if (format === 'csv') {
    // Convertir a CSV
    const csv = convertToCSV(histories);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=medical-histories.csv');
    res.send(csv);
  } else {
    const response: ApiResponse = {
      success: true,
      message: 'Historias médicas exportadas exitosamente',
      data: histories
    };
    res.status(200).json(response);
  }
});

// Función auxiliar para convertir a CSV
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  const headers = [
    'ID',
    'Paciente',
    'Edad',
    'Diagnóstico',
    'Fecha',
    'Síntomas',
    'Ubicación',
    'Estado de Sincronización'
  ];

  const rows = data.map(history => [
    history._id,
    history.patientName,
    history.age,
    history.diagnosis,
    history.date.toISOString(),
    history.symptoms.map((s: any) => s.name).join('; '),
    history.location ? `${history.location.latitude}, ${history.location.longitude}` : '',
    history.syncStatus
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};
