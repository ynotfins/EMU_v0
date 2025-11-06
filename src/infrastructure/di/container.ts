/**
 * Dependency Injection Container
 * 
 * Configures the InversifyJS container with all dependencies.
 * This is the composition root of the application.
 */

import 'reflect-metadata';
import { Container } from 'inversify';
import { TOKENS } from './tokens';

// Configuration interfaces
export interface AppConfig {
  env: 'development' | 'staging' | 'production';
  debug: boolean;
  apiUrl: string;
  appUrl: string;
}

export interface DatabaseConfig {
  type: 'firebase' | 'postgres' | 'in-memory';
  connectionString?: string;
}

export interface AuthConfig {
  jwtSecret?: string;
  jwtExpiresIn?: string;
  sessionDuration?: number;
  enableGoogleAuth: boolean;
  enableEmailAuth: boolean;
}

// Container factory options
export interface ContainerOptions {
  appConfig: AppConfig;
  databaseConfig?: DatabaseConfig;
  authConfig?: AuthConfig;
}

/**
 * Creates and configures the DI container
 */
export function createContainer(options: ContainerOptions): Container {
  const container = new Container({
    defaultScope: 'Singleton',
  });

  // Bind configurations
  container.bind<AppConfig>(TOKENS.AppConfig).toConstantValue(options.appConfig);
  
  if (options.databaseConfig) {
    container.bind<DatabaseConfig>(TOKENS.DatabaseConfig).toConstantValue(options.databaseConfig);
  }
  
  if (options.authConfig) {
    container.bind<AuthConfig>(TOKENS.AuthConfig).toConstantValue(options.authConfig);
  }

  // Configure based on environment
  if (options.appConfig.env === 'development') {
    configureDevelopmentBindings(container);
  } else if (options.appConfig.env === 'production') {
    configureProductionBindings(container);
  }

  return container;
}

/**
 * Development environment bindings
 */
function configureDevelopmentBindings(container: Container): void {
  // Import and configure bindings
  const { configureContainer } = require('./bindings');
  configureContainer(container);
}

/**
 * Production environment bindings
 */
function configureProductionBindings(container: Container): void {
  // Import and configure bindings
  const { configureContainer } = require('./bindings');
  configureContainer(container);
}

/**
 * Creates a child container for request-scoped dependencies
 */
export function createRequestContainer(
  parentContainer: Container,
  requestContext?: any
): Container {
  // Inversify doesn't have createChild, use parent container directly
  // Request-scoped bindings can be handled differently if needed
  return parentContainer;
}

// Re-export types for convenience
export { Container, injectable, inject } from 'inversify';
export { TOKENS } from './tokens';
