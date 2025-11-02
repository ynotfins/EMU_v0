import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

let ready: Promise<string|null> | null = null;

/** Resolves once Firebase emits an auth state (uid or null). */
export function waitForAuthReady(): Promise<string|null> {
  if (ready) return ready;
  ready = new Promise((resolve) => {
    const stop = onAuthStateChanged(auth, (u) => {
      stop();
      resolve(u?.uid ?? null);
    });
  });
  return ready;
}

