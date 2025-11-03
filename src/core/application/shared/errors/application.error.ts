/**
 * Application Layer Errors
 * 
 * Errors that can occur during use case execution.
 * These are higher-level than domain errors.
 */

import { DomainError } from '@domain/shared/errors';

export abstract class ApplicationError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): object {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

/**
 * Use Case Execution Error
 */
export class UseCaseError extends ApplicationError {
  constructor(useCase: string, reason: string, originalError?: Error) {
    super(
      `Use case ${useCase} failed: ${reason}`,
      'USE_CASE_ERROR',
      { useCase, originalError: originalError?.message }
    );
  }
}

/**
 * External Service Error
 */
export class ExternalServiceError extends ApplicationError {
  constructor(service: string, operation: string, originalError?: Error) {
    super(
      `External service ${service} failed during ${operation}`,
      'EXTERNAL_SERVICE_ERROR',
      { service, operation, originalError: originalError?.message }
    );
  }
}

/**
 * Session Error
 */
export class SessionError extends ApplicationError {
  constructor(reason: string) {
    super(
      `Session error: ${reason}`,
      'SESSION_ERROR'
    );
  }
}

/**
 * Data Consistency Error
 */
export class DataConsistencyError extends ApplicationError {
  constructor(entity: string, operation: string, details: string) {
    super(
      `Data consistency error in ${entity} during ${operation}: ${details}`,
      'DATA_CONSISTENCY_ERROR',
      { entity, operation }
    );
  }
}

/**
 * Converts domain errors to application errors
 */
export function toApplicationError(error: Error | DomainError): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  if (error instanceof DomainError) {
    return new UseCaseError(
      'Unknown',
      error.message,
      error
    );
  }

  return new UseCaseError(
    'Unknown',
    error.message || 'An unexpected error occurred',
    error
  );
}
