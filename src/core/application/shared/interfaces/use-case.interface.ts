/**
 * Use Case Interfaces
 * 
 * Base interfaces for application layer use cases.
 * Following Command Query Responsibility Segregation (CQRS) pattern.
 */

import { Either } from '@domain/shared/errors';

/**
 * Base interface for all use cases
 */
export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<Either<Error, TResponse>>;
}

/**
 * Interface for commands (write operations)
 */
export interface ICommand<TRequest, TResponse> extends IUseCase<TRequest, TResponse> {
  // Commands modify state and may return a result
}

/**
 * Interface for queries (read operations)
 */
export interface IQuery<TRequest, TResponse> extends IUseCase<TRequest, TResponse> {
  // Queries only read data, never modify state
}

/**
 * Interface for command handlers
 */
export interface ICommandHandler<TCommand, TResponse> {
  execute(command: TCommand): Promise<Either<Error, TResponse>>;
}

/**
 * Interface for query handlers
 */
export interface IQueryHandler<TQuery, TResponse> {
  execute(query: TQuery): Promise<Either<Error, TResponse>>;
}

/**
 * Base class for use cases with common functionality
 */
export abstract class UseCase<TRequest, TResponse> implements IUseCase<TRequest, TResponse> {
  abstract execute(request: TRequest): Promise<Either<Error, TResponse>>;
  
  /**
   * Validates the request before execution
   * Can be overridden by derived classes
   */
  protected async validate(request: TRequest): Promise<Either<Error, void>> {
    // Default implementation - no validation
    return { isLeft: () => false, isRight: () => true } as Either<Error, void>;
  }
}
