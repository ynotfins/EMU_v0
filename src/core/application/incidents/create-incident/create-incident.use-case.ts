/**
 * Create Incident Use Case
 * 
 * Handles creation of new incidents by authorized users (Supe/Admin).
 */

import { injectable, inject } from 'inversify';
import { UseCase } from '@application/shared/interfaces/use-case.interface';
import { Either, left, right } from '@domain/shared/errors';
import { 
  UserId, 
  Location,
  Role
} from '@domain/shared/value-objects';
import { 
  Incident, 
  IncidentType, 
  IncidentPriority,
  HomeownerInfo 
} from '@domain/entities/incident/incident.entity';
import { User } from '@domain/entities/user/user.entity';
import type { IUserRepository, IIncidentRepository } from '@domain/repositories';
import { InsufficientPermissionsError } from '@domain/entities/user/user.errors';
import { TOKENS } from '@infrastructure/di/tokens';
import { CreateIncidentRequest, CreateIncidentResponse } from './create-incident.dto';
import { 
  ApplicationError,
  UseCaseError,
  toApplicationError 
} from '@application/shared/errors/application.error';
import { 
  DomainEvent
} from '@application/shared/interfaces/services.interface';
import type { 
  IEventBus,
  INotificationService 
} from '@application/shared/interfaces/services.interface';
import { logger } from '@/lib/utils/logger';

@injectable()
export class CreateIncidentUseCase extends UseCase<CreateIncidentRequest, CreateIncidentResponse> {
  constructor(
    @inject(TOKENS.UserRepository) private userRepository: IUserRepository,
    @inject(TOKENS.IncidentRepository) private incidentRepository: IIncidentRepository,
    @inject(TOKENS.EventBus) private eventBus: IEventBus,
    @inject(TOKENS.NotificationService) private notificationService: INotificationService
  ) {
    super();
  }

  async execute(request: CreateIncidentRequest): Promise<Either<Error, CreateIncidentResponse>> {
    try {
      // 1. Get and validate reporting user
      const userIdResult = UserId.fromString(request.reportedByUserId);
      if (userIdResult.isLeft()) {
        return left(userIdResult.value);
      }
      const reporterId = userIdResult.value;

      const userResult = await this.userRepository.findById(reporterId);
      if (userResult.isLeft()) {
        return left(toApplicationError(userResult.value));
      }

      const reporter = userResult.value;
      if (!reporter) {
        return left(new UseCaseError(
          'CreateIncident',
          'Reporting user not found',
        ));
      }

      // 2. Check permissions
      if (!reporter.canCreateIncidents()) {
        return left(new InsufficientPermissionsError(
          reporter.id.value,
          'create incident'
        ));
      }

      // 3. Create location value object
      const locationResult = Location.create({
        lat: request.lat,
        lng: request.lng,
        address: request.address,
        city: request.city,
        state: request.state,
        zipCode: request.zipCode,
        country: 'US', // Default for now
      });

      if (locationResult.isLeft()) {
        return left(locationResult.value);
      }
      const location = locationResult.value;

      // 4. Create incident entity
      const incidentResult = Incident.create({
        location,
        type: request.type as IncidentType,
        priority: request.priority as IncidentPriority,
        description: request.description,
        reportedBy: reporterId,
        images: request.imageUrls,
        homeownerInfo: request.homeownerInfo as HomeownerInfo,
      });

      if (incidentResult.isLeft()) {
        return left(incidentResult.value);
      }
      const incident = incidentResult.value;

      // 5. Auto-assign the reporter as a Supe if they are one
      if (reporter.role.value === 'supe' || 
          reporter.role.value === 'admin' || 
          reporter.role.value === 'super_admin') {
        const assignResult = incident.assignSupe(reporter, reporter);
        if (assignResult.isLeft()) {
          // Log warning but don't fail
          logger.warn('Failed to auto-assign reporter as Supe', {
            code: 'CreateIncidentUseCase',
            error: assignResult.value instanceof Error ? assignResult.value.message : String(assignResult.value),
          });
        }
      }

      // 6. Save to repository
      const saveResult = await this.incidentRepository.save(incident);
      if (saveResult.isLeft()) {
        return left(new UseCaseError(
          'CreateIncident',
          'Failed to save incident',
          saveResult.value
        ));
      }

      // 7. Publish domain event (async, non-blocking)
      this.publishIncidentCreatedEvent(incident).catch((error) => {
        logger.error('Failed to publish incident created event', error, {
          code: 'CreateIncidentUseCase',
          incidentId: incident.id.value,
        });
      });

      // 8. Send notifications (async, non-blocking)
      this.notificationService.notifyNewIncident(incident, location)
        .then(result => {
          if (result.isLeft()) {
            logger.error('Failed to send notifications', result.value instanceof Error ? result.value : new Error(String(result.value)), {
              code: 'CreateIncidentUseCase',
              incidentId: incident.id.value,
            });
          }
        })
        .catch((error) => {
          logger.error('Error sending notifications', error, {
            code: 'CreateIncidentUseCase',
            incidentId: incident.id.value,
          });
        });

      // 9. Return response
      return right({
        incidentId: incident.id.value,
        status: incident.status,
        createdAt: incident.createdAt.toISOString(),
        assignedSupes: incident.assignedSupes.map(id => id.value),
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        },
      });
    } catch (error) {
      return left(toApplicationError(error as Error));
    }
  }

  private async publishIncidentCreatedEvent(incident: Incident): Promise<void> {
    const event: DomainEvent = {
      aggregateId: incident.id.value,
      eventType: 'IncidentCreated',
      eventData: {
        incidentId: incident.id.value,
        type: incident.type,
        priority: incident.priority,
        location: {
          lat: incident.location.lat,
          lng: incident.location.lng,
          address: incident.location.address,
        },
        reportedBy: incident.reportedBy.value,
      },
      occurredAt: new Date(),
    };

    await this.eventBus.publish(event);
  }
}
