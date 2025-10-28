import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { FavoritesProvider } from "@/lib/context/favorites-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EMU Alerts - Emergency Management Unit",
  description: "Professional emergency alert management and response system",
  generator: "v0.app",
  icons: {
    icon: "/app-icon.png",
    apple: "/app-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <FavoritesProvider>{children}</FavoritesProvider>
        <Analytics />
      </body>
    </html>
  )
}
