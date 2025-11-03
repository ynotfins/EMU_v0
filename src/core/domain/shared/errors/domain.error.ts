/**
 * Domain Error
 * 
 * Base class for all domain-specific errors.
 * Provides structured error handling with error codes and context.
 */

export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
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
      stack: this.stack,
    };
  }
}

/**
 * Entity Not Found Error
 */
export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(
      `${entity} with id ${id} not found`,
      'ENTITY_NOT_FOUND',
      { entity, id }
    );
  }
}

/**
 * Invalid Entity State Error
 */
export class InvalidEntityStateError extends DomainError {
  constructor(entity: string, state: string, operation: string) {
    super(
      `Cannot perform ${operation} on ${entity} in state ${state}`,
      'INVALID_ENTITY_STATE',
      { entity, state, operation }
    );
  }
}

/**
 * Business Rule Violation Error
 */
export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, details?: string) {
    super(
      `Business rule violation: ${rule}${details ? ` - ${details}` : ''}`,
      'BUSINESS_RULE_VIOLATION',
      { rule, details }
    );
  }
}

/**
 * Authorization Error
 */
export class UnauthorizedError extends DomainError {
  constructor(action: string, resource?: string) {
    super(
      `Unauthorized to perform ${action}${resource ? ` on ${resource}` : ''}`,
      'UNAUTHORIZED',
      { action, resource }
    );
  }
}

/**
 * Validation Error
 */
export class ValidationError extends DomainError {
  constructor(field: string, value: any, constraint: string) {
    super(
      `Validation failed for field ${field}: ${constraint}`,
      'VALIDATION_ERROR',
      { field, value, constraint }
    );
  }
}

/**
 * Aggregate multiple validation errors
 */
export class ValidationErrors extends DomainError {
  public readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = `Validation failed: ${errors.map(e => e.message).join(', ')}`;
    super(message, 'VALIDATION_ERRORS');
    this.errors = errors;
  }

  static combine(...errors: Array<ValidationError | ValidationErrors>): ValidationErrors {
    const allErrors: ValidationError[] = [];
    
    for (const error of errors) {
      if (error instanceof ValidationErrors) {
        allErrors.push(...error.errors);
      } else {
        allErrors.push(error);
      }
    }

    return new ValidationErrors(allErrors);
  }
}

/**
 * Concurrency Error
 */
export class ConcurrencyError extends DomainError {
  constructor(entity: string, id: string, expectedVersion: number, actualVersion: number) {
    super(
      `Concurrency conflict for ${entity} ${id}: expected version ${expectedVersion}, but was ${actualVersion}`,
      'CONCURRENCY_ERROR',
      { entity, id, expectedVersion, actualVersion }
    );
  }
}

/**
 * Invariant Violation Error
 */
export class InvariantViolationError extends DomainError {
  constructor(invariant: string, details?: Record<string, any>) {
    super(
      `Invariant violation: ${invariant}`,
      'INVARIANT_VIOLATION',
      details
    );
  }
}
