# Production Geocoding Guide - EMU Alerts

Since you're in production with real data, your incidents need lat/lng coordinates for maps to display properly.

## Quick Fix Steps

### 1. Check Current Status

First, check how many incidents need geocoding:

```bash
npm run incidents:check-coords
```

This will show:
- Sample incidents and whether they have coordinates
- Total count of incidents with/without coordinates
- Percentage that needs geocoding

### 2. Add Google Maps API Key (Recommended)

For best geocoding results, add your Google Maps API key to your environment:

**Local Development (.env.local)**:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-api-key-here
```

**Vercel Production**:
1. Go to your Vercel dashboard
2. Project Settings → Environment Variables
3. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with your API key

Without Google Maps API key, the system will use OpenStreetMap (free but less accurate).

### 3. Geocode All Incidents

Run the production geocoding script:

```bash
npm run incidents:geocode:prod
```

This will:
- Find all incidents without lat/lng
- Geocode each address using Google Maps (if API key) or OpenStreetMap
- Save coordinates to Firestore
- Show progress and summary

**Note**: The script has rate limiting (1 request/second) to avoid API limits.

### 4. Verify Maps Are Working

After geocoding:
1. Visit your live map at `/supe/map` or `/chaser/map`
2. Click on any incident to see the details page map
3. Check browser console for debug logs

## Troubleshooting

### Maps Still Show "No Location Data"

1. **Check Browser Console**: Look for logs starting with `[LiveMap]`, `[GoogleMap]`, or `[IncidentDetailTabs]`
2. **Verify Coordinates**: Check if incidents have lat/lng in the console logs
3. **Clear Cache**: Hard refresh the page (Ctrl+Shift+R)

### Geocoding Fails

If geocoding fails for some addresses:
- Check address format (should have street, city, state)
- Try manual geocoding for specific problematic addresses
- Consider using more specific addresses

### API Limits

- **Google Maps**: 40,000 geocodes/month free tier
- **OpenStreetMap**: 1 request/second limit (free, unlimited)

## Real-time Geocoding

The app also geocodes on-demand when:
- Calculating distance to incidents
- User views an incident without coordinates

This ensures new incidents get geocoded automatically.

## No More Test Data

All test/mock data has been removed:
- ✅ Deleted test geocoding script
- ✅ Fixed Live Team Map to use real map
- ✅ Removed all placeholders
- ✅ Using real Google Maps embed API

Your production system now uses only real data and real geocoding services.
