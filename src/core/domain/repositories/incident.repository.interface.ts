/**
 * Incident Repository Interface
 * 
 * Defines the contract for incident data persistence.
 * This interface belongs to the domain layer and should not contain
 * any implementation details or references to specific databases.
 */

import { Incident, IncidentStatus, IncidentType, IncidentPriority } from '../entities/incident/incident.entity';
import { IncidentId, UserId, Timestamp } from '../shared/value-objects';
import { Either } from '../shared/errors';
import { PaginatedResult, Pagination } from './user.repository.interface';

export interface IncidentFilter {
  status?: IncidentStatus | IncidentStatus[];
  type?: IncidentType | IncidentType[];
  priority?: IncidentPriority | IncidentPriority[];
  reportedBy?: UserId;
  assignedSupe?: UserId;
  assignedChaser?: UserId;
  createdAfter?: Timestamp;
  createdBefore?: Timestamp;
  search?: string; // Search in description or address
}

export interface IncidentSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  direction: 'asc' | 'desc';
}

export interface LocationBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface IIncidentRepository {
  /**
   * Saves an incident to the repository
   * Creates new if doesn't exist, updates if exists
   */
  save(incident: Incident): Promise<Either<Error, void>>;

  /**
   * Finds an incident by ID
   */
  findById(id: IncidentId): Promise<Either<Error, Incident | null>>;

  /**
   * Finds incidents by IDs
   */
  findByIds(ids: IncidentId[]): Promise<Either<Error, Incident[]>>;

  /**
   * Finds incidents with filters and pagination
   */
  findMany(
    filter?: IncidentFilter,
    sort?: IncidentSort,
    pagination?: Pagination
  ): Promise<Either<Error, PaginatedResult<Incident>>>;

  /**
   * Finds incidents within geographic bounds
   * Used for map display
   */
  findWithinBounds(
    bounds: LocationBounds,
    filter?: IncidentFilter
  ): Promise<Either<Error, Incident[]>>;

  /**
   * Finds incidents near a location
   * Used for proximity-based queries
   */
  findNearLocation(
    lat: number,
    lng: number,
    radiusKm: number,
    filter?: IncidentFilter
  ): Promise<Either<Error, Array<{ incident: Incident; distance: number }>>>;

  /**
   * Finds incidents assigned to a specific chaser
   */
  findByChaserId(
    chaserId: UserId,
    filter?: IncidentFilter
  ): Promise<Either<Error, Incident[]>>;

  /**
   * Finds incidents supervised by a specific supe
   */
  findBySupeId(
    supeId: UserId,
    filter?: IncidentFilter
  ): Promise<Either<Error, Incident[]>>;

  /**
   * Gets incident statistics for analytics
   */
  getStatistics(filter?: IncidentFilter): Promise<Either<Error, {
    total: number;
    byStatus: Record<IncidentStatus, number>;
    byType: Record<IncidentType, number>;
    byPriority: Record<IncidentPriority, number>;
    averageResponseTime?: number;
    averageResolutionTime?: number;
  }>>;

  /**
   * Subscribes to real-time updates for a specific incident
   * Returns an unsubscribe function
   */
  subscribeToIncident(
    id: IncidentId,
    callback: (incident: Incident) => void
  ): Promise<Either<Error, () => void>>;

  /**
   * Subscribes to real-time updates for incidents matching a filter
   * Returns an unsubscribe function
   */
  subscribeToIncidents(
    filter: IncidentFilter,
    callback: (incidents: Incident[]) => void
  ): Promise<Either<Error, () => void>>;

  /**
   * Deletes an incident
   * Should be used with extreme caution - consider soft deletes
   */
  delete(id: IncidentId): Promise<Either<Error, void>>;

  /**
   * Archives old incidents
   * Moves incidents older than specified date to archive storage
   */
  archiveOlderThan(date: Timestamp): Promise<Either<Error, number>>;

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
