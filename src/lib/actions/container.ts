/**
 * Server Action DI Container Setup
 * 
 * Creates and caches the DI container for use in Server Actions.
 * This ensures we have a singleton container across all server actions.
 */

import { createContainer, AppConfig } from '@infrastructure/di/container';
import { Container } from 'inversify';

let container: Container | null = null;

/**
 * Gets or creates the DI container for Server Actions
 */
export function getServerContainer(): Container {
  if (!container) {
    const appConfig: AppConfig = {
      env: process.env.NODE_ENV as 'development' | 'staging' | 'production',
      debug: process.env.NODE_ENV === 'development',
      apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    };

    container = createContainer({
      appConfig,
      databaseConfig: {
        type: 'firebase',
      },
      authConfig: {
        sessionDuration: 5 * 24 * 60 * 60 * 1000, // 5 days
        enableGoogleAuth: true,
        enableEmailAuth: true,
      },
    });
  }

  return container;
}

