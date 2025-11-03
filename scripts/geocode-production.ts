#!/usr/bin/env tsx
/**
 * Geocode all production incidents without lat/lng coordinates
 * Uses real geocoding APIs (Google Maps or OpenStreetMap)
 * Run: npm run incidents:geocode:prod
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { geocodeCache } from '../lib/offline-cache';

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

interface Location {
  lat: number;
  lng: number;
}

// Rate limiting for APIs
let lastRequestTime = 0;
const RATE_LIMIT_MS = 1100; // 1.1 seconds between requests

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();
}

async function geocodeAddress(address: string): Promise<Location | null> {
  console.log(`  📍 Geocoding: ${address}`);
  
  // Check cache first
  const cached = geocodeCache.get(address);
  if (cached) {
    console.log(`    ✅ Found in cache`);
    return { lat: cached.lat, lng: cached.lng };
  }

  await ensureRateLimit();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Try Google Maps API if we have a key
  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log(`    ✅ Google Maps: ${lat}, ${lng}`);
        
        // Save to cache
        geocodeCache.set(address, lat, lng);
        
        return { lat, lng };
      } else if (data.status === 'ZERO_RESULTS') {
        console.log(`    ⚠️  Google Maps: No results found`);
        return null;
      } else {
        console.error(`    ❌ Google Maps error: ${data.status}`);
      }
    } catch (error) {
      console.error(`    ❌ Google Maps error:`, error);
    }
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'EMU-Alerts-App/1.0',
        },
      }
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      console.log(`    ✅ OpenStreetMap: ${lat}, ${lng}`);
      
      // Save to cache
      geocodeCache.set(address, lat, lng);
      
      return { lat, lng };
    }

    console.log(`    ⚠️  OpenStreetMap: No results found`);
    return null;
  } catch (error) {
    console.error(`    ❌ OpenStreetMap error:`, error);
    return null;
  }
}

async function geocodeProductionIncidents() {
  console.log('🌎 Geocoding production incidents...\n');
  
  const incidentsRef = collection(db, 'incidents');
  const snapshot = await getDocs(incidentsRef);
  
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let noAddress = 0;
  
  console.log(`Found ${snapshot.size} total incidents\n`);
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    
    // Skip if already has coordinates
    if (data.lat && data.lng) {
      console.log(`⏭️  ${docSnap.id} - Already has coordinates`);
      skipped++;
      continue;
    }
    
    // Build full address
    const addressParts = [];
    if (data.address) addressParts.push(data.address);
    if (data.city) addressParts.push(data.city);
    if (data.state) addressParts.push(data.state);
    
    if (addressParts.length === 0) {
      console.log(`⚠️  ${docSnap.id} - No address data`);
      noAddress++;
      continue;
    }
    
    const fullAddress = addressParts.join(', ');
    
    // Geocode the address
    const location = await geocodeAddress(fullAddress);
    
    if (location) {
      // Update the document
      try {
        await updateDoc(doc(db, 'incidents', docSnap.id), {
          lat: location.lat,
          lng: location.lng,
          geocodedAt: new Date().toISOString(),
        });
        
        console.log(`    💾 Saved to Firestore\n`);
        updated++;
      } catch (error) {
        console.error(`    ❌ Failed to update Firestore:`, error);
        failed++;
      }
    } else {
      console.log(`    ❌ Failed to geocode\n`);
      failed++;
    }
    
    // Progress update every 10 incidents
    if ((updated + failed + skipped + noAddress) % 10 === 0) {
      console.log(`\n--- Progress: ${updated + failed + skipped + noAddress} / ${snapshot.size} ---\n`);
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`✅ Updated: ${updated} incidents`);
  console.log(`⏭️  Skipped: ${skipped} incidents (already had coordinates)`);
  console.log(`⚠️  No address: ${noAddress} incidents`);
  console.log(`❌ Failed: ${failed} incidents`);
  console.log(`📊 Total: ${snapshot.size} incidents`);
  
  process.exit(0);
}

// Check if we have environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error('❌ Missing Firebase environment variables!');
  console.error('Make sure you have a .env.local file with Firebase config');
  process.exit(1);
}

geocodeProductionIncidents().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
