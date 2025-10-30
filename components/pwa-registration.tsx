"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa-register";

/**
 * PWA Registration Component
 * Automatically registers service worker on app load
 */
export function PWARegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  // This component renders nothing - it just registers the service worker
  return null;
}

