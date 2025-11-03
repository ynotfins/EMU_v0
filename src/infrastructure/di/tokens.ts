/**
 * Dependency Injection Tokens
 * 
 * Symbols used to identify dependencies in the InversifyJS container.
 * Using symbols instead of strings prevents naming collisions.
 */

export const TOKENS = {
  // Repositories
  UserRepository: Symbol.for('UserRepository'),
  IncidentRepository: Symbol.for('IncidentRepository'),
  ChatRepository: Symbol.for('ChatRepository'),
  
  // Domain Services
  LocationCalculatorService: Symbol.for('LocationCalculatorService'),
  IncidentAssignmentService: Symbol.for('IncidentAssignmentService'),
  NotificationService: Symbol.for('NotificationService'),
  
  // Infrastructure Services
  AuthService: Symbol.for('AuthService'),
  SessionService: Symbol.for('SessionService'),
  StorageService: Symbol.for('StorageService'),
  EmailService: Symbol.for('EmailService'),
  SMSService: Symbol.for('SMSService'),
  MapService: Symbol.for('MapService'),
  LocationService: Symbol.for('LocationService'),
  RealtimeService: Symbol.for('RealtimeService'),
  LoggerService: Symbol.for('LoggerService'),
  CacheService: Symbol.for('CacheService'),
  
  // Application Services (Use Cases)
  // Auth Use Cases
  SignInUseCase: Symbol.for('SignInUseCase'),
  SignInWithGoogleUseCase: Symbol.for('SignInWithGoogleUseCase'),
  SignUpUseCase: Symbol.for('SignUpUseCase'),
  SignOutUseCase: Symbol.for('SignOutUseCase'),
  GetCurrentUserUseCase: Symbol.for('GetCurrentUserUseCase'),
  UpdateUserProfileUseCase: Symbol.for('UpdateUserProfileUseCase'),
  
  // Incident Use Cases
  CreateIncidentUseCase: Symbol.for('CreateIncidentUseCase'),
  UpdateIncidentUseCase: Symbol.for('UpdateIncidentUseCase'),
  AssignChaserUseCase: Symbol.for('AssignChaserUseCase'),
  RespondToIncidentUseCase: Symbol.for('RespondToIncidentUseCase'),
  ResolveIncidentUseCase: Symbol.for('ResolveIncidentUseCase'),
  GetIncidentsUseCase: Symbol.for('GetIncidentsUseCase'),
  GetIncidentDetailsUseCase: Symbol.for('GetIncidentDetailsUseCase'),
  
  // Chat Use Cases
  SendMessageUseCase: Symbol.for('SendMessageUseCase'),
  GetChatMessagesUseCase: Symbol.for('GetChatMessagesUseCase'),
  CreateChatUseCase: Symbol.for('CreateChatUseCase'),
  MarkMessagesAsReadUseCase: Symbol.for('MarkMessagesAsReadUseCase'),
  
  // Configuration
  AppConfig: Symbol.for('AppConfig'),
  DatabaseConfig: Symbol.for('DatabaseConfig'),
  AuthConfig: Symbol.for('AuthConfig'),
  
  // Event Bus
  EventBus: Symbol.for('EventBus'),
  
  // Factories
  UserFactory: Symbol.for('UserFactory'),
  IncidentFactory: Symbol.for('IncidentFactory'),
} as const;

export type DITokens = typeof TOKENS;
