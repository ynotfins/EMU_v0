/**
 * Centralized logging utility
 * Replace all console.log/error/warn with this utility
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  code?: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const prefix = context?.code ? `[${context.code}]` : '[App]';
    return `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context), context);
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('info', message, context), context);
    }
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context), context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(this.formatMessage('error', message, context), error, context);
    
    // In production, could send to error tracking service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Example: Could send to Sentry, LogRocket, etc.
      // errorTrackingService.captureException(error, { extra: context });
    }
  }
}

export const logger = new Logger();

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public ctx?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const logError = (e: unknown, code = 'unknown', ctx?: unknown): AppError => {
  const error = e instanceof Error ? e : new Error(String(e));
  logger.error(`Error: ${error.message}`, error, { code, ...(ctx && { ctx }) });
  return new AppError(code, error.message, ctx);
};
