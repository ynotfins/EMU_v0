"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { Profile } from "@/types/domain"

export function useProfile(uid?: string | null) {
  const [data, setData] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use provided uid or get from auth.currentUser
  const userId = uid || auth.currentUser?.uid

  useEffect(() => {
    if (!userId) {
      console.log("[useProfile] No user ID, setting to null")
      setData(null)
      setIsLoading(false)
      return
    }

    console.log("[useProfile] Loading profile for user:", userId)

    const userDocRef = doc(db, "users", userId)

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data()
          
          // Map Firestore data to Profile type
          const profile: Profile = {
            uid: userId,
            email: userData.email || "",
            displayName: userData.displayName || userData.name || userData.nickname || userData.email?.split("@")[0] || "User",
            role: userData.role || "chaser",
            viewMode: userData.viewMode || "chaser",
            agency: userData.agency,
            stats: {
              responded: userData.stats?.responded || 0,
              noted: userData.stats?.noted || 0,
              daysActive: userData.stats?.daysActive || 1,
            },
            settings: {
              pushEnabled: userData.settings?.pushEnabled !== false,
              trackingEnabled: userData.settings?.trackingEnabled !== false,
              highAlertSound: userData.settings?.highAlertSound || "train",
              muted: userData.settings?.muted || false,
            },
            payout: {
              verified: userData.payout?.verified || false,
              cashappHandle: userData.payout?.cashappHandle || "",
              venmoHandle: userData.payout?.venmoHandle || "",
            },
          }

          console.log("[useProfile] ✅ Profile loaded:", profile.displayName, profile.role)
          setData(profile)
          setError(null)
        } else {
          console.warn("[useProfile] ⚠️ User document not found:", userId)
          setData(null)
          setError(new Error("User profile not found"))
        }
        setIsLoading(false)
      },
      (err) => {
        console.error("[useProfile] ❌ Error loading profile:", err)
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  const updateSettings = async (settings: Partial<Profile["settings"]>) => {
    if (!userId) return
    
    console.log("[useProfile] updateSettings:", settings)
    
    // Update local state immediately (optimistic update)
    setData((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null))
    
    // Persist key settings to localStorage
    if (settings.pushEnabled !== undefined) {
      try {
        localStorage.setItem("emu.push", JSON.stringify(settings.pushEnabled))
      } catch (err) {
        console.error("[useProfile] Failed to save push setting to localStorage:", err)
      }
    }
    if (settings.trackingEnabled !== undefined) {
      try {
        localStorage.setItem("emu.tracking", JSON.stringify(settings.trackingEnabled))
      } catch (err) {
        console.error("[useProfile] Failed to save tracking setting to localStorage:", err)
      }
    }
    
    // Update Firestore
    try {
      const userDocRef = doc(db, "users", userId)
      const currentData = data?.settings || {}
      await updateDoc(userDocRef, {
        settings: {
          ...currentData,
          ...settings,
        },
      })
      console.log("[useProfile] ✅ Settings updated in Firestore")
    } catch (err) {
      console.error("[useProfile] ❌ Failed to update settings in Firestore:", err)
    }
  }

  const updatePayout = async (payout: Partial<Profile["payout"]>) => {
    if (!userId) return
    
    console.log("[useProfile] updatePayout:", payout)
    
    // Update local state immediately (optimistic update)
    setData((prev) => (prev ? { ...prev, payout: { ...prev.payout, ...payout } } : null))
    
    // Update Firestore
    try {
      const userDocRef = doc(db, "users", userId)
      const currentData = data?.payout || {}
      await updateDoc(userDocRef, {
        payout: {
          ...currentData,
          ...payout,
        },
      })
      console.log("[useProfile] ✅ Payout updated in Firestore")
    } catch (err) {
      console.error("[useProfile] ❌ Failed to update payout in Firestore:", err)
    }
  }

  const setViewMode = async (mode: "chaser" | "supe") => {
    const userId = auth.currentUser?.uid
    if (!userId) return
    localStorage.setItem("emu.viewMode", mode)
    await updateDoc(doc(db, "users", userId), { viewMode: mode }, { merge: true })
    setData((p) => p ? { ...p, viewMode: mode } : p)
  }

  return { data, isLoading, error, updateSettings, updatePayout, setViewMode }
}

// Action stubs
export function updateProfile(userId: string, data: Partial<Profile>): void {
  console.debug("[useProfile] updateProfile:", { userId, data })
  // TODO: Update Firestore: user_profiles/{userId} merge data
}

export function togglePush(userId: string, enabled: boolean): void {
  console.debug("[useProfile] togglePush:", { userId, enabled })
  // TODO: Update Firestore: user_profiles/{userId} set pushEnabled field
}

export function toggleLocation(userId: string, enabled: boolean): void {
  console.debug("[useProfile] toggleLocation:", { userId, enabled })
  // TODO: Update Firestore: user_profiles/{userId} set locationEnabled field
}

export function uploadAvatar(userId: string, file: File): void {
  console.debug("[useProfile] uploadAvatar:", { userId, fileName: file.name })
  // TODO: Upload to Firebase Storage, then update user_profiles/{userId} avatar field
}

export function uploadID(userId: string, file: File): void {
  console.debug("[useProfile] uploadID:", { userId, fileName: file.name })
  // TODO: Upload to Firebase Storage, then update user_profiles/{userId} isVerified field
}
