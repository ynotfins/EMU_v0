# 🚀 QUICK DEPLOY STEPS

## 1️⃣ Cloudflare (5 minutes)
1. Go to https://dash.cloudflare.com
2. Click `4axe.com` → DNS
3. Add record:
   - Type: `CNAME`
   - Name: `rebuild`
   - Target: `cname.vercel-dns.com`
   - Proxy: ON (orange cloud)
4. Save

## 2️⃣ Deploy to Vercel (5 minutes)
Run this command:
```bash
powershell -ExecutionPolicy Bypass -File scripts/deploy-now.ps1
```

When prompted:
- Set up and deploy? → `Y`
- Which scope? → Your account
- Link to existing? → `N`
- Project name? → `emu-rebuild`
- Directory? → Press Enter (.)
- Modify settings? → `N`

## 3️⃣ Environment Variables (10 minutes)
1. Go to https://vercel.com/dashboard
2. Click your project `emu-rebuild`
3. Settings → Environment Variables
4. Add all variables from `.env.local`
   - ⚠️ For `FIREBASE_ADMIN_PRIVATE_KEY`: Replace `\n` with `\\n`

## 4️⃣ Connect Domain (2 minutes)
1. In Vercel → Settings → Domains
2. Add `rebuild.4axe.com`
3. Wait for verification ✅

## 5️⃣ Test Your Site
Visit https://rebuild.4axe.com

---

**Total time: ~20 minutes** 🎉

Having issues? Check `DEPLOYMENT_SETUP_GUIDE.md` for detailed troubleshooting.
