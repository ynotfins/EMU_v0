/**
 * Make j.snap11@yahoo.com a Supe
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize Firebase Admin (reuse existing app if already initialized)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'firebase-admin-key.json'), 'utf8')
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: 'emu-incidents',
  });
}

const db = admin.firestore();

async function makeJSnapSupe() {
  const uid = 'Kfky1lZnisZ21SszzvVkR2w1h172';
  const email = 'j.snap11@yahoo.com';

  console.log(`\n🔄 Updating ${email} to Supe role...`);

  try {
    await db.collection('users').doc(uid).update({
      role: 'supe',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ SUCCESS! ${email} is now a SUPE!`);
  } catch (error: any) {
    console.error(`❌ Error: ${error.message}`);
  }
}

makeJSnapSupe()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

