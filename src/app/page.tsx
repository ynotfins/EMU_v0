"use client"

import { useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function HomePage() {
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // ONE-TIME check only - no listener to avoid race conditions
    const checkAuthAndRedirect = async () => {
      const user = auth.currentUser;
      
      if (user) {
        console.log("[Home] User authenticated:", user.email)
        
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          
          if (userDoc.exists()) {
            const role = userDoc.data().role
            console.log("[Home] User role:", role)
            
            // Hard navigation to break loops
            const targetPath = (role === "super_admin" || role === "admin" || role === "supe") 
              ? "/supe/incidents" 
              : "/chaser/incidents";
            
            window.location.href = targetPath;
          } else {
            window.location.href = "/chaser/incidents";
          }
        } catch (error) {
          console.error("[Home] Error checking user role:", error)
          window.location.href = "/chaser/incidents";
        }
      } else {
        console.log("[Home] No user authenticated, redirecting to login")
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
