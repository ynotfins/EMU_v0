/**
 * Incidents Hook with Real-Time Distance Calculation
 * 
 * This hook wraps useIncidents and enriches each incident with:
 * - Real-time distance calculation based on user's current location
 * - On-demand geocoding for incidents without cached lat/lng
 * 
 * Distance calculation happens asynchronously and updates as:
 * - User's location changes (moves)
 * - New incidents arrive
 * - Addresses get geocoded
 */

"use client";

import { useState, useEffect } from "react";
import { useIncidents } from "./use-incidents";
import { useLocationDistance } from "./use-location-distance";
import type { IncidentLite } from "@/types/domain";
import type { IncidentFilters } from "./use-filters";

/**
 * Enhanced useIncidents with real-time distance calculation
 * Drop-in replacement for useIncidents
 */
export function useIncidentsWithDistance(filters?: Partial<IncidentFilters>) {
  const { data: incidents, isLoading, error } = useIncidents(filters);
  const {
    userLocation,
    permissionGranted,
    getIncidentDistance,
  } = useLocationDistance();

  const [enrichedIncidents, setEnrichedIncidents] = useState<IncidentLite[]>(
    []
  );
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  // Calculate distances whenever incidents or user location changes
  useEffect(() => {
    if (!userLocation || incidents.length === 0) {
      // If no user location, just pass through incidents as-is
      setEnrichedIncidents(incidents);
      return;
    }

    // CRITICAL FIX: Show incidents IMMEDIATELY, calculate distances in background
    // This prevents UI blocking!
    setEnrichedIncidents(incidents);

    let isMounted = true;
    setCalculatingDistance(true);

    async function enrichWithDistances() {
      // OPTIMIZATION: Only geocode first 10 incidents (visible on screen)
      // Reduced from 20 to 10 for even faster loading
      const BATCH_SIZE = 10;
      
      console.log(
        `[useIncidentsWithDistance] 📏 Calculating distances in background (first ${Math.min(BATCH_SIZE, incidents.length)} will geocode if needed)`
      );

      // Process incidents one by one to avoid blocking
      for (let i = 0; i < incidents.length && isMounted; i++) {
        const incident = incidents[i];
        const shouldGeocode = i < BATCH_SIZE;
        
        let distance: number | undefined;
        
        // If we have cached lat/lng, always calculate distance
        if (incident.lat !== null && incident.lat !== undefined && 
            incident.lng !== null && incident.lng !== undefined) {
          distance = await getIncidentDistance(
            incident.id,
            `${incident.address}, ${incident.city}, ${incident.state}`,
            incident.lat,
            incident.lng
          );
        } else if (shouldGeocode) {
          // Only geocode if in first batch
          distance = await getIncidentDistance(
            incident.id,
            `${incident.address}, ${incident.city}, ${incident.state}`,
            undefined,
            undefined
          );
        }
        
        // Update incidents progressively as each distance is calculated
        if (isMounted && distance !== undefined) {
          setEnrichedIncidents(prev => 
            prev.map(inc => 
              inc.id === incident.id 
                ? { ...inc, distanceMi: distance }
                : inc
            )
          );
        }
      }

      if (isMounted) {
        console.log(
          `[useIncidentsWithDistance] ✅ Distance calculation complete (background process)`
        );
        setCalculatingDistance(false);
      }
    }

    // Run in background without blocking UI
    enrichWithDistances();

    return () => {
      isMounted = false;
    };
  }, [incidents, userLocation, getIncidentDistance]);

  return {
    data: enrichedIncidents,
    isLoading: isLoading, // Don't wait for distance calculation!
    error,
    userLocation,
    locationPermissionGranted: permissionGranted,
  };
}

