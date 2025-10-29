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

    let isMounted = true;
    setCalculatingDistance(true);

    async function enrichWithDistances() {
      // OPTIMIZATION: Only geocode first 20 incidents (visible on screen)
      // Rest will use cached lat/lng if available, or show undefined distance
      const BATCH_SIZE = 20;
      
      console.log(
        `[useIncidentsWithDistance] 📏 Calculating distances (first ${Math.min(BATCH_SIZE, incidents.length)} will geocode if needed)`
      );

      const enriched = await Promise.all(
        incidents.map(async (incident, index) => {
          // Only geocode first batch (visible incidents)
          const shouldGeocode = index < BATCH_SIZE;
          
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
          // Else: distance remains undefined (not visible, not cached)

          return {
            ...incident,
            distanceMi: distance,
          };
        })
      );

      if (isMounted) {
        const withDistance = enriched.filter(i => i.distanceMi !== undefined).length;
        console.log(
          `[useIncidentsWithDistance] ✅ Distances calculated for ${withDistance}/${enriched.length} incidents`
        );
        setEnrichedIncidents(enriched);
        setCalculatingDistance(false);
      }
    }

    enrichWithDistances();

    return () => {
      isMounted = false;
    };
  }, [incidents, userLocation, getIncidentDistance]);

  return {
    data: enrichedIncidents,
    isLoading: isLoading || calculatingDistance,
    error,
    userLocation,
    locationPermissionGranted: permissionGranted,
  };
}

