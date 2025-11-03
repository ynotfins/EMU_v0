#!/usr/bin/env tsx
/**
 * Set specific user roles
 * ynotfins@gmail.com -> supe
 * angryfrogmusic@gmail.com -> chaser
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import serviceAccount from '../firebase-admin-key.json' assert { type: 'json' };

// Load environment
dotenv.config({ path: '.env.local' });

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: 'emu-incidents',
});

const db = admin.firestore();
const auth = admin.auth();

interface UserRoleUpdate {
  email: string;
  role: 'chaser' | 'supe';
  displayName?: string;
}

const users: UserRoleUpdate[] = [
  { email: 'ynotfins@gmail.com', role: 'supe', displayName: 'Supervisor' },
  { email: 'angryfrogmusic@gmail.com', role: 'chaser', displayName: 'Chaser' },
];

async function setUserRoles() {
  console.log('🔧 Setting user roles...\n');
  
  for (const userData of users) {
    try {
      // Get user by email
      const userRecord = await auth.getUserByEmail(userData.email);
      const uid = userRecord.uid;
      
      console.log(`📧 Processing: ${userData.email}`);
      console.log(`   UID: ${uid}`);
      
      // Update Firestore profile
      const profileRef = db.collection('users').doc(uid);
      await profileRef.set({
        uid,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName || userData.email.split('@')[0],
        verified: true,
        emailVerified: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Remove viewMode field entirely - not needed anymore
      }, { merge: true });
      
      // Update Auth custom claim
      await auth.setCustomUserClaims(uid, { role: userData.role });
      
      console.log(`   ✅ Set role to: ${userData.role}`);
      console.log(`   ✅ Updated Firestore profile`);
      console.log(`   ✅ Updated Auth custom claim\n`);
      
    } catch (error) {
      console.error(`❌ Error processing ${userData.email}:`, error);
    }
  }
  
  console.log('✅ All user roles updated!\n');
  console.log('📋 Summary:');
  console.log('   - ynotfins@gmail.com -> supe (Supervisor)');
  console.log('   - angryfrogmusic@gmail.com -> chaser (Chaser)');
  console.log('\n👤 Users need to log out and log back in for changes to take effect.\n');
  
  process.exit(0);
}

setUserRoles().catch((error) => {
  console.error('❌ Error setting roles:', error);
  process.exit(1);
});

