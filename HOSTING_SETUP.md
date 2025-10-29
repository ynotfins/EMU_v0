# Firebase Hosting & Custom Domain Setup

## 🚀 Deployment Guide

### Step 1: Build Next.js for Static Export

```bash
npm run build
```

This will create an optimized production build in the `out/` directory.

### Step 2: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be deployed to: `https://emu-incidents.web.app`

### Step 3: Add Custom Domain

#### Option A: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/emu-incidents/hosting/sites)
2. Click on your hosting site
3. Click "Add custom domain"
4. Enter your domain (e.g., `emualerts.com`)
5. Follow the verification steps:
   - Add DNS TXT record for verification
   - Add DNS A/CNAME records for connection
6. Wait for SSL certificate provisioning (can take up to 24 hours)

#### Option B: Using Firebase CLI

```bash
firebase hosting:channel:deploy --expires 30d custom-domain
```

### DNS Configuration

Once you have your custom domain, update your DNS provider with these records:

**For apex domain (emualerts.com):**
```
Type: A
Name: @
Value: [IP from Firebase Console]
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: emu-incidents.web.app.
```

**For verification:**
```
Type: TXT
Name: @
Value: [Verification code from Firebase]
```

---

## 🔐 Security & Performance

### Firestore Security Rules

Before going live, **CRITICAL**: Update `firestore.rules` to remove the wide-open access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users only
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Specific rules for incidents
    match /incidents/{incidentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null 
        && (request.resource.data.keys().hasOnly(['notes', 'favoritedBy', 'bookmarkedBy', 'homeownerForm'])
        || request.auth.token.role == 'admin');
      allow delete: if request.auth.token.role == 'admin';
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 30-Day Data Retention

Add a Cloud Function to auto-delete old alerts:

```javascript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const cleanupOldAlerts = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Delete alerts older than 30 days (but keep favorited/bookmarked/noted)
    const oldAlerts = await db.collection('incidents')
      .where('lastTs', '<', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
      .where('favoritedBy', '==', [])
      .where('bookmarkedBy', '==', [])
      .get();
    
    const batch = db.batch();
    oldAlerts.docs.forEach(doc => {
      const data = doc.data();
      // Don't delete if it has notes
      if (!data.notes || data.notes.length === 0) {
        batch.delete(doc.ref);
      }
    });
    
    await batch.commit();
    console.log(`Deleted ${oldAlerts.size} old alerts`);
  });
```

Deploy Cloud Function:
```bash
firebase deploy --only functions
```

---

## 📱 Environment Configuration

### Production Environment Variables

Create `.env.production` for production-specific values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=emu-incidents.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=emu-incidents
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=emu-incidents.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: emu-incidents
```

---

## 📊 Monitoring

### Firebase Performance Monitoring

Already integrated via `@vercel/analytics`. View metrics at:
- https://console.firebase.google.com/project/emu-incidents/performance

### Analytics

Enable Firebase Analytics for user tracking:
```bash
firebase analytics:enable
```

---

## ✅ Pre-Launch Checklist

- [ ] Build app: `npm run build`
- [ ] Test build locally: `npx serve out`
- [ ] Deploy to Firebase: `firebase deploy --only hosting`
- [ ] Add custom domain in Firebase Console
- [ ] Configure DNS records with your domain provider
- [ ] **CRITICAL**: Update Firestore security rules (remove wide-open access)
- [ ] Deploy Cloud Function for 30-day retention
- [ ] Enable Firebase Authentication for user management
- [ ] Test all features on production URL
- [ ] Verify SSL certificate is active
- [ ] Test on mobile devices
- [ ] Set up monitoring alerts

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next out

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Deployment Fails
```bash
# Re-authenticate with Firebase
firebase login --reauth

# Deploy with verbose logging
firebase deploy --only hosting --debug
```

### Custom Domain Not Working
1. Verify DNS records are correct
2. Wait 24-48 hours for DNS propagation
3. Check Firebase Console for status
4. Use https://dnschecker.org to verify DNS

### SSL Certificate Pending
- Can take up to 24 hours
- Ensure DNS A records are correct
- Check Firebase Console for status
- Try removing and re-adding domain

---

## 📞 Support

- Firebase Console: https://console.firebase.google.com/project/emu-incidents
- Firebase Support: https://firebase.google.com/support
- Next.js Docs: https://nextjs.org/docs/app/building-your-application/deploying/static-exports

---

**Last Updated**: 2025-01-29
**Project**: EMU Alerts v0
**Environment**: Production

