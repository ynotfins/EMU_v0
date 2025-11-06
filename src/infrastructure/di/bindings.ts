/**
 * DI Container Bindings
 * 
 * Configures all the concrete implementations for the application.
 */

import { Container } from 'inversify';
import { TOKENS } from './tokens';

// Repository interfaces
import { IUserRepository, IIncidentRepository, IChatRepository } from '@domain/repositories';

// Use case interfaces
import { 
  SignInWithEmailUseCase, 
  SignInWithGoogleUseCase, 
  SignUpUseCase, 
  SignOutUseCase, 
  GetCurrentUserUseCase 
} from '@application/auth';
import { 
  CreateIncidentUseCase, 
  GetIncidentsUseCase 
} from '@application/incidents';

// Service interfaces
import { 
  IAuthService, 
  ISessionService, 
  IEventBus, 
  INotificationService,
  IEmailService,
  IStorageService,
  ILoggerService,
  ICacheService
} from '@application/shared/interfaces/services.interface';

// Concrete implementations
import { FirebaseUserRepository } from '../firebase/repositories/user.repository.firebase';
import { FirebaseIncidentRepository } from '../firebase/repositories/incident.repository.firebase';
// import { FirebaseChatRepository } from '../firebase/repositories/chat.repository.firebase';
import { FirebaseAuthService } from '../auth/firebase-auth.service';
import { SessionService } from '../auth/session.service';
import { EventBus } from '../events/event-bus';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
// import { FirebaseStorageService } from '../services/storage.service';
// import { GoogleMapsLocationService } from '../services/location.service';
// import { ConsoleLoggerService } from '../services/logger.service';
// import { InMemoryCacheService } from '../services/cache.service';

/**
 * Configure repository bindings
 */
export function configureRepositories(container: Container): void {
  container.bind<IUserRepository>(TOKENS.UserRepository)
    .to(FirebaseUserRepository)
    .inSingletonScope();
    
  container.bind<IIncidentRepository>(TOKENS.IncidentRepository)
    .to(FirebaseIncidentRepository)
    .inSingletonScope();
    
  // Chat repository to be implemented
  // container.bind<IChatRepository>(TOKENS.ChatRepository)
  //   .to(FirebaseChatRepository)
  //   .inSingletonScope();
}

/**
 * Configure infrastructure service bindings
 */
export function configureInfrastructureServices(container: Container): void {
  container.bind<IAuthService>(TOKENS.AuthService)
    .to(FirebaseAuthService)
    .inSingletonScope();
    
  container.bind<ISessionService>(TOKENS.SessionService)
    .to(SessionService)
    .inSingletonScope();
    
  container.bind<IEventBus>(TOKENS.EventBus)
    .to(EventBus)
    .inSingletonScope();
    
  container.bind<INotificationService>(TOKENS.NotificationService)
    .to(NotificationService)
    .inSingletonScope();
    
  container.bind<IEmailService>(TOKENS.EmailService)
    .to(EmailService)
    .inSingletonScope();
    
  // Additional services to be implemented
  // container.bind<IStorageService>(TOKENS.StorageService)
  //   .to(FirebaseStorageService)
  //   .inSingletonScope();
  //   
  // container.bind<ILocationService>(TOKENS.LocationService)
  //   .to(GoogleMapsLocationService)
  //   .inSingletonScope();
  //   
  // container.bind<ILoggerService>(TOKENS.LoggerService)
  //   .to(ConsoleLoggerService)
  //   .inSingletonScope();
  //   
  // container.bind<ICacheService>(TOKENS.CacheService)
  //   .to(InMemoryCacheService)
  //   .inSingletonScope();
}

/**
 * Configure application use case bindings
 */
export function configureUseCases(container: Container): void {
  // Authentication use cases
  container.bind<SignInWithEmailUseCase>(TOKENS.SignInUseCase)
    .to(SignInWithEmailUseCase)
    .inTransientScope();
    
  container.bind<SignInWithGoogleUseCase>(TOKENS.SignInWithGoogleUseCase)
    .to(SignInWithGoogleUseCase)
    .inTransientScope();
    
  container.bind<SignUpUseCase>(TOKENS.SignUpUseCase)
    .to(SignUpUseCase)
    .inTransientScope();
    
  container.bind<SignOutUseCase>(TOKENS.SignOutUseCase)
    .to(SignOutUseCase)
    .inTransientScope();
    
  container.bind<GetCurrentUserUseCase>(TOKENS.GetCurrentUserUseCase)
    .to(GetCurrentUserUseCase)
    .inTransientScope();
    
  // Incident use cases
  container.bind<CreateIncidentUseCase>(TOKENS.CreateIncidentUseCase)
    .to(CreateIncidentUseCase)
    .inTransientScope();
    
  container.bind<GetIncidentsUseCase>(TOKENS.GetIncidentsUseCase)
    .to(GetIncidentsUseCase)
    .inTransientScope();
}

/**
 * Configure all bindings for the application
 */
export function configureContainer(container: Container): void {
  configureRepositories(container);
  configureInfrastructureServices(container);
  configureUseCases(container);
  
  // Additional configuration can be added here
}
