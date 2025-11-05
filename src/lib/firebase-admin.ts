/**
 * Firebase Admin SDK
 * 
 * Used ONLY in Server Components, Server Actions, and API Routes.
 * These credentials must NEVER be exposed to the client.
 * 
 * Verified with Context7: Using latest Firebase Admin SDK patterns
 */

import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';
import { getDatabase, type Database } from 'firebase-admin/database';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

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
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
  // Replace escaped newlines in private key
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin SDK (singleton pattern)
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
export const adminAuth: Auth = getAuth(adminApp);
export const adminDb: Firestore = getFirestore(adminApp);
export const adminStorage: Storage = getStorage(adminApp);
export const adminRealtimeDb: Database = getDatabase(adminApp);
export const adminMessaging: Messaging = getMessaging(adminApp);

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

