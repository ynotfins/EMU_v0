# Google Maps API Setup Guide

This guide explains how to set up the Google Maps Geocoding API for the EMU Alerts app to calculate distances between users and incident locations.

---

## Why Do We Need This?

The app needs to:
1. **Geocode incident addresses** → Get lat/lng coordinates
2. **Calculate distances** → Show "15.3 mi away" for each incident
3. **Cache geocoded addresses** → Only geocode each address once

---

## Cost Analysis

### Google Maps Geocoding API Pricing

| Usage | Monthly Cost |
|-------|--------------|
| **First 28,000 requests** | **FREE** ✅ |
| After 28,000 | $5 per 1,000 |

### Your Expected Usage

With **caching** (each unique address geocoded only once):

| Scenario | Unique Addresses/Mo | Cost |
|----------|---------------------|------|
| **Light usage** | 100 incidents | **$0** |
| **Medium usage** | 1,000 incidents | **$0** |
| **Heavy usage** | 5,000 incidents | **$0** |
| **Extreme usage** | 50,000 incidents | **$110/mo** |

**Recommendation**: You'll stay well within the free tier! 🎉

---

## Alternative: Free OpenStreetMap (No API Key Needed)

The app **already includes a fallback** to OpenStreetMap Nominatim:
- ✅ Completely free
- ✅ No API key required
- ✅ Already configured in `use-location-distance.ts`
- ⚠️ Rate limit: 1 request/second
- ⚠️ Less accurate than Google Maps

**You can skip this entire setup and use OSM!** The app will work fine without a Google Maps API key.

---

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Click **"Select a Project"** → **"New Project"**
3. Project name: `EMU-Alerts` (or anything you prefer)
4. Click **"Create"**
5. Wait for project creation (~30 seconds)

### Step 2: Enable Geocoding API

1. Go to: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
2. Ensure your project (`EMU-Alerts`) is selected in the top dropdown
3. Click **"Enable"**
4. Wait for API activation (~10 seconds)

### Step 3: Create API Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"API key"**
3. Copy the API key (looks like: `AIzaSyD...`)
4. Click **"Restrict Key"** (IMPORTANT for security!)

### Step 4: Restrict API Key (CRITICAL!)

**Application Restrictions:**
1. Choose: **"HTTP referrers (websites)"**
2. Add referrers:
   ```
   https://yourapp.pages.dev/*
   https://yourdomain.com/*
   http://localhost:3000/*
   ```
   
**API Restrictions:**
1. Choose: **"Restrict key"**
2. Select APIs: **Geocoding API** only
3. Click **"Save"**

### Step 5: Add API Key to Environment Variables

#### Local Development:

1. Create/edit `.env.local` in project root:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyD...your-key-here
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

#### Production (Cloudflare Pages):

1. Go to: https://dash.cloudflare.com/
2. Navigate to: **Workers & Pages** → Your deployment
3. Click: **Settings** → **Environment variables**
4. Add variable:
   - **Variable name**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: `AIzaSyD...your-key-here`
   - **Environment**: Production (and Preview if you want)
5. Click **"Save"**
6. Redeploy your app

---

## Testing the Setup

### Test 1: Check API Key is Loaded

Open browser console and run:
```javascript
console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
```

**Expected**: Your API key (or `undefined` if using OSM fallback)

### Test 2: Check Geocoding Works

1. Open incidents list page
2. Open browser console (F12)
3. Look for logs:
   ```
   [geocodeAddress] 🗺️ Geocoding: 123 Main St, City, NY
   [geocodeAddress] ✅ Google Maps result: {lat: 40.7128, lng: -74.0060}
   ```

**If using OSM fallback:**
```
[geocodeAddress] ✅ OSM Nominatim result: {lat: 40.7128, lng: -74.0060}
```

### Test 3: Check Distance Display

1. Grant location permission when prompted
2. Check incident cards show: **"15.3 mi away"**
3. Move to different location (or simulate in DevTools)
4. Distances should update in real-time

---

## Troubleshooting

### "API key not valid. Please pass a valid API key."

**Cause**: API key restrictions or not enabled properly

**Fix**:
1. Check API key restrictions allow your domain
2. Ensure Geocoding API is enabled
3. Wait 5 minutes for changes to propagate
4. Try clearing browser cache

### "You have exceeded your request quota for this API."

**Cause**: Hit the 28,000/month free tier limit (unlikely!)

**Fix**:
1. Enable billing in Google Cloud Console
2. Or wait until next month
3. Or rely on OpenStreetMap fallback

### Geocoding not working at all

**Fix**: The app will automatically fall back to OpenStreetMap Nominatim. No action needed!

### Distance not showing

**Possible causes**:
1. User didn't grant location permission
2. Address couldn't be geocoded
3. Network error

**Check console for errors**:
```javascript
[useLocationDistance] ❌ Location error: User denied Geolocation
[geocodeAddress] ❌ No results from Nominatim
```

---

## Monitoring Usage

### Check API Usage:

1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select: **Geocoding API**
3. View: **Metrics** tab

You'll see:
- Requests per day
- Errors
- Latency

### Set Up Billing Alerts:

1. Go to: https://console.cloud.google.com/billing
2. Click: **Budgets & alerts**
3. Create alert: **$5 threshold**
4. You'll get email if you approach paid tier

---

## Security Best Practices

### ✅ DO:
- Use HTTP referrer restrictions
- Restrict to Geocoding API only
- Set up billing alerts
- Monitor usage regularly

### ❌ DON'T:
- Share API key publicly
- Commit API key to Git (use `.env.local`)
- Use API key on server-side (use `NEXT_PUBLIC_` prefix for client-side only)
- Allow unrestricted API access

---

## Summary

**Recommended Setup**: Skip Google Maps, use OpenStreetMap fallback (already configured!)

**Optional Setup**: Get Google Maps API key for better accuracy (free tier: 28,000 requests/month)

**Your Choice!** Both work great. 🎯

---

## Next Steps

1. ✅ Uninstall broken Firebase Extensions (Geocode Address, Validate Address)
2. ✅ Deploy updated code to Cloudflare Pages
3. ✅ Test distance calculation in production
4. ✅ (Optional) Set up Google Maps API key for better accuracy

**Ready to deploy!** 🚀

