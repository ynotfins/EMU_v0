"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import type { IncidentLite } from "@/types/domain"
import { useFavoritesContext } from "@/lib/context/favorites-context"

// Normalize inconsistent Firestore data into IncidentLite type
function normalize(docId: string, data: any): IncidentLite {
  // Handle timestamp variations
  let updatedAt = data.updatedAt || data.timestamp || new Date().toISOString()
  if (typeof updatedAt === "object" && updatedAt.seconds) {
    updatedAt = new Date(updatedAt.seconds * 1000).toISOString()
  }

  return {
    id: docId,
    incidentNumber: data.incidentNumber || data.alertNumber || 0,
    updatedAt,
    state: data.state || "",
    county: data.county || "",
    city: data.city || "",
    address: data.address || data.addr || data.street || "",
    type: data.type || data.alertType || "Unknown",
    message: data.message || data.alertMessage || "",
    highAlert: data.highAlert || false,
    isFavorited: false, // Computed client-side from favoritedBy array
    isBookmarked: false, // Computed client-side from bookmarkedBy array
    isSilenced: data.isSilenced || false,
    distanceMi: data.distanceMi,
    updates: data.updates || [],
    // Store raw arrays for favorite/bookmark logic
    favoritedBy: data.favoritedBy || [],
    bookmarkedBy: data.bookmarkedBy || [],
  }
}

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
        const rawData = snapshot.docs.map((doc) => normalize(doc.id, doc.data()))
        
        // Sort by updatedAt descending (newest first)
        rawData.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        
        // Compute isFavorited/isBookmarked based on current user
        const userId = auth.currentUser?.uid
        const normalized = rawData.map((inc) => ({
          ...inc,
          isFavorited: userId ? inc.favoritedBy?.includes(userId) : false,
          isBookmarked: userId ? inc.bookmarkedBy?.includes(userId) : false,
        }))
        
        setIncidents(normalized)
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

// Firestore actions for favorites and bookmarks
export async function toggleFavorite(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    console.warn("[toggleFavorite] No user logged in")
    return
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    await updateDoc(incidentRef, {
      favoritedBy: arrayUnion(userId),
    })
  } catch (error) {
    console.error("[toggleFavorite] Error:", error)
  }
}

export async function unfavorite(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    console.warn("[unfavorite] No user logged in")
    return
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    await updateDoc(incidentRef, {
      favoritedBy: arrayRemove(userId),
    })
  } catch (error) {
    console.error("[unfavorite] Error:", error)
  }
}

export async function toggleBookmark(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    console.warn("[toggleBookmark] No user logged in")
    return
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    await updateDoc(incidentRef, {
      bookmarkedBy: arrayUnion(userId),
    })
  } catch (error) {
    console.error("[toggleBookmark] Error:", error)
  }
}

export async function unbookmark(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    console.warn("[unbookmark] No user logged in")
    return
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    await updateDoc(incidentRef, {
      bookmarkedBy: arrayRemove(userId),
    })
  } catch (error) {
    console.error("[unbookmark] Error:", error)
  }
}

// Action stubs - ready for Firebase implementation
export function respondToAlert(incidentId: string): void {
  console.debug("[useIncidents] respondToAlert:", incidentId)
  // TODO: Update Firestore: incidents/{incidentId} set status='responding', assignedTo=currentUserId
}
