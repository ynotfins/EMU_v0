"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { onAuthStateChanged, getRedirectResult } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Handle redirect result from Google sign-in
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user) {
          console.log("[Home] Google redirect sign-in successful:", result.user.email)
          
          // Check if user profile exists in Firestore
          const userDoc = await getDoc(doc(db, "users", result.user.uid))
          
          let userRole = "chaser" // Default to chaser for new users

          if (!userDoc.exists()) {
            console.log("[Home] 🆕 New Google user - creating profile...")
            
            // Special handling for ynotfins@gmail.com - default to super_admin
            const isSuperAdmin = result.user.email === "ynotfins@gmail.com"
            const defaultRole = isSuperAdmin ? "super_admin" : "chaser"
            
            // Create Firestore profile for new Google user
            const { setDoc } = await import("firebase/firestore")
            await setDoc(doc(db, "users", result.user.uid), {
              id: result.user.uid,
              uid: result.user.uid,
              email: result.user.email,
              displayName: isSuperAdmin ? "Tony" : (result.user.displayName || result.user.email?.split("@")[0] || "User"),
              name: isSuperAdmin ? "Tony" : (result.user.displayName || result.user.email?.split("@")[0] || "User"),
              nickname: isSuperAdmin ? "Tony" : (result.user.displayName || result.user.email?.split("@")[0] || "User"),
              phone: result.user.phoneNumber || "",
              role: defaultRole,
              settings: {
                pushEnabled: true,
                trackingEnabled: true,
                muted: false,
                highAlertSound: "train",
              },
              payout: {
                verified: false,
                cashappHandle: "",
                venmoHandle: "",
              },
              stats: {
                responded: 0,
                noted: 0,
                daysActive: 1,
              },
              createdAt: new Date().toISOString(),
            })
            userRole = defaultRole
          } else {
            const userData = userDoc.data()
            userRole = userData.role || "chaser"
            
            // Update name to Tony if it's ynotfins@gmail.com
            if (result.user.email === "ynotfins@gmail.com" && userData.displayName !== "Tony") {
              const { updateDoc } = await import("firebase/firestore")
              await updateDoc(doc(db, "users", result.user.uid), {
                displayName: "Tony",
                name: "Tony",
                nickname: "Tony",
              })
            }
          }

          // Redirect based on role
          if (userRole === "super_admin" || userRole === "admin" || userRole === "supe") {
            router.push("/supe/incidents")
          } else {
            router.push("/chaser/incidents")
          }
          setChecking(false)
          return
        }
      } catch (error) {
        console.error("[Home] Error handling redirect result:", error)
      }
    }

    // Check redirect result first
    handleRedirectResult().then(() => {
      // Then set up auth state listener
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
    })
  }, [router, searchParams])

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
