import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { FavoritesProvider } from "@/lib/context/favorites-context"
import { PWARegistration } from "@/components/features/pwa-registration"
import { InstallPWAPrompt } from "@/components/features/install-pwa-prompt"
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
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <FavoritesProvider>
          {children}
          <PWARegistration />
          <InstallPWAPrompt />
        </FavoritesProvider>
      </body>
    </html>
  )
}
