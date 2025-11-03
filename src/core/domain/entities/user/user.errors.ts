/**
 * User-specific Domain Errors
 */

import { DomainError } from '@domain/shared/errors';

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(
      `User with id ${userId} not found`,
      'USER_NOT_FOUND',
      { userId }
    );
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(
      `User with email ${email} already exists`,
      'USER_ALREADY_EXISTS',
      { email }
    );
  }
}

export class InvalidUserCredentialsError extends DomainError {
  constructor() {
    super(
      'Invalid email or password',
      'INVALID_USER_CREDENTIALS'
    );
  }
}

export class UserNotActiveError extends DomainError {
  constructor(userId: string, status: string) {
    super(
      `User ${userId} is not active (status: ${status})`,
      'USER_NOT_ACTIVE',
      { userId, status }
    );
  }
}

export class EmailNotVerifiedError extends DomainError {
  constructor(userId: string) {
    super(
      `User ${userId} email is not verified`,
      'EMAIL_NOT_VERIFIED',
      { userId }
    );
  }
}

export class InsufficientPermissionsError extends DomainError {
  constructor(userId: string, action: string, resource?: string) {
    super(
      `User ${userId} lacks permission to ${action}${resource ? ` on ${resource}` : ''}`,
      'INSUFFICIENT_PERMISSIONS',
      { userId, action, resource }
    );
  }
}
