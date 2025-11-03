/**
 * Client-Side Location & Distance Calculation
 * 
 * This hook provides:
 * 1. Real-time user location tracking
 * 2. On-demand address geocoding with Firestore caching
 * 3. Distance calculation between user and incidents
 * 
 * Architecture:
 * - User location: Browser Geolocation API (free, real-time)
 * - Address geocoding: Google Maps API (free tier: 28k/mo)
 * - Caching: Store lat/lng in Firestore (geocode each address only once)
 * - Distance: Haversine formula (instant calculation)
 */

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { geocodeCache, userLocationCache, locationPermission } from '@/lib/offline-cache';

interface Location {
  lat: number;
  lng: number;
}

/**
 * Haversine formula - calculates great-circle distance between two points
 * Returns distance in miles
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth radius in miles (use 6371 for km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Geocode address using Google Maps Geocoding API
 * Falls back to a free service if API key not configured
 * 
 * NOW WITH OFFLINE CACHE: Checks localStorage first!
 */
async function geocodeAddress(address: string): Promise<Location | null> {
  console.log('[geocodeAddress] 🗺️ Geocoding:', address);

  // OFFLINE FIRST: Check localStorage cache
  const cached = geocodeCache.get(address);
  if (cached) {
    console.log('[geocodeAddress] ✅ Using offline cache:', { lat: cached.lat, lng: cached.lng });
    return { lat: cached.lat, lng: cached.lng };
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log('[geocodeAddress] Google Maps API Key:', apiKey ? 'Present' : 'Missing');

  // Option 1: Google Maps API (if configured)
  if (apiKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        console.log('[geocodeAddress] ✅ Google Maps result:', { lat, lng });
        
        // SAVE TO OFFLINE CACHE
        geocodeCache.set(address, lat, lng);
        
        return { lat, lng };
      }

      console.error('[geocodeAddress] ❌ Google Maps error:', data.status);
    } catch (error) {
      console.error('[geocodeAddress] ❌ Google Maps fetch error:', error);
    }
  }

  // Option 2: OpenStreetMap Nominatim (free, no API key needed)
  // Rate limit: 1 request/second
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address
      )}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'EMU-Alerts-App/1.0', // Required by Nominatim
        },
      }
    );
    const data = await response.json();

    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      console.log('[geocodeAddress] ✅ OSM Nominatim result:', { lat, lng });
      
      // SAVE TO OFFLINE CACHE
      geocodeCache.set(address, lat, lng);
      
      return { lat, lng };
    }

    console.error('[geocodeAddress] ❌ No results from Nominatim');
  } catch (error) {
    console.error('[geocodeAddress] ❌ Nominatim fetch error:', error);
  }

  return null;
}

/**
 * Hook for managing user location and calculating distances to incidents
 */
export function useLocationDistance() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );

  // Request and track user location
  useEffect(() => {
    // Check geolocation support (must be async to avoid setState-in-effect warning)
    if (!navigator.geolocation) {
      // Use setTimeout to defer setState (React best practice)
      Promise.resolve().then(() => {
        setError('Geolocation not supported by your browser');
        setPermissionGranted(false);
      });
      return;
    }

    // Check if permission was previously granted (defer setState)
    if (locationPermission.wasGranted()) {
      console.log('[useLocationDistance] ✅ Location permission already granted (never asking again)');
      Promise.resolve().then(() => setPermissionGranted(true));
    } else {
      console.log('[useLocationDistance] 📍 Requesting location permission...');
    }
    
    // Try to use cached location first (defer setState)
    const cachedLoc = userLocationCache.get();
    if (cachedLoc && !userLocationCache.isStale()) {
      console.log('[useLocationDistance] 📦 Using cached location (fresh)');
      Promise.resolve().then(() => {
        setUserLocation({ lat: cachedLoc.lat, lng: cachedLoc.lng });
        setPermissionGranted(true);
        setError(null);
      });
    }

    // Watch position for real-time updates (hardware GPS)
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        // Only update if user has moved significantly (saves battery & re-renders)
        const didUpdate = userLocationCache.update(newLat, newLng, accuracy, 'gps');
        
        if (didUpdate) {
          console.log('[useLocationDistance] ✅ Location updated (user moved)');
          setUserLocation({ lat: newLat, lng: newLng });
        } else {
          console.log('[useLocationDistance] ⏸️ Location unchanged (using cached)');
        }
        
        // Save permission status permanently (never ask again)
        if (!locationPermission.wasGranted()) {
          locationPermission.setGranted();
        }
        
        setPermissionGranted(true);
        setError(null);
      },
      (err) => {
        console.error('[useLocationDistance] ❌ Location error:', err);
        
        // Provide helpful error messages
        let errorMessage = err.message;
        if (err.code === 1) {
          errorMessage = "Location permission denied. Please enable location access in your browser settings.";
        } else if (err.code === 2) {
          errorMessage = "Location unavailable. Please check your device's location settings.";
        } else if (err.code === 3) {
          errorMessage = "Location request timed out. This may be due to poor GPS signal or browser restrictions.";
        }
        
        // Mobile browsers often require HTTPS for geolocation
        if (typeof window !== "undefined" && window.location.protocol === "http:" && !window.location.hostname.includes("localhost")) {
          errorMessage += " Note: Location access requires HTTPS on most mobile browsers.";
        }
        
        console.error('[useLocationDistance] 📱 Error details:', {
          code: err.code,
          message: err.message,
          protocol: typeof window !== "undefined" ? window.location.protocol : "unknown",
          hostname: typeof window !== "undefined" ? window.location.hostname : "unknown",
        });
        
        setError(errorMessage);
        setPermissionGranted(false);
      },
      {
        enableHighAccuracy: false, // Use network location (faster, less battery)
        timeout: 60000, // Increased to 60s to prevent idle timeout errors
        maximumAge: 300000, // Cache location for 5 minutes (prevents constant re-requests)
      }
    );

    return () => {
      console.log('[useLocationDistance] 🛑 Stopping location watch');
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  /**
   * Calculate distance to an incident
   * - Uses cached lat/lng if available
   * - Otherwise geocodes address and caches result
   * - Returns undefined if user location unavailable
   */
  async function getIncidentDistance(
    incidentId: string,
    address: string,
    incidentLat?: number,
    incidentLng?: number
  ): Promise<number | undefined> {
    if (!userLocation) {
      console.log('[getIncidentDistance] ⏳ User location not available yet');
      return undefined;
    }

    // Use cached lat/lng if available
    if (incidentLat !== undefined && incidentLng !== undefined) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        incidentLat,
        incidentLng
      );
      console.log(
        `[getIncidentDistance] ✅ Distance calculated (cached): ${distance.toFixed(
          1
        )} mi`
      );
      return distance;
    }

    // Geocode address and cache result
    console.log(
      `[getIncidentDistance] 🗺️ No cached location, geocoding: ${address}`
    );
    const location = await geocodeAddress(address);

    if (!location) {
      console.error(
        `[getIncidentDistance] ❌ Failed to geocode: ${address}`
      );
      return undefined;
    }

    // Cache lat/lng in Firestore for future lookups
    try {
      const incidentRef = doc(db, 'incidents', incidentId);
      await updateDoc(incidentRef, {
        lat: location.lat,
        lng: location.lng,
        geocodedAt: new Date().toISOString(),
      });
      console.log(
        `[getIncidentDistance] 💾 Cached lat/lng in Firestore: ${incidentId}`
      );
    } catch (cacheError) {
      console.error(
        '[getIncidentDistance] ⚠️ Failed to cache location:',
        cacheError
      );
      // Continue anyway - distance calculation doesn't depend on caching
    }

    // Calculate distance
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      location.lat,
      location.lng
    );
    console.log(
      `[getIncidentDistance] ✅ Distance calculated (new): ${distance.toFixed(
        1
      )} mi`
    );
    return distance;
  }

  /**
   * Calculate distance using already-known coordinates
   * (Faster than getIncidentDistance when you already have lat/lng)
   */
  function calculateDistanceToPoint(lat: number, lng: number): number | undefined {
    if (!userLocation) return undefined;
    
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      lat,
      lng
    );
  }

  /**
   * Force refresh location (for desktop "Reset Location" button)
   */
  async function refreshLocation(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('[refreshLocation] ❌ Geolocation not supported');
        resolve(false);
        return;
      }

      console.log('[refreshLocation] 🔄 Forcing location refresh...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          
          // Force refresh (bypass movement detection)
          userLocationCache.forceRefresh(newLat, newLng, accuracy, 'gps');
          
          setUserLocation({ lat: newLat, lng: newLng });
          setPermissionGranted(true);
          setError(null);
          
          console.log('[refreshLocation] ✅ Location refreshed successfully');
          resolve(true);
        },
        (err) => {
          console.error('[refreshLocation] ❌ Failed to refresh:', err);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Force fresh location
        }
      );
    });
  }

  return {
    userLocation,
    permissionGranted,
    error,
    getIncidentDistance,
    calculateDistanceToPoint,
    refreshLocation, // For desktop "Reset Location" button
  };
}

