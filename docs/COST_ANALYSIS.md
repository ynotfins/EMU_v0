# EMU Alerts - Cost Analysis for 100 Alerts/Day

## Current API Usage

### Google Maps Geocoding API
**What it does**: Converts address → lat/lng coordinates

**Pricing**: 
- First 200 requests/month: **FREE**
- $5.00 per 1,000 requests after that

**Our Usage**:
- **ONE-TIME per unique address** (cached in Firestore)
- 100 new alerts/day = 100 unique addresses/day (assuming all unique)
- 100 × 30 days = 3,000 addresses/month

**Reality Check**:
- Many alerts are for **same addresses** (repeating locations)
- We **cache lat/lng in Firestore** after first geocode
- Updates for same address = **0 additional API calls**
- Estimated unique addresses: ~30-50/day (1,000-1,500/month)

**Monthly Cost**:
- 200 free requests
- 1,500 - 200 = 1,300 paid requests
- 1,300 × $5 / 1,000 = **$6.50/month**

**Best case** (if 50% are repeat addresses):
- 750 unique addresses/month
- 750 - 200 = 550 paid
- 550 × $5 / 1,000 = **$2.75/month**

---

### Firebase Services
**What we use**: Firestore, Storage, Authentication, Hosting

**Pricing**: 
- Firestore: 50K reads/day, 20K writes/day FREE
- Storage: 5GB storage, 1GB/day download FREE
- Authentication: Unlimited for email/password & Google Sign-In FREE

**Our Usage** (100 alerts/day):
- **Writes**: 
  - 100 new alerts = 100 writes
  - ~300 updates/day = 300 writes
  - Total: 400 writes/day (well under 20K free)
  
- **Reads**:
  - 10 users × 100 alerts viewed = 1,000 reads/day
  - Updates: 10 users × 300 = 3,000 reads/day
  - Total: 4,000 reads/day (well under 50K free)

- **Storage**:
  - Alerts + updates text: ~1MB/month
  - Images (if any): ~100MB/month
  - Total: ~100MB (well under 5GB free)

**Monthly Cost**: **$0** (within free tier)

---

### Cloudflare Pages (Hosting)
**What it does**: Hosts the Next.js app with HTTPS

**Pricing**: 
- FREE tier: 500 builds/month, unlimited bandwidth
- Perfect for our use case

**Monthly Cost**: **$0**

---

## Total Monthly Cost Estimate

| Service | Best Case | Worst Case |
|---------|-----------|------------|
| Google Maps Geocoding | $2.75 | $6.50 |
| Firebase (all services) | $0 | $0 |
| Cloudflare Pages | $0 | $0 |
| **TOTAL** | **$2.75/month** | **$6.50/month** |

---

## Cost Optimization Strategies

### ✅ Already Implemented:
1. **Cache lat/lng in Firestore** - Only geocode once per unique address
2. **Batch processing** - Process 5 addresses at a time
3. **Lazy loading** - Only geocode visible incidents
4. **Client-side calculation** - Distance calculation is free (Haversine formula)
5. **5-minute location cache** - Reduces browser geolocation requests

### 🎯 Additional Optimizations (if needed):
1. **Weekly cleanup** - Remove stale alerts > 30 days
2. **Dedupe addresses** - Check if address already geocoded before API call
3. **Fallback to OpenStreetMap** - Free alternative (already implemented as backup)
4. **Rate limiting** - Prevent excessive API calls

---

## Scaling Projections

### 500 Alerts/Day (5x growth)
- Unique addresses: ~5,000/month
- Google Maps cost: (5,000 - 200) × $5 / 1,000 = **$24/month**
- Firebase: Still free (25K writes/day under limit)
- **Total**: ~$24/month

### 1,000 Alerts/Day (10x growth)
- Unique addresses: ~10,000/month
- Google Maps cost: (10,000 - 200) × $5 / 1,000 = **$49/month**
- Firebase: Still free (under limits)
- **Total**: ~$49/month

---

## Cost Breakdown by Feature

| Feature | API Used | Cost Impact |
|---------|----------|-------------|
| Show distance | Google Maps (one-time) | $0.005/address |
| User location | Browser Geolocation API | $0 (free) |
| Distance calculation | Haversine formula | $0 (client-side) |
| Real-time updates | Firebase Firestore | $0 (within free tier) |
| Store alerts | Firebase Firestore | $0 (within free tier) |
| Authentication | Firebase Auth | $0 (free) |
| File uploads | Firebase Storage | $0 (within free tier) |
| Hosting | Cloudflare Pages | $0 (free) |

---

## ⚠️ Important Notes

1. **Caching is Critical**: Without Firestore caching, costs would be 30x higher!
2. **OpenStreetMap Fallback**: If Google Maps fails, we use free Nominatim API
3. **Phone Location**: HTTPS required (Cloudflare provides free)
4. **No Surprise Bills**: Firebase won't charge without explicit upgrade

---

## Recommended Budget

**Month 1-3** (100 alerts/day): Budget $10/month  
**Month 4-6** (200-300 alerts/day): Budget $20/month  
**After 6 months** (500+ alerts/day): Budget $30-50/month

**Current Reality**: Probably **$3-7/month** for foreseeable future

---

**Last Updated**: October 29, 2025  
**Status**: ✅ Extremely cost-effective at current scale

