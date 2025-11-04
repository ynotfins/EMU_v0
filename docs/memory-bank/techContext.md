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

### Update 2025-01-05T01:45:00Z
[status]: active
[id]: u_20250105_014500_tech1
[source]: action
[reason]: Adding current technical implementation details

**Cloud Functions** (Created, Deployment In Progress):
- Runtime: Node.js 20
- API: Firebase Functions v2 (2nd Gen)
- Functions:
  - `autoGeocodeIncident`: onCreate trigger for /incidents
  - `scheduleGeocodeMissing`: Scheduled every 15 minutes
- Dependencies:
  - firebase-admin@^12.0.0
  - firebase-functions@^5.0.0
  - @googlemaps/google-maps-services-js@^3.3.42

**Google Maps Integration**:
- Client-side: @googlemaps/js-api-loader@2.0.2
- Server-side: @googlemaps/google-maps-services-js@3.3.42  
- Geocoding: Server-side via Cloud Functions (prevents duplicate geocoding)
- Map Display: GoogleMapLive component with Loader API
- Embed Maps: iframe embeds on detail pages (zoom 12)

**Architecture Issues Identified**:
- Duplicate page implementations (/chaser/* and /supe/* are separate)
- Should be using shared components with role-based rendering
- Consolidation plan created in ARCHITECTURE_CONSOLIDATION_PLAN.md
- Maintenance burden due to code duplication

**Build Status**:
- TypeScript errors: 429 (ignoreBuildErrors: true enabled)
- ESLint: Circular reference error in config (known issue)
- Deployment: Working on rebuild.4axe.com via Vercel
- Cloud Functions: Pending deployment (waiting for user)

**Development Environment**:
- Primary IDE: VS Code with custom profile
- Extensions: Optimized for Next.js/Firebase development
- Package Manager: pnpm v10.15.0
- Git Branch: rebuild-proper-architecture
