/**
 * User Repository Interface
 * 
 * Defines the contract for user data persistence.
 * This interface belongs to the domain layer and should not contain
 * any implementation details or references to specific databases.
 */

import { User } from '../entities/user/user.entity';
import { UserId, Email, Role } from '../shared/value-objects';
import { Either } from '../shared/errors';

export interface UserFilter {
  role?: Role;
  status?: string;
  emailVerified?: boolean;
  search?: string; // Search in email or display name
}

export interface UserSort {
  field: 'createdAt' | 'lastLogin' | 'displayName' | 'email';
  direction: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IUserRepository {
  /**
   * Saves a user to the repository
   * Creates new if doesn't exist, updates if exists
   */
  save(user: User): Promise<Either<Error, void>>;

  /**
   * Finds a user by ID
   */
  findById(id: UserId): Promise<Either<Error, User | null>>;

  /**
   * Finds a user by email
   */
  findByEmail(email: Email): Promise<Either<Error, User | null>>;

  /**
   * Finds users by IDs
   */
  findByIds(ids: UserId[]): Promise<Either<Error, User[]>>;

  /**
   * Finds users with filters and pagination
   */
  findMany(
    filter?: UserFilter,
    sort?: UserSort,
    pagination?: Pagination
  ): Promise<Either<Error, PaginatedResult<User>>>;

  /**
   * Checks if a user exists by email
   */
  existsByEmail(email: Email): Promise<Either<Error, boolean>>;

  /**
   * Deletes a user
   * Should be used with caution - consider soft deletes
   */
  delete(id: UserId): Promise<Either<Error, void>>;

  /**
   * Gets users by role
   */
  findByRole(role: Role): Promise<Either<Error, User[]>>;

  /**
   * Gets active chasers within a certain distance from a location
   * Used for incident assignment
   */
  findActiveChasersNearLocation(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<Either<Error, Array<{ user: User; distance: number }>>>;

  /**
   * Updates user's last login timestamp
   */
  updateLastLogin(id: UserId): Promise<Either<Error, void>>;

  /**
   * Updates user's last known location
   */
  updateLocation(id: UserId, lat: number, lng: number): Promise<Either<Error, void>>;

  /**
   * Begins a transaction
   * Returns a transaction object that can be passed to other repositories
   */
  beginTransaction(): Promise<any>;

  /**
   * Commits a transaction
   */
  commitTransaction(transaction: any): Promise<Either<Error, void>>;

  /**
   * Rolls back a transaction
   */
  rollbackTransaction(transaction: any): Promise<Either<Error, void>>;
}
