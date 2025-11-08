"use client"

import { useState, useEffect } from "react"
import { useIncidents } from "./use-incidents"
import { useLocationDistance } from "./use-location-distance"
import type { IncidentLite } from "@/types/extended-domain"
import type { IncidentFilters } from "./use-incidents"

export function useIncidentsWithDistance(filters?: Partial<IncidentFilters>) {
  const filtersWithoutDistance = filters ? { ...filters, distanceMi: undefined } : undefined
  const { data: incidents, isLoading, error } = useIncidents(filtersWithoutDistance)
  const { userLocation, permissionGranted, getIncidentDistance } = useLocationDistance()

  const [enrichedIncidents, setEnrichedIncidents] = useState<IncidentLite[]>([])
  const [calculatingDistance, setCalculatingDistance] = useState(false)

  useEffect(() => {
    if (!userLocation || incidents.length === 0) {
      setEnrichedIncidents(incidents)
      return
    }

    setEnrichedIncidents(incidents)

    let isMounted = true
    let hasRun = false
    setCalculatingDistance(true)

    async function enrichWithDistances() {
      if (hasRun) return
      hasRun = true

      const BATCH_SIZE = 5

      for (let i = 0; i < incidents.length && isMounted; i += BATCH_SIZE) {
        const batch = incidents.slice(i, i + BATCH_SIZE)

        await Promise.all(
          batch.map(async (incident) => {
            const addressParts = [incident.address, incident.city, incident.state].filter(
              (part) => part && part.trim().length > 0
            )

            if (addressParts.length === 0) {
              return
            }

            const fullAddress = addressParts.join(", ")
            const distance =
              incident.lat !== null &&
              incident.lat !== undefined &&
              incident.lng !== null &&
              incident.lng !== undefined
                ? await getIncidentDistance(incident.id, fullAddress, incident.lat, incident.lng)
                : await getIncidentDistance(incident.id, fullAddress, undefined, undefined)

            if (isMounted && distance !== undefined) {
              setEnrichedIncidents((prev) =>
                prev.map((inc) => (inc.id === incident.id ? { ...inc, distanceMi: distance } : inc))
              )
            }
          })
        )

        if (i + BATCH_SIZE < incidents.length) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      if (isMounted) {
        setCalculatingDistance(false)
      }
    }

    enrichWithDistances()

    return () => {
      isMounted = false
    }
  }, [incidents, userLocation, getIncidentDistance])

  let filteredIncidents = enrichedIncidents

  if (filters?.distanceMi !== undefined && userLocation) {
    const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000
    filteredIncidents = enrichedIncidents.filter((inc) => {
      const incidentTime = new Date(inc.updatedAt).getTime()
      const isRecent = incidentTime >= fourHoursAgo
      const withinDistance =
        inc.distanceMi !== undefined && inc.distanceMi <= (filters.distanceMi ?? 0)
      return isRecent && withinDistance
    })
  }

  return {
    data: filteredIncidents,
    isLoading,
    error,
    userLocation,
    locationPermissionGranted: permissionGranted,
  }
}
