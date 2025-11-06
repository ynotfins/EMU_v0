"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logger } from "@/lib/utils/logger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Zap, Users, User } from "lucide-react";

interface GodModeCardProps {
  userRole: "super_admin" | "admin" | "supe" | "chaser";
}

export function GodModeCard({ userRole }: GodModeCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize God Mode from localStorage (default OFF)
  const [godMode, setGodMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("godMode");
      return stored === "true";
    }
    return false;
  });

  // Derive view mode from pathname (no useState needed)
  const viewMode = useMemo<"chaser" | "supe">(() => {
    if (pathname.startsWith("/chaser")) {
      return "chaser";
    }
    return "supe";
  }, [pathname]);

  const handleGodModeToggle = (enabled: boolean) => {
    setGodMode(enabled);
    localStorage.setItem("godMode", enabled.toString());
    logger.debug(enabled ? 'God Mode activated' : 'God Mode deactivated', { code: 'GodModeCard' });

    // Force bottom nav to re-render
    window.dispatchEvent(new Event("storage"));
  };

  const handleViewModeToggle = (isSupe: boolean) => {
    const newView = isSupe ? "supe" : "chaser";

    // Replace route based on current pathname
    let newPath = pathname;
    if (pathname.startsWith("/chaser/")) {
      newPath = pathname.replace("/chaser/", `/${newView}/`);
    } else if (pathname.startsWith("/supe/")) {
      newPath = pathname.replace("/supe/", `/${newView}/`);
    } else {
      // Fallback: just navigate to incidents page
      newPath = `/${newView}/incidents`;
    }

    logger.debug('Switching view mode', { code: 'GodModeCard', from: viewMode, to: newView });
    router.push(newPath as any);
  };

  // Only show for super_admin
  if (userRole !== "super_admin") {
    return null;
  }

  return (
    <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900">God Mode Controls</CardTitle>
          </div>
          <Badge className="bg-purple-600 text-white">SUPER ADMIN</Badge>
        </div>
        <CardDescription>
          Toggle God Mode and switch between Chaser/Supe views
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* God Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <Zap
              className={`h-6 w-6 ${
                godMode ? "text-yellow-500" : "text-gray-400"
              }`}
            />
            <div>
              <p className="font-semibold text-sm">
                God Mode {godMode ? "ON" : "OFF"}
              </p>
              <p className="text-xs text-gray-500">
                {godMode
                  ? "Bottom nav shows 'God' - Full power active"
                  : "Bottom nav shows role name - Normal mode"}
              </p>
            </div>
          </div>
          <Switch
            checked={godMode}
            onCheckedChange={handleGodModeToggle}
            className="data-[state=checked]:bg-purple-600"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-blue-200">
          <div className="flex items-center gap-3">
            {viewMode === "supe" ? (
              <Users className="h-6 w-6 text-blue-600" />
            ) : (
              <User className="h-6 w-6 text-green-600" />
            )}
            <div>
              <p className="font-semibold text-sm">
                Current View: {viewMode === "supe" ? "Supervisor" : "Chaser"}
              </p>
              <p className="text-xs text-gray-500">
                {viewMode === "supe"
                  ? "Seeing what supes see - manage team"
                  : "Seeing what chasers see - field view"}
              </p>
            </div>
          </div>
          <Switch
            checked={viewMode === "supe"}
            onCheckedChange={handleViewModeToggle}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>

        {/* Status Info */}
        <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
          <p className="text-xs text-purple-900 font-medium">
            <strong>Active Status:</strong>
            <br />
            God Mode:{" "}
            <Badge className={godMode ? "bg-yellow-500" : "bg-gray-500"}>
              {godMode ? "? ACTIVE" : "?? OFF"}
            </Badge>
            {" • "}
            View:{" "}
            <Badge
              className={viewMode === "supe" ? "bg-blue-500" : "bg-green-500"}
            >
              {viewMode === "supe" ? "?? Supe" : "?? Chaser"}
            </Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
