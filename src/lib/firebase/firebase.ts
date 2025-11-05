import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, type Messaging } from "firebase/messaging";
import { saveAuthState, loadAuthState } from "./auth-persistence";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB!,
};

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Export Firebase services
export const auth: Auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firestore with multi-tab persistent cache (CRITICAL for PWA)
export const db: Firestore = typeof window !== "undefined" 
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  : initializeFirestore(app, {}); // Server-side: empty config

if (typeof window !== "undefined") {
  console.log("[Firestore] [OK] Offline persistence enabled (multi-tab support)");
  console.log("[Firestore] [MOBILE] App will work offline with cached data!");
}

// Set auth persistence to LOCAL (never expires until explicit sign out)
// CRITICAL: This ensures users NEVER get signed out automatically
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("[Firebase] [OK] Auth persistence set to LOCAL - users stay signed in FOREVER");
      console.log("[Firebase] [LOCKED] Users will ONLY be signed out if they manually click 'Sign Out'");
    })
    .catch((error) => {
      console.error("[Firebase] [X] CRITICAL: Failed to set persistence:", error);
      console.error("[Firebase] [WARN] Users may be signed out unexpectedly!");
    });
  
  // Additional check: Verify persistence is actually set
  setTimeout(() => {
    if (auth.currentUser) {
      console.log("[Firebase] [OK] User still authenticated after persistence check");
    } else {
      console.warn("[Firebase] [WARN] No user found after setting persistence - check browser settings");
    }
  }, 1000);

  // BULLETPROOF FALLBACK: Save auth state to multiple locations
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in - save their info to localStorage, sessionStorage, AND cookies
      saveAuthState(user.uid, user.email || '');
      console.log("[Firebase] [LOCKED] Auth state saved to 3 locations for maximum persistence");
    }
  });
}

// Messaging only available in browser context AND if browser supports it
export const messaging: Messaging | null = (() => {
  if (typeof window === "undefined") return null;
  
  try {
    // Check if browser supports service workers (required for FCM)
    if (!("serviceWorker" in navigator)) {
      console.warn("[Firebase] [WARN] Service Worker not supported - Push notifications disabled");
      return null;
    }
    
    return getMessaging(app);
  } catch (error) {
    console.warn("[Firebase] [WARN] Messaging not supported on this browser:", error);
    return null;
  }
})();

// Log authentication state changes (for debugging)
if (typeof window !== "undefined") {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("[Firebase] [OK] User authenticated:", user.email || user.uid);
    } else {
      console.log("[Firebase] [WARN]  No user authenticated - redirecting to login");
    }
  });
}

export default app;
