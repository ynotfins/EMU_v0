# 🚀 Deploy EMU Alerts to Vercel (WORKS WITH NEXT.JS 16!)

## ✅ Why Vercel?
- **Perfect Next.js 16 support** (Vercel created Next.js!)
- **Zero configuration** - just connect GitHub
- **Free custom domain** (use 4axe.com)
- **Instant SSR** for dynamic routes
- **2-minute setup**

---

## 📋 Step-by-Step Deployment

### Step 1: Create Vercel Account
1. Go to: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

---

### Step 2: Import Project
1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find **"EMU_v0"** in your repository list
3. Click **"Import"**

---

### Step 3: Configure Build Settings
Vercel will auto-detect Next.js! Just verify:

**Framework Preset**: `Next.js` ✅ (auto-detected)
**Build Command**: `npm run build` ✅ (auto-detected)
**Output Directory**: `.next` ✅ (auto-detected)
**Install Command**: `npm install` ✅ (auto-detected)

---

### Step 4: Add Environment Variables
Click **"Environment Variables"**, add these:

| Name | Value | Where to Find |
|------|-------|---------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key | Firebase Console → Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `emu-incidents.firebaseapp.com` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `emu-incidents` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `emu-incidents.firebasestorage.app` | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Sender ID | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your App ID | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Your Measurement ID | Firebase Console (optional) |
| `NEXT_PUBLIC_VAPID_KEY` | Your VAPID Key | Firebase Console → Cloud Messaging |

**All values from**: `docs/ENV.md` or Firebase Console

---

### Step 5: Deploy!
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Vercel will give you a URL like: `https://emu-v0.vercel.app`

---

### Step 6: Add Custom Domain (4axe.com)
1. In your Vercel project, go to **"Settings"** → **"Domains"**
2. Add domain: `4axe.com`
3. Vercel will show DNS settings:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
   AND
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. Go to **Cloudflare DNS** for 4axe.com:
   - **Delete** the existing A record (if any)
   - **Delete** the existing CNAME for www (if any)
   - **Add** new A record: `@ → 76.76.21.21`
   - **Add** new CNAME: `www → cname.vercel-dns.com`
   - **Set Proxy Status**: 🟠 **DNS only** (turn OFF orange cloud)

5. Back in Vercel, wait 1-2 minutes
6. Vercel will verify and issue SSL certificate
7. **Done!** 🎉

---

### Step 7: Add to Firebase Authorized Domains
1. Go to Firebase Console: **https://console.firebase.google.com**
2. Select **"EMU_incidents"** project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add these domains:
   - `emu-v0.vercel.app` (or whatever Vercel gave you)
   - `4axe.com`
   - `www.4axe.com`

---

## ✅ Testing

Once deployed, test:

1. **Visit**: `https://emu-v0.vercel.app` (or `https://4axe.com`)
2. **Sign in** with Google or Email/Password
3. **Grant location** permission
4. **See alerts** with distances
5. **Test on phone** too!

---

## 🔧 Automatic Deployments

**Every time you push to GitHub**:
- Vercel automatically builds and deploys
- No manual steps needed!
- Live in ~2 minutes

---

## 💰 Cost

**FREE!** Includes:
- ✅ Unlimited deployments
- ✅ Custom domain (4axe.com)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless Functions
- ✅ Real-time logs

---

## 🆚 Vercel vs Cloudflare for Next.js 16

| Feature | Vercel | Cloudflare Pages |
|---------|--------|------------------|
| Next.js 16 Support | ✅ Perfect | ⚠️ Limited/Broken |
| SSR & Dynamic Routes | ✅ Native | ❌ Requires adapter |
| Setup Time | 2 min | Complex |
| Configuration | Zero | Lots |
| Cost | Free | Free |

**Winner**: **VERCEL** 🏆

---

## 🎯 Summary

1. Sign up: https://vercel.com/signup
2. Import EMU_v0 from GitHub
3. Add environment variables
4. Deploy
5. Add 4axe.com custom domain
6. Update Firebase authorized domains
7. **DONE!** 🚀

**Vercel = Made for Next.js = Zero Issues!**

