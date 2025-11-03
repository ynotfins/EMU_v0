#!/usr/bin/env tsx
/**
 * Test the map fix by adding a test location to a user profile
 * This simulates what happens when a user enables location tracking
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import serviceAccount from '../firebase-admin-key.json' assert { type: 'json' };

dotenv.config({ path: '.env.local' });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: 'emu-incidents',
});

const db = admin.firestore();

async function addTestLocation() {
  console.log('📍 Adding test location to angryfrogmusic@gmail.com...\n');
  
  // angryfrogmusic's UID (Chaser)
  const uid = 'Wr1VvhnDhlfNB4RlSnIVfunJEyz1';
  
  // Los Angeles coordinates (example)
  const testLocation = {
    lat: 34.0522,
    lng: -118.2437,
    lastUpdated: new Date().toISOString(),
    accuracy: 10,
  };
  
  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      location: testLocation,
      'settings.trackingEnabled': true,
    });
    
    console.log('✅ Test location added to user profile:');
    console.log(`   User: angryfrogmusic@gmail.com`);
    console.log(`   Location: ${testLocation.lat}, ${testLocation.lng}`);
    console.log(`   Timestamp: ${testLocation.lastUpdated}`);
    console.log('\n📊 Expected Result:');
    console.log('   - Live Team Map should now display a map centered on LA');
    console.log('   - Map should show 1 team member online');
    console.log('   - Console should log: "[GoogleMap] ✅ Created map URL for 1 team members"');
    console.log('\n🔍 To verify:');
    console.log('   1. Log in as ynotfins@gmail.com (Supe)');
    console.log('   2. Go to /supe/map or /supe/profile');
    console.log('   3. Live Team Map should show map instead of "no location data"');
    console.log('   4. Badge should show "1 Online"\n');
    
  } catch (error) {
    console.error('❌ Error adding test location:', error);
  }
  
  process.exit(0);
}

addTestLocation();

