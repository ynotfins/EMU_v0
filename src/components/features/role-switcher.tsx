"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RefreshCw } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: "super_admin" | "admin" | "supe" | "chaser";
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Derive current view from pathname (no useState needed)
  const currentView = useMemo<"chaser" | "supe">(() => {
    if (pathname.startsWith("/chaser")) {
      return "chaser";
    }
    return "supe";
  }, [pathname]);

  const switchRole = () => {
    const newView = currentView === "chaser" ? "supe" : "chaser";
    
    // Replace route: /chaser/* ? /supe/* or vice versa
    const newPath = pathname.replace(`/${currentView}/`, `/${newView}/`);
    
    console.log(`[RoleSwitcher] Switching from ${currentView} to ${newView}`);
    console.log(`[RoleSwitcher] New path: ${newPath}`);
    
    router.push(newPath as any);
  };

  // Only show for super_admin
  if (currentRole !== "super_admin") {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={switchRole}
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg flex items-center gap-2"
        size="sm"
      >
        <RefreshCw className="h-4 w-4" />
        {currentView === "chaser" ? (
          <>
            Switch to <Badge className="bg-blue-500 ml-1">Supe View</Badge>
          </>
        ) : (
          <>
            Switch to <Badge className="bg-green-500 ml-1">Chaser View</Badge>
          </>
        )}
      </Button>
      
      <div className="mt-2 text-center">
        <Badge className="bg-purple-900 text-white text-xs">
          ?? GOD MODE
        </Badge>
      </div>
    </div>
  );
}

