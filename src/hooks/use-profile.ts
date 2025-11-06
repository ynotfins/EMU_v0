"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebase-client"
import { onAuthStateChanged } from "firebase/auth"
import type { Profile } from "@/types/extended-domain"
import { logger } from "@/lib/utils/logger"

export function useProfile(uid?: string | null) {
  const [data, setData] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [authReady, setAuthReady] = useState(false)

  // Wait for auth to initialize before checking for user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthReady(true)
    })
    return () => unsubscribe()
  }, [])

  // Use provided uid or get from auth.currentUser (only after auth is ready)
  const userId = uid || (authReady ? auth.currentUser?.uid : null)

  useEffect(() => {
    // Wait for auth to be ready
    if (!authReady) {
      return
    }

    if (!userId) {
      logger.debug('No user ID, setting to null', {
        code: 'useProfile',
      });
      setData(null)
      setIsLoading(false)
      return
    }

    logger.debug('Loading profile for user', {
      code: 'useProfile',
      userId,
    });

    const userDocRef = doc(db, "users", userId)

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data()
          
          // Map Firestore data to Profile type
          const profile: Profile = {
            id: userId,
            uid: userId,
            userId: userId,
            email: userData.email || "",
            displayName: userData.displayName || userData.name || userData.nickname || userData.email?.split("@")[0] || "User",
            name: userData.displayName || userData.name || userData.nickname || userData.email?.split("@")[0] || "User",
            role: userData.role || "chaser",
            agency: userData.agency,
            pushNotifications: userData.settings?.pushEnabled !== false,
            locationTracking: userData.settings?.trackingEnabled !== false,
            isActive: userData.isActive !== false,
            preferences: {
              favoriteChaser: userData.preferences?.favoriteChaser || false,
              silencedAlerts: userData.preferences?.silencedAlerts || userData.settings?.silencedAlerts || [],
            },
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
              silencedAlerts: userData.settings?.silencedAlerts || [],
            },
            payout: {
              verified: userData.payout?.verified || false,
              cashappHandle: userData.payout?.cashappHandle || "",
              venmoHandle: userData.payout?.venmoHandle || "",
            },
            createdAt: userData.createdAt || new Date().toISOString(),
            updatedAt: userData.updatedAt || new Date().toISOString(),
          }

          logger.debug('Profile loaded', {
            code: 'useProfile',
            displayName: profile.displayName,
            role: profile.role,
          });
          setData(profile)
          setError(null)
        } else {
          logger.warn('User document not found', {
            code: 'useProfile',
            userId,
          });
          setData(null)
          setError(new Error("User profile not found"))
        }
        setIsLoading(false)
      },
      (err) => {
        logger.error('Error loading profile', err, {
          code: 'useProfile',
          userId,
        });
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, authReady])

  const updateSettings = async (settings: Partial<Profile["settings"]>) => {
    if (!userId) return
    
    logger.debug('Updating settings', {
      code: 'useProfile',
      settings,
    });
    
    // Update local state immediately (optimistic update)
    setData((prev) => (prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null))
    
    // Persist key settings to localStorage
    if (settings?.pushEnabled !== undefined) {
      try {
        localStorage.setItem("emu.push", JSON.stringify(settings.pushEnabled))
      } catch (err) {
        logger.error('Failed to save push setting to localStorage', err, {
          code: 'useProfile',
        });
      }
    }
      if (settings?.trackingEnabled !== undefined) {
        try {
          localStorage.setItem("emu.tracking", JSON.stringify(settings.trackingEnabled))
      } catch (err) {
        logger.error('Failed to save tracking setting to localStorage', err, {
          code: 'useProfile',
        });
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
      logger.debug('Settings updated in Firestore', {
        code: 'useProfile',
      });
    } catch (err) {
      logger.error('Failed to update settings in Firestore', err, {
        code: 'useProfile',
      });
    }
  }

  const updatePayout = async (payout: Partial<Profile["payout"]>) => {
    if (!userId) return
    
    logger.debug('Updating payout', {
      code: 'useProfile',
      payout,
    });
    
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
      logger.debug('Payout updated in Firestore', {
        code: 'useProfile',
      });
    } catch (err) {
      logger.error('Failed to update payout in Firestore', err, {
        code: 'useProfile',
      });
    }
  }

  return { data, isLoading, error, updateSettings, updatePayout }
}

// Action stubs
export function updateProfile(userId: string, data: Partial<Profile>): void {
  logger.debug('updateProfile', {
    code: 'useProfile',
    userId,
    data,
  });
  // TODO: Update Firestore: user_profiles/{userId} merge data
}

export function togglePush(userId: string, enabled: boolean): void {
  logger.debug('togglePush', {
    code: 'useProfile',
    userId,
    enabled,
  });
  // TODO: Update Firestore: user_profiles/{userId} set pushEnabled field
}

export function toggleLocation(userId: string, enabled: boolean): void {
  logger.debug('toggleLocation', {
    code: 'useProfile',
    userId,
    enabled,
  });
  // TODO: Update Firestore: user_profiles/{userId} set locationEnabled field
}

export function uploadAvatar(userId: string, file: File): void {
  logger.debug('uploadAvatar', {
    code: 'useProfile',
    userId,
    fileName: file.name,
  });
  // TODO: Upload to Firebase Storage, then update user_profiles/{userId} avatar field
}

export function uploadID(userId: string, file: File): void {
  logger.debug('uploadID', {
    code: 'useProfile',
    userId,
    fileName: file.name,
  });
  // TODO: Upload to Firebase Storage, then update user_profiles/{userId} isVerified field
}
