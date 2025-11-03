/**
 * Firebase Client SDK Configuration
 * 
 * Used in Client Components for real-time subscriptions and auth UI.
 * All environment variables must be prefixed with NEXT_PUBLIC_.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getMessaging, isSupported } from 'firebase/messaging';

// Client-safe Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase for client-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth instance for client
export const clientAuth = getAuth(app);

// Firestore instance for client
export const clientDb = getFirestore(app);

// Storage instance for client
export const clientStorage = getStorage(app);

// Realtime Database instance for client
export const clientRealtimeDb = getDatabase(app);

// Messaging instance for client (only in browser)
let clientMessaging: ReturnType<typeof getMessaging> | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      clientMessaging = getMessaging(app);
    }
  });
}

export { clientMessaging };

// Export the app instance
export default app;
