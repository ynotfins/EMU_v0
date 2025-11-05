"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { clearAuthState } from "@/lib/firebase/auth-persistence";
import { RoleLayout } from "@/components/features/role-layout";
import { ProfileHeader } from "@/components/features/profile-header";
import { StatsCards } from "@/components/features/stats-cards";
import { IDVerificationCard } from "@/components/features/id-verification-card";
import { PreferencesCard } from "@/components/features/preferences-card";
import { EmergencyPaymentCard } from "@/components/features/emergency-payment-card";
import { HelpLegalCard } from "@/components/features/help-legal-card";
import { SupeControlsCard } from "@/components/features/supe-controls-card";
import { GodModeCard } from "@/components/features/god-mode-card";
import { LiveTeamMap } from "@/components/features/live-team-map";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

export default function SupeProfilePage() {
  const router = useRouter();
  const { data: profile, updateSettings, updatePayout } = useProfile();

  const handleSignOut = async () => {
    try {
      console.log("[Profile] Signing out...");

      // Clear all auth persistence FIRST
      clearAuthState();

      // Then sign out from Firebase
      await signOut(auth);

      console.log("[Profile] [OK] Signed out successfully - all auth cleared");
      router.push("/login");
    } catch (error) {
      console.error("[Profile] [X] Sign out error:", error);
    }
  };

  if (!profile) {
    return (
      <RoleLayout role="supe">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#6B7280]">Loading profile...</p>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="supe">
      <div className="flex flex-col min-h-screen">
        <ProfileHeader profile={profile} />

        <div className="flex-1 p-4 space-y-4">
          {/* Supe Controls Card - Shows for all Supe users */}
          <SupeControlsCard userRole={profile.role} />

          {/* God Mode Card - Only shows when actively in Super Admin mode */}
          {(() => {
            // Check if user is actively in Super Admin mode
            if (typeof window !== "undefined") {
              const activeRole = localStorage.getItem("activeRole");
              if (activeRole === "super_admin" && profile.role === "super_admin") {
                return <GodModeCard userRole={profile.role} />;
              }
            }
            return null;
          })()}

          <StatsCards
            responded={profile.stats?.responded ?? 0}
            noted={profile.stats?.noted ?? 0}
            daysActive={profile.stats?.daysActive ?? 0}
          />

          {/* Live Team Map - Above ID Verification */}
          <LiveTeamMap />

          <IDVerificationCard
            verified={profile.payout?.verified ?? false}
            onUploadID={() => console.log("[v0] Upload ID")}
          />

          <PreferencesCard
            pushEnabled={profile.settings?.pushEnabled ?? true}
            trackingEnabled={profile.settings?.trackingEnabled ?? true}
            onPushChange={(enabled) => updateSettings({ pushEnabled: enabled })}
            onTrackingChange={(enabled) =>
              updateSettings({ trackingEnabled: enabled })
            }
          />

          <EmergencyPaymentCard
            verified={profile.payout?.verified ?? false}
            cashappHandle={profile.payout?.cashappHandle}
            venmoHandle={profile.payout?.venmoHandle}
            onSave={(cashapp, venmo) =>
              updatePayout({ cashappHandle: cashapp, venmoHandle: venmo })
            }
          />

          <HelpLegalCard
            onHelpSupport={() => console.log("[v0] Help & Support")}
            onTermsPrivacy={() => console.log("[v0] Terms & Privacy")}
          />

          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </RoleLayout>
  );
}
