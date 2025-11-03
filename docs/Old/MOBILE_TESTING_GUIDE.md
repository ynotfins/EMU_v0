# 📱 Mobile Testing Guide - Test EMU Alerts on Your Phone

## 🚀 Quick Start: Test on Phone in 2 Minutes

### Method 1: Local Network Testing (Recommended)

**Test your app on phone BEFORE deploying!**

---

## Step 1: Find Your Computer's IP Address (30 seconds)

### On Windows:

1. Open PowerShell or Command Prompt
2. Run:
   ```bash
   ipconfig
   ```
3. Look for **"IPv4 Address"** under your active network
4. Example: `192.168.1.100`

### On Mac/Linux:

```bash
ifconfig | grep "inet "
```

**Write down your IP!** Example: `192.168.1.100`

---

## Step 2: Start Dev Server (10 seconds)

```bash
npm run dev
```

**Default**: http://localhost:3000

---

## Step 3: Configure Next.js for Network Access (1 minute)

### Option A: Update package.json (Permanent)

Edit `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "dev:local": "next dev"
  }
}
```

Restart server:
```bash
npm run dev
```

### Option B: One-Time Command (Temporary)

```bash
npx next dev -H 0.0.0.0
```

---

## Step 4: Open on Phone (30 seconds)

### On Your Phone:

1. **Connect to SAME Wi-Fi** as your computer
2. Open browser (Chrome, Safari, etc.)
3. Go to: `http://YOUR-IP:3000`
   
   **Example**: `http://192.168.1.100:3000`

4. **You should see the app!** 🎉

---

## Step 5: Test GPS Permission (1 minute)

1. Navigate to: `/chaser/incidents`
2. **Browser will ask for location permission**
3. Tap **"Allow"**
4. You should see:
   - ✅ Green banner: "Location enabled • lat, lng"
   - ✅ Distances on each incident: "15.3 mi away"

---

## 🔥 Why This Works

- Your phone and computer are on same network
- Phone can reach computer's IP directly
- **HTTPS NOT required** for localhost/local IPs!
- GPS works on local network testing

---

## 🐛 Troubleshooting

### "Can't reach the server"

**Fixes**:
1. Check Wi-Fi: Phone and computer on SAME network?
2. Check Firewall: Windows may block port 3000
   - Windows Defender → Allow app through firewall
   - Allow Node.js on Private networks
3. Check IP: Run `ipconfig` again (IP may have changed)
4. Try: `http://YOUR-IP:3000` (not https://)

### "Location permission not showing"

**This is normal!** Some mobile browsers ask differently:

**iOS Safari**:
- Settings → Safari → Location Services → Allow

**Android Chrome**:
- Should prompt automatically
- Or: Settings → Site settings → Location → Allow

### "Permission denied automatically"

**Fix**: Clear browser cache/data for that site

**iOS**:
1. Settings → Safari → Advanced → Website Data
2. Find your IP address
3. Swipe left → Delete

**Android**:
1. Chrome → Settings → Site settings
2. Find your IP address
3. Clear & reset

---

## 📱 Testing Checklist

### Test on Phone:

- [ ] App loads on `http://YOUR-IP:3000`
- [ ] Login works
- [ ] Location permission prompt appears
- [ ] Green banner shows after granting permission
- [ ] Distances display on incidents
- [ ] Navigation works (bottom nav)
- [ ] Incident details page works
- [ ] Favorites/bookmarks work
- [ ] Notes save correctly

### Test GPS Features:

- [ ] **Walk around** → Distances update
- [ ] Different incidents show different distances
- [ ] Distance filters work (10mi, 25mi, etc.)
- [ ] Closest incidents appear first (when sorted)

---

## 🌐 Method 2: Deploy to Cloudflare (Production Testing)

**For real production testing:**

1. Follow: `CLOUDFLARE_DEPLOYMENT.md`
2. Deploy to Cloudflare Pages
3. Get URL: `https://emu-v0-xxx.pages.dev`
4. Open on phone anywhere (doesn't need same Wi-Fi!)
5. **HTTPS required for GPS in production!**
   - Cloudflare provides this automatically ✅

---

## 🔒 HTTPS & Location Permission

### Development (localhost or local IP):
- ✅ HTTP works fine
- ✅ No SSL certificate needed
- ✅ GPS permission works

### Production (internet):
- ⚠️ **HTTPS REQUIRED** for GPS!
- Cloudflare/Vercel provide free SSL ✅
- Modern browsers block GPS on HTTP in production

---

## 🎯 Quick Reference

### Your URLs:

**Local Computer**:
```
http://localhost:3000
```

**Your Phone (same Wi-Fi)**:
```
http://YOUR-IP:3000
(example: http://192.168.1.100:3000)
```

**Production (after Cloudflare deploy)**:
```
https://emu-v0-xxx.pages.dev
(or your custom domain)
```

---

## 💡 Pro Tips

### Test Multiple Devices Simultaneously:

1. Open on computer: `http://localhost:3000`
2. Open on phone 1: `http://YOUR-IP:3000`
3. Open on phone 2: `http://YOUR-IP:3000`
4. All see same Firebase data in real-time! 🎉

### Test Different Locations:

1. You test on your phone (your location)
2. Wife tests on her phone (her location)
3. Different distances display for same incidents!

### Simulate Movement (Chrome DevTools):

1. Open Chrome DevTools (F12)
2. Click "..." (three dots) → More tools → Sensors
3. Choose location or enter custom lat/lng
4. Watch distances update!

---

## 🚨 Important Notes

### Location Permission Behavior:

**First Visit**:
- Browser asks for permission
- User must explicitly allow

**Return Visits**:
- Permission remembered
- No prompt shown
- Works immediately

**After Denying**:
- User must manually enable in settings
- Red banner shown with instructions

### Company Device Considerations:

**If using MDM** (Mobile Device Management):
- Can pre-approve location permissions
- Users never see prompt
- Automatic access

**If using personal mode**:
- Each user controls their permission
- Optional feature (app works without it)

---

## 📋 Summary

### Local Testing Steps:
1. Get your computer's IP: `ipconfig`
2. Start dev server: `npm run dev -H 0.0.0.0`
3. Open on phone: `http://YOUR-IP:3000`
4. Grant location permission
5. Test GPS features!

### Production Testing:
1. Deploy to Cloudflare Pages
2. Open URL on any device
3. Grant location permission
4. Test in real world!

**Next**: Deploy to Cloudflare for real-world testing! 🚀

