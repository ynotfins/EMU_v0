#!/usr/bin/env tsx
/**
 * Seed Firestore using Admin SDK
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment
dotenv.config({ path: '.env.local' });

// Initialize Admin SDK
const serviceAccount = require('../firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'emu-incidents',
});

const db = admin.firestore();

const testIncidents = [
  {
    incidentNumber: 1234567,
    type: "Working Fire",
    message: "Structure fire with heavy smoke showing. Multiple units responding.",
    address: "1234 Sunset Blvd",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 2.3,
    updatedAt: admin.firestore.Timestamp.now(),
    favoritedBy: [],
    bookmarkedBy: [],
  },
  {
    incidentNumber: 1234568,
    type: "Medical Emergency",
    message: "Cardiac arrest - CPR in progress. Ambulance en route.",
    address: "5678 Hollywood Blvd",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 4.1,
    updatedAt: admin.firestore.Timestamp.now(),
    favoritedBy: [],
    bookmarkedBy: [],
  },
  {
    incidentNumber: 1234569,
    type: "Vehicle Accident",
    message: "Multi-vehicle collision on I-10. Traffic backed up. Injuries reported.",
    address: "I-10 Eastbound at La Cienega",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 6.8,
    updatedAt: admin.firestore.Timestamp.now(),
    favoritedBy: [],
    bookmarkedBy: [],
  },
  {
    incidentNumber: 1234570,
    type: "Hazmat",
    message: "Chemical spill reported. Hazmat team dispatched. Area being evacuated.",
    address: "789 Industrial Way",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 8.2,
    updatedAt: admin.firestore.Timestamp.now(),
    favoritedBy: [],
    bookmarkedBy: [],
  },
  {
    incidentNumber: 1234571,
    type: "Rescue",
    message: "Person trapped in elevator. Fire department responding.",
    address: "456 Office Tower Blvd",
    city: "Los Angeles",
    county: "Los Angeles",
    state: "CA",
    distanceMi: 3.5,
    updatedAt: admin.firestore.Timestamp.now(),
    favoritedBy: [],
    bookmarkedBy: [],
  },
];

async function seedIncidents() {
  console.log('🌱 Seeding Firestore with test incidents using Admin SDK...\n');
  
  const batch = db.batch();
  const incidentsRef = db.collection('incidents');

  for (const incident of testIncidents) {
    const docRef = incidentsRef.doc();
    batch.set(docRef, incident);
    console.log(`  ✅ Added: ${incident.type} - ${incident.address}`);
  }

  await batch.commit();
  console.log('\n✅ SUCCESS! Added', testIncidents.length, 'test incidents to Firestore.');
  console.log('🔄 Refresh your app at http://localhost:3000 to see them!\n');
  
  process.exit(0);
}

seedIncidents().catch((error) => {
  console.error('❌ Error seeding data:', error);
  process.exit(1);
});

