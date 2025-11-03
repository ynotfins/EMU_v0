/**
 * Centralized Logging Utility
 * Provides structured logging with levels, prefixes, and production control
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogOptions {
  level?: LogLevel;
  prefix?: string;
  data?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  
  // Control which logs show in production
  private productionLevels: Set<LogLevel> = new Set(['warn', 'error']);

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    if (this.isProduction) return this.productionLevels.has(level);
    return true;
  }

  private formatMessage(prefix: string, message: string, level: LogLevel): string {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level];

    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${emoji} [${prefix}] ${message}`;
  }

  private log(level: LogLevel, prefix: string, message: string, options?: { data?: any; error?: Error }) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(prefix, message, level);

    switch (level) {
      case 'error':
        console.error(formattedMessage, options?.data || '', options?.error || '');
        break;
      case 'warn':
        console.warn(formattedMessage, options?.data || '');
        break;
      case 'debug':
        console.debug(formattedMessage, options?.data || '');
        break;
      default:
        console.log(formattedMessage, options?.data || '');
    }
  }

  // Public API
  debug(prefix: string, message: string, data?: any) {
    this.log('debug', prefix, message, { data });
  }

  info(prefix: string, message: string, data?: any) {
    this.log('info', prefix, message, { data });
  }

  warn(prefix: string, message: string, data?: any) {
    this.log('warn', prefix, message, { data });
  }

  error(prefix: string, message: string, error?: Error, data?: any) {
    this.log('error', prefix, message, { error, data });
  }

  success(prefix: string, message: string, data?: any) {
    this.log('success', prefix, message, { data });
  }

  // Specialized loggers
  auth = {
    login: (email: string) => this.info('Auth', `User logged in: ${email}`),
    logout: (email: string) => this.info('Auth', `User logged out: ${email}`),
    error: (message: string, error?: Error) => this.error('Auth', message, error),
    stateChange: (hasUser: boolean, email?: string) => 
      this.debug('Auth', `State changed - ${hasUser ? `User: ${email}` : 'No user'}`),
  };

  firebase = {
    init: () => this.success('Firebase', 'Initialized successfully'),
    error: (message: string, error?: Error) => this.error('Firebase', message, error),
    firestore: (message: string, data?: any) => this.debug('Firestore', message, data),
    rtdb: (message: string, data?: any) => this.debug('RTDB', message, data),
  };

  location = {
    granted: () => this.success('Location', 'Permission granted'),
    denied: () => this.warn('Location', 'Permission denied'),
    error: (message: string, error?: Error) => this.error('Location', message, error),
    update: (lat: number, lng: number) => this.debug('Location', `Updated: ${lat}, ${lng}`),
  };

  profile = {
    loaded: (userId: string, role: string) => this.info('Profile', `Loaded for ${userId} (${role})`),
    error: (message: string, error?: Error) => this.error('Profile', message, error),
    updated: (field: string) => this.debug('Profile', `Updated field: ${field}`),
  };

  incidents = {
    loaded: (count: number) => this.info('Incidents', `Loaded ${count} incidents`),
    filtered: (count: number, filters: any) => 
      this.debug('Incidents', `Filtered to ${count} incidents`, filters),
    error: (message: string, error?: Error) => this.error('Incidents', message, error),
  };

  distance = {
    calculating: (incidentId: string) => this.debug('Distance', `Calculating for ${incidentId}`),
    calculated: (incidentId: string, distance: number) => 
      this.debug('Distance', `Calculated for ${incidentId}: ${distance.toFixed(1)} mi`),
    error: (message: string, error?: Error) => this.error('Distance', message, error),
    geocoding: (address: string) => this.debug('Distance', `Geocoding: ${address}`),
    geocoded: (address: string, lat: number, lng: number) => 
      this.debug('Distance', `Geocoded ${address} to ${lat}, ${lng}`),
  };

  chat = {
    connected: (chatId: string) => this.debug('Chat', `Connected to ${chatId}`),
    message: (chatId: string, from: string) => this.debug('Chat', `Message in ${chatId} from ${from}`),
    error: (message: string, error?: Error) => this.error('Chat', message, error),
  };

  api = {
    request: (method: string, url: string) => this.debug('API', `${method} ${url}`),
    success: (method: string, url: string, data?: any) => 
      this.debug('API', `✅ ${method} ${url}`, data),
    error: (method: string, url: string, error?: Error) => 
      this.error('API', `❌ ${method} ${url}`, error),
  };

  // Performance tracking
  performance = {
    start: (label: string): PerformanceTracker => {
      const startTime = performance.now();
      return {
        end: () => {
          const duration = performance.now() - startTime;
          this.debug('Performance', `${label} took ${duration.toFixed(2)}ms`);
        }
      };
    }
  };

  // Group related logs
  group(title: string, callback: () => void) {
    if (!this.shouldLog('debug')) return;
    console.group(title);
    callback();
    console.groupEnd();
  }
}

interface PerformanceTracker {
  end: () => void;
}

// Export singleton instance
export const logger = new Logger();

// Export specialized loggers for convenience
export const {
  auth: authLogger,
  firebase: firebaseLogger,
  location: locationLogger,
  profile: profileLogger,
  incidents: incidentsLogger,
  distance: distanceLogger,
  chat: chatLogger,
  api: apiLogger,
} = logger;
