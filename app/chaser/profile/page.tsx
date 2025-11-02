"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { clearAuthState } from "@/lib/auth-persistence";
import { RoleLayout } from "@/components/role-layout";
import { ProfileHeader } from "@/components/profile-header";
import { StatsCards } from "@/components/stats-cards";
import { IDVerificationCard } from "@/components/id-verification-card";
import { PreferencesCard } from "@/components/preferences-card";
import { EmergencyPaymentCard } from "@/components/emergency-payment-card";
import { HelpLegalCard } from "@/components/help-legal-card";
import { SupeControlsCard } from "@/components/supe-controls-card";
import { GodModeCard } from "@/components/god-mode-card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useProfile } from "@/hooks/use-profile";

export default function ChaserProfilePage() {
  const router = useRouter();
  const { data: profile, updateSettings, updatePayout } = useProfile();

  const handleSignOut = async () => {
    try {
      console.log("[Profile] Signing out...");

      // Clear all auth persistence FIRST
      clearAuthState();

      // Then sign out from Firebase
      await signOut(auth);

      console.log("[Profile] ✅ Signed out successfully - all auth cleared");
      router.push("/login");
    } catch (error) {
      console.error("[Profile] ❌ Sign out error:", error);
    }
  };

  if (!profile) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#6B7280]">Loading profile...</p>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col min-h-screen">
        <ProfileHeader profile={profile} />

        <div className="flex-1 p-4 space-y-4">
          {/* Supe Controls Card - Shows if user can toggle to Supe view */}
          {(profile.role === "super_admin" || profile.role === "supe" || profile.role === "admin") && (
            <SupeControlsCard userRole={profile.role} />
          )}

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
            responded={profile.stats.responded}
            noted={profile.stats.noted}
            daysActive={profile.stats.daysActive}
          />

          <IDVerificationCard
            verified={profile.payout.verified}
            onUploadID={() => console.log("[v0] Upload ID")}
          />

          <PreferencesCard
            pushEnabled={profile.settings.pushEnabled}
            trackingEnabled={profile.settings.trackingEnabled}
            onPushChange={(enabled) => updateSettings({ pushEnabled: enabled })}
            onTrackingChange={(enabled) =>
              updateSettings({ trackingEnabled: enabled })
            }
          />

          <EmergencyPaymentCard
            verified={profile.payout.verified}
            cashappHandle={profile.payout.cashappHandle}
            venmoHandle={profile.payout.venmoHandle}
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
            <span className="text-lg mr-2">🚪</span>
            Sign Out
          </Button>
        </div>
      </div>
    </RoleLayout>
  );
}
