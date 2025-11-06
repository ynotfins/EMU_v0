/**
 * Authentication Error Types
 * Custom error classes for authentication operations
 */

export enum AuthErrorCode {
  INVALID_EMAIL = 'INVALID_EMAIL',
  USER_DISABLED = 'USER_DISABLED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  POPUP_CLOSED = 'POPUP_CLOSED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN = 'UNKNOWN',
}

export class AuthRepositoryError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AuthRepositoryError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthRepositoryError);
    }
  }
}

