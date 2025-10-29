"use client"

import { useState, useMemo } from "react"
import type { IncidentLite } from "@/types/domain"
import { useFavoritesContext } from "@/lib/context/favorites-context"

export interface IncidentFilters {
  distanceMi?: number
  types: string[]
  keyword: string
  highAlertOnly: boolean
  minUpdates?: number
  showSilenced?: boolean
}

export function useIncidents(filters?: Partial<IncidentFilters>) {
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)
  const { favorites, bookmarks, silenced } = useFavoritesContext()

  // TODO: Replace with Firestore query to 'incidents' collection
  // const incidentsRef = collection(db, 'incidents')
  // const q = query(incidentsRef, orderBy('createdAt', 'desc'))
  // Use onSnapshot for real-time updates
  const data = useMemo<IncidentLite[]>(() => {
    let filtered: IncidentLite[] = []

    // TODO: Apply Firestore filters here instead of client-side filtering
    // - where('status', '==', 'active')
    // - where('distanceMi', '<=', filters.distanceMi)
    // - where('type', 'in', filters.types)

    if (!filters) return filtered

    if (!filters.showSilenced) {
      filtered = filtered.filter((inc) => !silenced.has(inc.id))
    }

    if (filters.distanceMi !== undefined) {
      filtered = filtered.filter((inc) => inc.distanceMi <= filters.distanceMi!)
    }

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((inc) => filters.types!.includes(inc.type))
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(
        (inc) =>
          inc.title?.toLowerCase().includes(keyword) ||
          inc.address.toLowerCase().includes(keyword) ||
          inc.type.toLowerCase().includes(keyword) ||
          inc.message.toLowerCase().includes(keyword),
      )
    }

    if (filters.highAlertOnly) {
      filtered = filtered.filter((inc) => inc.highAlert)
    }

    if (filters.minUpdates !== undefined) {
      filtered = filtered.filter((inc) => inc.updates.length >= filters.minUpdates!)
    }

    return filtered
  }, [favorites, bookmarks, silenced, filters])

  return { data, isLoading, error }
}

// Action stubs - ready for Firebase implementation
export function respondToAlert(incidentId: string): void {
  console.debug("[useIncidents] respondToAlert:", incidentId)
  // TODO: Update Firestore: incidents/{incidentId} set status='responding', assignedTo=currentUserId
}
