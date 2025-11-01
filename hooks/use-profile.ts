"use client"

import { useState } from "react"
import type { Profile } from "@/types/domain"

const DEV_PROFILE: Profile = {
  uid: "dev-user-1",
  displayName: "Dev User",
  email: "dev@emuui.com",
  role: "chaser",
  agency: "EMU Response Team",
  stats: {
    responded: 0,
    noted: 0,
    daysActive: 1,
  },
  settings: {
    pushEnabled: true,
    trackingEnabled: true,
    highAlertSound: "default",
    muted: false,
  },
  payout: {
    verified: false,
    cashappHandle: "",
    venmoHandle: "",
  },
}

export function useProfile() {
  const [data, setData] = useState<Profile | null>(DEV_PROFILE)
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  // TODO: Replace with Firestore query to 'user_profiles/{currentUserId}' document
  // const docRef = doc(db, 'user_profiles', currentUserId)
  // Use onSnapshot for real-time updates
  // REMOVE DEV_PROFILE when Firebase Auth is integrated

  const updateSettings = (settings: Partial<Profile["settings"]>) => {
    console.debug("[useProfile] updateSettings:", settings)
    
    // Update local state
    setData((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...settings } } : prev))
    
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
    
    // TODO: Update Firestore: user_profiles/{currentUserId} merge settings field
  }

  const updatePayout = (payout: Partial<Profile["payout"]>) => {
    console.debug("[useProfile] updatePayout:", payout)
    
    // Update local state
    setData((prev) => (prev ? { ...prev, payout: { ...prev.payout, ...payout } } : prev))
    
    // TODO: Update Firestore: user_profiles/{currentUserId} merge payout field
  }

  return { data, isLoading, error, updateSettings, updatePayout }
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
