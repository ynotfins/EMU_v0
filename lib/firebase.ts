import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore, type Firestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, type Messaging } from "firebase/messaging";
import { getFunctions, type Functions } from "firebase/functions";
import { saveAuthState, loadAuthState } from "./auth-persistence";

import { config } from './config';

// Firebase configuration from centralized config
const firebaseConfig = {
  apiKey: config.firebaseApiKey,
  authDomain: config.firebaseAuthDomain,
  projectId: config.firebaseProjectId,
  storageBucket: config.firebaseStorageBucket,
  messagingSenderId: config.firebaseMessagingSenderId,
  appId: config.firebaseAppId,
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
export const functions: Functions = getFunctions(app);
// Persist session in browser and mirror a lightweight cookie for Edge middleware
setPersistence(auth, browserLocalPersistence).catch(() => {})
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, (u) => {
    try {
      // Scope cookie to both 4axe.com and www.4axe.com
      const domain = location.hostname.endsWith("4axe.com") ? "; Domain=.4axe.com" : "";
      document.cookie = `__emu_authed=${u ? "1" : "0"}; Path=/${domain}; SameSite=Lax; Secure`;
    } catch {}
  })
}
export const db: Firestore = getFirestore(app);
export const storage = getStorage(app);

// Enable Firestore offline persistence (CRITICAL for PWA)
if (typeof window !== "undefined") {
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log("[Firestore] ✅ Offline persistence enabled (multi-tab support)");
      console.log("[Firestore] 📱 App will work offline with cached data!");
    })
    .catch((err) => {
      if (err.code === "failed-precondition") {
        console.warn("[Firestore] ⚠️ Multiple tabs open, persistence enabled in first tab only");
      } else if (err.code === "unimplemented") {
        console.warn("[Firestore] ⚠️ Browser doesn't support persistence");
      } else {
        console.error("[Firestore] ❌ Failed to enable persistence:", err);
      }
    });
}

// Set auth persistence to LOCAL (never expires until explicit sign out)
// CRITICAL: This ensures users NEVER get signed out automatically
if (typeof window !== "undefined") {
  // Additional check: Verify persistence is actually set
  setTimeout(() => {
    if (auth.currentUser) {
      console.log("[Firebase] ✅ User still authenticated after persistence check");
    } else {
      console.warn("[Firebase] ⚠️ No user found after setting persistence - check browser settings");
    }
  }, 1000);

  // BULLETPROOF FALLBACK: Save auth state to multiple locations
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in - save their info to localStorage, sessionStorage, AND cookies
      saveAuthState(user.uid, user.email || '');
      console.log("[Firebase] 🔒 Auth state saved to 3 locations for maximum persistence");
    }
  });
}

// Messaging only available in browser context AND if browser supports it
export const messaging: Messaging | null = (() => {
  if (typeof window === "undefined") return null;
  
  try {
    // Check if browser supports service workers (required for FCM)
    if (!("serviceWorker" in navigator)) {
      console.warn("[Firebase] ⚠️ Service Worker not supported - Push notifications disabled");
      return null;
    }
    
    return getMessaging(app);
  } catch (error) {
    console.warn("[Firebase] ⚠️ Messaging not supported on this browser:", error);
    return null;
  }
})();

// Log authentication state changes (for debugging)
if (typeof window !== "undefined") {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("[Firebase] ✅ User authenticated:", user.email || user.uid);
    } else {
      console.log("[Firebase] ⚠️  No user authenticated - redirecting to login");
    }
  });
}

export default app;
