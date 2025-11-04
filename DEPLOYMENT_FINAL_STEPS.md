# 🚀 Final Deployment Steps for rebuild.4axe.com

## Current Status
- ✅ Cloudflare DNS configured
- ✅ Vercel project linked
- ✅ Environment variables set
- 🔄 Deployment building...

## Step 1: Connect Domain in Vercel

1. Go to: https://vercel.com/anthony-coviellos-projects/emu-v0
2. Click **Settings** → **Domains**
3. Click **Add**
4. Enter: `rebuild.4axe.com`
5. Click **Add**

Vercel will verify the DNS configuration (should show ✅ since DNS is already set).

## Step 2: Check Deployment Status

1. Go to the **Deployments** tab
2. Look for the latest deployment (should be building)
3. Click on it to see real-time logs

**Common Build Messages:**
- "Installing dependencies" → Good, it's starting
- "Building application" → Compiling your Next.js app
- "Generating static pages" → Almost done!
- "Deployed" → Success! 🎉

## Step 3: Test Your Deployment

Once deployed, test these URLs:

### A. Preview URL (Available immediately)
```
https://emu-v0-[hash]-anthony-coviellos-projects.vercel.app
```

### B. Custom Domain (May take 5-10 min)
```
https://rebuild.4axe.com
```

## Step 4: Verification Checklist

Test these features on the deployed site:

### 🔐 Authentication
- [ ] Sign up with email/password
- [ ] Sign in
- [ ] Sign out
- [ ] Session persistence

### 📍 Core Features
- [ ] View incidents list
- [ ] Create new incident
- [ ] View incident details
- [ ] Map functionality

### 🔥 Firebase Integration
- [ ] Firestore connection working
- [ ] Real-time updates
- [ ] File uploads (if applicable)

### 📱 Responsive Design
- [ ] Mobile view
- [ ] Tablet view
- [ ] Desktop view

## Troubleshooting

### Domain Not Working?
- Wait 10-15 minutes for DNS propagation
- Check https://dnschecker.org for `rebuild.4axe.com`
- Ensure domain is added in Vercel settings

### Build Failed?
- Check build logs for specific errors
- Most common: Missing env vars (double-check in Vercel)
- Ensure `FIREBASE_ADMIN_PRIVATE_KEY` has `\\n` not `\n`

### 500 Errors?
- Check browser console (F12)
- Verify all environment variables are set
- Check Vercel Function logs

### Authentication Issues?
- Verify Firebase project settings
- Check authorized domains in Firebase Console
- Ensure session cookies are enabled

## Success Indicators

You'll know everything is working when:
- ✅ Site loads at https://rebuild.4axe.com
- ✅ No console errors
- ✅ Can sign in/out successfully
- ✅ Real-time features work
- ✅ SSL certificate shows as valid

## Next Steps

Once deployed successfully:
1. Monitor performance in Vercel Analytics
2. Set up error tracking (optional)
3. Plan migration from old architecture
4. Continue with Phase 4.4 (UI integration)

---

**Deployment URL**: https://rebuild.4axe.com
**Status**: 🔄 In Progress...
