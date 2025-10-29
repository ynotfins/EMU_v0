"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Star, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  role: "chaser" | "supe"
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: "Incidents",
      icon: Home,
      href: `/${role}/incidents`,
      active: pathname.includes("/incidents") && !pathname.includes("/incident/"),
    },
    {
      label: "Favorites",
      icon: Star,
      href: `/${role}/favorites`,
      active: pathname.includes("/favorites"),
    },
    {
      label: "Chat",
      icon: MessageSquare,
      href: `/${role}/chat`,
      active: pathname.includes("/chat"),
    },
    {
      label: "Profile",
      icon: User,
      href: `/${role}/profile`,
      active: pathname.includes("/profile"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                item.active ? "text-[#007AFF]" : "text-[#6B7280]",
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
