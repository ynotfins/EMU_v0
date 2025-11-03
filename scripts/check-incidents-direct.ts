#!/usr/bin/env tsx
/**
 * Check incidents directly with proper environment loading
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

// Now import Firebase after env vars are loaded
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB,
};

console.log('🔍 Checking incidents with proper env loading...\n');
console.log('Firebase Project:', firebaseConfig.projectId || 'NOT SET');
console.log('Google Maps API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'FOUND' : 'NOT FOUND');
console.log('---\n');

if (!firebaseConfig.projectId) {
  console.error('❌ Firebase configuration missing! Check .env.local file');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkIncidents() {
  try {
    const incidentsRef = collection(db, 'incidents');
    const q = query(incidentsRef, orderBy('updatedAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} recent incidents:\n`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id}`);
      console.log(`Type: ${data.type || 'N/A'}`);
      console.log(`Address: ${data.address || 'N/A'}, ${data.city || 'N/A'}, ${data.state || 'N/A'}`);
      console.log(`Has Coordinates: ${data.lat && data.lng ? `Yes (${data.lat}, ${data.lng})` : 'NO'}`);
      console.log(`Updated: ${data.updatedAt || 'N/A'}`);
      console.log('---\n');
    });

    // Count totals
    const allSnapshot = await getDocs(incidentsRef);
    let withCoords = 0;
    let withoutCoords = 0;
    
    allSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.lat && data.lng) {
        withCoords++;
      } else {
        withoutCoords++;
      }
    });
    
    console.log('=== SUMMARY ===');
    console.log(`Total incidents: ${allSnapshot.size}`);
    console.log(`✅ With coordinates: ${withCoords}`);
    console.log(`❌ Without coordinates: ${withoutCoords}`);
    
    if (withoutCoords > 0) {
      console.log(`\n⚠️  ${withoutCoords} incidents need geocoding!`);
      console.log(`Google Maps API Key: ${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'FOUND - Will use Google Maps' : 'NOT FOUND - Will use OpenStreetMap'}`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching incidents:', error);
  }
  
  process.exit(0);
}

checkIncidents();
