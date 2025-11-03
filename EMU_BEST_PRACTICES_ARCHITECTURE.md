# 🚀 **EMU Alerts - Best Practices Architecture Plan**

**Version**: 3.0 - Full Clean Architecture  
**Date**: November 3, 2025  
**Approach**: Domain-Driven Design with Clean Architecture

---

## 📋 **Executive Summary**

This plan implements industry best practices for a **production-grade**, **scalable**, **maintainable** real-time incident management system. We follow Clean Architecture principles to ensure:

1. **Business logic is independent** of frameworks, UI, database
2. **Testable** - Business rules can be tested without external dependencies
3. **Flexible** - Easy to swap implementations (Firebase → AWS)
4. **Maintainable** - Clear separation of concerns
5. **Scalable** - Can grow with the business

---

## 🎯 **Core Principles**

### **1. Clean Architecture Layers**

```
┌─────────────────────────────────────────────┐
│             Presentation Layer              │ ← UI Components, Pages
├─────────────────────────────────────────────┤
│             Application Layer               │ ← Use Cases, DTOs
├─────────────────────────────────────────────┤
│               Domain Layer                  │ ← Entities, Business Rules
├─────────────────────────────────────────────┤
│           Infrastructure Layer              │ ← External Services
└─────────────────────────────────────────────┘

Dependencies flow inward: Presentation → Application → Domain ← Infrastructure
```

### **2. Dependency Rule**
- **Inner layers don't know about outer layers**
- **Domain is the core** - no external dependencies
- **Use interfaces** for dependency inversion
- **Inject dependencies** at runtime

### **3. Domain-Driven Design**
- **Entities** encapsulate business rules
- **Value Objects** for immutable concepts
- **Aggregates** maintain consistency
- **Domain Events** for decoupling

---

## 📁 **Project Structure**

```
src/
├── core/                          # Domain & Application layers
│   ├── domain/                    # Business logic (no dependencies)
│   │   ├── entities/              # Business entities
│   │   │   ├── incident/
│   │   │   │   ├── incident.entity.ts
│   │   │   │   ├── incident.value-objects.ts
│   │   │   │   └── incident.errors.ts
│   │   │   ├── user/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── user.value-objects.ts
│   │   │   │   └── user.errors.ts
│   │   │   └── chat/
│   │   │       ├── chat.entity.ts
│   │   │       └── chat.value-objects.ts
│   │   │
│   │   ├── repositories/          # Repository interfaces
│   │   │   ├── incident.repository.interface.ts
│   │   │   ├── user.repository.interface.ts
│   │   │   └── chat.repository.interface.ts
│   │   │
│   │   ├── services/              # Domain services
│   │   │   ├── incident-assignment.service.ts
│   │   │   ├── location-calculator.service.ts
│   │   │   └── notification.service.interface.ts
│   │   │
│   │   └── events/                # Domain events
│   │       ├── incident-created.event.ts
│   │       ├── chaser-responded.event.ts
│   │       └── event-bus.interface.ts
│   │
│   └── application/               # Use cases & Application services
│       ├── incidents/
│       │   ├── commands/          # Write operations
│       │   │   ├── create-incident/
│       │   │   │   ├── create-incident.command.ts
│       │   │   │   ├── create-incident.handler.ts
│       │   │   │   └── create-incident.dto.ts
│       │   │   ├── respond-to-incident/
│       │   │   └── assign-chaser/
│       │   │
│       │   └── queries/           # Read operations
│       │       ├── get-incidents/
│       │       │   ├── get-incidents.query.ts
│       │       │   ├── get-incidents.handler.ts
│       │       │   └── incident.dto.ts
│       │       └── get-incident-details/
│       │
│       ├── auth/
│       │   ├── commands/
│       │   │   ├── sign-in/
│       │   │   ├── sign-up/
│       │   │   └── sign-out/
│       │   └── queries/
│       │       └── get-current-user/
│       │
│       └── shared/
│           ├── interfaces/
│           │   ├── command.interface.ts
│           │   ├── query.interface.ts
│           │   └── handler.interface.ts
│           └── decorators/
│               └── inject.decorator.ts
│
├── infrastructure/                # External implementations
│   ├── persistence/               # Database implementations
│   │   ├── firebase/
│   │   │   ├── repositories/
│   │   │   │   ├── incident.repository.firebase.ts
│   │   │   │   └── user.repository.firebase.ts
│   │   │   ├── mappers/
│   │   │   │   ├── incident.mapper.ts
│   │   │   │   └── user.mapper.ts
│   │   │   └── firebase.module.ts
│   │   │
│   │   └── in-memory/            # For testing
│   │       ├── incident.repository.memory.ts
│   │       └── user.repository.memory.ts
│   │
│   ├── auth/                      # Authentication
│   │   ├── firebase-auth.service.ts
│   │   ├── jwt.service.ts
│   │   └── auth.module.ts
│   │
│   ├── realtime/                  # Real-time updates
│   │   ├── firebase-realtime.service.ts
│   │   ├── websocket.service.ts
│   │   └── realtime.module.ts
│   │
│   ├── maps/                      # Maps integration
│   │   ├── google-maps.service.ts
│   │   └── maps.module.ts
│   │
│   ├── notifications/             # Push notifications
│   │   ├── fcm.service.ts
│   │   └── notifications.module.ts
│   │
│   └── di/                        # Dependency Injection
│       ├── container.ts
│       ├── tokens.ts
│       └── providers.ts
│
├── presentation/                  # UI Layer
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (protected)/
│   │   │   ├── incidents/
│   │   │   ├── incident/[id]/
│   │   │   ├── map/
│   │   │   ├── chat/
│   │   │   └── profile/
│   │   └── layout.tsx
│   │
│   ├── components/                # React components
│   │   ├── incidents/
│   │   │   ├── incident-list/
│   │   │   │   ├── incident-list.tsx
│   │   │   │   ├── incident-list.stories.tsx
│   │   │   │   └── incident-list.test.tsx
│   │   │   └── incident-card/
│   │   ├── maps/
│   │   ├── chat/
│   │   └── shared/
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── incidents/
│   │   │   ├── use-incidents.ts
│   │   │   └── use-incident-subscription.ts
│   │   └── auth/
│   │       └── use-auth.ts
│   │
│   ├── stores/                    # State management
│   │   ├── incidents/
│   │   │   └── incidents.store.ts
│   │   └── auth/
│   │       └── auth.store.ts
│   │
│   └── providers/                 # React context providers
│       ├── auth.provider.tsx
│       └── di.provider.tsx
│
├── shared/                        # Shared utilities
│   ├── errors/
│   │   ├── base.error.ts
│   │   └── error-handler.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   └── validation.utils.ts
│   └── types/
│       └── common.types.ts
│
└── test/                          # Test utilities
    ├── builders/                  # Test data builders
    │   ├── incident.builder.ts
    │   └── user.builder.ts
    ├── mocks/
    │   └── repositories/
    └── setup/
        └── test-setup.ts
```

---

## 🏛️ **Layer Responsibilities**

### **1. Domain Layer** (core/domain)

**Purpose**: Pure business logic, no external dependencies

```typescript
// domain/entities/incident/incident.entity.ts
export class Incident {
  private constructor(
    private readonly id: IncidentId,
    private readonly location: Location,
    private readonly type: IncidentType,
    private readonly status: IncidentStatus,
    private readonly assignedChasers: Set<UserId>,
    private readonly createdAt: Date,
    private readonly updates: IncidentUpdate[]
  ) {}

  static create(props: CreateIncidentProps): Either<IncidentError, Incident> {
    // Business validation
    if (!props.location.isValid()) {
      return left(new InvalidLocationError());
    }
    
    if (!this.isValidIncidentType(props.type)) {
      return left(new InvalidIncidentTypeError());
    }
    
    return right(new Incident(
      IncidentId.create(),
      props.location,
      props.type,
      IncidentStatus.ACTIVE,
      new Set(),
      new Date(),
      []
    ));
  }

  assignChaser(userId: UserId): Either<IncidentError, void> {
    if (this.status !== IncidentStatus.ACTIVE) {
      return left(new IncidentNotActiveError());
    }
    
    if (this.assignedChasers.has(userId)) {
      return left(new ChaserAlreadyAssignedError());
    }
    
    this.assignedChasers.add(userId);
    return right(undefined);
  }

  addUpdate(update: IncidentUpdate): Either<IncidentError, void> {
    if (!update.isValid()) {
      return left(new InvalidUpdateError());
    }
    
    this.updates.push(update);
    return right(undefined);
  }
}

// domain/entities/incident/incident.value-objects.ts
export class Location {
  constructor(
    private readonly lat: number,
    private readonly lng: number,
    private readonly address: Address
  ) {}

  isValid(): boolean {
    return this.lat >= -90 && this.lat <= 90 &&
           this.lng >= -180 && this.lng <= 180;
  }

  distanceTo(other: Location): Distance {
    // Haversine formula
    return Distance.fromKilometers(calculatedDistance);
  }
}
```

### **2. Application Layer** (core/application)

**Purpose**: Orchestrate use cases, coordinate domain entities

```typescript
// application/incidents/commands/create-incident/create-incident.handler.ts
export class CreateIncidentHandler implements ICommandHandler<CreateIncidentCommand> {
  constructor(
    private readonly incidentRepo: IIncidentRepository,
    private readonly eventBus: IEventBus,
    private readonly notificationService: INotificationService
  ) {}

  async execute(command: CreateIncidentCommand): Promise<Either<Error, IncidentId>> {
    // 1. Create domain entity
    const incidentResult = Incident.create({
      location: new Location(command.lat, command.lng, command.address),
      type: command.type as IncidentType,
      reportedBy: UserId.fromString(command.userId)
    });

    if (incidentResult.isLeft()) {
      return left(incidentResult.value);
    }

    const incident = incidentResult.value;

    // 2. Save to repository
    try {
      await this.incidentRepo.save(incident);
    } catch (error) {
      return left(new PersistenceError('Failed to save incident'));
    }

    // 3. Dispatch domain events
    await this.eventBus.publish(
      new IncidentCreatedEvent(incident.id, incident.location, incident.type)
    );

    // 4. Send notifications
    await this.notificationService.notifySupesOfNewIncident(incident);

    return right(incident.id);
  }
}
```

### **3. Infrastructure Layer** (infrastructure/)

**Purpose**: Implement external dependencies

```typescript
// infrastructure/persistence/firebase/repositories/incident.repository.firebase.ts
export class FirebaseIncidentRepository implements IIncidentRepository {
  constructor(
    private readonly db: Firestore,
    private readonly mapper: IncidentMapper
  ) {}

  async save(incident: Incident): Promise<void> {
    const data = this.mapper.toPersistence(incident);
    await setDoc(doc(this.db, 'incidents', data.id), data);
  }

  async findById(id: IncidentId): Promise<Incident | null> {
    const doc = await getDoc(doc(this.db, 'incidents', id.value));
    if (!doc.exists()) return null;
    
    return this.mapper.toDomain(doc.data());
  }

  async findNearby(location: Location, radius: Distance): Promise<Incident[]> {
    // Use geohash for efficient querying
    const bounds = geohashQueryBounds(location, radius);
    
    const promises = bounds.map(bound => 
      getDocs(query(
        collection(this.db, 'incidents'),
        where('geohash', '>=', bound[0]),
        where('geohash', '<=', bound[1])
      ))
    );
    
    const snapshots = await Promise.all(promises);
    const incidents = snapshots
      .flatMap(snap => snap.docs)
      .map(doc => this.mapper.toDomain(doc.data()))
      .filter(incident => incident.location.distanceTo(location) <= radius);
    
    return incidents;
  }
}
```

### **4. Presentation Layer** (presentation/)

**Purpose**: UI components and user interaction

```typescript
// presentation/hooks/incidents/use-incidents.ts
export function useIncidents(filters?: IncidentFilters) {
  const container = useDI();
  const getIncidentsQuery = container.resolve<GetIncidentsQuery>('GetIncidentsQuery');
  
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => getIncidentsQuery.execute({ filters }),
    staleTime: 30_000, // 30 seconds
  });
}

// presentation/components/incidents/incident-list/incident-list.tsx
export function IncidentList({ className }: IncidentListProps) {
  const { data: incidents, isLoading, error } = useIncidents();
  const { user } = useAuth();
  
  if (isLoading) return <IncidentListSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!incidents?.length) return <EmptyState />;
  
  const filteredIncidents = user.role === 'chaser' 
    ? incidents.filter(i => i.distance <= user.settings.maxDistance)
    : incidents;
  
  return (
    <VirtualList
      items={filteredIncidents}
      renderItem={(incident) => (
        <IncidentCard
          key={incident.id}
          incident={incident}
          onRespond={() => handleRespond(incident.id)}
        />
      )}
    />
  );
}
```

---

## 🔧 **Dependency Injection Setup**

```typescript
// infrastructure/di/container.ts
import { Container } from 'inversify';
import { TOKENS } from './tokens';

export function createContainer(config: AppConfig): Container {
  const container = new Container();
  
  // Domain Services
  container.bind(TOKENS.LocationCalculator).to(LocationCalculatorService);
  
  // Repositories
  if (config.env === 'test') {
    container.bind(TOKENS.IncidentRepository).to(InMemoryIncidentRepository);
  } else {
    container.bind(TOKENS.IncidentRepository).to(FirebaseIncidentRepository);
  }
  
  // Application Services
  container.bind(TOKENS.CreateIncidentHandler).to(CreateIncidentHandler);
  container.bind(TOKENS.GetIncidentsQuery).to(GetIncidentsQuery);
  
  // Infrastructure Services
  container.bind(TOKENS.AuthService).to(FirebaseAuthService);
  container.bind(TOKENS.NotificationService).to(FCMNotificationService);
  
  return container;
}

// presentation/providers/di.provider.tsx
export function DIProvider({ children }: { children: ReactNode }) {
  const [container] = useState(() => createContainer(appConfig));
  
  return (
    <DIContext.Provider value={container}>
      {children}
    </DIContext.Provider>
  );
}
```

---

## 🧪 **Testing Strategy**

### **1. Unit Tests** (Domain & Application)

```typescript
// test/domain/entities/incident.test.ts
describe('Incident Entity', () => {
  it('should create valid incident', () => {
    const result = Incident.create({
      location: LocationBuilder.valid().build(),
      type: IncidentType.FIRE,
      reportedBy: UserIdBuilder.valid().build()
    });
    
    expect(result.isRight()).toBe(true);
    expect(result.value).toBeInstanceOf(Incident);
  });
  
  it('should reject invalid location', () => {
    const result = Incident.create({
      location: LocationBuilder.invalid().build(),
      type: IncidentType.FIRE,
      reportedBy: UserIdBuilder.valid().build()
    });
    
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidLocationError);
  });
});
```

### **2. Integration Tests** (Infrastructure)

```typescript
// test/infrastructure/repositories/incident.repository.test.ts
describe('FirebaseIncidentRepository', () => {
  let repository: FirebaseIncidentRepository;
  let testDb: Firestore;
  
  beforeEach(async () => {
    testDb = await createTestDatabase();
    repository = new FirebaseIncidentRepository(testDb, new IncidentMapper());
  });
  
  it('should save and retrieve incident', async () => {
    const incident = IncidentBuilder.valid().build();
    
    await repository.save(incident);
    const retrieved = await repository.findById(incident.id);
    
    expect(retrieved).toEqual(incident);
  });
});
```

### **3. E2E Tests**

```typescript
// test/e2e/incident-flow.test.ts
test('Complete incident response flow', async ({ page }) => {
  // 1. Supe creates incident
  await page.goto('/incidents');
  await page.click('[data-testid="create-incident"]');
  await page.fill('[name="address"]', '123 Main St');
  await page.click('[type="submit"]');
  
  // 2. Chaser sees and responds
  await loginAsChaser(page);
  await page.goto('/incidents');
  await expect(page.locator('[data-testid="incident-123-main"]')).toBeVisible();
  await page.click('[data-testid="respond-btn"]');
  
  // 3. Verify response recorded
  await expect(page.locator('[data-testid="response-status"]')).toHaveText('Responding');
});
```

---

## 🔄 **State Management**

```typescript
// presentation/stores/incidents/incidents.store.ts
interface IncidentsState {
  incidents: IncidentDTO[];
  activeIncident: IncidentDTO | null;
  filters: IncidentFilters;
  subscription: Unsubscribe | null;
}

interface IncidentsActions {
  loadIncidents: () => Promise<void>;
  setActiveIncident: (id: string) => void;
  updateFilters: (filters: Partial<IncidentFilters>) => void;
  respondToIncident: (id: string) => Promise<void>;
  startRealtimeSync: () => void;
  stopRealtimeSync: () => void;
}

export const useIncidentsStore = create<IncidentsState & IncidentsActions>((set, get) => ({
  // State
  incidents: [],
  activeIncident: null,
  filters: defaultFilters,
  subscription: null,
  
  // Actions
  loadIncidents: async () => {
    const query = container.resolve<GetIncidentsQuery>(TOKENS.GetIncidentsQuery);
    const result = await query.execute({ filters: get().filters });
    
    if (result.isRight()) {
      set({ incidents: result.value });
    }
  },
  
  startRealtimeSync: () => {
    const service = container.resolve<IRealtimeService>(TOKENS.RealtimeService);
    const sub = service.subscribeToIncidents((incidents) => {
      set({ incidents });
    });
    set({ subscription: sub });
  },
  
  stopRealtimeSync: () => {
    get().subscription?.();
    set({ subscription: null });
  }
}));
```

---

## 📐 **API Design** (REST + Real-time)

### **REST Endpoints** (Next.js API Routes)

```typescript
// app/api/incidents/route.ts
export async function GET(request: Request) {
  const container = await getServerContainer();
  const query = container.resolve<GetIncidentsQuery>(TOKENS.GetIncidentsQuery);
  
  const { searchParams } = new URL(request.url);
  const filters = parseFilters(searchParams);
  
  const result = await query.execute({ filters });
  
  if (result.isLeft()) {
    return NextResponse.json(
      { error: result.value.message },
      { status: 400 }
    );
  }
  
  return NextResponse.json(result.value);
}

export async function POST(request: Request) {
  const container = await getServerContainer();
  const command = container.resolve<CreateIncidentCommand>(TOKENS.CreateIncidentCommand);
  
  const body = await request.json();
  const validation = createIncidentSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }
  
  const result = await command.execute(validation.data);
  
  if (result.isLeft()) {
    return NextResponse.json(
      { error: result.value.message },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { id: result.value },
    { status: 201 }
  );
}
```

### **WebSocket Events** (Real-time)

```typescript
// infrastructure/realtime/websocket.service.ts
export class WebSocketService implements IRealtimeService {
  private io: Server;
  
  constructor(private eventBus: IEventBus) {
    this.setupEventHandlers();
  }
  
  private setupEventHandlers() {
    // Domain event → WebSocket broadcast
    this.eventBus.subscribe(IncidentCreatedEvent, async (event) => {
      this.io.to('incidents').emit('incident:created', {
        id: event.incidentId,
        location: event.location,
        type: event.type
      });
    });
    
    this.eventBus.subscribe(ChaserRespondedEvent, async (event) => {
      this.io.to(`incident:${event.incidentId}`).emit('incident:response', {
        incidentId: event.incidentId,
        chaserId: event.chaserId,
        status: event.status
      });
    });
  }
}
```

---

## 🛡️ **Security Implementation**

### **1. Authentication & Authorization**

```typescript
// infrastructure/auth/auth.middleware.ts
export function authMiddleware(requiredRole?: Role) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const authService = container.resolve<IAuthService>(TOKENS.AuthService);
      const user = await authService.verifyToken(token);
      
      if (requiredRole && !user.hasRole(requiredRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

### **2. Input Validation**

```typescript
// application/incidents/commands/create-incident/create-incident.dto.ts
import { z } from 'zod';

export const createIncidentSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1).max(500),
  type: z.enum(['fire', 'accident', 'hazard', 'other']),
  description: z.string().max(1000).optional(),
  images: z.array(z.string().url()).max(5).optional()
});

export type CreateIncidentDTO = z.infer<typeof createIncidentSchema>;
```

### **3. Rate Limiting**

```typescript
// infrastructure/security/rate-limiter.ts
export class RateLimiter {
  constructor(
    private redis: Redis,
    private limits: RateLimitConfig
  ) {}
  
  async checkLimit(userId: string, action: string): Promise<boolean> {
    const key = `rate_limit:${userId}:${action}`;
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, this.limits[action].window);
    }
    
    return current <= this.limits[action].max;
  }
}
```

---

## 🚀 **Performance Optimization**

### **1. Caching Strategy**

```typescript
// infrastructure/caching/redis-cache.service.ts
export class RedisCacheService implements ICacheService {
  constructor(private redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, data);
    } else {
      await this.redis.set(key, data);
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}

// application/incidents/queries/get-incidents/get-incidents.handler.ts
export class GetIncidentsHandler {
  constructor(
    private repo: IIncidentRepository,
    private cache: ICacheService
  ) {}
  
  async execute(query: GetIncidentsQuery): Promise<IncidentDTO[]> {
    const cacheKey = `incidents:${JSON.stringify(query.filters)}`;
    
    // Check cache
    const cached = await this.cache.get<IncidentDTO[]>(cacheKey);
    if (cached) return cached;
    
    // Fetch from repository
    const incidents = await this.repo.findByFilters(query.filters);
    const dtos = incidents.map(i => IncidentMapper.toDTO(i));
    
    // Cache for 1 minute
    await this.cache.set(cacheKey, dtos, 60);
    
    return dtos;
  }
}
```

### **2. Database Optimization**

```typescript
// Firestore composite indexes (firestore.indexes.json)
{
  "indexes": [
    {
      "collectionGroup": "incidents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "incidents",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "geohash", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### **3. React Performance**

```typescript
// Lazy loading
const MapComponent = lazy(() => import('./components/maps/incident-map'));

// Memoization
const IncidentCard = memo(({ incident, onRespond }: IncidentCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.incident.id === nextProps.incident.id &&
         prevProps.incident.updatedAt === nextProps.incident.updatedAt;
});

// Virtual scrolling for long lists
import { VirtualList } from '@tanstack/react-virtual';

// Query optimization
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.status === 404) return false;
        return failureCount < 3;
      }
    }
  }
});
```

---

## 📱 **Mobile Optimization**

### **1. Progressive Web App**

```typescript
// public/manifest.json
{
  "name": "EMU Alerts",
  "short_name": "EMU",
  "description": "Emergency Management Unit Alert System",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#ef4444",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

// Service Worker with offline support
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('emu-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/manifest.json',
        '/icon-192.png'
      ]);
    })
  );
});
```

### **2. Offline Support**

```typescript
// infrastructure/offline/offline-queue.service.ts
export class OfflineQueueService {
  private queue: IDBDatabase;
  
  async addToQueue(action: OfflineAction): Promise<void> {
    const tx = this.queue.transaction(['actions'], 'readwrite');
    await tx.objectStore('actions').add({
      ...action,
      timestamp: Date.now(),
      synced: false
    });
  }
  
  async syncQueue(): Promise<void> {
    const tx = this.queue.transaction(['actions'], 'readonly');
    const actions = await tx.objectStore('actions')
      .index('synced')
      .getAll(false);
    
    for (const action of actions) {
      try {
        await this.executeAction(action);
        await this.markAsSynced(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action.id);
      }
    }
  }
}
```

---

## 🔄 **Migration Path**

### **Phase 1: Foundation** (Week 1-2)
1. Set up project structure
2. Implement core domain entities
3. Create repository interfaces
4. Set up dependency injection
5. Implement basic auth

### **Phase 2: Core Features** (Week 3-4)
1. Implement incident use cases
2. Create Firebase repositories
3. Build incident UI components
4. Add real-time subscriptions
5. Implement role-based access

### **Phase 3: Advanced Features** (Week 5-6)
1. Add chat functionality
2. Implement maps integration
3. Add push notifications
4. Implement offline support
5. Add analytics

### **Phase 4: Optimization** (Week 7-8)
1. Performance optimization
2. Security hardening
3. E2E testing
4. Documentation
5. Deployment setup

---

## 📊 **Success Metrics**

1. **Code Quality**
   - Test coverage > 80%
   - Zero critical security issues
   - TypeScript strict mode
   - No circular dependencies

2. **Performance**
   - Initial load < 3s
   - Time to interactive < 5s
   - Lighthouse score > 90
   - 60 FPS scrolling

3. **Reliability**
   - 99.9% uptime
   - < 100ms API response time
   - Offline capability
   - Error recovery

4. **Maintainability**
   - Clear separation of concerns
   - Documented APIs
   - Consistent code style
   - Easy onboarding

---

## 🎯 **Conclusion**

This architecture provides:

✅ **Testability** - Every layer can be tested in isolation  
✅ **Flexibility** - Easy to swap implementations  
✅ **Scalability** - Can grow with the business  
✅ **Maintainability** - Clear boundaries and responsibilities  
✅ **Performance** - Optimized for real-time mobile use  

By following these best practices, EMU Alerts will be a **production-grade**, **enterprise-ready** application that can scale to thousands of users while maintaining code quality and developer experience.
