"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { logger } from "@/lib/utils/logger";

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
        logger.debug('User authenticated', {
          code: 'ProtectedRoute',
          email: user.email || undefined,
        });
        setAuthenticated(true);
        setLoading(false);
      } else {
        logger.debug('No user, redirecting to login', {
          code: 'ProtectedRoute',
        });
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

