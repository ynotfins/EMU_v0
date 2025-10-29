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
 */
async function geocodeAddress(address: string): Promise<Location | null> {
  console.log('[geocodeAddress] 🗺️ Geocoding:', address);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

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
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      setPermissionGranted(false);
      return;
    }

    console.log('[useLocationDistance] 📍 Requesting location permission...');

    // Watch position for real-time updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('[useLocationDistance] ✅ Location updated:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setPermissionGranted(true);
        setError(null);
      },
      (err) => {
        console.error('[useLocationDistance] ❌ Location error:', err);
        setError(err.message);
        setPermissionGranted(false);
      },
      {
        enableHighAccuracy: false, // Use network location (faster, less battery)
        timeout: 10000,
        maximumAge: 60000, // Cache location for 1 minute
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

  return {
    userLocation,
    permissionGranted,
    error,
    getIncidentDistance,
    calculateDistanceToPoint,
  };
}

