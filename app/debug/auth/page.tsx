"use client"

import { useEffect, useState } from "react";
import { onAuthStateChanged, getIdToken } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function AuthDebug() {
  const [uid, setUid] = useState<string|null>(null);
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUid(u?.uid ?? null);
      setEmail(u?.email ?? "");
      setToken(u ? await getIdToken(u, /*forceRefresh*/ true).catch(()=> "") : "");
    });
  }, []);
  return (
    <div className="p-6 space-y-3 text-sm">
      <div className="font-medium">Auth Debug</div>
      <div>uid: <code>{uid ?? "null"}</code></div>
      <div>email: <code>{email || "—"}</code></div>
      <div>idToken(first 24): <code>{token ? token.slice(0,24) + "…" : "—"}</code></div>
    </div>
  );
}

