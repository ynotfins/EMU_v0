#!/usr/bin/env tsx
/**
 * Add lat/lng coordinates to existing incidents for testing
 * Run: npm run incidents:geocode
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Common LA area addresses with real coordinates
const addressCoordinates: Record<string, { lat: number; lng: number }> = {
  "1234 Sunset Blvd": { lat: 34.0835, lng: -118.3659 },
  "5678 Hollywood Blvd": { lat: 34.1016, lng: -118.3356 },
  "I-10 Eastbound at La Cienega": { lat: 34.0351, lng: -118.3760 },
  "456 Main St": { lat: 34.0522, lng: -118.2437 },
  "789 Broadway": { lat: 34.0407, lng: -118.2468 },
  "321 Spring St": { lat: 34.0534, lng: -118.2482 },
  "654 Hope St": { lat: 34.0517, lng: -118.2541 },
  "987 Flower St": { lat: 34.0487, lng: -118.2587 },
  "147 Figueroa St": { lat: 34.0582, lng: -118.2524 },
  "258 Olive St": { lat: 34.0502, lng: -118.2525 },
  "369 Hill St": { lat: 34.0494, lng: -118.2495 },
  "753 Grand Ave": { lat: 34.0492, lng: -118.2546 },
  "159 Temple St": { lat: 34.0537, lng: -118.2453 },
  "852 Alameda St": { lat: 34.0487, lng: -118.2381 },
  "951 San Pedro St": { lat: 34.0398, lng: -118.2569 },
};

// Fallback coordinates for different LA areas
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  "Santa Monica": { lat: 34.0194, lng: -118.4912 },
  "Beverly Hills": { lat: 34.0736, lng: -118.4004 },
  "Long Beach": { lat: 33.7701, lng: -118.1937 },
  "Pasadena": { lat: 34.1478, lng: -118.1445 },
  "Glendale": { lat: 34.1425, lng: -118.2551 },
  "Burbank": { lat: 34.1808, lng: -118.3090 },
  "Torrance": { lat: 33.8358, lng: -118.3406 },
  "Inglewood": { lat: 33.9617, lng: -118.3531 },
  "West Hollywood": { lat: 34.0900, lng: -118.3617 },
};

async function addGeocodes() {
  console.log('🌎 Adding lat/lng coordinates to incidents...');
  
  const incidentsRef = collection(db, 'incidents');
  const snapshot = await getDocs(incidentsRef);
  
  let updated = 0;
  let skipped = 0;
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    
    // Skip if already has coordinates
    if (data.lat && data.lng) {
      console.log(`  ⏭️  Skipped ${docSnap.id} - already has coordinates`);
      skipped++;
      continue;
    }
    
    const address = data.address || "";
    const city = data.city || "Los Angeles";
    
    // Try to find exact address match
    let coords = addressCoordinates[address];
    
    // If no exact match, use city coordinates with some randomization
    if (!coords) {
      const cityCoord = cityCoordinates[city] || cityCoordinates["Los Angeles"];
      // Add some random variation (about 1-2 miles)
      coords = {
        lat: cityCoord.lat + (Math.random() - 0.5) * 0.02,
        lng: cityCoord.lng + (Math.random() - 0.5) * 0.02,
      };
    }
    
    // Update the document
    await updateDoc(doc(db, 'incidents', docSnap.id), {
      lat: coords.lat,
      lng: coords.lng,
      geocodedAt: new Date().toISOString(),
    });
    
    console.log(`  ✅ Updated ${docSnap.id} - ${address} -> ${coords.lat}, ${coords.lng}`);
    updated++;
  }
  
  console.log(`\n✅ Done! Updated ${updated} incidents, skipped ${skipped}`);
  process.exit(0);
}

addGeocodes().catch((error) => {
  console.error('❌ Error adding geocodes:', error);
  process.exit(1);
});
