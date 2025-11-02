/**
 * Update j.snap11@yahoo.com Firestore document to Chaser role
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'firebase-admin-key.json'), 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

const db = admin.firestore();

async function updateRole() {
  const uid = 'Kfky1lZnisZ21SszzvVkR2w1h172';
  const email = 'j.snap11@yahoo.com';

  console.log(`\n🔄 Updating ${email} Firestore document to Chaser role...`);

  try {
    await db.collection('users').doc(uid).update({
      role: 'chaser',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ SUCCESS! ${email} Firestore document updated to CHASER!`);
    console.log('🔥 User will see changes on next page load.\n');
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

updateRole()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

