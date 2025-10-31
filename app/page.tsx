"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("[Home] User authenticated:", user.email)
        
        // Check user role in Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid))
          
          if (userDoc.exists()) {
            const role = userDoc.data().role
            console.log("[Home] User role:", role)
            
            // Redirect based on role
            if (role === "super_admin" || role === "admin" || role === "supe") {
              router.push("/supe/incidents")
            } else {
              router.push("/chaser/incidents")
            }
          } else {
            // No profile, go to incidents (will be created on login)
            router.push("/chaser/incidents")
          }
        } catch (error) {
          console.error("[Home] Error checking user role:", error)
          router.push("/chaser/incidents")
        }
      } else {
        console.log("[Home] No user authenticated, redirecting to login")
        router.push("/login")
      }
      
      setChecking(false)
    })

    return () => unsubscribe()
  }, [router])

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
