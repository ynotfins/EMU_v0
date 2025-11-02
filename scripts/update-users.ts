// Script to update user profiles
// Run with: npx tsx scripts/update-users.ts

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateUserProfile(email: string, updates: Record<string, any>) {
  try {
    // First, we need to find the user by email
    // Since Firestore doesn't support querying by email easily, we'll need the UID
    // For now, this script assumes you'll provide the UID or we'll search users collection
    
    console.log(`Updating profile for ${email}...`);
    
    // Note: In production, you'd query users collection by email field
    // For now, this is a placeholder - you'll need to run this from Firebase Console
    // or provide the UID
    
    console.log("Updates to apply:", updates);
    console.log("Please run this update manually in Firebase Console or provide UID");
    
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

// Update ynotfins@gmail.com to Tony
async function updateTony() {
  const updates = {
    displayName: "Tony",
    name: "Tony",
    nickname: "Tony",
  };
  await updateUserProfile("ynotfins@gmail.com", updates);
}

// Create/update j.snap11@yahoo.com as Chaser with Lightning Joe name
async function updateLightningJoe() {
  const updates = {
    displayName: "⚡ Lightning Joe ⚡",
    name: "⚡ Lightning Joe ⚡",
    nickname: "⚡ Lightning Joe ⚡",
    role: "chaser",
  };
  await updateUserProfile("j.snap11@yahoo.com", updates);
}

async function main() {
  console.log("Updating user profiles...");
  await updateTony();
  await updateLightningJoe();
  console.log("Done!");
}

main();

