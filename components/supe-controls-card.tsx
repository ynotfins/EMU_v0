"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Zap, Users, User, Shield } from "lucide-react";

interface SupeControlsCardProps {
  userRole: "super_admin" | "admin" | "supe" | "chaser";
}

export function SupeControlsCard({ userRole }: SupeControlsCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has super_admin role in Firestore (can toggle to Super Admin)
  const canToggleSuperAdmin = userRole === "super_admin";

  // Get active role from localStorage (defaults to supe if super_admin)
  const [activeRole, setActiveRole] = useState<"supe" | "super_admin">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("activeRole");
      if (stored === "super_admin" || stored === "supe") {
        return stored;
      }
    }
    // Default to supe if user has super_admin role, otherwise supe
    return canToggleSuperAdmin ? "supe" : "supe";
  });

  // Derive view mode from pathname
  const viewMode = useMemo<"chaser" | "supe">(() => {
    if (pathname.startsWith("/chaser")) {
      return "chaser";
    }
    return "supe";
  }, [pathname]);

  // Update active role in localStorage (don't update Firestore - keep role as super_admin)
  const handleRoleToggle = async (isSuperAdmin: boolean) => {
    const newRole = isSuperAdmin ? "super_admin" : "supe";
    setActiveRole(newRole);
    localStorage.setItem("activeRole", newRole);

    console.log(`[SupeControls] Active role set to ${newRole} (Firestore role remains super_admin)`);

    // Force bottom nav to re-render
    window.dispatchEvent(new Event("storage"));
    
    // Reload to update UI
    window.location.reload();
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

    console.log(`[SupeControls] Switching from ${viewMode} to ${newView} view`);
    router.push(newPath);
  };

  // Only show for supe users (including those who can toggle to super_admin)
  if (userRole !== "supe" && userRole !== "super_admin" && userRole !== "admin") {
    return null;
  }

  return (
    <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Supe Controls</CardTitle>
          </div>
          <Badge className="bg-blue-600 text-white">SUPE</Badge>
        </div>
        <CardDescription>
          Switch between Chaser/Supe views {canToggleSuperAdmin && "and toggle Super Admin mode"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Super Admin Toggle - Only if user has super_admin role */}
        {canToggleSuperAdmin && (
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-3">
              <Zap
                className={`h-6 w-6 ${
                  activeRole === "super_admin" ? "text-yellow-500" : "text-gray-400"
                }`}
              />
              <div>
                <p className="font-semibold text-sm">
                  Super Admin Mode {activeRole === "super_admin" ? "ON" : "OFF"}
                </p>
                <p className="text-xs text-gray-500">
                  {activeRole === "super_admin"
                    ? "Full admin access - God Mode controls available"
                    : "Normal Supe mode - Standard supervisor access"}
                </p>
              </div>
            </div>
            <Switch
              checked={activeRole === "super_admin"}
              onCheckedChange={handleRoleToggle}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-green-200">
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
        <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-xs text-blue-900 font-medium">
            <strong>Active Status:</strong>
            <br />
            {canToggleSuperAdmin && (
              <>
                Role:{" "}
                <Badge className={activeRole === "super_admin" ? "bg-purple-500" : "bg-blue-500"}>
                  {activeRole === "super_admin" ? "⚡ Super Admin" : "👥 Supe"}
                </Badge>
                {" • "}
              </>
            )}
            View:{" "}
            <Badge
              className={viewMode === "supe" ? "bg-blue-500" : "bg-green-500"}
            >
              {viewMode === "supe" ? "👥 Supe" : "🚒 Chaser"}
            </Badge>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

