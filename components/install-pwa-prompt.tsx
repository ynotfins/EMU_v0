"use client";

import { useEffect, useState } from "react";
import { setupInstallPrompt, promptInstall, isInstalledPWA } from "@/lib/pwa-register";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

/**
 * Install PWA Prompt
 * Shows a banner prompting users to install the app on their device
 * Only shows if:
 * - App is not already installed
 * - Browser supports PWA installation
 * - User hasn't dismissed it recently
 */
export function InstallPWAPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (isInstalledPWA()) {
      return;
    }

    // Check if user dismissed prompt recently (within 7 days)
    const dismissedAt = localStorage.getItem("pwa_install_dismissed");
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    // Setup install prompt listener
    setupInstallPrompt((installable) => {
      setCanInstall(installable);
    });
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setCanInstall(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
    setDismissed(true);
    setCanInstall(false);
  };

  // Don't render if can't install or dismissed
  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-[#007AFF] text-white rounded-lg shadow-2xl p-4 flex items-start gap-3 animate-in slide-in-from-bottom">
        <div className="bg-white/20 rounded-lg p-2">
          <Download className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">
            Install EMU Alerts
          </h3>
          <p className="text-xs text-white/90 mb-3">
            Add to your home screen for quick access and offline use
          </p>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-white text-[#007AFF] hover:bg-white/90 h-8 text-xs font-semibold"
            >
              Install App
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 h-8 text-xs"
            >
              Not Now
            </Button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

