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
    let hasRun = false; // Prevent multiple runs
    setCalculatingDistance(true);

    async function enrichWithDistances() {
      if (hasRun) {
        console.log('[useIncidentsWithDistance] ⏭️ Already running, skipping...');
        return;
      }
      hasRun = true;
      
      // OPTIMIZATION: Only process visible incidents (8 visible + 4 preload = 12 total)
      const VISIBLE_COUNT = 8;  // Max visible on screen
      const PRELOAD_COUNT = 4;  // Preload next 4 for smooth scrolling
      const BATCH_SIZE = VISIBLE_COUNT + PRELOAD_COUNT; // Total: 12
      
      console.log(
        `[useIncidentsWithDistance] 📏 Processing ONLY first ${BATCH_SIZE} incidents (${VISIBLE_COUNT} visible + ${PRELOAD_COUNT} preload)`
      );

      // CRITICAL FIX: Only loop through BATCH_SIZE, not all incidents!
      const incidentsToProcess = incidents.slice(0, BATCH_SIZE);
      
      for (let i = 0; i < incidentsToProcess.length && isMounted; i++) {
        const incident = incidentsToProcess[i];
        
        let distance: number | undefined;
        
        // If we have cached lat/lng, calculate distance (fast!)
        if (incident.lat !== null && incident.lat !== undefined && 
            incident.lng !== null && incident.lng !== undefined) {
          distance = await getIncidentDistance(
            incident.id,
            `${incident.address}, ${incident.city}, ${incident.state}`,
            incident.lat,
            incident.lng
          );
        } else {
          // No cached lat/lng, need to geocode (slower)
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
          `[useIncidentsWithDistance] ✅ Distance calculation complete - processed ${incidentsToProcess.length} incidents`
        );
        setCalculatingDistance(false);
      }
    }

    // Run in background without blocking UI
    enrichWithDistances();

    return () => {
      isMounted = false;
    };
  }, [incidents, userLocation]); // REMOVED getIncidentDistance from dependencies!

  return {
    data: enrichedIncidents,
    isLoading: isLoading, // Don't wait for distance calculation!
    error,
    userLocation,
    locationPermissionGranted: permissionGranted,
  };
}

