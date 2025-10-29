import type React from "react"
import { BottomNav } from "@/components/bottom-nav"

interface RoleLayoutProps {
  role: "chaser" | "supe"
  children: React.ReactNode
}

export function RoleLayout({ role, children }: RoleLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-16">
      {children}
      <BottomNav role={role} />
    </div>
  )
}
