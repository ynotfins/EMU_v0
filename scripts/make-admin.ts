/**
 * Make a user an admin
 * Usage: npx ts-node scripts/make-admin.ts
 */

// cspell:ignore firestore
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
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

async function _makeAdmin(email: string) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);

    // Find user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`❌ No user found with email: ${email}`);
      console.log("\n💡 Available users:");
      const allUsers = await getDocs(collection(db, "users"));
      allUsers.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${data.email} (role: ${data.role})`);
      });
      return;
    }

    // Update user role to admin
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    console.log(
      `✅ Found user: ${userData.email} (current role: ${userData.role})`
    );
    console.log(`🔄 Updating role to admin...`);

    await updateDoc(doc(db, "users", userDoc.id), {
      role: "admin",
    });

    console.log(`✅ SUCCESS! ${email} is now an admin!`);
    console.log(`\n📝 User details:`);
    console.log(`  ID: ${userDoc.id}`);
    console.log(`  Email: ${userData.email}`);
    console.log(`  Name: ${userData.name}`);
    console.log(`  Role: admin ← UPDATED`);
  } catch (error) {
    console.error("❌ Error making user admin:", error);
  }
}

// Make ynotfins@gmail.com a SUPER ADMIN (not just admin)
async function makeSuperAdmin(email: string) {
  try {
    console.log(`🔍 Searching for user with email: ${email}`);

    // Find user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`❌ No user found with email: ${email}`);
      console.log("\n💡 Available users:");
      const allUsers = await getDocs(collection(db, "users"));
      allUsers.forEach((doc) => {
        const data = doc.data();
        console.log(`  - ${data.email} (role: ${data.role})`);
      });
      return;
    }

    // Update user role to super_admin
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    console.log(
      `✅ Found user: ${userData.email} (current role: ${userData.role})`
    );
    console.log(`🔄 Updating role to super_admin...`);

    await updateDoc(doc(db, "users", userDoc.id), {
      role: "super_admin",
    });

    console.log(`✅ SUCCESS! ${email} is now a SUPER ADMIN!`);
    console.log(`\n📝 User details:`);
    console.log(`  ID: ${userDoc.id}`);
    console.log(`  Email: ${userData.email}`);
    console.log(`  Name: ${userData.name}`);
    console.log(`  Role: super_admin ← UPDATED`);
    console.log(`\n🔥 GOD MODE ACTIVATED!`);
  } catch (error) {
    console.error("❌ Error making user super admin:", error);
  }
}

// Make ynotfins@gmail.com a SUPER ADMIN
makeSuperAdmin("ynotfins@gmail.com");
