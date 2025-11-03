import { logError } from "./logger"
import { getUid } from "./dev"
import { initializeApp } from "firebase/app"
import { getFirestore, doc, getDoc } from "firebase/firestore"

export async function testFirebaseAccess() {
  try {
    // Initialize Firebase without Auth (Auth doesn't work well in Node.js)
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB!,
    }
    
    const app = initializeApp(config, "diagnostics-test")
    const db = getFirestore(app)
    
    // Use DEV_UID (no auth in Node.js context)
    const uid = getUid(null)
    
    // Try to read a test document
    const ref = doc(db, "diagnostic", "test")
    const snap = await getDoc(ref)
    
    return { ok: true, uid, message: snap.exists() ? "Firestore read OK (doc exists)" : "Firestore read OK (doc missing)" }
  } catch (e: any) {
    const err = logError(e, "firestore-access")
    return { ok: false, uid: "unknown", message: err.message, code: e?.code || "unknown" }
  }
}
