import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../utils/AppError';
import { AuthenticatedRequest } from '../types';

// Middleware para verificar autenticación
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Token de acceso requerido', 401);
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new AppError('Token inválido - Usuario no encontrado', 401);
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new AppError('Token inválido - Usuario inactivo', 401);
    }

    // Agregar usuario al request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Token inválido', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expirado', 401));
    }
    next(error);
  }
};

// Middleware para verificar roles
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('No autenticado', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Acceso denegado. Se requieren roles: ${roles.join(', ')}`, 403));
    }

    next();
  };
};

// Middleware para verificar si es el propietario del recurso o admin
export const authorizeOwnerOrAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('No autenticado', 401));
  }

  // Si es admin, permitir acceso
  if (req.user.role === 'admin') {
    return next();
  }

  // Si es el propietario del recurso, permitir acceso
  const resourceUserId = req.params.userId || req.body.userId;
  if (resourceUserId && resourceUserId === req.user._id) {
    return next();
  }

  return next(new AppError('Acceso denegado. Solo el propietario o administrador pueden acceder', 403));
};

// Middleware opcional para autenticación (no falla si no hay token)
export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const user = await User.findById(decoded.userId);
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // En autenticación opcional, no fallamos si hay error
    next();
  }
};
