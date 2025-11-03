/**
 * Incident-specific Domain Errors
 */

import { DomainError } from '@domain/shared/errors';

export class IncidentNotFoundError extends DomainError {
  constructor(incidentId: string) {
    super(
      `Incident with id ${incidentId} not found`,
      'INCIDENT_NOT_FOUND',
      { incidentId }
    );
  }
}

export class IncidentAlreadyResolvedError extends DomainError {
  constructor(incidentId: string) {
    super(
      `Incident ${incidentId} is already resolved`,
      'INCIDENT_ALREADY_RESOLVED',
      { incidentId }
    );
  }
}

export class IncidentAlreadyCancelledError extends DomainError {
  constructor(incidentId: string) {
    super(
      `Incident ${incidentId} is already cancelled`,
      'INCIDENT_ALREADY_CANCELLED',
      { incidentId }
    );
  }
}

export class ChaserNotAssignedError extends DomainError {
  constructor(incidentId: string, chaserId: string) {
    super(
      `Chaser ${chaserId} is not assigned to incident ${incidentId}`,
      'CHASER_NOT_ASSIGNED',
      { incidentId, chaserId }
    );
  }
}

export class ChaserAlreadyAssignedError extends DomainError {
  constructor(incidentId: string, chaserId: string) {
    super(
      `Chaser ${chaserId} is already assigned to incident ${incidentId}`,
      'CHASER_ALREADY_ASSIGNED',
      { incidentId, chaserId }
    );
  }
}

export class MaxChasersExceededError extends DomainError {
  constructor(incidentId: string, maxChasers: number) {
    super(
      `Incident ${incidentId} already has the maximum number of chasers (${maxChasers})`,
      'MAX_CHASERS_EXCEEDED',
      { incidentId, maxChasers }
    );
  }
}

export class InvalidIncidentTypeError extends DomainError {
  constructor(type: string) {
    super(
      `Invalid incident type: ${type}`,
      'INVALID_INCIDENT_TYPE',
      { type }
    );
  }
}

export class InvalidIncidentStatusError extends DomainError {
  constructor(status: string) {
    super(
      `Invalid incident status: ${status}`,
      'INVALID_INCIDENT_STATUS',
      { status }
    );
  }
}

export class IncidentUpdateFailedError extends DomainError {
  constructor(incidentId: string, reason: string) {
    super(
      `Failed to update incident ${incidentId}: ${reason}`,
      'INCIDENT_UPDATE_FAILED',
      { incidentId, reason }
    );
  }
}
