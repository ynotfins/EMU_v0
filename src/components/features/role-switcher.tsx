"use client"

import { useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { RefreshCw } from "lucide-react"

interface RoleSwitcherProps {
  currentRole: "super_admin" | "admin" | "supe" | "chaser"
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const currentView = useMemo<"chaser" | "supe">(() => {
    if (pathname.startsWith("/chaser")) {
      return "chaser"
    }
    return "supe"
  }, [pathname])

  const switchRole = () => {
    const newView = currentView === "chaser" ? "supe" : "chaser"
    const newPath = pathname.replace(`/${currentView}/`, `/${newView}/`)
    router.push(newPath)
  }

  if (currentRole !== "super_admin") {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={switchRole}
        className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg flex items-center gap-2"
        size="sm"
      >
        <RefreshCw className="h-4 w-4" />
        {currentView === "chaser" ? (
          <>
            Switch to <Badge className="bg-primary ml-1">Supe View</Badge>
          </>
        ) : (
          <>
            Switch to <Badge className="bg-primary ml-1">Chaser View</Badge>
          </>
        )}
      </Button>
      
      <div className="mt-2 text-center">
        <Badge className="bg-secondary text-secondary-foreground text-xs">
          ⚡ GOD MODE
        </Badge>
      </div>
    </div>
  )
}

