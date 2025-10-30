"use client";

/**
 * PWA Service Worker Registration
 * Registers the service worker for offline caching and push notifications
 */

export function registerServiceWorker() {
  if (typeof window === "undefined") return;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
          { scope: "/" }
        );
        
        console.log("[PWA] ✅ Service Worker registered:", registration.scope);

        // Update service worker when new version available
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("[PWA] 🔄 New version available! Reload to update.");
                // Optionally show a toast notification
              }
            });
          }
        });
      } catch (error) {
        console.error("[PWA] ❌ Service Worker registration failed:", error);
      }
    });
  } else {
    console.warn("[PWA] ⚠️ Service Workers not supported in this browser");
  }
}

/**
 * Check if app is running as installed PWA
 */
export function isInstalledPWA(): boolean {
  if (typeof window === "undefined") return false;
  
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

/**
 * Prompt user to install PWA (A2HS - Add to Home Screen)
 */
let deferredPrompt: any = null;

export function setupInstallPrompt(onInstallable: (canInstall: boolean) => void) {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    onInstallable(true);
    console.log("[PWA] 📱 Install prompt ready");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    onInstallable(false);
    console.log("[PWA] ✅ App installed successfully!");
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.warn("[PWA] ⚠️ Install prompt not available");
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`[PWA] User response to install prompt: ${outcome}`);
  deferredPrompt = null;
  
  return outcome === "accepted";
}

