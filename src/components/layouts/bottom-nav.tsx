"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, Heart, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  role: "chaser" | "supe" | "super_admin";
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if user is actively in Super Admin mode
  // For super_admin users, check localStorage for active role
  const activeRole =
    role === "super_admin" && typeof window !== "undefined"
      ? (localStorage.getItem("activeRole") === "super_admin" ? "super_admin" : "supe")
      : role;

  // Check if God Mode is active (stored in localStorage)
  const isGodMode =
    typeof window !== "undefined"
      ? localStorage.getItem("godMode") === "true"
      : false;

  // Profile label logic:
  // - super_admin in God Mode → "God"
  // - super_admin NOT in God Mode → "Supe"
  // - supe → "Supe"
  // - chaser → "Profile"
  let profileLabel = "Profile";

  if (activeRole === "super_admin") {
    if (isGodMode) {
      profileLabel = "God";
    } else {
      profileLabel = "Supe";
    }
  } else if (activeRole === "supe" || role === "supe") {
    profileLabel = "Supe";
  }

  // Use active role for navigation
  const baseRole = activeRole === "super_admin" ? "supe" : activeRole;

  const navItems: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    active: boolean;
  }> = [
    {
      label: "Incidents",
      icon: Home,
      href: "/incidents", // Shared route in (app) group
      active:
        pathname.includes("/incidents") && !pathname.includes("/incident/"),
    },
    {
      label: "Favorites",
      icon: Heart,
      href: "/favorites", // Shared route in (app) group
      active: pathname.includes("/favorites"),
    },
    {
      label: "Chat",
      icon: MessageSquare,
      href: "/chat", // Shared route in (app) group
      active: pathname.includes("/chat"),
    },
    {
      label: profileLabel,
      icon: User,
      href: "/profile", // Shared route in (app) group
      active: pathname.includes("/profile"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] safe-area-inset-bottom z-[100] pointer-events-auto">
      <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(item.href);
              }}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors pointer-events-auto cursor-pointer touch-manipulation",
                item.active ? "text-[#007AFF]" : "text-[#6B7280]"
              )}
            >
              {item.label === "Favorites" ? (
                item.active ? (
                  <Icon className={cn("h-6 w-6 fill-[#FF3B30] text-[#FF3B30]")} />
                ) : (
                  <Icon className={cn("h-6 w-6 text-[#FF3B30] stroke-[#FF3B30]")} />
                )
              ) : (
                <Icon className="h-6 w-6" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
