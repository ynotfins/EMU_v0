"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Heart, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  role: "chaser" | "supe" | "super_admin"
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()
  
  // Super admin can access supe routes
  const baseRole = role === "super_admin" ? "supe" : role;
  
  // Show "Supe" label for supe and super_admin roles
  const profileLabel = (role === "supe" || role === "super_admin") ? "Supe" : "Profile";

  const navItems = [
    {
      label: "Incidents",
      icon: Home,
      href: `/${baseRole}/incidents`,
      active: pathname.includes("/incidents") && !pathname.includes("/incident/"),
    },
    {
      label: "Favorites",
      icon: Heart,
      href: `/${baseRole}/favorites`,
      active: pathname.includes("/favorites"),
    },
    {
      label: "Chat",
      icon: MessageSquare,
      href: `/${baseRole}/chat`,
      active: pathname.includes("/chat"),
    },
    {
      label: profileLabel,
      icon: User,
      href: `/${baseRole}/profile`,
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
              {item.label === "Favorites" ? (
                <Icon className={cn("h-6 w-6 fill-[#FF3B30] text-[#FF3B30]")} />
              ) : (
                <Icon className="h-6 w-6" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
