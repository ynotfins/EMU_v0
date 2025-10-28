import { logError } from "./logger"
import { getUid } from "./dev"
import { auth, db } from "./firebase"
import { doc, getDoc } from "firebase/firestore"

export async function testFirebaseAccess() {
  try {
    const uid = getUid(auth.currentUser?.uid)
    const ref = doc(db, "diagnostic", "test")
    const snap = await getDoc(ref)
    return { ok: snap.exists(), uid, message: "Firestore read OK" }
  } catch (e) {
    const err = logError(e, "firestore-access")
    return { ok: false, message: err.message }
  }
}

