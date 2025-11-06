"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase/firebase"
import { doc, getDoc } from "firebase/firestore"
import { logger } from "@/lib/utils/logger"

export default function HomePage() {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // ONE-TIME check only - no listener to avoid race conditions
    const checkAuthAndRedirect = async () => {
      const user = auth.currentUser;
      
      if (user) {
        logger.debug('User authenticated', {
          code: 'HomePage',
          email: user.email || undefined,
        });
        
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          
          if (userDoc.exists()) {
            const role = userDoc.data().role
            logger.debug('User role determined', {
              code: 'HomePage',
              role,
            });
            
            // Hard navigation to break loops
            const targetPath = (role === "super_admin" || role === "admin" || role === "supe") 
              ? "/supe/incidents" 
              : "/chaser/incidents";
            
            window.location.href = targetPath;
          } else {
            window.location.href = "/chaser/incidents";
          }
        } catch (error) {
          logger.error('Error checking user role', error, {
            code: 'HomePage',
          });
          window.location.href = "/chaser/incidents";
        }
      } else {
        logger.debug('No user authenticated, redirecting to login', {
          code: 'HomePage',
        });
        window.location.href = "/login";
      }
      
      setChecking(false)
    }

    // Small delay to let auth initialize
    const timer = setTimeout(checkAuthAndRedirect, 50);
    return () => clearTimeout(timer);
  }, [])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Loading NFA Alerts...</p>
        </div>
      </div>
    )
  }

  return null
}
