# EMU Alerts - Environment Variables

## Required Environment Variables

The following environment variables are required for EMU Alerts to function properly. These should be configured in your Vercel project settings.

---

### `FIREBASE_API_KEY`

**Description**: Firebase Web API key for client-side Firebase SDK initialization.

**Where Used**:
- Firebase SDK initialization (to be implemented in `/lib/firebase.ts`)
- Client-side authentication
- Firestore queries
- Firebase Storage uploads

**How to Get**:
1. Go to Firebase Console → Project Settings
2. Under "Your apps" section, find your web app
3. Copy the `apiKey` value from the config object

**Verification**:
\`\`\`typescript
// lib/firebase.ts
if (!process.env.FIREBASE_API_KEY) {
  console.error('[v0] FIREBASE_API_KEY is not set')
}
\`\`\`

**Used In**:
- All hooks that will connect to Firebase
- Authentication flows
- File upload components

---

### `GOOGLE_MAPS_API_KEY`

**Description**: Google Maps JavaScript API key for rendering maps.

**Where Used**:
- `components/map-card.tsx` - Incident location map
- `components/live-map.tsx` - Supervisor live tracking map
- Geocoding services (optional)

**How to Get**:
1. Go to Google Cloud Console
2. Enable Maps JavaScript API
3. Create API key with appropriate restrictions
4. Restrict to your domain in production

**Verification**:
\`\`\`typescript
// components/map-card.tsx
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.warn('[v0] GOOGLE_MAPS_API_KEY not set, showing placeholder')
}
\`\`\`

**Used In**:
- `/chaser/incident/[id]` (Details tab)
- `/supe/incident/[id]` (Details tab)
- `/supe/map` (Live map page)

---

### `FCM_VAPID_KEY`

**Description**: Firebase Cloud Messaging VAPID key for web push notifications.

**Where Used**:
- Push notification subscription
- High alert audio notifications
- New message notifications
- Incident update notifications

**How to Get**:
1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Under "Web Push certificates", generate a new key pair
3. Copy the "Key pair" value

**Verification**:
\`\`\`typescript
// lib/fcm.ts (to be created)
if (!process.env.FCM_VAPID_KEY) {
  console.error('[v0] FCM_VAPID_KEY is not set, push notifications disabled')
}
\`\`\`

**Used In**:
- High alert system (`components/filter-bar.tsx`)
- Chat notifications
- Incident update notifications
- Topic subscriptions

---

## Environment Variable Setup

### Development (Local)

Create a `.env.local` file in the project root:

\`\`\`bash
FIREBASE_API_KEY=your_firebase_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
FCM_VAPID_KEY=your_fcm_vapid_key_here
\`\`\`

**Note**: `.env.local` is gitignored and should never be committed.

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its value
4. Select appropriate environments (Production, Preview, Development)
5. Save and redeploy

### Accessing in Code

**Client-side** (components, hooks):
\`\`\`typescript
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
\`\`\`

**Server-side** (API routes, server components):
\`\`\`typescript
const apiKey = process.env.FIREBASE_API_KEY
\`\`\`

**Note**: Currently all variables are used client-side. If you need server-only access, remove the `NEXT_PUBLIC_` prefix.

---

## Runtime Verification

Add a verification utility to check all required env vars at startup:

\`\`\`typescript
// lib/verify-env.ts
export function verifyEnvVars() {
  const required = [
    'FIREBASE_API_KEY',
    'GOOGLE_MAPS_API_KEY',
    'FCM_VAPID_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('[v0] Missing required environment variables:', missing)
    return false
  }
  
  console.log('[v0] All required environment variables are set')
  return true
}
\`\`\`

Call this in your root layout or app initialization:

\`\`\`typescript
// app/layout.tsx
import { verifyEnvVars } from '@/lib/verify-env'

if (process.env.NODE_ENV === 'development') {
  verifyEnvVars()
}
\`\`\`

---

## Security Best Practices

1. **Never commit** `.env.local` or any file containing actual keys
2. **Restrict API keys** in production:
   - Firebase: Add authorized domains
   - Google Maps: Restrict to your domain and specific APIs
3. **Rotate keys** if they are ever exposed
4. **Use different keys** for development and production
5. **Monitor usage** in Firebase and Google Cloud consoles

---

## Troubleshooting

### Maps not loading
- Check `GOOGLE_MAPS_API_KEY` is set
- Verify Maps JavaScript API is enabled in Google Cloud Console
- Check browser console for API key errors

### Push notifications not working
- Check `FCM_VAPID_KEY` is set
- Verify Cloud Messaging is enabled in Firebase Console
- Check browser permissions for notifications

### Firebase connection errors
- Check `FIREBASE_API_KEY` is set
- Verify Firebase project is active
- Check Firestore security rules allow access
