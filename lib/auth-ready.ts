import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
export function waitForAuthReady(): Promise<void> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, () => { unsub(); resolve(); });
  });
}

