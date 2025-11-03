"use client";

import type React from "react";
import { BottomNav } from "@/components/layouts/bottom-nav";
import { ProtectedRoute } from "@/components/features/protected-route";
import { RoleSwitcher } from "@/components/features/role-switcher";
import { useProfile } from "@/hooks/use-profile";
import { auth } from "@/lib/firebase/firebase";

interface RoleLayoutProps {
  role: "chaser" | "supe";
  children: React.ReactNode;
}

export function RoleLayout({ role, children }: RoleLayoutProps) {
  const { data: profile } = useProfile(auth.currentUser?.uid);

  // Determine actual role from profile or use provided role
  const actualRole = profile?.role || role;
  
  // For super_admin users, check localStorage for active role (defaults to supe)
  let navRole = actualRole;
  if (actualRole === "super_admin" && typeof window !== "undefined") {
    const activeRole = localStorage.getItem("activeRole");
    navRole = activeRole === "super_admin" ? "super_admin" : "supe";
  } else if (actualRole === "admin") {
    navRole = "supe";
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F2F2F7] pb-16">
        {children}
        <BottomNav role={navRole} />
        {/* Role Switcher moved to profile page */}
      </div>
    </ProtectedRoute>
  );
}
