import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

let watchId: number | null = null;
let updateInterval: NodeJS.Timer | null = null;
let lastPosition: GeolocationPosition | null = null;

export async function startLocationTracking() {
  if (!auth.currentUser) {
    console.warn("[LocationTracking] No authenticated user");
    return;
  }

  if (!navigator.geolocation) {
    console.warn("[LocationTracking] Geolocation not supported");
    return;
  }

  console.log("[LocationTracking] Starting location tracking...");

  // Clear any existing tracking
  stopLocationTracking();

  // Request location permission and start watching
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      lastPosition = position;
      updateLocation(position);
    },
    (error) => {
      console.error("[LocationTracking] Error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );

  // Also update location every 30 seconds if position hasn't changed
  updateInterval = setInterval(() => {
    if (lastPosition) {
      updateLocation(lastPosition);
    }
  }, 30000);
}

export function stopLocationTracking() {
  console.log("[LocationTracking] Stopping location tracking...");
  
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  if (updateInterval !== null) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  lastPosition = null;
}

async function updateLocation(position: GeolocationPosition) {
  if (!auth.currentUser) return;

  try {
    const userRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(userRef, {
      location: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        lastUpdated: new Date().toISOString(),
      },
    });

    console.log(
      `[LocationTracking] Updated location: ${position.coords.latitude}, ${position.coords.longitude}`
    );
  } catch (error) {
    console.error("[LocationTracking] Failed to update location:", error);
  }
}

// Auto-start tracking when tracking is enabled
export function initLocationTracking(trackingEnabled: boolean) {
  if (trackingEnabled) {
    startLocationTracking();
  } else {
    stopLocationTracking();
  }
}
