/**
 * Application Service Interfaces
 * 
 * Defines contracts for services used by use cases.
 * These will be implemented in the infrastructure layer.
 */

import { Either } from '@domain/shared/errors';
import { Incident } from '@domain/entities/incident/incident.entity';
import { Location } from '@domain/shared/value-objects';

/**
 * Authentication Service
 */
export interface IAuthService {
  verifyEmailPassword(email: string, password: string): Promise<Either<Error, string>>;
  verifyGoogleIdToken(idToken: string): Promise<Either<Error, { uid: string; email: string }>>;
  createSessionToken(userId: string): Promise<Either<Error, string>>;
  createUserWithEmailPassword(email: string, password: string): Promise<Either<Error, string>>;
  sendEmailVerification(email: string): Promise<Either<Error, void>>;
}

/**
 * Session Management Service
 */
export interface ISessionService {
  verifySessionToken(token: string): Promise<Either<Error, string>>;
  getUserIdFromToken(token: string): string | null;
  invalidateSession(sessionToken: string): Promise<Either<Error, void>>;
}

/**
 * Email Service
 */
export interface IEmailService {
  sendWelcomeEmail(email: string, displayName: string): Promise<Either<Error, void>>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<Either<Error, void>>;
  sendIncidentNotification(email: string, incident: any): Promise<Either<Error, void>>;
}

/**
 * Push Notification Service
 */
export interface INotificationService {
  notifyNewIncident(incident: Incident, location: Location): Promise<Either<Error, void>>;
  notifyChaserAssigned(userId: string, incidentId: string): Promise<Either<Error, void>>;
  notifyIncidentUpdate(userIds: string[], incidentId: string, update: string): Promise<Either<Error, void>>;
}

/**
 * Domain Event Bus
 */
export interface DomainEvent {
  aggregateId: string;
  eventType: string;
  eventData: any;
  occurredAt: Date;
}

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}

/**
 * Storage Service for file uploads
 */
export interface IStorageService {
  generateUploadUrl(
    path: string, 
    contentType: string, 
    userId: string
  ): Promise<Either<Error, { uploadUrl: string; downloadUrl: string }>>;
  
  deleteFile(path: string): Promise<Either<Error, void>>;
}
