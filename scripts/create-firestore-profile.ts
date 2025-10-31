/**
 * Create Firestore profiles for authenticated users
 * This creates the users collection document with proper role
 */

import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), 'firebase-admin-key.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: 'emu-incidents',
});

const db = admin.firestore();

async function createFirestoreProfiles() {
  console.log('\n🔥 CREATING FIRESTORE PROFILES');
  console.log('================================\n');

  // Define users to create
  const usersToCreate = [
    {
      uid: 'oQMSwjt2PmeciUWLLKPypJsZf2h2', // ynotfins@gmail.com
      email: 'ynotfins@gmail.com',
      name: 'Yosef Fins',
      role: 'super_admin',
    },
    {
      uid: 'KfbyTlZna2Z21sszzxVKR2w1h...', // j.snap11@yahoo.com (you need to get full UID)
      email: 'j.snap11@yahoo.com',
      name: 'J Snap',
      role: 'chaser',
    },
    {
      uid: 'PoeF0lGcaHUUO9PD34yeuV...', // kristina41788@gmail.com (you need to get full UID)
      email: 'kristina41788@gmail.com',
      name: 'Kristina',
      role: 'chaser',
    },
  ];

  for (const user of usersToCreate) {
    try {
      console.log(`\n👤 Creating profile for: ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);

      await db.collection('users').doc(user.uid).set({
        id: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`   ✅ Profile created successfully!`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✅ ALL PROFILES CREATED!\n');
}

createFirestoreProfiles()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

