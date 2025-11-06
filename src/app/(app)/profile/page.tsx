"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
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
import { logger } from "@/lib/utils/logger";

export default function SharedProfilePage() {
  const router = useRouter();
  const { data: profile, updateSettings, updatePayout } = useProfile();

  // Determine role dynamically based on user profile
  const userRole = profile?.role === "super_admin" || profile?.role === "admin" || profile?.role === "supe" 
    ? "supe" 
    : "chaser"

  // Determine if user is supe (for showing supe-specific features)
  const isSupe = profile?.role === "super_admin" || profile?.role === "admin" || profile?.role === "supe";

  const handleSignOut = async () => {
    try {
      logger.debug('Signing out', {
        code: 'ProfilePage',
      });

      // Clear all auth persistence FIRST
      clearAuthState();

      // Then sign out from Firebase
      await signOut(auth);

      logger.debug('Signed out successfully', {
        code: 'ProfilePage',
      });
      router.push("/login");
    } catch (error) {
      logger.error('Sign out error', error, {
        code: 'ProfilePage',
      });
    }
  };

  if (!profile) {
    return (
      <RoleLayout role={userRole}>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#6B7280]">Loading profile...</p>
        </div>
      </RoleLayout>
    );
  }

  return (
    <RoleLayout role={userRole}>
      <div className="flex flex-col min-h-screen">
        <ProfileHeader profile={profile} />

        <div className="flex-1 p-4 space-y-4">
          {/* Supe Controls Card - Shows if user can toggle to Supe view */}
          {isSupe && (
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
            responded={profile.stats?.responded ?? 0}
            noted={profile.stats?.noted ?? 0}
            daysActive={profile.stats?.daysActive ?? 0}
          />

          {/* Live Team Map - Only for Supe users */}
          {isSupe && <LiveTeamMap />}

          <IDVerificationCard
            verified={profile.payout?.verified ?? false}
            onUploadID={() => logger.debug('Upload ID', { code: 'ProfilePage' })}
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
            onHelpSupport={() => logger.debug('Help & Support', { code: 'ProfilePage' })}
            onTermsPrivacy={() => logger.debug('Terms & Privacy', { code: 'ProfilePage' })}
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

