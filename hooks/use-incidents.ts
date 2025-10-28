"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
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
  const [incidents, setIncidents] = useState<IncidentLite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { silenced } = useFavoritesContext()

  // Real-time Firestore listener
  useEffect(() => {
    const incidentsRef = collection(db, "incidents")
    const q = query(incidentsRef, orderBy("updatedAt", "desc"), limit(100))
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as IncidentLite[]
        
        setIncidents(data)
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        console.error("[useIncidents] Firestore error:", err)
        setError(err as Error)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Client-side filtering
  const data = useMemo<IncidentLite[]>(() => {
    let filtered = incidents

    if (!filters) return filtered

    if (!filters.showSilenced) {
      filtered = filtered.filter((inc) => !silenced.has(inc.id))
    }

    if (filters.distanceMi !== undefined) {
      filtered = filtered.filter((inc) => inc.distanceMi !== undefined && inc.distanceMi <= filters.distanceMi!)
    }

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((inc) => filters.types!.includes(inc.type))
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(
        (inc) =>
          inc.address.toLowerCase().includes(keyword) ||
          inc.type.toLowerCase().includes(keyword) ||
          inc.message.toLowerCase().includes(keyword),
      )
    }

    if (filters.highAlertOnly) {
      filtered = filtered.filter((inc) => inc.highAlert)
    }

    if (filters.minUpdates !== undefined) {
      filtered = filtered.filter((inc) => inc.updates && inc.updates.length >= filters.minUpdates!)
    }

    return filtered
  }, [incidents, silenced, filters])

  return { data, isLoading, error }
}

// Action stubs - ready for Firebase implementation
export function respondToAlert(incidentId: string): void {
  console.debug("[useIncidents] respondToAlert:", incidentId)
  // TODO: Update Firestore: incidents/{incidentId} set status='responding', assignedTo=currentUserId
}
