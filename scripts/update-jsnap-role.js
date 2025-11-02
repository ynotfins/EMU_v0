/**
 * Update j.snap11@yahoo.com to Chaser role
 * Run from project root: node --env-file=.env.local scripts/update-jsnap-role.js
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { credential } = require('firebase-admin');
const { readFileSync } = require('fs');
const { join } = require('path');

// Initialize Firebase Admin
let app;
try {
  const serviceAccount = JSON.parse(
    readFileSync(join(process.cwd(), 'firebase-admin-key.json'), 'utf8')
  );
  app = initializeApp({
    credential: credential.cert(serviceAccount),
    projectId: 'emu-incidents',
  });
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

const db = getFirestore(app);

async function updateRole() {
  const uid = 'Kfky1lZnisZ21SszzvVkR2w1h172';
  const email = 'j.snap11@yahoo.com';

  console.log(`\n🔄 Updating ${email} to Chaser role...`);

  try {
    await db.collection('users').doc(uid).update({
      role: 'chaser',
      updatedAt: new Date(),
    });

    console.log(`✅ SUCCESS! ${email} is now a CHASER!`);
    console.log('🔥 User will need to sign out and back in to see changes.\n');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

updateRole()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

