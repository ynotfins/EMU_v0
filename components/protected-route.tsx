"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("[ProtectedRoute] ✅ User authenticated:", user.email);
        setAuthenticated(true);
        setLoading(false);
      } else {
        console.log("[ProtectedRoute] ❌ No user, redirecting to login");
        setAuthenticated(false);
        setLoading(false);
        router.push("/login");
      }
    });

    // Fallback: if auth check takes too long, render children anyway
    const timeout = setTimeout(() => {
      if (loading) {
        console.log("[ProtectedRoute] ⚠️ Auth check timeout, rendering children");
        setLoading(false);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, loading]);

  if (loading) {
    return <></>; // Show nothing, not a blocking "Loading..."
  }

  if (!authenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

