import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../types';

type Role = 'patient' | 'doctor' | 'admin';

const roleHierarchy: Record<Role, number> = {
  patient: 1,
  doctor: 2,
  admin: 3
};

export function requireRole(minRole: Role): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const ok = roleHierarchy[user.role as Role] >= roleHierarchy[minRole];
    if (!ok) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    next();
  };
}

// Permisos por acción; fácilmente extensible por módulo
const permissionsByRole: Record<Role, Set<string>> = {
  admin: new Set([
    'reports:read',
    'reports:stats',
    'reports:generate',
    'reports:export',
    'dsr:export',
    'dsr:delete',
    'users:manage',
    'alerts:manage',
    'prescriptions:validate',
  ]),
  doctor: new Set([
    'reports:read',
    'reports:export',
    'prescriptions:validate',
  ]),
  patient: new Set([
    // permisos de lectura propios se validan adicionalmente en controladores
  ])
};

export function requirePermission(permission: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    const role = (user.role || 'patient') as Role;
    const allowed = permissionsByRole[role]?.has(permission);
    if (!allowed) {
      return res.status(403).json({ success: false, message: 'Permiso insuficiente' });
    }
    next();
  };
}


