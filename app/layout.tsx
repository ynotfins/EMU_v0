import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { FavoritesProvider } from "@/lib/context/favorites-context"
import ErrorBoundary from "@/components/ErrorBoundary"
import { PWARegistration } from "@/components/pwa-registration"
import { InstallPWAPrompt } from "@/components/install-pwa-prompt"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NFA Alerts - National Fire Alerts",
  description: "Professional emergency alert management and response system",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EMU Alerts",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // Prevent zoom on company phones
  },
  themeColor: "#007AFF",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ErrorBoundary>
          <FavoritesProvider>
            {children}
            <PWARegistration />
            <InstallPWAPrompt />
          </FavoritesProvider>
          <Analytics />
        </ErrorBoundary>
      </body>
    </html>
  )
}
