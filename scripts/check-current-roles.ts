#!/usr/bin/env tsx
/**
 * Check current user roles in Firestore
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

async function checkRoles() {
  console.log('🔍 Checking current user roles...\n');
  
  const usersSnapshot = await db.collection('users').get();
  
  if (usersSnapshot.empty) {
    console.log('❌ No users found in database\n');
    return;
  }
  
  console.log(`Found ${usersSnapshot.size} users:\n`);
  
  usersSnapshot.forEach(doc => {
    const data = doc.data();
    console.log(`📧 ${data.email || 'No email'}`);
    console.log(`   UID: ${doc.id}`);
    console.log(`   Role: ${data.role || 'NO ROLE SET'}`);
    console.log(`   Display Name: ${data.displayName || data.name || 'None'}`);
    console.log(`   Verified: ${data.verified || false}`);
    if (data.location) {
      console.log(`   📍 Location: ${data.location.lat}, ${data.location.lng} (${data.location.lastUpdated})`);
    }
    if (data.settings) {
      console.log(`   🔧 Tracking: ${data.settings.trackingEnabled || false}`);
    }
    console.log('');
  });
  
  process.exit(0);
}

checkRoles();

