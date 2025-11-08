"use client"

import { useState, useEffect } from "react"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase/firebase"
import { onAuthStateChanged } from "firebase/auth"
import type { Profile } from "@/types/extended-domain"

export function useProfile(uid?: string | null) {
  const [data, setData] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthReady(true)
    })
    return () => unsubscribe()
  }, [])

  const userId = uid || (authReady ? auth.currentUser?.uid : null)

  useEffect(() => {
    if (!authReady) {
      return
    }

    if (!userId) {
      setData(null)
      setIsLoading(false)
      return
    }

    const userDocRef = doc(db, "users", userId)

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data()

          const profile: Profile = {
            uid: userId,
            email: userData.email || "",
            displayName:
              userData.displayName ||
              userData.name ||
              userData.nickname ||
              userData.email?.split("@")[0] ||
              "User",
            role: userData.role || "chaser",
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

          setData(profile)
          setError(null)
        } else {
          setData(null)
          setError(new Error("User profile not found"))
        }
        setIsLoading(false)
      },
      (err) => {
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, authReady])

  const updateSettings = async (settings: Partial<Profile["settings"]>) => {
    if (!userId) return

    setData((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null))

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

    try {
      const userDocRef = doc(db, "users", userId)
      const currentData = data?.settings || {}
      await updateDoc(userDocRef, {
        settings: {
          ...currentData,
          ...settings,
        },
      })
    } catch (err) {
      console.error("[useProfile] Failed to update settings in Firestore:", err)
    }
  }

  const updatePayout = async (payout: Partial<Profile["payout"]>) => {
    if (!userId) return

    setData((prev) => (prev ? { ...prev, payout: { ...prev.payout, ...payout } } : null))

    try {
      const userDocRef = doc(db, "users", userId)
      const currentData = data?.payout || {}
      await updateDoc(userDocRef, {
        payout: {
          ...currentData,
          ...payout,
        },
      })
    } catch (err) {
      console.error("[useProfile] Failed to update payout in Firestore:", err)
    }
  }

  return { data, isLoading, error, updateSettings, updatePayout }
}

export function updateProfile(userId: string, data: Partial<Profile>): void {
  console.debug("[useProfile] updateProfile:", { userId, data })
}

export function togglePush(userId: string, enabled: boolean): void {
  console.debug("[useProfile] togglePush:", { userId, enabled })
}

export function toggleLocation(userId: string, enabled: boolean): void {
  console.debug("[useProfile] toggleLocation:", { userId, enabled })
}

export function uploadAvatar(userId: string, file: File): void {
  console.debug("[useProfile] uploadAvatar:", { userId, fileName: file.name })
}

export function uploadID(userId: string, file: File): void {
  console.debug("[useProfile] uploadID:", { userId, fileName: file.name })
}
