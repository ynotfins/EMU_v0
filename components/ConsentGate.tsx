"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const TOS_VERSION = "v1";
const PRIVACY_VERSION = "v1";

export default function ConsentGate({ children }: { children: React.ReactNode }) {
  const [needed, setNeeded] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const run = async () => {
      const u = auth.currentUser
      if (!u) return
      const snap = await getDoc(doc(db, "users", u.uid))
      const c = snap.data()?.consent
      if (!(c?.tos?.version && c?.privacy?.version)) setNeeded(true)
    }; run()
  }, [])

  async function accept() {
    setBusy(true)
    try {
      const fns = getFunctions()
      const recordConsent = httpsCallable(fns, 'recordConsent')
      await recordConsent({ tosVersion: TOS_VERSION, privacyVersion: PRIVACY_VERSION })
      setNeeded(false)
    } finally {
      setBusy(false)
    }
  }

  if (!needed) return <>{children}</>
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white max-w-lg w-full rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Consent Required</h2>
        <div className="h-40 overflow-auto border rounded p-2 text-sm">
          <p><strong>Terms v{TOS_VERSION}</strong> and <strong>Privacy v{PRIVACY_VERSION}</strong></p>
          <p>This app is for employees. Activity may be logged for security and compliance.</p>
        </div>
        <button
          disabled={busy}
          onClick={accept}
          className="w-full rounded-md border px-4 py-2 disabled:opacity-50"
        >
          {busy ? "Saving..." : "I have read and agree"}
        </button>
      </div>
    </div>
  )
}

