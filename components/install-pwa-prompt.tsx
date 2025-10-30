"use client";

import { useEffect, useState } from "react";
import {
  setupInstallPrompt,
  promptInstall,
  isInstalledPWA,
} from "@/lib/pwa-register";
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

    // Check if user dismissed prompt recently (within 1 day)
    const dismissedAt = localStorage.getItem("pwa_install_dismissed");
    if (dismissedAt) {
      const daysSince =
        (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 1) {
        return; // Don't show for 1 day after dismissal
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
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-72">
      <div className="bg-[#007AFF] text-white rounded-lg shadow-2xl p-2.5 flex items-start gap-2 animate-in slide-in-from-bottom">
        <div className="bg-white/20 rounded-lg p-1.5">
          <Download className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-xs mb-0.5">Install NFA Alerts</h3>
          <p className="text-[10px] text-white/90 mb-2">Add to home screen</p>

          <div className="flex gap-1.5">
            <Button
              size="sm"
              onClick={handleInstall}
              className="bg-white text-[#007AFF] hover:bg-white/90 h-6 text-[10px] font-semibold px-2"
            >
              Install
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 h-6 text-[10px] px-2"
            >
              Later
            </Button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
