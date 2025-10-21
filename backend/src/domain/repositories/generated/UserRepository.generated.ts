// AUTO-GENERATED - DO NOT EDIT MANUALLY
// Generated Repository Interface for UserEntity
// Generation date: 2025-10-21T02:20:25.117Z

import { UserEntity } from '@domain/entities/User';

/**
 * Repository interface for User
 * Defines contract for data access (Platform Independent)
 */
export interface UserRepository {
  /**
   * Find entity by ID
   */
  findById(id: string): Promise<UserEntity | null>;

  /**
   * Find all entities
   */
  findAll(): Promise<UserEntity[]>;

  /**
   * Save new entity
   */
  save(entity: UserEntity): Promise<UserEntity>;

  /**
   * Update existing entity
   */
  update(entity: UserEntity): Promise<UserEntity>;

  /**
   * Delete entity (soft delete)
   */
  delete(id: string): Promise<boolean>;

  /**
   * Search entities by criteria
   */
  search(query: any): Promise<UserEntity[]>;

  /**
   * Count entities matching criteria
   */
  count(query?: any): Promise<number>;
}
