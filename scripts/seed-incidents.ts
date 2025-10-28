#!/usr/bin/env tsx
/**
 * Seed Firestore with test incidents
 * Run: npm run incidents:seed
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testIncidents = [
  {
    incidentNumber: 1234567,
    type: "Working Fire",
    message: "Structure fire with heavy smoke showing",
    address: "1234 Sunset Blvd",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 2.3,
    updatedAt: new Date(),
    favoritedBy: [],
    bookmarkedBy: [],
  },
  {
    incidentNumber: 1234568,
    type: "Medical Emergency",
    message: "Cardiac arrest - CPR in progress",
    address: "5678 Hollywood Blvd",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 4.1,
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    favoritedBy: [],
    bookmarkedBy: [],
  },
  {
    incidentNumber: 1234569,
    type: "Vehicle Accident",
    message: "Multi-vehicle collision on I-10",
    address: "I-10 Eastbound at La Cienega",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 6.8,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    favoritedBy: [],
    bookmarkedBy: [],
  },
];

async function seedIncidents() {
  console.log('🌱 Seeding Firestore with test incidents...');
  
  const batch = writeBatch(db);
  const incidentsRef = collection(db, 'incidents');

  for (const incident of testIncidents) {
    const docRef = doc(incidentsRef);
    batch.set(docRef, incident);
    console.log(`  ✅ Added incident #${incident.incidentNumber}`);
  }

  await batch.commit();
  console.log('✅ Done! Refresh your app to see incidents.');
  process.exit(0);
}

seedIncidents().catch((error) => {
  console.error('❌ Error seeding data:', error);
  process.exit(1);
});

