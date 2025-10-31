"use client";

import type React from "react";
import { BottomNav } from "@/components/bottom-nav";
import { ProtectedRoute } from "@/components/protected-route";
import { RoleSwitcher } from "@/components/role-switcher";
import { useProfile } from "@/hooks/use-profile";
import { auth } from "@/lib/firebase";

interface RoleLayoutProps {
  role: "chaser" | "supe";
  children: React.ReactNode;
}

export function RoleLayout({ role, children }: RoleLayoutProps) {
  const { data: profile } = useProfile(auth.currentUser?.uid);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F2F2F7] pb-16">
        {children}
        <BottomNav role={role} />
        {/* Role Switcher moved to profile page */}
      </div>
    </ProtectedRoute>
  );
}
