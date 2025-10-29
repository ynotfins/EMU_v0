# EMU Alerts - Filter System

## Overview

The EMU Alerts filter system provides a robust, real-time filtering mechanism for incidents across all app roles (Chaser, Supe, Admin). All filtering is done client-side for instant responsiveness with Firebase's real-time data.

---

## Filter Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Filter Flow                           │
└─────────────────────────────────────────────────────────┘

Firestore (500 most recent)
         ↓
useIncidents() Hook
  ├─ Real-time listener (onSnapshot)
  ├─ Data normalization
  └─ Returns raw incidents[]
         ↓
Client-Side Filters (useMemo)
  ├─ Distance Filter (last 4 hours + X miles)
  ├─ Type Filter (FIRE, EMS, etc.)
  ├─ Keyword Search (address, type, message)
  ├─ High Alert Filter
  ├─ Min Updates Filter
  └─ Hidden Incidents Filter
         ↓
Sorted Results
  ├─ Default: Most recent first (updatedAt DESC)
  ├─ Or: By distance (closest first)
         ↓
Display in UI
```

---

## 1. Filter Types

### 1.1 Distance Filter

**Purpose**: Show incidents within X miles from last 4 hours

**UI Location**: `FilterBar` component → Distance dropdown

**Implementation**: `hooks/use-incidents.ts`

```typescript
if (filters.distanceMi !== undefined) {
  const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
  
  filtered = filtered.filter(inc => {
    const incidentTime = new Date(inc.updatedAt).getTime();
    const isRecent = incidentTime >= fourHoursAgo;
    const withinDistance = 
      inc.distanceMi !== undefined && 
      inc.distanceMi <= filters.distanceMi;
    
    return isRecent && withinDistance;
  });
}
```

**Options**:
- 10 miles
- 25 miles
- 50 miles
- 100 miles
- All

**Requirements**:
- ✅ User location permission granted
- ✅ Incident has `lat`/`lng` (geocoded)
- ✅ Incident within last 4 hours

**Why 4 Hours?**
- Prevents filtering stale incidents
- Focuses on active situations
- Reduces processing load
- Matches typical alert lifecycle

---

### 1.2 Type Filter

**Purpose**: Filter by incident type (FIRE, EMS, etc.)

**UI Location**: `FilterBar` → Type multi-select

**Implementation**:
```typescript
if (filters.types && filters.types.length > 0) {
  filtered = filtered.filter(inc => 
    filters.types.includes(inc.type)
  );
}
```

**Common Types**:
- FIRE
- EMS
- MVA (Motor Vehicle Accident)
- RESCUE
- HAZMAT
- OTHER

**Features**:
- ✅ Multi-select (can choose multiple types)
- ✅ Case-insensitive matching
- ✅ Shows count of each type
- ✅ Remembers selection across sessions

---

### 1.3 Keyword Search

**Purpose**: Full-text search across address, type, and message

**UI Location**: `FilterBar` → Search input

**Implementation**:
```typescript
if (filters.keyword) {
  const keyword = filters.keyword.toLowerCase();
  
  filtered = filtered.filter(inc =>
    inc.address.toLowerCase().includes(keyword) ||
    inc.type.toLowerCase().includes(keyword) ||
    inc.message.toLowerCase().includes(keyword)
  );
}
```

**Search Fields**:
| Field | Example | Match |
|-------|---------|-------|
| Address | "123 Main St" | "main" ✅ |
| Type | "FIRE" | "fire" ✅ |
| Message | "Structure fire" | "structure" ✅ |

**Features**:
- ✅ Case-insensitive
- ✅ Partial matches
- ✅ Real-time (filters as you type)
- ✅ No minimum character requirement

---

### 1.4 High Alert Filter

**Purpose**: Show only critical/high-priority incidents

**UI Location**: `FilterBar` → High Alert toggle

**Implementation**:
```typescript
if (filters.highAlertOnly) {
  filtered = filtered.filter(inc => inc.highAlert);
}
```

**What Makes an Incident "High Alert"?**
- Multiple alarms
- Special circumstances (e.g., "working fire")
- High-risk locations
- Escalating situations

**UI Indicator**:
- 🔴 Red badge with "HIGH ALERT"
- Flashing animation
- Priority sorting

---

### 1.5 Minimum Updates Filter

**Purpose**: Show incidents with at least X updates

**UI Location**: `FilterBar` → Updates dropdown

**Implementation**:
```typescript
if (filters.minUpdates !== undefined) {
  filtered = filtered.filter(inc => 
    inc.updates && inc.updates.length >= filters.minUpdates
  );
}
```

**Options**:
- 0 (all incidents)
- 1+ update
- 3+ updates
- 5+ updates
- 10+ updates

**Use Case**: Focus on evolving/active situations

---

### 1.6 Hidden Incidents Filter

**Purpose**: Exclude incidents user has hidden

**UI Location**: Automatic (no UI control)

**Implementation**: `app/chaser/incidents/page.tsx`

```typescript
const [hiddenIncidents, setHiddenIncidents] = useState<Set<string>>(new Set());

// Filter out hidden
filtered = filtered.filter(inc => !hiddenIncidents.has(inc.id));
```

**Features**:
- ✅ Session-based (resets on page refresh)
- ✅ Per-user (not shared)
- ✅ Green "hide" button on each incident
- ✅ Instant removal from view

**Future Enhancement**: Persist to user preferences in Firestore

---

### 1.7 Silenced Incidents (Visual Only)

**Purpose**: Show silenced incidents with visual indicator, don't filter out

**UI Location**: Bell icon on each incident

**Implementation**: Local storage + visual styling

```typescript
// Check if silenced
const silenced = isSilenced(incident.id);

// Apply styling
<Card className={silenced ? "opacity-50 bg-gray-50" : ""}>
```

**Important**: Silenced incidents are NOT filtered out, just styled differently!

**Why Not Filter?**
- Users should still see all incidents
- May need to unsilence later
- Different from "hide" which removes completely

---

## 2. Sort Options

### 2.1 Default Sort - Most Recent

**Implementation**: `app/chaser/incidents/page.tsx`

```typescript
filtered.sort((a, b) => 
  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
);
```

**Behavior**:
- ✅ Newest incidents at top
- ✅ Updated incidents bubble up
- ✅ Always active by default

---

### 2.2 Sort by Distance

**UI Location**: "Sort by Distance" button (when location enabled)

**Implementation**:
```typescript
if (sortByDistance) {
  // Filter to last 4 hours
  const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
  filtered = filtered.filter(inc => 
    new Date(inc.updatedAt).getTime() >= fourHoursAgo
  );
  
  // Sort closest first
  filtered.sort((a, b) => {
    if (a.distanceMi === undefined) return 1;
    if (b.distanceMi === undefined) return -1;
    return a.distanceMi - b.distanceMi;
  });
}
```

**Features**:
- ⚠️ **Warning**: Button flashes red/white (risky mode indicator)
- ⏰ Auto-filters to last 4 hours only
- 📏 Closest incidents shown first
- 🚨 Use sparingly (focuses on proximity over recency)

**Why Flash Red/White?**
Sorting by distance can cause you to miss newer incidents further away. The flashing animation warns users this is a risky mode.

---

## 3. Filter State Management

### Filter Hook: `useFilters()`

**Location**: `hooks/use-filters.ts`

```typescript
export interface IncidentFilters {
  distanceMi?: number;
  types: string[];
  keyword: string;
  highAlertOnly: boolean;
  minUpdates?: number;
  showSilenced?: boolean;
}

export function useFilters() {
  const [filters, setFilters] = useState<IncidentFilters>({
    types: [],
    keyword: "",
    highAlertOnly: false,
  });
  
  const setDistance = (distanceMi?: number) => {
    setFilters(prev => ({ ...prev, distanceMi }));
  };
  
  // ... other setters
  
  return { filters, setDistance, setTypes, setKeyword, ... };
}
```

**State Persistence**: Currently session-only (resets on refresh)

**Future Enhancement**: Save to `localStorage` or user preferences

---

## 4. Filter Performance

### Optimization Strategy

#### Memoization
```typescript
const data = useMemo<IncidentLite[]>(() => {
  let filtered = incidents;
  
  // Apply all filters
  // ...
  
  return filtered;
}, [incidents, filters, silenced]);
```

**Why useMemo?**
- Only re-filters when `incidents` or `filters` change
- Prevents unnecessary recalculations on every render
- Keeps UI responsive

#### Batching
Filters are applied sequentially, but all in one pass:
1. Distance filter
2. Type filter
3. Keyword filter
4. High alert filter
5. Min updates filter
6. Hidden filter

**Order Matters**: Most restrictive filters first reduces work for subsequent filters.

---

## 5. Filter Combinations

### Example Scenarios

#### Scenario 1: Nearby Fires
```
✅ Distance: 25 miles
✅ Types: [FIRE]
❌ Keyword: (empty)
```
**Result**: All fires within 25 miles from last 4 hours

#### Scenario 2: Search for Address
```
❌ Distance: (not set)
❌ Types: (all)
✅ Keyword: "main street"
```
**Result**: All incidents with "main street" in address/type/message

#### Scenario 3: Active Situations Nearby
```
✅ Distance: 50 miles
❌ Types: (all)
❌ Keyword: (empty)
✅ Min Updates: 3+
```
**Result**: Incidents within 50 miles with 3+ updates (last 4 hours)

#### Scenario 4: High Priority Only
```
❌ Distance: (not set)
❌ Types: (all)
❌ Keyword: (empty)
✅ High Alert: ON
```
**Result**: All high-priority incidents, sorted by most recent

---

## 6. Filter UI Components

### FilterBar Component

**Location**: `components/filter-bar.tsx`

**Props**:
```typescript
interface FilterBarProps {
  distanceMi?: number;
  onDistanceChange: (distance?: number) => void;
  
  types: string[];
  onTypesChange: (types: string[]) => void;
  
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  
  highAlertEnabled: boolean;
  onHighAlertChange: (enabled: boolean) => void;
  
  minUpdates?: number;
  onMinUpdatesChange: (min?: number) => void;
  
  // Sound settings
  highAlertSound: string;
  onHighAlertSoundChange: (soundId: string) => void;
  
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
}
```

**Layout**:
```
┌──────────────────────────────────────────────────────┐
│  [Distance ▼] [Types ▼] [Search...] [🔴 High Alert] │
│  [Updates ▼]  [🔊 Sound] [🔇 Mute]                   │
└──────────────────────────────────────────────────────┘
```

---

## 7. Advanced Filtering (Future)

### Planned Enhancements

#### 7.1 Date Range Filter
```typescript
if (filters.dateRange) {
  filtered = filtered.filter(inc => {
    const incidentDate = new Date(inc.updatedAt).getTime();
    return incidentDate >= filters.dateRange.start && 
           incidentDate <= filters.dateRange.end;
  });
}
```

#### 7.2 Custom Regions
```typescript
if (filters.customRegion) {
  // Filter by polygon boundary
  filtered = filtered.filter(inc => 
    isPointInPolygon(inc.lat, inc.lng, filters.customRegion.polygon)
  );
}
```

#### 7.3 Saved Filter Presets
```typescript
interface FilterPreset {
  name: string;
  filters: IncidentFilters;
  icon: string;
}

const presets: FilterPreset[] = [
  {
    name: "Nearby Fires",
    filters: { types: ["FIRE"], distanceMi: 25 },
    icon: "🔥"
  },
  // ...
];
```

#### 7.4 AI-Powered Suggestions
```typescript
// Suggest filters based on user behavior
const suggestions = await getFilterSuggestions(userHistory);
// "You often view fires in Brooklyn - filter for those?"
```

---

## 8. Filter State Persistence

### Current: Session-Based
Filters reset on page refresh.

### Planned: LocalStorage
```typescript
useEffect(() => {
  const saved = localStorage.getItem('filter-state');
  if (saved) {
    setFilters(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  localStorage.setItem('filter-state', JSON.stringify(filters));
}, [filters]);
```

### Planned: User Preferences (Firestore)
```typescript
// Save to /users/{userId}/settings/filters
await updateDoc(doc(db, "users", userId), {
  "settings.filters": filters
});
```

---

## 9. Filter Analytics

### Track Filter Usage

```typescript
// Log filter applications
analytics.logEvent('filter_applied', {
  filter_type: 'distance',
  filter_value: '25mi',
  results_count: filtered.length,
  user_role: 'chaser'
});
```

**Insights**:
- Most used filters
- Filter combinations
- Average results per filter
- User preferences by role

---

## 10. Testing Filters

### Test Scenarios

#### Test 1: Distance Filter
1. Enable location
2. Set distance to 10 miles
3. Verify only incidents < 10 miles shown
4. Verify only last 4 hours shown
5. Check distance badge on each incident

#### Test 2: Keyword Search
1. Enter "main"
2. Verify only incidents with "main" in address/type/message
3. Try uppercase "MAIN" - should work (case-insensitive)
4. Clear search - all incidents return

#### Test 3: Filter Combination
1. Distance: 25 miles
2. Types: FIRE
3. Keyword: "structure"
4. Verify results match ALL criteria

#### Test 4: Sort by Distance
1. Click "Sort by Distance"
2. Button should flash red/white
3. Verify closest incident at top
4. Verify only last 4 hours shown
5. Click again to return to time sort

---

## 11. Error Handling

### Missing Distance Data
```typescript
// Show incidents without distance at bottom
filtered.sort((a, b) => {
  if (a.distanceMi === undefined) return 1;
  if (b.distanceMi === undefined) return -1;
  return a.distanceMi - b.distanceMi;
});
```

### Invalid Filter Values
```typescript
// Validate distance
if (distanceMi && distanceMi < 0) {
  console.warn('[Filter] Invalid distance:', distanceMi);
  distanceMi = undefined;
}
```

### Empty Results
```tsx
{filtered.length === 0 && (
  <div className="text-center py-12">
    <p className="text-gray-500">No incidents match your filters</p>
    <Button onClick={clearFilters}>Clear Filters</Button>
  </div>
)}
```

---

## 12. Accessibility

### Keyboard Navigation
- ✅ Tab through filter controls
- ✅ Enter to toggle checkboxes
- ✅ Arrow keys in dropdowns
- ✅ Escape to close dropdowns

### Screen Reader Support
```tsx
<label htmlFor="distance-filter" className="sr-only">
  Filter by distance
</label>
<select 
  id="distance-filter"
  aria-label="Filter incidents by distance"
  value={distanceMi}
  onChange={e => setDistance(Number(e.target.value))}
>
```

### Visual Indicators
- Active filters highlighted
- Clear "X" button on active filters
- Result count shown
- Loading state during filtering

---

## Cross-References

- **Data Structure**: See `docs/PARSING_AND_INDEXING.md`
- **Hooks**: See `hooks/use-filters.ts`, `hooks/use-incidents.ts`
- **Components**: See `components/filter-bar.tsx`
- **Architecture**: See `docs/WIRING.md`
- **API**: See `docs/API.md`

---

**Last Updated**: October 29, 2025  
**Status**: ✅ Production-Ready  
**Complexity**: High - Multiple interdependent filters  
**Maintainer**: EMU Development Team

