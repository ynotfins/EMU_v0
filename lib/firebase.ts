import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, signInAnonymously, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getMessaging, type Messaging } from "firebase/messaging"

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB!,
}

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Export Firebase services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage = getStorage(app)

// Messaging only available in browser context
export const messaging: Messaging | null = typeof window !== "undefined" ? getMessaging(app) : null

// Dev bootstrap: ensure we are authenticated so rules allow reads/toggles
if (typeof window !== "undefined") {
  try {
    void signInAnonymously(auth)
  } catch (e) {
    console.warn("[Firebase] Anonymous sign-in failed:", e)
  }
}

export default app
