import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";

/** Ensure a Firebase user exists before protected actions. Throws on failure. */
export async function ensureAuthed(): Promise<string> {
  const user = auth.currentUser;
  if (user?.uid) return user.uid;
  // Try to recover silently first
  const uid = await new Promise<string>((resolve, reject) => {
    const stop = onAuthStateChanged(auth, (u) => {
      stop();
      if (u?.uid) resolve(u.uid); else reject(new Error("not-authed"));
    });
  }).catch(() => "");
  if (uid) return uid;
  // Interactive fallback
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  if (!res.user?.uid) throw new Error("auth-failed");
  return res.user.uid;
}

export function onAuth(cb: (uid:string|null)=>void) {
  return onAuthStateChanged(auth, (u)=> cb(u?.uid ?? null));
}

