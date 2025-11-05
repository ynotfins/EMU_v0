"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let hasRedirected = false;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return;
      
      if (user) {
        console.log("[ProtectedRoute] [OK] User authenticated:", user.email);
        setAuthenticated(true);
        setLoading(false);
      } else {
        console.log("[ProtectedRoute] [X] No user, redirecting to login");
        setAuthenticated(false);
        setLoading(false);
        
        // Only redirect once, and only if we haven't already
        if (!hasRedirected) {
          hasRedirected = true;
          // Use hard navigation to ensure we break any loops
          setTimeout(() => {
            if (isMounted) {
              window.location.href = "/login";
            }
          }, 200);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}

