'use client'

import type React from 'react'
import { Analytics } from '@vercel/analytics/react'
import ErrorBoundary from '@/components/ErrorBoundary'
import { InstallPWAPrompt } from '@/components/install-pwa-prompt'
import { PWARegistration } from '@/components/pwa-registration'
import { FavoritesProvider } from '@/lib/context/favorites-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <FavoritesProvider>
        {children}
        <PWARegistration />
        <InstallPWAPrompt />
      </FavoritesProvider>
      <Analytics />
    </ErrorBoundary>
  )
}
