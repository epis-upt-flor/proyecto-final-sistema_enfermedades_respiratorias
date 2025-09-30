// DTO para Respuesta de Usuario - Capa de Interfaz
import { UserEntity, UserRole } from '../../domain/entities/User';

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserResponseDto {
  static fromEntity(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  static fromEntities(users: UserEntity[]): UserResponseDto[] {
    return users.map(user => this.fromEntity(user));
  }
}
