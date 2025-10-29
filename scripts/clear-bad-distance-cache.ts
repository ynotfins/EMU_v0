/**
 * Clear Bad Distance Cache
 * 
 * Problem: Some incidents have:
 * - lat: null, lng: null
 * - But distanceMi: 5382 (wrong!)
 * 
 * This script clears the bad cached distanceMi values
 * so geocoding will happen fresh.
 */

import 'dotenv/config';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

async function clearBadDistanceCache() {
  console.log('🔍 Finding incidents with bad distance cache...');
  
  const incidentsRef = collection(db, 'incidents');
  const snapshot = await getDocs(incidentsRef);
  
  let fixed = 0;
  let total = 0;
  
  for (const docSnap of snapshot.docs) {
    total++;
    const data = docSnap.data();
    
    // If lat/lng is null but distanceMi exists, clear it
    if ((data.lat === null || data.lat === undefined || 
         data.lng === null || data.lng === undefined) &&
        data.distanceMi !== undefined) {
      
      console.log(`❌ Bad cache found: ${docSnap.id} - distanceMi: ${data.distanceMi}, lat: ${data.lat}, lng: ${data.lng}`);
      
      await updateDoc(doc(db, 'incidents', docSnap.id), {
        distanceMi: null,
        geocodedAt: null
      });
      
      fixed++;
    }
  }
  
  console.log(`\n✅ Done!`);
  console.log(`   Total incidents: ${total}`);
  console.log(`   Fixed: ${fixed}`);
  console.log(`   Clean: ${total - fixed}`);
}

clearBadDistanceCache()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });

