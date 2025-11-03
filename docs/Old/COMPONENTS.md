# EMU Alerts - Component Catalog

## Custom Components

| Component | Path | Props (Typed) | Events | Used In (Routes) |
|-----------|------|---------------|--------|------------------|
| `Logo` | `components/logo.tsx` | `{ size?: 'sm' \| 'md' \| 'lg', className?: string }` | - | `/login` |
| `BottomNav` | `components/bottom-nav.tsx` | `{ role: 'chaser' \| 'supe' }` | - | All chaser/supe routes |
| `RoleLayout` | `components/role-layout.tsx` | `{ role: 'chaser' \| 'supe', children: ReactNode }` | - | All chaser/supe routes |
| `FilterBar` | `components/filter-bar.tsx` | `{ filters: FilterState, onFilterChange: (filters: FilterState) => void, onHighAlertToggle: (enabled: boolean, sound?: string) => void }` | `onFilterChange`, `onHighAlertToggle` | `/chaser/incidents`, `/supe/incidents` |
| `IncidentListItem` | `components/incident-list-item.tsx` | `{ incident: Incident, onFavorite: (id: string) => void, onBookmark: (id: string) => void }` | `onFavorite`, `onBookmark`, `onClick` (navigate) | `/chaser/incidents`, `/supe/incidents`, `/chaser/favorites`, `/supe/favorites` |
| `MapCard` | `components/map-card.tsx` | `{ lat: number, lng: number, address: string, className?: string }` | - | `/chaser/incident/[id]`, `/supe/incident/[id]` |
| `UpdatesList` | `components/updates-list.tsx` | `{ updates: IncidentUpdate[] }` | - | `/chaser/incident/[id]`, `/supe/incident/[id]` |
| `NotesEditor` | `components/notes-editor.tsx` | `{ incidentId: string, initialNotes: string, onSave: (notes: string) => void }` | `onSave` | `/chaser/incident/[id]`, `/supe/incident/[id]` |
| `HomeownerForm` | `components/homeowner-form.tsx` | `{ incidentId: string, initialData?: Partial<HomeownerForm>, onSave: (data: HomeownerForm) => void }` | `onSave` | `/chaser/incident/[id]?tab=homeowner`, `/supe/incident/[id]?tab=homeowner` |
| `DocsManager` | `components/docs-manager.tsx` | `{ incidentId: string, files: IncidentFile[], onUpload: (file: File, type: 'photo' \| 'document') => void, onDelete?: (fileId: string) => void }` | `onUpload`, `onDelete`, `onCapture` | `/chaser/incident/[id]?tab=docs`, `/supe/incident/[id]?tab=docs` |
| `ESignManager` | `components/esign-manager.tsx` | `{ incidentId: string, files: IncidentFile[], packets: ESignPacket[], onSendForESign: (fileIds: string[], recipientEmail: string) => void, onLiveSign: (fileIds: string[]) => void }` | `onSendForESign`, `onLiveSign` | `/chaser/incident/[id]?tab=sign`, `/supe/incident/[id]?tab=sign` |
| `ThreadList` | `components/thread-list.tsx` | `{ threads: Thread[], onSelectThread: (threadId: string) => void }` | `onSelectThread` | `/chaser/chat`, `/supe/chat` |
| `ChatRoom` | `components/chat-room.tsx` | `{ threadId: string, messages: Message[], currentUserId: string, onSendMessage: (text: string) => void }` | `onSendMessage` | `/chaser/chat/[threadId]`, `/supe/chat/[threadId]` |
| `ProfileHeader` | `components/profile-header.tsx` | `{ profile: UserProfile }` | `onAvatarChange` | `/chaser/profile`, `/supe/profile` |
| `StatsCards` | `components/stats-cards.tsx` | `{ responded: number, noted: number, daysActive: number }` | - | `/chaser/profile`, `/supe/profile` |
| `IDVerificationCard` | `components/id-verification-card.tsx` | `{ isVerified: boolean, onUploadID: (file: File) => void }` | `onUploadID` | `/chaser/profile`, `/supe/profile` |
| `PreferencesCard` | `components/preferences-card.tsx` | `{ pushEnabled: boolean, locationEnabled: boolean, onTogglePush: (enabled: boolean) => void, onToggleLocation: (enabled: boolean) => void }` | `onTogglePush`, `onToggleLocation` | `/chaser/profile`, `/supe/profile` |
| `EmergencyPaymentCard` | `components/emergency-payment-card.tsx` | `{ isVerified: boolean, cashApp?: string, venmo?: string, onSave: (cashApp: string, venmo: string) => void }` | `onSave` | `/chaser/profile`, `/supe/profile` |
| `HelpLegalCard` | `components/help-legal-card.tsx` | `{}` | - | `/chaser/profile`, `/supe/profile` |
| `LiveMap` | `components/live-map.tsx` | `{ locations: LiveLocation[], className?: string }` | - | `/supe/map` |

## shadcn/ui Components Used

The following shadcn/ui components are used throughout the application:

- `Button` - Primary actions, navigation
- `Card` - Content containers
- `Input` - Text input fields
- `Textarea` - Multi-line text input
- `Select` - Dropdown selections
- `Switch` - Toggle controls
- `Tabs` - Tab navigation
- `Badge` - Status indicators, type labels
- `Avatar` - User profile images
- `Dialog` - Modal dialogs
- `Dropdown Menu` - Context menus
- `Separator` - Visual dividers
- `Checkbox` - Multi-select options
- `Label` - Form labels
- `Scroll Area` - Scrollable containers
- `Collapsible` - Expandable sections

## Component Prop Types

All components export their prop types for type safety:

\`\`\`typescript
// Example from filter-bar.tsx
export interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onHighAlertToggle: (enabled: boolean, sound?: string) => void
}
\`\`\`

## Event Naming Convention

All event handlers follow the `on[Action]` pattern:
- `onSave` - Save data
- `onUpload` - Upload file
- `onDelete` - Delete item
- `onToggle` - Toggle state
- `onSendMessage` - Send message
- `onFilterChange` - Change filters
- etc.

## Component Organization

- **Layout Components**: `BottomNav`, `RoleLayout`, `Logo`
- **List Components**: `IncidentListItem`, `ThreadList`, `UpdatesList`
- **Form Components**: `HomeownerForm`, `NotesEditor`, `FilterBar`
- **File Components**: `DocsManager`, `ESignManager`
- **Profile Components**: `ProfileHeader`, `StatsCards`, `IDVerificationCard`, `PreferencesCard`, `EmergencyPaymentCard`, `HelpLegalCard`
- **Map Components**: `MapCard`, `LiveMap`
- **Chat Components**: `ThreadList`, `ChatRoom`
