# EMU Alerts - Route Tree

## Route Structure

All routes use Next.js 14 App Router with file-based routing.

### Root Routes

| Route | File | Layout | Description | Params | Query |
|-------|------|--------|-------------|--------|-------|
| `/` | `app/page.tsx` | `app/layout.tsx` | Root redirect to `/role` | - | - |
| `/role` | `app/role/page.tsx` | `app/layout.tsx` | Role selection, redirects to role dashboard | - | - |

### Authentication Routes

| Route | File | Layout | Description | Params | Query |
|-------|------|--------|-------------|--------|-------|
| `/login` | `app/(auth)/login/page.tsx` | `app/layout.tsx` | Login page with logo and form | - | - |

### Chaser Routes

All chaser routes use `app/layout.tsx` as the root layout.

| Route | File | Description | Params | Query |
|-------|------|-------------|--------|-------|
| `/chaser/incidents` | `app/chaser/incidents/page.tsx` | Incidents list with filters (Home) | - | - |
| `/chaser/incident/[id]` | `app/chaser/incident/[id]/page.tsx` | Incident details with tabs | `id: string` | `tab?: 'details' \| 'homeowner' \| 'docs' \| 'sign'` |
| `/chaser/favorites` | `app/chaser/favorites/page.tsx` | Favorites with tabs | - | `tab?: 'starred' \| 'bookmarks' \| 'notes'` |
| `/chaser/chat` | `app/chaser/chat/page.tsx` | Chat thread list | - | - |
| `/chaser/chat/[threadId]` | `app/chaser/chat/[threadId]/page.tsx` | Chat room for specific thread | `threadId: string` | - |
| `/chaser/profile` | `app/chaser/profile/page.tsx` | User profile (single scrollable page) | - | - |

### Supervisor (Supe) Routes

All supe routes use `app/layout.tsx` as the root layout.

| Route | File | Description | Params | Query |
|-------|------|-------------|--------|-------|
| `/supe/incidents` | `app/supe/incidents/page.tsx` | Incidents list with filters (Home) | - | - |
| `/supe/incident/[id]` | `app/supe/incident/[id]/page.tsx` | Incident details with tabs | `id: string` | `tab?: 'details' \| 'homeowner' \| 'docs' \| 'sign'` |
| `/supe/map` | `app/supe/map/page.tsx` | Live map of active responders | - | - |
| `/supe/favorites` | `app/supe/favorites/page.tsx` | Favorites with tabs | - | `tab?: 'starred' \| 'bookmarks' \| 'notes'` |
| `/supe/chat` | `app/supe/chat/page.tsx` | Chat thread list | - | - |
| `/supe/chat/[threadId]` | `app/supe/chat/[threadId]/page.tsx` | Chat room for specific thread | `threadId: string` | - |
| `/supe/profile` | `app/supe/profile/page.tsx` | User profile (single scrollable page) | - | - |

### Admin Routes

| Route | File | Layout | Description | Params | Query |
|-------|------|--------|-------------|--------|-------|
| `/admin` | `app/admin/page.tsx` | `app/layout.tsx` | Admin dashboard with user management | - | - |

### Dev Routes

| Route | File | Layout | Description | Params | Query |
|-------|------|--------|-------------|--------|-------|
| `/docs` | `app/docs/page.tsx` | `app/layout.tsx` | Documentation viewer (dev only) | - | - |

## Navigation Patterns

### Bottom Navigation

Chaser and Supe roles use a persistent bottom navigation bar (via `<BottomNav>` component) with the following tabs:

**Chaser Navigation:**
- Home (Incidents) - `/chaser/incidents`
- Favorites - `/chaser/favorites`
- Chat - `/chaser/chat`
- Profile - `/chaser/profile`

**Supe Navigation:**
- Home (Incidents) - `/supe/incidents`
- Map - `/supe/map`
- Chat - `/supe/chat`
- Profile - `/supe/profile`

### Tab Persistence

Tabs within pages persist via query parameters:

- **Incident Details**: `?tab=details|homeowner|docs|sign` (default: `details`)
- **Favorites**: `?tab=starred|bookmarks|notes` (default: `starred`)

### Role-Based Redirects

- Root `/` redirects to `/role`
- `/role` reads user profile and redirects to:
  - Admin → `/admin`
  - Chaser → `/chaser/incidents`
  - Supe → `/supe/incidents`

## Route Guards

Currently, routes are not protected (mock auth). In production:
- All routes except `/login` require authentication
- Role-specific routes should verify user role matches route prefix
- Admin routes require `role: 'admin'`

## Merged Pages

The following pages are single scrollable routes (not split):

1. **Profile Page**: `/[role]/profile` - Contains all sections from Profile1, Profile2, and Profile_Emergency_Section screenshots
2. **Homeowner Tab**: `/[role]/incident/[id]?tab=homeowner` - Single scrollable form with all fields from Homeowner_tab and Homeowner2 screenshots
3. **E-Sign Tab**: `/[role]/incident/[id]?tab=sign` - Single scrollable page with document selection and signature history from eSign and eSign2 screenshots
