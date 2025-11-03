/**
 * Firebase Admin SDK Configuration
 * 
 * Used in Server Components, Server Actions, and API routes.
 * These credentials must NEVER be exposed to the client.
 */

import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Admin SDK service account configuration
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  // Replace escaped newlines in private key
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK
let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.projectId}-default-rtdb.firebaseio.com`,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.projectId}.appspot.com`,
  });
} else {
  adminApp = getApp();
}

// Admin SDK instances
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export const adminRealtimeDb = getDatabase(adminApp);
export const adminMessaging = getMessaging(adminApp);

// Configure Firestore settings
adminDb.settings({
  ignoreUndefinedProperties: true,
});

// Export the admin app instance
export { adminApp };

// Type exports for convenience
export type AdminAuth = typeof adminAuth;
export type AdminFirestore = typeof adminDb;
export type AdminStorage = typeof adminStorage;
export type AdminDatabase = typeof adminRealtimeDb;
export type AdminMessaging = typeof adminMessaging;
