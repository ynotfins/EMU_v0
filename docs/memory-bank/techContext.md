# Technical Context: Implementation Details

## Clean Architecture Layers

### 1. Domain Layer (`src/core/domain/`)
- **Entities**: User, Incident (rich domain models)
- **Value Objects**: Email, Location, Role, Timestamp, ID
- **Repository Interfaces**: IUserRepository, IIncidentRepository
- **Domain Errors**: Custom error classes
- **Either Monad**: Functional error handling

### 2. Application Layer (`src/core/application/`)
- **Use Cases**: SignIn, SignUp, CreateIncident, GetIncidents
- **DTOs**: Request/Response objects
- **Service Interfaces**: IAuthService, ISessionService, IEventBus
- **Application Errors**: UseCaseError, ExternalServiceError

### 3. Infrastructure Layer (`src/infrastructure/`)
- **Firebase**: Admin SDK for server, Client SDK for real-time
- **Repositories**: FirebaseUserRepository, FirebaseIncidentRepository
- **Services**: EmailService, NotificationService, AuthService
- **Event Bus**: Domain event publishing
- **DI Container**: InversifyJS configuration

### 4. Presentation Layer (`src/presentation/`)
- **Server Actions**: Type-safe API endpoints
- **React Hooks**: useAuth, useIncidents, useLocation
- **Zustand Stores**: Auth, Incidents, UI state
- **Components**: UI components (to be integrated)

## Key Technologies

### Core Stack
- **Next.js 16.0.1**: App Router, Server Components, Server Actions
- **React 19.0.0**: Latest React with new features
- **TypeScript 5**: Strict mode, branded types
- **Node.js**: Runtime environment

### Firebase Services
- **Authentication**: Email/password, Google OAuth
- **Firestore**: Primary database for structured data
- **Realtime Database**: Chat messages
- **Cloud Storage**: File uploads (pending)
- **Cloud Messaging**: Push notifications (pending)

### State Management
- **Zustand 4.5.2**: Client-side global state
- **Server Actions**: Server-side operations
- **React Hooks**: Component-level state

### UI/Styling
- **Tailwind CSS 3.4.1**: Utility-first CSS
- **shadcn/ui**: Pre-built components
- **Radix UI**: Headless component primitives
- **Lucide React**: Icon library

### Development Tools
- **pnpm**: Package manager
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Turbopack**: Fast bundler

## Environment Configuration

### Required Environment Variables
```
# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=

# App Configuration
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Development Workflow

### Branch Strategy
- `main`: Production (4axe.com)
- `rebuild-proper-architecture`: Clean Architecture development

### Build Commands
```bash
pnpm install     # Install dependencies
pnpm dev         # Start dev server
pnpm build       # Production build
pnpm lint        # Run ESLint
```

### Deployment
- **Production**: Vercel (main branch → 4axe.com)
- **Preview**: Vercel (feature branches)
- **Planned**: rebuild.4axe.com for new architecture

## Architecture Patterns

### Dependency Injection
- InversifyJS container
- Symbol-based tokens
- Constructor injection
- Singleton/Transient scopes

### Error Handling
- Either<Error, Success> pattern
- No thrown exceptions in domain/application
- Explicit error types
- Graceful degradation

### Real-time Updates
- Firestore onSnapshot in hooks
- Optimistic updates in Zustand
- Server-sent events for notifications
- WebSocket fallback for chat

### Security
- httpOnly session cookies
- Server-side authorization
- Input validation with value objects
- Firebase Security Rules
