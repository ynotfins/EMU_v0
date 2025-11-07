# System Patterns: Architecture & Design Patterns

## Application Architecture

### Monorepo Structure
```
EMU_v0/
├── emu-alerts-new/          # Next.js frontend application
├── functions/               # Firebase Cloud Functions
├── server_v2/               # Standalone webhook service
├── data/fire-departments/   # Reference data and scripts
└── scripts/                 # Utility scripts
```

### Key Principles
1. **Type Safety**: End-to-end TypeScript with Zod validation
2. **Real-time Updates**: Firestore subscriptions for live data
3. **AI Integration**: OpenRouter API for text extraction
4. **Modular Design**: Separate concerns (webhook, frontend, functions)

## Core Design Patterns

### 1. Webhook Processing Pattern
```typescript
// Incoming alert → AI extraction → Firestore storage
POST /webhook → AI Extract → Validate → Store → Geocode
```

### 2. Real-time Subscription Pattern
```typescript
// Firestore → React Hook → UI Update
onSnapshot(query) → useIncidents() → Component Re-render
```

### 3. Type Guard Pattern
```typescript
// Runtime type validation
function isFireDepartment(data: unknown): data is FireDepartment {
  return typeof data === 'object' && data !== null && 'fdid' in data;
}
```

### 4. Server Action Pattern
```typescript
// Type-safe server-side operations
'use server'
export async function createFireDepartment(data: FireDepartmentInput) {
  // Server-side validation and Firestore write
}
```

## Data Flow Patterns

### Alert Processing Flow
```
MacroDroid → Webhook → AI Extract → Firestore → Geocode → Display
                ↓           ↓            ↓          ↓
          JSON Payload  Structured   Incident   lat/lng
```

### Real-time Subscription Flow
```
Firestore → onSnapshot → React Hook → Component Re-render
               ↓             ↓              ↓
          Query Change   State Update   UI Update
```

### Fire Department Code Tracking Flow
```
Alert → Extract Codes → Track Address → Cross-Reference → Link Department → Encryption Policy
  ↓          ↓              ↓                ↓                  ↓                  ↓
BNN      departmentCodes  Mapping      Address Match      FireDepartment    Policy Type
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
