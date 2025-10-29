# 🚀 Deploy EMU Alerts to 4axe.com - Step by Step

## 📋 What I See from Your Screenshots

✅ **4axe.com is already on Cloudflare** (Domain registered)  
✅ **DNS records exist** (A record → `35.219.200.192`)  
⚠️ **Currently shows "Backend Not Found"** (Old Firebase Hosting attempt)  
✅ **Ready to deploy EMU Alerts** (Clean slate!)

---

## 🎯 The Plan

We're going to:
1. Create a **Cloudflare Pages** project
2. Connect it to your **GitHub repo** (EMU_v0)
3. Point **4axe.com** to the Pages project
4. Deploy your app!

**Result**: `https://4axe.com` will show your EMU Alerts app 🎉

---

## Step 1: Create Cloudflare Pages Project

**Go to**: https://dash.cloudflare.com/

**In the left sidebar**, click **"Workers & Pages"**

**Click**: "Create application" button

**Click**: "Pages" tab at the top

**Click**: "Connect to Git"

---

## Step 2: Connect to GitHub

**Click**: "Connect GitHub"

**Authorize**: Cloudflare (if asked)

**Select repository**: `ynotfins/EMU_v0`

**Click**: "Begin setup"

---

## Step 3: Configure Build Settings

**Project name**: `emu-alerts` (or whatever you like)

**Production branch**: `main`

**Framework preset**: Select "Next.js"

**Build command**: 
```
npm run build
```

**Build output directory**:
```
.next
```

**Root directory**: (leave blank)

**Environment variables**: Click "+ Add variable" for each of these 7:

### Variable 1:
```
Name: NEXT_PUBLIC_FIREBASE_API_KEY
Value: [Copy from D:\github\EMU_v0\.env.local]
```

### Variable 2:
```
Name: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
Value: emu-incidents.firebaseapp.com
```

### Variable 3:
```
Name: NEXT_PUBLIC_FIREBASE_PROJECT_ID
Value: emu-incidents
```

### Variable 4:
```
Name: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
Value: emu-incidents.firebasestorage.app
```

### Variable 5:
```
Name: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
Value: [Copy from .env.local - it's a number]
```

### Variable 6:
```
Name: NEXT_PUBLIC_FIREBASE_APP_ID_WEB
Value: [Copy from .env.local - starts with 1:...:web:...]
```

### Variable 7:
```
Name: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
Value: [Copy from .env.local - starts with AIza...]
```

**Click**: "Save and Deploy"

**Wait**: 3-5 minutes for first build

**You'll get a URL**: `https://emu-alerts-xxx.pages.dev`

**✅ Step 3 complete!** Your app is deployed (but on .pages.dev domain)

---

## Step 4: Connect 4axe.com to Your Pages Project

**In Cloudflare dashboard**, go to your **Pages project** (emu-alerts)

**Click**: "Custom domains" tab

**Click**: "Set up a custom domain"

**Enter**: `4axe.com` (your root domain)

**Click**: "Continue"

**Cloudflare will say**: "Do you want to activate this domain?"

**Click**: "Activate domain"

**Cloudflare will automatically**:
- Create the CNAME record
- Set up SSL certificate
- Configure routing

**Wait**: 2-5 minutes for DNS propagation

---

## Step 5: Clean Up Old DNS Records (Important!)

Your screenshots show an **A record** pointing to `35.219.200.192` (old Firebase Hosting).

**Go to**: Cloudflare → Your account → 4axe.com → DNS → Records

**Find the A record** (Type: A, Name: 4axe.com, Content: 35.219.200.192)

**Delete it** or **Update it**:
- Cloudflare Pages will handle this automatically when you add the custom domain
- If you see conflicts, delete the old A record

**What you should see**:
- CNAME record: `4axe.com` → `emu-alerts-xxx.pages.dev` (or similar)
- Proxy status: Orange cloud (Proxied)

---

## Step 6: Add 4axe.com to Firebase Authorized Domains

**Go to**: https://console.firebase.google.com/project/emu-incidents/authentication/settings

**Scroll to**: "Authorized domains"

**Click**: "Add domain"

**Enter**: `4axe.com`

**Click**: "Add"

**Wait**: 30 seconds

---

## Step 7: Test Your App! 🎉

**On your PC**:
1. Go to: `https://4axe.com`
2. You should see the login page
3. Sign in with your email/password
4. Grant location permission
5. See distances!

**On your phone**:
1. Go to: `https://4axe.com`
2. Sign in
3. Grant location permission
4. **Distances work!** 🎉

---

## ✅ Success Checklist

After deployment:

- [ ] `https://4axe.com` loads (not "Backend Not Found")
- [ ] Can sign in with email/password
- [ ] Can sign in with Google
- [ ] PC shows distances
- [ ] **Phone asks for location permission** ✅
- [ ] **Phone shows distances** ✅
- [ ] All features work
- [ ] No SSL warnings

---

## 🔧 Troubleshooting

### Issue: Still shows "Backend Not Found"

**Cause**: Old Firebase Hosting config or DNS not updated

**Fix**:
1. Check DNS records (should be CNAME to Pages, not A record to Firebase)
2. Wait 5-10 minutes for DNS propagation
3. Clear browser cache (Ctrl+Shift+R)
4. Try incognito mode

---

### Issue: "This site can't provide a secure connection"

**Cause**: SSL certificate still provisioning

**Fix**:
1. Wait 5-10 minutes (SSL takes time)
2. Cloudflare automatically provisions SSL
3. Check Pages project → Custom domains → Should show "Active"

---

### Issue: "Unauthorized domain" when signing in

**Cause**: `4axe.com` not added to Firebase

**Fix**:
1. Go to Firebase Console → Authentication → Settings
2. Authorized domains → Add `4axe.com`
3. Wait 1 minute, try again

---

### Issue: Cloudflare says "Domain already in use"

**Cause**: Old Workers/Pages project using 4axe.com

**Fix**:
1. Go to Workers & Pages
2. Find old project
3. Custom domains → Remove 4axe.com
4. Go back to your new project and add it

---

## 🔄 Auto-Deployments

Every time you push to GitHub:

```bash
git add .
git commit -m "fix: something"
git push
```

**Cloudflare automatically**:
1. Detects the push
2. Runs `npm run build`
3. Deploys to `https://4axe.com`
4. **Live in 2 minutes!**

---

## 📊 What You Get

### Before
- ✅ localhost:3000 (PC only)
- ❌ No HTTPS
- ❌ Can't test on phone
- ❌ Can't share with wife

### After
- ✅ `https://4axe.com` (HTTPS!)
- ✅ PC: Distances work
- ✅ **Phone: Distances work!**
- ✅ Share with wife: "Check out 4axe.com"
- ✅ Professional domain

---

## 💡 Desktop Location - Manual Reset

Your desktop location is now **saved permanently** and **never auto-updates**.

**To update desktop location**:
1. I'll add a "Reset Location" button on the profile page
2. Click it when you move offices
3. It will get a fresh GPS reading
4. Save it for months/years

**For now**: Just grant location permission once, it'll be cached forever on desktop!

---

## 💰 Cost: Still $0

- ✅ Cloudflare Pages: Free
- ✅ Custom domain (4axe.com): Already paid for
- ✅ SSL certificate: Free (auto-provisioned)
- ✅ Unlimited bandwidth: Free
- ✅ 500 builds/month: Free

**Total**: $0/month

---

## 🎯 Next Steps

1. **Deploy now** (follow steps above - 10 minutes)
2. **Test on PC and phone**
3. **Share with wife**: "Check out https://4axe.com"
4. **Celebrate**: You're live on your own domain! 🎉

---

## 📱 Share With Your Wife

**Text her**:
```
Hey! Check out our emergency alerts app:

🔗 https://4axe.com

Login:
📧 Email: [her email]
🔑 Password: [her password]

Make sure to allow location when it asks!
Let me know if distances show up next to each alert.
```

---

## 🚨 Important Notes

1. **Delete the old A record** pointing to Firebase (35.219.200.192)
2. **Use CNAME** to point to your Pages project
3. **Cloudflare handles SSL** automatically
4. **First build takes 5 minutes**, subsequent builds are 2 minutes
5. **DNS propagation** can take 5-10 minutes

---

## ✅ You're Ready!

**Time**: 10 minutes (including DNS propagation wait)  
**Difficulty**: Easy  
**Impact**: 🚀 Your app goes live on **4axe.com**!  

**Let's deploy!** 🎉

---

**Last Updated**: 2025-10-29  
**Domain**: 4axe.com (your existing Cloudflare domain)  
**Status**: Ready to deploy NOW!

