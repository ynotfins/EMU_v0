"use client"

import { useState } from "react"
import type { Profile } from "@/types/domain"

const DEV_PROFILE: Profile = {
  id: "dev-user-1",
  name: "Dev User",
  email: "dev@emuui.com",
  role: "chaser",
  phone: "+1 (555) 123-4567",
  avatar: "",
  isVerified: false,
  stats: {
    responded: 0,
    noted: 0,
    daysActive: 1,
  },
  settings: {
    pushEnabled: true,
    locationEnabled: true,
  },
  payout: {
    cashApp: "",
    venmo: "",
  },
}

export function useProfile() {
  const [data] = useState<Profile | null>(DEV_PROFILE)
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  // TODO: Replace with Firestore query to 'user_profiles/{currentUserId}' document
  // const docRef = doc(db, 'user_profiles', currentUserId)
  // Use onSnapshot for real-time updates
  // REMOVE DEV_PROFILE when Firebase Auth is integrated

  const updateSettings = (settings: Partial<Profile["settings"]>) => {
    console.debug("[useProfile] updateSettings:", settings)
    // TODO: Update Firestore: user_profiles/{currentUserId} merge settings field
  }

  const updatePayout = (payout: Partial<Profile["payout"]>) => {
    console.debug("[useProfile] updatePayout:", payout)
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
