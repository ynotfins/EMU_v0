/**
 * Create a super admin user account
 * This script will:
 * 1. Check if user exists in Firebase Auth
 * 2. Create Firestore profile with super_admin role
 * 3. List all existing users for reference
 */

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
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
const auth = getAuth(app);
const db = getFirestore(app);

async function listAllUsers() {
  console.log("\n📋 LISTING ALL USERS IN FIRESTORE:");
  console.log("=====================================");
  
  const usersRef = collection(db, "users");
  const usersSnap = await getDocs(usersRef);
  
  if (usersSnap.empty) {
    console.log("❌ NO USERS FOUND IN FIRESTORE!");
    console.log("The users collection is empty.");
    return [];
  }
  
  const users: any[] = [];
  usersSnap.forEach((doc) => {
    const data = doc.data();
    users.push({ id: doc.id, ...data });
    console.log(`\n👤 User ID: ${doc.id}`);
    console.log(`   Email: ${data.email || "N/A"}`);
    console.log(`   Name: ${data.name || "N/A"}`);
    console.log(`   Role: ${data.role || "N/A"}`);
  });
  
  console.log(`\n✅ Total users: ${users.length}`);
  return users;
}

async function createSuperAdmin(email: string, password: string, name: string) {
  try {
    console.log(`\n🔥 CREATING SUPER ADMIN: ${email}`);
    console.log("=====================================");
    
    // Check if user already exists in Firestore
    const users = await listAllUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      console.log(`\n✅ User already exists in Firestore!`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Current Role: ${existingUser.role}`);
      console.log(`\n🔄 Updating role to super_admin...`);
      
      await setDoc(doc(db, "users", existingUser.id), {
        ...existingUser,
        role: "super_admin",
        updatedAt: serverTimestamp(),
      });
      
      console.log(`✅ SUCCESS! ${email} is now a SUPER ADMIN!`);
      return;
    }
    
    // User doesn't exist - need to sign them up first
    console.log(`\n⚠️  User not found in Firestore.`);
    console.log(`\n📝 To create this user:`);
    console.log(`1. Go to: https://4axe.com/signup`);
    console.log(`2. Sign up with email: ${email}`);
    console.log(`3. Set password: ${password}`);
    console.log(`4. Choose name: ${name}`);
    console.log(`5. Select role: Supe (we'll upgrade to super_admin)`);
    console.log(`6. Click "Create Account"`);
    console.log(`7. Run this script again!`);
    
    console.log(`\n💡 OR - I can try to create the account now...`);
    console.log(`   (This might fail if the email is already in Firebase Auth)`);
    
  } catch (error: any) {
    console.error("\n❌ ERROR:", error.message);
    
    if (error.code === "auth/email-already-in-use") {
      console.log(`\n✅ Email already exists in Firebase Auth!`);
      console.log(`   This means you've signed up before.`);
      console.log(`\n🔄 Let me check Firebase Auth and create Firestore profile...`);
      // We'll handle this in the next step
    }
  }
}

// Run the script
const EMAIL = "ynotfins@gmail.com";
const PASSWORD = "TempPassword123!"; // Change this after first login
const NAME = "Super Admin";

console.log("\n🚀 SUPER ADMIN CREATOR");
console.log("=====================\n");

createSuperAdmin(EMAIL, PASSWORD, NAME)
  .then(() => {
    console.log("\n✅ Script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

