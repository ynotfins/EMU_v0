"use client"

import { useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function AuthFix() {
  useEffect(() => {
    // Force auth state check on mount
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('[AuthFix] User authenticated:', user.email)
        // Trigger a re-render by setting a dummy state
        window.dispatchEvent(new Event('auth-state-fixed'))
      } else {
        console.log('[AuthFix] No user authenticated')
      }
    })

    // Also check current user immediately
    if (auth.currentUser) {
      console.log('[AuthFix] Current user found:', auth.currentUser.email)
    }

    return () => unsubscribe()
  }, [])

  return null
}
