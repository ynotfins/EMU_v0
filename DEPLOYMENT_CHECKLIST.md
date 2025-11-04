# 🚀 Deployment Checklist for rebuild.4axe.com

## Prerequisites ✅

- [x] Clean Architecture implementation (90% complete)
- [x] TypeScript errors fixed
- [x] Build passing locally
- [x] vercel.json configured
- [x] Deployment scripts created
- [ ] Vercel CLI installed (`pnpm add -g vercel`)

## Vercel Dashboard Setup 🎛️

### 1. Connect Repository
- [ ] Log in to [Vercel Dashboard](https://vercel.com/dashboard)
- [ ] Import GitHub repository `ynotfins/EMU_v0`
- [ ] Select branch: `rebuild-proper-architecture`

### 2. Configure Build Settings
- [ ] Framework Preset: Next.js
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`

### 3. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

#### Firebase Admin SDK (Required)
- [ ] `FIREBASE_ADMIN_PROJECT_ID`
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` (⚠️ Escape \n as \\n)

#### Firebase Client SDK (Required)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

#### App Configuration
- [ ] `NEXT_PUBLIC_APP_URL` = `https://rebuild.4axe.com`
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 4. GitHub Secrets (for Actions)
Add these in GitHub → Settings → Secrets:
- [ ] `VERCEL_ORG_ID` (from Vercel account settings)
- [ ] `VERCEL_PROJECT_ID` (from Vercel project settings)
- [ ] `VERCEL_TOKEN` (create in Vercel account settings)

## Domain Configuration 🌐

### Cloudflare DNS Setup
1. [ ] Log in to Cloudflare Dashboard
2. [ ] Select your domain (4axe.com)
3. [ ] Add CNAME record:
   ```
   Type: CNAME
   Name: rebuild
   Content: cname.vercel-dns.com
   Proxy Status: Proxied (orange cloud)
   TTL: Auto
   ```

### Vercel Domain Setup
1. [ ] In Vercel Dashboard → Domains
2. [ ] Add domain: `rebuild.4axe.com`
3. [ ] Verify DNS propagation (may take 5-10 minutes)

## Deployment Steps 🚢

### Option 1: Manual Deployment (First Time)
```bash
# 1. Ensure on correct branch
git checkout rebuild-proper-architecture

# 2. Run deployment script
powershell -ExecutionPolicy Bypass -File scripts/deploy-rebuild.ps1

# 3. Choose option 1 (preview) first
# 4. Test the preview URL
# 5. If working, alias to rebuild.4axe.com
```

### Option 2: Automated Deployment
Simply push to `rebuild-proper-architecture` branch:
```bash
git add .
git commit -m "feat: deploy clean architecture"
git push origin rebuild-proper-architecture
```

## Post-Deployment Verification ✨

### Immediate Checks
- [ ] Site loads at https://rebuild.4axe.com
- [ ] SSL certificate active
- [ ] No console errors
- [ ] Environment variables loading

### Functionality Tests
- [ ] Authentication flow (sign in/out)
- [ ] Create test incident
- [ ] Real-time updates working
- [ ] Map functionality
- [ ] Chat system
- [ ] File uploads

### Performance Checks
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No hydration errors

## Monitoring Setup 📊

### Vercel Analytics
- [ ] Enable Analytics in Vercel Dashboard
- [ ] Set up custom events for key actions

### Error Tracking
- [ ] Sentry integration (optional)
- [ ] Custom error logging to Firebase

### Uptime Monitoring
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure alerts for downtime

## Rollback Plan 🔄

If issues occur:
1. Vercel Dashboard → Deployments → Previous deployment → Promote to Production
2. Or: `vercel rollback [deployment-url]`
3. Investigate issues in non-production environment

## Notes 📝

- First deployment may take 5-10 minutes
- DNS propagation can take up to 48 hours (usually < 30 min)
- Keep `main` branch on 4axe.com until fully tested
- Consider A/B testing before full migration

---

**Status**: Ready for deployment! 🚀
