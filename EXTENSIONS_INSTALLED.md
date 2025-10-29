# 🔌 Firebase Extensions - Installed & Configured

## ✅ **YOUR EXTENSIONS:**

You've installed **4 Firebase Extensions** for EMU Alerts:

---

## 1. 🗑️ **Delete User Data**

**By:** Firebase  
**Status:** ✅ Installed & Configured

### What It Does:

Automatically deletes user data when a Firebase Authentication account is deleted (GDPR compliance).

### Configuration:

- **Firestore paths:** `users/{UID}`
- **Storage paths:** `users/{UID}`
- **Delete mode:** Shallow (only specified documents)

### What Gets Deleted:

- User profile documents
- User uploaded files/photos
- User-specific data

### What DOESN'T Get Deleted:

- Favorites/bookmarks (preserved in incident documents)
- Notes (preserved with historical records)
- Incident data (shared, not user-specific)

### Cost:

**FREE** - Only pays for the Firestore deletes (~$0.00002 per deletion)

### Logs:

https://console.firebase.google.com/project/emu-incidents/extensions/instances/delete-user-data

---

## 2. 🖼️ **Resize Images**

**By:** Firebase  
**Status:** ✅ Installed & Configured

### What It Does:

Automatically resizes images uploaded to Cloud Storage.

### Configuration:

- **Storage bucket:** `emu-incidents.firebasestorage.app`
- **Sizes:** `200x200` (thumbnail), `800x800` (display)
- **Delete original:** No (keeps full resolution)
- **Cache control:** `max-age=31536000` (1 year)

### Use Cases:

- Roof damage photos on incidents
- Property images in Docs tab
- User profile pictures
- Any uploaded images

### How It Works:

1. User uploads image to `/incidents/{id}/photos/original.jpg`
2. Extension auto-creates:
   - `/incidents/{id}/photos/original_200x200.jpg`
   - `/incidents/{id}/photos/original_800x800.jpg`
3. Your app can choose which size to display

### Cost:

**~$0.05/month** for 100 images resized

### Logs:

https://console.firebase.google.com/project/emu-incidents/extensions/instances/storage-resize-images

---

## 3. 📍 **Geocode Address in Firestore**

**By:** Google Maps Platform  
**Status:** ✅ Installed & Configured

### What It Does:

Automatically converts incident addresses to latitude/longitude coordinates.

### Configuration:

- **Collection:** `incidents`
- **Address input field:** `address`
- **Latitude output field:** `lat`
- **Longitude output field:** `lng`
- **Google Maps API:** Uses your existing API key

### Use Cases:

- **Map pins** - Show incident location on details page
- **Distance calculation** - "2.3 miles away"
- **Route planning** - Directions to incident
- **Clustering** - Group nearby incidents
- **Geofencing** - Alert chasers in radius

### How It Works:

1. New incident created with `address: "123 Main St, Brooklyn, NY"`
2. Extension calls Google Geocoding API
3. Automatically adds:
   ```javascript
   {
     address: "123 Main St, Brooklyn, NY",
     lat: 40.6782,
     lng: -73.9442
   }
   ```
4. Your map components can now display the location!

### Example Query:

```javascript
// Find incidents within 10 miles
const userLat = 40.7128;
const userLng = -74.006;

// Use lat/lng to calculate distance
incidents.filter((i) => calculateDistance(userLat, userLng, i.lat, i.lng) < 10);
```

### Cost:

- **First $200/month:** FREE (Google Cloud credit)
- **After free tier:** $5 per 1,000 geocodes
- **Your usage:** ~500/month = $2.50

### Backfill Existing Data:

To geocode existing incidents without lat/lng:

```bash
# Run a script to update all incidents
# Extension will automatically geocode them
```

### Logs:

https://console.firebase.google.com/project/emu-incidents/extensions/instances/firestore-geocode-address

---

## 4. ✅ **Validate Address in Firestore**

**By:** Google Maps Platform  
**Status:** ✅ Installed & Configured

### What It Does:

Validates incident addresses using Google Maps Address Validation API.

### Configuration:

- **Collection:** `incidents`
- **Address field:** `address`
- **Validation output field:** `addressValidation`
- **Google Maps API:** Uses your existing API key

### Use Cases:

- **Prevent typos** - "123 Main St" → "123 Main Street"
- **Standardize formats** - Consistent address formats
- **Verify deliverability** - Is this a real address?
- **Get suggestions** - "Did you mean...?"
- **Geocoding enhancement** - Works with Geocode extension

### How It Works:

1. Incident created with `address: "123 main st brooklyn"`
2. Extension validates with Google Maps API
3. Adds validation result:
   ```javascript
   {
     address: "123 main st brooklyn",
     addressValidation: {
       isValid: true,
       formatted: "123 Main Street, Brooklyn, NY 11201",
       confidence: "HIGH",
       components: {
         street: "123 Main Street",
         city: "Brooklyn",
         state: "NY",
         zip: "11201"
       }
     }
   }
   ```

### Validation Levels:

- **HIGH:** Address is verified and deliverable
- **MEDIUM:** Address exists but may have minor issues
- **LOW:** Address format is correct but not verified
- **INVALID:** Address does not exist

### Benefits:

- ✅ Cleaner data in Firestore
- ✅ Better geocoding accuracy
- ✅ Reduced duplicate incidents (same address, different formats)
- ✅ Improved user experience

### Cost:

- **First $200/month:** FREE (Google Cloud credit)
- **After free tier:** $5 per 1,000 validations
- **Your usage:** ~500/month = $2.50

### Logs:

https://console.firebase.google.com/project/emu-incidents/extensions/instances/firestore-validate-address

---

## 💰 **TOTAL COST ESTIMATE:**

| Extension        | Monthly Cost | Free Tier           |
| ---------------- | ------------ | ------------------- |
| Delete User Data | $0           | Always free         |
| Resize Images    | $0.05        | N/A                 |
| Geocode Address  | $2.50        | First $200 free     |
| Validate Address | $2.50        | First $200 free     |
| **TOTAL**        | **$5.05**    | **$0 for 3 months** |

**With Google Cloud free tier:** $0 for the first 3 months!

---

## 📊 **MONITORING YOUR EXTENSIONS:**

### View All Extensions:

https://console.firebase.google.com/project/emu-incidents/extensions

### Check Logs:

1. Go to **Functions** in Firebase Console
2. Find function starting with `ext-[extension-name]-*`
3. Click **"Logs"** to see activity

### Common Log Patterns:

```
✅ [geocode-address] Geocoded 123 Main St → 40.6782, -73.9442
✅ [validate-address] Validated address with HIGH confidence
✅ [resize-images] Created 200x200 thumbnail
✅ [delete-user-data] Deleted data for user abc123
```

### Errors to Watch:

```
❌ [geocode-address] OVER_QUERY_LIMIT - Too many requests
❌ [validate-address] INVALID_ADDRESS - Address not found
❌ [resize-images] File too large (>10MB)
```

---

## 🛠️ **MANAGING YOUR EXTENSIONS:**

### Update Configuration:

```bash
cd D:\github\EMU_v0
firebase ext:update [extension-name]
```

### Uninstall Extension:

```bash
firebase ext:uninstall [extension-name]
```

### View Extension Info:

```bash
firebase ext:info [extension-name]
```

### List All Extensions:

```bash
firebase ext:list
```

---

## 🚀 **USING EXTENSIONS IN YOUR CODE:**

### Geocoding Example:

```typescript
// Your code - just save the address
await addDoc(collection(db, "incidents"), {
  address: "123 Main St, Brooklyn, NY",
  type: "Fire",
  // ... other fields
});

// Extension automatically adds:
// lat: 40.6782
// lng: -73.9442

// Later, read the geocoded data:
const incident = await getDoc(doc(db, "incidents", id));
const { lat, lng } = incident.data();

// Use in map:
<Marker position={{ lat, lng }} />;
```

### Image Resizing Example:

```typescript
// Upload original image
const storageRef = ref(storage, `incidents/${id}/photos/photo.jpg`);
await uploadBytes(storageRef, file);

// Extension automatically creates:
// incidents/{id}/photos/photo_200x200.jpg
// incidents/{id}/photos/photo_800x800.jpg

// Display thumbnail:
<img src={`${baseUrl}/photo_200x200.jpg`} />

// Display full size:
<img src={`${baseUrl}/photo_800x800.jpg`} />
```

---

## 📈 **EXTENSION PERFORMANCE:**

### Geocode Address:

- **Speed:** ~500ms per address
- **Accuracy:** 95%+ (Google Maps quality)
- **Cache:** Results cached in Firestore
- **Retry:** Auto-retries on failure

### Validate Address:

- **Speed:** ~300ms per address
- **Confidence:** HIGH/MEDIUM/LOW/INVALID
- **Auto-correct:** Minor typos fixed automatically
- **Components:** Splits into street, city, state, zip

### Resize Images:

- **Speed:** ~2-5 seconds per image
- **Quality:** JPEG 90%, WebP supported
- **Formats:** JPG, PNG, WEBP, GIF
- **Max size:** 10MB per image

### Delete User Data:

- **Speed:** ~1 second per user
- **Scope:** Firestore + Storage
- **Safety:** Only deletes specified paths
- **Reversible:** No (permanent deletion)

---

## 🎯 **BEST PRACTICES:**

### For Geocoding:

- ✅ Always include city and state in addresses
- ✅ Use consistent address formats
- ✅ Handle missing lat/lng gracefully (some addresses can't be geocoded)
- ❌ Don't geocode partial addresses ("Main St")

### For Address Validation:

- ✅ Show validation feedback to users
- ✅ Suggest corrected addresses
- ✅ Store both original and validated addresses
- ❌ Don't reject LOW confidence addresses (they might be correct)

### For Image Resizing:

- ✅ Upload highest quality original
- ✅ Use thumbnails for lists/previews
- ✅ Use 800x800 for detail views
- ❌ Don't upload images >10MB

### For User Deletion:

- ✅ Warn users before account deletion
- ✅ Export user data before deletion (GDPR)
- ✅ Test deletion flow in development
- ❌ Don't delete shared data (incidents, shared notes)

---

## 🔗 **USEFUL LINKS:**

- **Firebase Extensions Hub:** https://extensions.dev/
- **Geocoding API Docs:** https://developers.google.com/maps/documentation/geocoding
- **Address Validation Docs:** https://developers.google.com/maps/documentation/address-validation
- **Image Processing Docs:** https://firebase.google.com/docs/storage
- **Your Project:** https://console.firebase.google.com/project/emu-incidents

---

## 🎉 **YOU'RE ALL SET!**

Your app now has:

- ✅ Auto-geocoding for all incidents
- ✅ Address validation for data quality
- ✅ Image resizing for performance
- ✅ User data cleanup for compliance

**All extensions are working automatically in the background!**

No code changes needed - they trigger on Firestore writes and Storage uploads.

---

**Last Updated:** October 29, 2025  
**Extensions:** 4 installed  
**Monthly Cost:** ~$5 (free with credits)  
**Status:** Active & Monitoring 🎉
