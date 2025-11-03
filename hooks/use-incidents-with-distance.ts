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
  // DON'T pass distance filter to useIncidents - we'll apply it AFTER distance calculation
  const filtersWithoutDistance = filters
    ? { ...filters, distanceMi: undefined }
    : undefined;
  const {
    data: incidents,
    isLoading,
    error,
  } = useIncidents(filtersWithoutDistance);
  const { userLocation, permissionGranted, getIncidentDistance } =
    useLocationDistance();

  const [enrichedIncidents, setEnrichedIncidents] = useState<IncidentLite[]>(
    []
  );
  const [calculatingDistance, setCalculatingDistance] = useState(false);

  // Calculate distances whenever incidents or user location changes
  useEffect(() => {
    console.log('[useIncidentsWithDistance] Effect triggered');
    console.log(`  - User location: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Not available'}`);
    console.log(`  - Location permission: ${permissionGranted}`);
    console.log(`  - Incidents count: ${incidents.length}`);

    if (!userLocation || incidents.length === 0) {
      // If no user location, just pass through incidents as-is
      console.log('[useIncidentsWithDistance] No location or no incidents - passing through');
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
        console.log(
          "[useIncidentsWithDistance] ⏭️ Already running, skipping..."
        );
        return;
      }
      hasRun = true;

      // Process ALL incidents for scrolling support
      console.log(
        `[useIncidentsWithDistance] 📏 Processing ALL ${incidents.length} incidents for distance calculation`
      );

      // Process in batches to avoid blocking UI for too long
      const BATCH_SIZE = 5; // Process 5 at a time

      for (let i = 0; i < incidents.length && isMounted; i += BATCH_SIZE) {
        const batch = incidents.slice(i, i + BATCH_SIZE);

        // Process batch in parallel
        await Promise.all(
          batch.map(async (incident) => {
            let distance: number | undefined;

            // If we have cached lat/lng, calculate distance (fast!)
            if (
              incident.lat !== null &&
              incident.lat !== undefined &&
              incident.lng !== null &&
              incident.lng !== undefined
            ) {
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

            // Update incident with distance
            if (isMounted && distance !== undefined) {
              setEnrichedIncidents((prev) =>
                prev.map((inc) =>
                  inc.id === incident.id
                    ? { ...inc, distanceMi: distance }
                    : inc
                )
              );
            }
          })
        );

        // Small delay between batches to keep UI responsive
        if (i + BATCH_SIZE < incidents.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      if (isMounted) {
        console.log(
          `[useIncidentsWithDistance] ✅ Distance calculation complete - processed ${incidents.length} incidents`
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

  // Apply distance filter AFTER enrichment (when distanceMi is calculated)
  let filteredIncidents = enrichedIncidents;

  if (filters?.distanceMi !== undefined && userLocation) {
    const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
    filteredIncidents = enrichedIncidents.filter((inc) => {
      const incidentTime = new Date(inc.updatedAt).getTime();
      const isRecent = incidentTime >= fourHoursAgo;
      const withinDistance =
        inc.distanceMi !== undefined && inc.distanceMi <= filters.distanceMi!;

      // Debug logging for distance filter
      if (inc.distanceMi !== undefined) {
        console.log(
          `[distance filter] ${inc.address}: ${inc.distanceMi.toFixed(1)}mi - ${
            withinDistance && isRecent ? "SHOW" : "HIDE"
          }`
        );
      }

      return isRecent && withinDistance;
    });
    console.log(
      `[useIncidentsWithDistance] 🔍 Distance filter: ${filteredIncidents.length}/${enrichedIncidents.length} incidents within ${filters.distanceMi}mi in last 4 hours`
    );
  }

  return {
    data: filteredIncidents,
    isLoading: isLoading, // Don't wait for distance calculation!
    error,
    userLocation,
    locationPermissionGranted: permissionGranted,
  };
}
