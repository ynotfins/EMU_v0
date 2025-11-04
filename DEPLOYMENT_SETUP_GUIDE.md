# 🚀 EMU Deployment Setup Guide - Cloudflare & Vercel

## Current Status
- ✅ Vercel CLI installed
- ✅ vercel.json configured
- ✅ Branch `rebuild-proper-architecture` ready
- ✅ Package.json updated with deploy commands

---

## 🌐 Step 1: Cloudflare DNS Setup

### 1.1 Log in to Cloudflare
Go to https://dash.cloudflare.com

### 1.2 Select Your Domain
Click on `4axe.com` from your domain list

### 1.3 Navigate to DNS Records
Click on "DNS" in the left sidebar

### 1.4 Add CNAME Record
Click "Add record" and enter:
- **Type**: CNAME
- **Name**: `rebuild` (just type "rebuild", not the full domain)
- **Target**: `cname.vercel-dns.com`
- **Proxy status**: Proxied (orange cloud ON)
- **TTL**: Auto

Click "Save"

### 1.5 Verify DNS Setup
DNS propagation typically takes 5-30 minutes.

---

## 🎛️ Step 2: Vercel Dashboard Setup

### 2.1 Link Your Project to Vercel
Run in terminal:
```bash
cd D:\github\EMU_v0
pnpm run deploy:preview
```

When prompted:
1. **Set up and deploy?** → `Y`
2. **Which scope?** → Select your personal account
3. **Link to existing project?** → `N` (first time) or `Y` (if already exists)
4. **What's your project's name?** → `emu-rebuild` (or use existing)
5. **In which directory is your code located?** → `.` (press Enter)
6. **Want to modify these settings?** → `N`

The CLI will create the project and give you URLs.

### 2.2 Connect to GitHub (if not done via CLI)
1. Go to https://vercel.com/dashboard
2. Find your project `emu-rebuild`
3. Go to Settings → Git
4. Connect to GitHub repository `ynotfins/EMU_v0`
5. Set production branch to `rebuild-proper-architecture`

---

## 🔐 Step 3: Environment Variables

### 3.1 Get Your Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your EMU project
3. Go to Project Settings → Service Accounts
4. Click "Generate new private key"
5. Save the JSON file

### 3.2 Add Variables to Vercel
Go to your Vercel project → Settings → Environment Variables

Add these variables (copy values from your `.env.local`):

#### Firebase Admin SDK
- `FIREBASE_ADMIN_PROJECT_ID` → From service account JSON
- `FIREBASE_ADMIN_CLIENT_EMAIL` → From service account JSON
- `FIREBASE_ADMIN_PRIVATE_KEY` → From service account JSON
  ⚠️ **IMPORTANT**: Replace all `\n` with `\\n` in the private key!

#### Firebase Client SDK
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_DATABASE_URL`

#### App Configuration
- `NEXT_PUBLIC_APP_URL` → `https://rebuild.4axe.com`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

---

## 🌍 Step 4: Connect Domain to Vercel

### 4.1 Add Domain in Vercel
1. Go to your project → Settings → Domains
2. Click "Add"
3. Enter: `rebuild.4axe.com`
4. Click "Add"

### 4.2 Verify Configuration
Vercel will check the DNS settings. If you see:
- ✅ "Valid Configuration" → You're good!
- ⚠️ "Invalid Configuration" → Wait for DNS propagation

---

## 🚢 Step 5: Deploy

### Option A: Deploy via CLI
```bash
cd D:\github\EMU_v0
pnpm run deploy:preview
```

Then visit the preview URL and test everything works.

### Option B: Auto-Deploy via Git
```bash
git add .
git commit -m "feat: deploy clean architecture to rebuild.4axe.com"
git push origin rebuild-proper-architecture
```

Vercel will automatically deploy when you push.

---

## ✅ Step 6: Verification

### 6.1 Check Deployment
1. Visit https://rebuild.4axe.com
2. Check for SSL certificate (padlock in browser)
3. Open browser console (F12) - should have no errors

### 6.2 Test Core Features
- [ ] Sign in/out works
- [ ] Can create incidents
- [ ] Real-time updates work
- [ ] Maps load correctly
- [ ] File uploads work

### 6.3 Check Build Logs
Go to Vercel Dashboard → Your Project → Deployments
Click on the latest deployment to see logs.

---

## 🔧 Troubleshooting

### DNS Not Working?
- Check Cloudflare DNS records are saved
- Use https://dnschecker.org to verify propagation
- Wait up to 30 minutes

### Environment Variables Issues?
- Double-check all variables are added in Vercel
- Ensure `FIREBASE_ADMIN_PRIVATE_KEY` has `\\n` not `\n`
- Redeploy after adding variables

### Build Failing?
- Check build logs in Vercel dashboard
- Run `pnpm build` locally to test
- Ensure all dependencies are in package.json

### SSL Certificate Issues?
- Vercel auto-provisions SSL certificates
- May take 10-15 minutes after domain verification
- Check domain settings in Vercel dashboard

---

## 📊 Next Steps

Once deployed successfully:
1. Monitor performance in Vercel Analytics
2. Set up error tracking (optional)
3. Configure deployment notifications
4. Plan migration from 4axe.com to rebuild.4axe.com

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ https://rebuild.4axe.com loads without errors
- ✅ SSL certificate shows as valid
- ✅ Authentication works
- ✅ All features function correctly
- ✅ No TypeScript or build errors

---

**Ready to deploy? Let's start with Step 1: Cloudflare DNS! 🚀**
