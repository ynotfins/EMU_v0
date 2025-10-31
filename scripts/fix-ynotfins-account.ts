/**
 * Fix ynotfins@gmail.com account
 * Sets proper profile and super_admin role
 * Usage: npx ts-node scripts/fix-ynotfins-account.ts
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAccount() {
  const email = "ynotfins@gmail.com";

  try {
    console.log(`\n🔍 Searching for ${email}...`);

    // Find user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log(`\n❌ No user found with email: ${email}`);
      console.log("ℹ️  User needs to sign in with Google first to create account");
      return;
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const currentData = userDoc.data();

    console.log(`\n✅ Found user: ${userId}`);
    console.log(`   Current role: ${currentData.role}`);
    console.log(`   Current name: ${currentData.name}`);

    // Update to super_admin with proper data
    await setDoc(
      doc(db, "users", userId),
      {
        role: "super_admin",
        nickname: "Yosef",
        name: "Yosef Notfins",
        email: email,
        settings: {
          pushEnabled: true,
          trackingEnabled: true,
          muted: false,
          highAlertSound: "train",
        },
        payout: {
          verified: false,
          cashappHandle: "",
          venmoHandle: "",
        },
        stats: {
          responded: currentData.stats?.responded || 0,
          noted: currentData.stats?.noted || 0,
          daysActive: currentData.stats?.daysActive || 1,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`\n🔥 ✅ ACCOUNT UPDATED!`);
    console.log(`   Role: super_admin (GOD MODE)`);
    console.log(`   Nickname: Yosef`);
    console.log(`   Email: ${email}`);
    console.log(`\n🎉 Sign out and sign back in to see changes!`);
  } catch (error) {
    console.error("\n❌ Error:", error);
  }
}

fixAccount().then(() => {
  console.log("\n✅ Script complete");
  process.exit(0);
});

