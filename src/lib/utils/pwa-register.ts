"use client";

import { logger } from './logger';

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
        
        logger.debug('Service Worker registered', { code: 'PWA', scope: registration.scope });

        // Update service worker when new version available
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                logger.debug('New version available', { code: 'PWA', message: 'Reload to update' });
                // Optionally show a toast notification
              }
            });
          }
        });
      } catch (error) {
        logger.error('Service Worker registration failed', error as Error, { code: 'PWA' });
      }
    });
  } else {
    logger.warn('Service Workers not supported', { code: 'PWA' });
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
    logger.debug('Install prompt ready', { code: 'PWA' });
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    onInstallable(false);
    logger.debug('App installed successfully', { code: 'PWA' });
  });
}

export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    logger.warn('Install prompt not available', { code: 'PWA' });
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  logger.debug('User response to install prompt', { code: 'PWA', outcome });
  deferredPrompt = null;
  
  return outcome === "accepted";
}

