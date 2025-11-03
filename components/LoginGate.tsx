"use client";

import { useEffect, useState, Suspense } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/lib/firebase";

function LoginGateContent({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        const next = sp.get("next") || window.location.pathname;
        router.replace(`/login?next=${encodeURIComponent(next)}`);
      } else {
        setReady(true);
      }
    });
    return () => unsub();
  }, [router, sp]);
  if (!ready) return <div className="p-6 text-sm text-muted-foreground">Checking session…</div>;
  return <>{children}</>;
}

export default function LoginGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading…</div>}>
      <LoginGateContent>{children}</LoginGateContent>
    </Suspense>
  );
}

