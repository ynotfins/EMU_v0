/**
 * Create Firestore profiles for authenticated users
 * YOLO MODE - Just do it!
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(process.cwd(), 'firebase-admin-key.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: 'emu-incidents',
});

const db = admin.firestore();

async function createAllUsers() {
  console.log('\n🔥 CREATING ALL USER PROFILES');
  console.log('================================\n');

  const users = [
    {
      uid: 'oOMSwjtZPmcIUWlLLkPypuSPO5d2',
      email: 'ynotfins@gmail.com',
      name: 'Yosef Fins',
      role: 'super_admin',
      firstName: 'Yosef',
      lastName: 'Fins',
      phone: '',
    },
    {
      uid: 'Kfky1lZnisZ21SszzvVkR2w1h172',
      email: 'j.snap11@yahoo.com',
      name: 'J Snap',
      role: 'chaser',
      firstName: 'J',
      lastName: 'Snap',
      phone: '',
    },
    {
      uid: 'PoeFDfGcaHUUOr3PQ3dyauVQzi23',
      email: 'kristina41788@gmail.com',
      name: 'Kristina',
      role: 'chaser',
      firstName: 'Kristina',
      lastName: '',
      phone: '',
    },
  ];

  for (const user of users) {
    try {
      console.log(`\n👤 Creating: ${user.email}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Role: ${user.role.toUpperCase()}`);

      await db.collection('users').doc(user.uid).set({
        id: user.uid,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        settings: {
          muted: false,
          highAlertSound: 'train',
        },
      });

      console.log(`   ✅ CREATED!`);
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n🎉 ALL PROFILES CREATED!\n');
  console.log('✅ ynotfins@gmail.com → SUPER ADMIN (GOD MODE)');
  console.log('✅ j.snap11@yahoo.com → CHASER');
  console.log('✅ kristina41788@gmail.com → CHASER');
  console.log('\n🚀 NOW GO TO: https://4axe.com/admin\n');
}

createAllUsers()
  .then(() => {
    console.log('✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

