/**
 * Get Incidents Use Case
 * 
 * Retrieves incidents based on filters and user permissions.
 * Chasers only see assigned incidents, Supes see all.
 */

import { injectable, inject } from 'inversify';
import { UseCase } from '@application/shared/interfaces/use-case.interface';
import { Either, left, right } from '@domain/shared/errors';
import { 
  UserId,
  Timestamp,
  Role,
  RoleType
} from '@domain/shared/value-objects';
import { 
  IncidentStatus, 
  IncidentType, 
  IncidentPriority 
} from '@domain/entities/incident/incident.entity';
import type { IUserRepository } from '@domain/repositories/user.repository.interface';
import type { IIncidentRepository } from '@domain/repositories/incident.repository.interface';
import { IncidentFilter, IncidentSort } from '@domain/repositories/incident.repository.interface';
import type { Pagination, PaginatedResult } from '@domain/repositories/shared.types';
import { Incident } from '@domain/entities/incident/incident.entity';
import { TOKENS } from '@infrastructure/di/tokens';
import { 
  GetIncidentsRequest, 
  GetIncidentsResponse,
  IncidentDto 
} from './get-incidents.dto';
import { toApplicationError } from '@application/shared/errors/application.error';

@injectable()
export class GetIncidentsUseCase extends UseCase<GetIncidentsRequest, GetIncidentsResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.IncidentRepository) private incidentRepository: IIncidentRepository
  ) {
    super();
  }

  async execute(request: GetIncidentsRequest): Promise<Either<Error, GetIncidentsResponse>> {
    try {
      // 1. Get requesting user
      const userIdResult = UserId.fromString(request.requestingUserId);
      if (userIdResult.isLeft()) {
        return left(userIdResult.value);
      }
      const userId = userIdResult.value;

      const userResult = await this.userRepository.findById(userId);
      if (userResult.isLeft()) {
        return left(toApplicationError(userResult.value));
      }

      const user = userResult.value;
      if (!user || !user.isActive()) {
        return left(new Error('User not found or inactive'));
      }

      // 2. Build filter based on role
      const filter = await this.buildFilter(request, user.role);

      // 3. Build sort
      const sort: IncidentSort = {
        field: request.sortBy || 'createdAt',
        direction: request.sortDirection || 'desc',
      };

      // 4. Build pagination
      const pagination: Pagination = {
        page: request.page || 1,
        pageSize: request.pageSize || 20,
      };

      // 5. Query based on location or regular filters
      let result: PaginatedResult<Incident>;
      
      if (request.nearLat && request.nearLng && request.radiusKm) {
        // Location-based query
        const nearResult = await this.incidentRepository.findNearLocation(
          request.nearLat,
          request.nearLng,
          request.radiusKm,
          filter
        );
        
        if (nearResult.isLeft()) {
          return left(toApplicationError(nearResult.value));
        }

        // Convert to paginated format
        const incidents = nearResult.value;
        const start = (pagination.page - 1) * pagination.pageSize;
        const paginatedIncidents = incidents.slice(start, start + pagination.pageSize);

        result = {
          items: paginatedIncidents.map(i => i.incident),
          total: incidents.length,
          page: pagination.page,
          pageSize: pagination.pageSize,
          totalPages: Math.ceil(incidents.length / pagination.pageSize),
        };

        // Add distance to DTOs
        paginatedIncidents.forEach((item, index) => {
          (result.items[index] as any)._distance = item.distance;
        });
      } else if (request.bounds) {
        // Bounds-based query for map
        const boundsResult = await this.incidentRepository.findWithinBounds(
          request.bounds,
          filter
        );
        
        if (boundsResult.isLeft()) {
          return left(toApplicationError(boundsResult.value));
        }

        const incidents = boundsResult.value;
        result = {
          items: incidents,
          total: incidents.length,
          page: 1,
          pageSize: incidents.length,
          totalPages: 1,
        };
      } else {
        // Regular paginated query
        const queryResult = await this.incidentRepository.findMany(
          filter,
          sort,
          pagination
        );
        
        if (queryResult.isLeft()) {
          return left(toApplicationError(queryResult.value));
        }

        result = queryResult.value;
      }

      // 6. Get user details for incidents
      const userIds = new Set<string>();
      result.items.forEach(incident => {
        userIds.add(incident.reportedBy.value);
        incident.assignedSupes.forEach(id => userIds.add(id.value));
        incident.chaserResponses.forEach(r => userIds.add(r.userId.value));
      });

      const userIdsArray = Array.from(userIds).map(id => 
        UserId.unsafeFromString(id)
      );
      
      const usersResult = await this.userRepository.findByIds(userIdsArray);
      const usersMap = new Map<string, { id: string; displayName: string }>();
      
      if (usersResult.isRight()) {
        usersResult.value.forEach(u => {
          usersMap.set(u.id.value, {
            id: u.id.value,
            displayName: u.displayName,
          });
        });
      }

      // 7. Map to DTOs
      const incidentDtos: IncidentDto[] = result.items.map(incident => {
        const dto: IncidentDto = {
          id: incident.id.value,
          location: {
            lat: incident.location.lat,
            lng: incident.location.lng,
            address: incident.location.address,
            city: incident.location.city,
            state: incident.location.state,
          },
          type: incident.type,
          priority: incident.priority,
          status: incident.status,
          description: incident.description,
          reportedBy: usersMap.get(incident.reportedBy.value) || {
            id: incident.reportedBy.value,
            displayName: 'Unknown User',
          },
          assignedSupes: incident.assignedSupes.map(id => 
            usersMap.get(id.value) || {
              id: id.value,
              displayName: 'Unknown Supe',
            }
          ),
          chaserResponses: incident.chaserResponses.map(response => ({
            userId: response.userId.value,
            displayName: usersMap.get(response.userId.value)?.displayName || 'Unknown Chaser',
            status: response.status,
            distance: response.distance?.kilometers,
            estimatedArrival: response.estimatedArrival?.toISOString(),
          })),
          images: incident.images,
          homeownerInfo: incident.homeownerInfo ? {
            name: incident.homeownerInfo.name,
            phone: incident.homeownerInfo.phone,
          } : undefined,
          createdAt: incident.createdAt.toISOString(),
          updatedAt: incident.updatedAt.toISOString(),
          distance: (incident as any)._distance,
          canRespond: this.canUserRespond(incident, user),
          canEdit: this.canUserEdit(incident, user),
        };

        return dto;
      });

      // 8. Return response
      return right({
        incidents: incidentDtos,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      return left(toApplicationError(error as Error));
    }
  }

  private async buildFilter(
    request: GetIncidentsRequest,
    userRole: Role
  ): Promise<IncidentFilter> {
    const filter: IncidentFilter = {};

    // Role-based filtering
    if (userRole.value === RoleType.CHASER) {
      // Chasers only see incidents they're assigned to
      const userIdResult = UserId.fromString(request.requestingUserId);
      if (userIdResult.isRight()) {
        filter.assignedChaser = userIdResult.value;
      }
    }

    // Status filter
    if (request.status) {
      filter.status = Array.isArray(request.status) 
        ? request.status as IncidentStatus[]
        : request.status as IncidentStatus;
    }

    // Type filter
    if (request.type) {
      filter.type = Array.isArray(request.type)
        ? request.type as IncidentType[]
        : request.type as IncidentType;
    }

    // Priority filter
    if (request.priority) {
      filter.priority = Array.isArray(request.priority)
        ? request.priority as IncidentPriority[]
        : request.priority as IncidentPriority;
    }

    // User filters
    if (request.reportedByUserId) {
      const idResult = UserId.fromString(request.reportedByUserId);
      if (idResult.isRight()) {
        filter.reportedBy = idResult.value;
      }
    }

    if (request.assignedSupeId) {
      const idResult = UserId.fromString(request.assignedSupeId);
      if (idResult.isRight()) {
        filter.assignedSupe = idResult.value;
      }
    }

    if (request.assignedChaserId) {
      const idResult = UserId.fromString(request.assignedChaserId);
      if (idResult.isRight()) {
        filter.assignedChaser = idResult.value;
      }
    }

    // Date filters
    if (request.createdAfter) {
      const tsResult = Timestamp.fromISOString(request.createdAfter);
      if (tsResult.isRight()) {
        filter.createdAfter = tsResult.value;
      }
    }

    if (request.createdBefore) {
      const tsResult = Timestamp.fromISOString(request.createdBefore);
      if (tsResult.isRight()) {
        filter.createdBefore = tsResult.value;
      }
    }

    // Search
    if (request.search) {
      filter.search = request.search;
    }

    return filter;
  }

  private canUserRespond(incident: any, user: any): boolean {
    // Only chasers can respond
    if (user.role.value !== RoleType.CHASER) {
      return false;
    }

    // Must be active incident
    if (incident.status !== IncidentStatus.ACTIVE && 
        incident.status !== IncidentStatus.ASSIGNED) {
      return false;
    }

    // Check if already assigned
    const isAssigned = incident.isChaserAssigned(user.id);
    return !isAssigned;
  }

  private canUserEdit(incident: any, user: any): boolean {
    // Admins can always edit
    if (user.role.value === RoleType.SUPER_ADMIN || 
        user.role.value === RoleType.ADMIN) {
      return true;
    }

    // Supes can edit if assigned or reporter
    if (user.role.value === RoleType.SUPE) {
      return incident.reportedBy.equals(user.id) || 
             incident.isSupeAssigned(user.id);
    }

    return false;
  }
}
