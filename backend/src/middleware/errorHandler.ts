import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

// Handler para errores de validación de Mongoose
const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((val: any) => val.message);
  const message = `Datos inválidos: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handler para errores de duplicado de Mongoose
const handleDuplicateFieldsError = (err: any): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' ya existe`;
  return new AppError(message, 400);
};

// Handler para errores de cast de Mongoose
const handleCastError = (err: any): AppError => {
  const message = `Recurso no encontrado: ${err.path} = ${err.value}`;
  return new AppError(message, 404);
};

// Handler para errores de JWT
const handleJWTError = (): AppError => {
  return new AppError('Token inválido', 401);
};

// Handler para errores de JWT expirado
const handleJWTExpiredError = (): AppError => {
  return new AppError('Token expirado', 401);
};

// Enviar error en desarrollo
const sendErrorDev = (err: AppError, res: Response) => {
  const response: ApiResponse = {
    success: false,
    message: err.message,
    error: err.stack,
    data: {
      statusCode: err.statusCode,
      isOperational: err.isOperational
    }
  };

  res.status(err.statusCode).json(response);
};

// Enviar error en producción
const sendErrorProd = (err: AppError, res: Response) => {
  // Solo enviar errores operacionales al cliente
  if (err.isOperational) {
    const response: ApiResponse = {
      success: false,
      message: err.message
    };

    res.status(err.statusCode).json(response);
  } else {
    // No enviar detalles de errores de programación
    logger.error('ERROR 💥', err);

    const response: ApiResponse = {
      success: false,
      message: 'Algo salió mal!'
    };

    res.status(500).json(response);
  }
};

// Middleware principal de manejo de errores
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.isOperational = err.isOperational || false;

  // Log del error
  logger.error('Error capturado:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  let error = { ...err };
  error.message = err.message;

  // Manejar errores específicos de Mongoose
  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateFieldsError(err);
  }

  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Enviar respuesta de error
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Middleware para manejar rutas no encontradas
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Ruta no encontrada: ${req.originalUrl}`, 404);
  next(error);
};

// Middleware para manejar errores asíncronos no capturados
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
