# System Patterns: Architecture & Design Patterns

## Clean Architecture Structure

### Layer Dependencies
```
Presentation → Application → Domain ← Infrastructure
     ↓             ↓                      ↑
     └─────────────┴──────────────────────┘
```

### Key Principles
1. **Dependency Rule**: Dependencies point inward
2. **Domain Independence**: Business logic has no external dependencies
3. **Interface Segregation**: Use interfaces, not concrete implementations
4. **Single Responsibility**: Each module has one reason to change

## Core Design Patterns

### 1. Repository Pattern
```typescript
// Domain defines interface
interface IUserRepository {
  findById(id: UserId): Promise<Either<Error, User>>;
  save(user: User): Promise<Either<Error, void>>;
}

// Infrastructure implements
class FirebaseUserRepository implements IUserRepository {
  // Concrete Firebase implementation
}
```

### 2. Use Case Pattern
```typescript
// Single responsibility use case
class SignInUseCase {
  execute(request: SignInRequest): Promise<Either<Error, SignInResponse>> {
    // Orchestrates domain logic
  }
}
```

### 3. Value Object Pattern
```typescript
// Self-validating, immutable values
class Email extends ValueObject<{ value: string }> {
  static create(email: string): Either<InvalidEmailError, Email> {
    // Validation logic
  }
}
```

### 4. Either Monad Pattern
```typescript
// Explicit error handling
const result = await createIncident(data);
if (result.isLeft()) {
  handleError(result.value);
} else {
  handleSuccess(result.value);
}
```

## Data Flow Patterns

### Server Action Flow
```
Client Component → Server Action → Use Case → Repository → Database
                         ↓              ↓           ↓
                    Session Check   Domain Logic  Mapping
```

### Real-time Subscription Flow
```
Firestore → onSnapshot → React Hook → Zustand Store → UI Component
               ↓             ↓              ↓
          Data Transform  State Update  Re-render
```

### Authentication Flow
```
Login Form → Server Action → Auth Service → Session Cookie
                 ↓               ↓               ↓
            Validation    Firebase Auth    httpOnly Cookie
```

## State Management Patterns

### Global State (Zustand)
- **Auth Store**: User session, permissions
- **Incidents Store**: List, filters, selections
- **UI Store**: Modals, notifications, theme

### Component State (Hooks)
- **Real-time Data**: Firebase subscriptions
- **Form State**: Controlled inputs
- **UI State**: Loading, errors

### Server State (Server Actions)
- **Data Fetching**: Initial loads
- **Mutations**: Create, update, delete
- **Validation**: Server-side checks

## Error Handling Patterns

### Domain Errors
```typescript
class UserNotFoundError extends DomainError {
  constructor(id: string) {
    super('USER_NOT_FOUND', `User ${id} not found`);
  }
}
```

### Application Errors
```typescript
class AuthenticationError extends ApplicationError {
  constructor(message: string) {
    super('AUTH_ERROR', message);
  }
}
```

### UI Error Boundaries
```typescript
function ErrorBoundary({ children }) {
  // Catches React errors
  // Shows fallback UI
  // Reports to monitoring
}
```

## Security Patterns

### Authentication
- Server-side session validation
- httpOnly cookies for tokens
- CSRF protection
- Rate limiting

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- Server-side checks
- Client-side UI hiding

### Data Validation
- Input validation in value objects
- Schema validation in use cases
- Firebase Security Rules
- XSS prevention

## Performance Patterns

### Lazy Loading
- Route-based code splitting
- Dynamic imports for features
- Suspense boundaries
- Progressive enhancement

### Caching
- Zustand persistence
- Firebase offline persistence
- Service Worker caching
- CDN for static assets

### Optimization
- React.memo for pure components
- useMemo/useCallback hooks
- Virtual scrolling for lists
- Image optimization

## Testing Patterns

### Unit Testing
- Pure functions in domain
- Use cases with mocked repos
- Value object validation
- Store actions

### Integration Testing
- Server Actions
- API endpoints
- Database queries
- External services

### E2E Testing
- Critical user flows
- Cross-browser testing
- Mobile testing
- Performance testing

## Deployment Patterns

### Environment Management
- Development: Local Firebase emulator
- Staging: Preview deployments
- Production: Main branch auto-deploy

### Feature Flags
- Gradual rollouts
- A/B testing
- Quick rollbacks
- User segments

### Monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Custom metrics

### Correction 2025-01-05T00:30:00Z
[status]: superseded
[id]: c_20250105_003000_arch1
[supersedes]: entire document
[source]: action
[reason]: Current implementation doesn't follow documented patterns

**This document describes intended patterns, but current implementation differs:**

1. **Page Architecture Issue**:
   - Document implies shared components with role-based access
   - Reality: Duplicate pages in `/chaser/*` and `/supe/*` folders
   - No code sharing between roles
   - Different features for same functionality

2. **Missing Shared Architecture**:
   - Should have: Single page implementation with role checks
   - Actually have: Completely separate page implementations
   - Navigation routes to `/{role}/page` not shared `/page`

3. **Recommended Fix**:
   - Create `/app/(shared)/*` pages
   - Update navigation to remove role prefix
   - Add role-based permissions within pages
   - Delete duplicate implementations
