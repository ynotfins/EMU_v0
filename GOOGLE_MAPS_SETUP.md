# 🗺️ Google Maps API Setup for EMU

## ⚠️ Current Issue
The maps are not working on rebuild.4axe.com because:
1. The Google Maps API key is not set in Vercel environment variables
2. The fallback API key in the code is a demo key that doesn't work in production

## 🔧 How to Fix

### Step 1: Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Maps Embed API
   - Geocoding API
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy your API key

### Step 2: Secure Your API Key

1. In Google Cloud Console, click on your API key
2. Under "Application restrictions":
   - Select "HTTP referrers (websites)"
   - Add these referrers:
     ```
     https://rebuild.4axe.com/*
     https://4axe.com/*
     http://localhost:3000/*
     ```
3. Under "API restrictions":
   - Select "Restrict key"
   - Select these APIs:
     - Maps JavaScript API
     - Maps Embed API
     - Geocoding API
4. Save

### Step 3: Add to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `emu-v0` project
3. Go to Settings → Environment Variables
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Value**: Your API key from Step 1
   - **Environment**: Production, Preview, Development
5. Save

### Step 4: Redeploy

1. Go to Deployments tab in Vercel
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

## 🧪 Testing

After deployment, test these pages:
1. Any incident detail page - should show embedded map
2. `/chaser/map` - should show live alerts map
3. `/supe/map` - should show live alerts map

## 🔍 Troubleshooting

### "This page can't load Google Maps correctly"
- Check if API key is set in Vercel
- Verify domain is whitelisted in Google Cloud Console
- Check browser console for specific error messages

### "API key is invalid"
- Make sure you enabled the required APIs (Maps JavaScript, Maps Embed, Geocoding)
- Check if the key has the correct restrictions

### Maps work locally but not in production
- Verify `rebuild.4axe.com` is added to HTTP referrer restrictions
- Make sure environment variable is named exactly `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Redeploy after adding environment variables

## 💡 Quick Fix (Temporary)

If you need maps working immediately and don't have an API key:

1. Create a new API key in Google Cloud Console
2. Don't add any restrictions (temporary only!)
3. Add to Vercel and redeploy
4. Set up proper restrictions after confirming it works

**⚠️ WARNING**: Never commit API keys to code! Always use environment variables.
