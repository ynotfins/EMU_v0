# Deployment Setup: rebuild.4axe.com

## Current Status
- **Production**: 4axe.com (main branch) - Old architecture
- **Development**: rebuild.4axe.com - CONFIGURATION IN PROGRESS

### ✅ Completed Setup
- Created `vercel.json` with optimized settings
- Created deployment script (`scripts/deploy-rebuild.ps1`)
- Created GitHub Actions workflow (`.github/workflows/deploy-rebuild.yml`)
- Created comprehensive deployment checklist

## Steps to Set Up rebuild.4axe.com

### 1. Vercel Configuration
1. Log in to Vercel Dashboard
2. Go to Project Settings for `emu-v0`
3. Navigate to "Domains" section
4. Add custom domain: `rebuild.4axe.com`
5. Configure domain settings:
   - Type: Subdomain
   - Branch: `rebuild-proper-architecture`
   - Production: No (Preview only)

### 2. DNS Configuration (Cloudflare)
Add CNAME record:
```
Type: CNAME
Name: rebuild
Content: cname.vercel-dns.com
Proxy: Yes (Orange cloud)
TTL: Auto
```

### 3. Environment Variables
Ensure all environment variables are set for the preview deployment:
```
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_APP_URL=https://rebuild.4axe.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

### 4. Build Configuration
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### 5. Branch Protection
- Set `rebuild-proper-architecture` as a protected branch
- Enable preview deployments for this branch
- Disable auto-merge to main

## Deployment Strategy

### Phase 1: Preview Testing
- Deploy to rebuild.4axe.com
- Test all features
- Gather feedback
- Fix issues

### Phase 2: Staged Rollout
- Create feature flags
- Gradually migrate users
- Monitor performance
- A/B test if needed

### Phase 3: Production Migration
- Merge to main branch
- Update 4axe.com
- Deprecate old code
- Archive old documentation

## Verification Steps

After setup:
1. Push to `rebuild-proper-architecture` branch
2. Check Vercel deployment logs
3. Verify rebuild.4axe.com loads
4. Test authentication flow
5. Verify real-time features
6. Check mobile responsiveness

## Monitoring

### Deployment Health
- Vercel Analytics
- Build success rate
- Deploy time
- Error rate

### Application Health
- Core Web Vitals
- API response times
- WebSocket connections
- Error tracking

## Rollback Plan

If issues arise:
1. Revert to previous commit
2. Vercel instant rollback
3. DNS failover to production
4. Communicate with users

## Notes
- SSL certificate will be auto-provisioned by Vercel
- Preview deployments have 12-hour expiry by default
- Consider upgrading Vercel plan for permanent preview URLs
- Set up deployment notifications in Discord/Slack
