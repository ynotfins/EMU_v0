#!/usr/bin/env tsx
/**
 * Check incidents for lat/lng coordinates
 * Run: npm run incidents:check-coords
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

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

async function checkCoordinates() {
  console.log('🔍 Checking incident coordinates...\n');
  
  const incidentsRef = collection(db, 'incidents');
  const q = query(incidentsRef, limit(20)); // Check first 20 incidents
  const snapshot = await getDocs(q);
  
  let withCoords = 0;
  let withoutCoords = 0;
  let total = 0;
  
  console.log('Sample incidents:');
  console.log('================\n');
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    total++;
    
    const hasCoords = data.lat !== undefined && data.lng !== undefined;
    if (hasCoords) {
      withCoords++;
    } else {
      withoutCoords++;
    }
    
    console.log(`ID: ${docSnap.id}`);
    console.log(`Address: ${data.address || 'N/A'}`);
    console.log(`City: ${data.city || 'N/A'}, State: ${data.state || 'N/A'}`);
    console.log(`Coordinates: ${hasCoords ? `${data.lat}, ${data.lng}` : 'MISSING'}`);
    console.log(`Type: ${data.type || 'N/A'}`);
    console.log(`Updated: ${data.updatedAt || 'N/A'}`);
    console.log('---\n');
  }
  
  // Get total count
  const allSnapshot = await getDocs(incidentsRef);
  const totalCount = allSnapshot.size;
  
  let totalWithCoords = 0;
  let totalWithoutCoords = 0;
  
  allSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.lat !== undefined && data.lng !== undefined) {
      totalWithCoords++;
    } else {
      totalWithoutCoords++;
    }
  });
  
  console.log('\n=== SUMMARY ===');
  console.log(`Sample (first 20):`);
  console.log(`  ✅ With coordinates: ${withCoords}`);
  console.log(`  ❌ Without coordinates: ${withoutCoords}`);
  console.log(`\nTotal in database:`);
  console.log(`  📊 Total incidents: ${totalCount}`);
  console.log(`  ✅ With coordinates: ${totalWithCoords} (${((totalWithCoords/totalCount)*100).toFixed(1)}%)`);
  console.log(`  ❌ Without coordinates: ${totalWithoutCoords} (${((totalWithoutCoords/totalCount)*100).toFixed(1)}%)`);
  
  if (totalWithoutCoords > 0) {
    console.log(`\n⚠️  ${totalWithoutCoords} incidents need geocoding!`);
    console.log(`Run 'npm run incidents:geocode:prod' to geocode them.`);
  } else {
    console.log(`\n✅ All incidents have coordinates!`);
  }
  
  process.exit(0);
}

checkCoordinates().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
