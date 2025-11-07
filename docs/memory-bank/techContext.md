# Technical Context: Implementation Details

## Application Structure

### Frontend (`emu-alerts-new/`)
- **Pages**: Next.js App Router (`app/` directory)
- **Components**: React components (`components/ui/`)
- **Hooks**: Custom React hooks (`hooks/`)
- **Actions**: Server actions (`actions/`)
- **Firebase**: Client SDK config (`firebase/config/client.ts`)
- **Schema**: Typesaurus schema (`firebase/schema.ts`)

### Backend Services

#### Webhook Service (`server_v2/`)
- **Runtime**: Node.js 20
- **Framework**: Express
- **AI**: OpenRouter API (Claude 3.5 Sonnet)
- **Database**: Firebase Admin SDK → Firestore
- **Deployment**: Google Cloud Run

#### Cloud Functions (`functions/`)
- **Runtime**: Node.js 20
- **API**: Firebase Functions v2
- **Functions**:
  - `ingress`: Main webhook endpoint, AI processing
  - `autoGeocodeIncident`: Auto-geocode on incident creation
  - `scheduleGeocodeMissing`: Scheduled geocoding fallback
- **Dependencies**: Firebase Admin, Google Maps API, OpenRouter AI SDK

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

### Update 2025-01-07T00:00:00Z
[status]: active
[id]: u_20250107_000000_tech1
[source]: action
[reason]: Current technical implementation

**Cloud Functions** (Deployed):
- Runtime: Node.js 20
- API: Firebase Functions v2 (2nd Gen)
- Functions:
  - `ingress`: Main webhook endpoint with AI processing
  - `autoGeocodeIncident`: onCreate trigger for /incidents
  - `scheduleGeocodeMissing`: Scheduled every 15 minutes
- Secrets: OPENROUTER_API_KEY_EMU, GOOGLE_MAPS_API_KEY (Secret Manager)

**AI Integration**:
- Provider: OpenRouter API
- Model: Claude 3.5 Sonnet
- Purpose: Extract structured data from alert messages
- Fields Extracted: incidentId, location, type, description, departmentCodes, fireDepartmentInfo

**Google Maps Integration**:
- Client-side: @googlemaps/js-api-loader@2.0.2
- Server-side: @googlemaps/google-maps-services-js@3.3.42
- Geocoding: Server-side via Cloud Functions (prevents duplicates)
- API Key: Stored in Secret Manager, accessed via environment

**Fire Department System**:
- Google Sheets: Master data source (columns A-AB protected, AC-AH editable)
- Firestore: `fireDepartments` and `fireDepartmentMappings` collections
- Import: CSV or Google Sheets URL
- Automation: Google Apps Script for data validation

**Build Status**:
- TypeScript: 0 errors (after refactoring)
- ESLint: Configured and passing
- Deployment: Vercel (frontend), Cloud Run (webhook), Firebase Functions
- Package Manager: pnpm v10.15.0
