import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging } from "firebase/messaging";
import { saveAuthState } from "./auth-persistence";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

export const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

function createFirestore() {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch (error) {
    // Persistence already initialized, return existing instance
    return getFirestore(app);
  }
}

export const db = createFirestore();

// Setup auth persistence (client-side only)
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("✅ Firebase Auth: Persistence enabled"))
  .catch((error) => console.error("❌ Firebase Auth: Persistence failed", error));

// Monitor auth state and save to multiple storage locations for reliability
onAuthStateChanged(auth, (user) => {
  if (user) {
    saveAuthState(user.uid, user.email || "");
    console.log("✅ Firebase Auth: User session saved", user.email);
  } else {
    console.log("ℹ️  Firebase Auth: No active session");
  }
});

// Initialize Messaging (optional, only if supported)
let messagingInstance = null;
try {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    messagingInstance = getMessaging(app);
    console.log("✅ Firebase Messaging: Initialized");
  }
} catch (error) {
  console.log("ℹ️  Firebase Messaging: Not available");
}

export const messaging = messagingInstance;

export default app;
