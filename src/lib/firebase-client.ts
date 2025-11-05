/**
 * Firebase Client SDK
 * 
 * Used ONLY in Client Components for real-time subscriptions and auth UI.
 * All environment variables must be prefixed with NEXT_PUBLIC_.
 * 
 * Verified with Context7: Using latest Firebase JS SDK patterns
 * - persistentLocalCache (not deprecated enableIndexedDbPersistence)
 * - persistentMultipleTabManager for multi-tab support
 * - initializeFirestore with proper settings
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from "firebase/firestore";
import { getStorage, type Storage } from "firebase/storage";
import { getDatabase, type Database } from "firebase/database";
import { getMessaging, type Messaging, isSupported } from "firebase/messaging";

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID_WEB',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with LOCAL persistence (users stay signed in forever)
export const auth: Auth = getAuth(app);

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("[Firebase Client] Auth persistence set to LOCAL");
    })
    .catch((error) => {
      console.error("[Firebase Client] Failed to set persistence:", error);
    });
}

// Initialize Firestore with multi-tab persistent cache (CRITICAL for PWA)
export const db: Firestore = typeof window !== "undefined" 
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  : initializeFirestore(app, {}); // Server-side: empty config

if (typeof window !== "undefined") {
  console.log("[Firebase Client] Offline persistence enabled (multi-tab support)");
}

// Initialize Storage
export const storage: Storage = getStorage(app);

// Initialize Realtime Database (if databaseURL is provided)
export const database: Database | null = firebaseConfig.databaseURL 
  ? getDatabase(app)
  : null;

// Export as rtdb for backward compatibility
export const rtdb = database;

// Initialize Messaging (only in browser context)
export const messaging: Messaging | null = (() => {
  if (typeof window === "undefined") return null;
  
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("[Firebase Client] Service Worker not supported - Push notifications disabled");
      return null;
    }
    
    // Check if messaging is supported before initializing
    isSupported().then((supported) => {
      if (!supported) {
        console.warn("[Firebase Client] Messaging not supported on this browser");
      }
    });
    
    return getMessaging(app);
  } catch (error) {
    console.warn("[Firebase Client] Messaging initialization failed:", error);
    return null;
  }
})();

export default app;

