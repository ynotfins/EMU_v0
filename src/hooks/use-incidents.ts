"use client"

import { useState, useEffect, useMemo } from "react"
import { logger } from "@/lib/utils/logger"
import type { IncidentLite, IncidentUpdate } from "@/types/extended-domain"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { db, auth } from "@/lib/firebase/firebase"
import { useFavoritesContext } from "@/lib/context/favorites-context"

const BOROUGH_TO_COUNTY: Record<string, string> = {
  Manhattan: "New York",
  Brooklyn: "Kings",
  Queens: "Queens",
  Bronx: "Bronx",
  "Staten Island": "Richmond",
}

interface FirestoreIncidentData {
  incidentId?: string | number
  incidentNumber?: string | number
  firestoreDocId?: string
  updatedAt?: string | { seconds: number }
  lastSeenAt?: string | { seconds: number }
  lastTs?: string | { seconds: number }
  timestamp?: string | { seconds: number }
  ts?: string | { seconds: number }
  state?: string
  county?: string
  city?: string
  address?: string
  addr?: string
  street?: string
  type?: string
  lastType?: string
  alertType?: string
  message?: string
  lastMessage?: string
  alertMessage?: string
  highAlert?: boolean
  isSilenced?: boolean
  updates?: IncidentUpdate[]
  favoritedBy?: string[]
  bookmarkedBy?: string[]
  distanceMi?: number
  lat?: number
  lng?: number
  geocodedAt?: string
  notes?: Array<{
    text: string
    createdAt: string
    createdBy: string
  }>
  [key: string]: unknown
}

function normalize(docId: string, data: FirestoreIncidentData): IncidentLite {
  let updatedAt =
    data.updatedAt ||
    data.lastSeenAt ||
    data.lastTs ||
    data.timestamp ||
    data.ts ||
    new Date().toISOString()
  if (typeof updatedAt === "object" && updatedAt.seconds) {
    updatedAt = new Date(updatedAt.seconds * 1000).toISOString()
  }

  const state = data.state || ""
  const rawCounty = data.county || ""
  const county = BOROUGH_TO_COUNTY[rawCounty] || rawCounty
  const city = data.city || ""
  const address = data.address || data.addr || data.street || ""
  const rawType = data.type || data.lastType || data.alertType || "Unknown"
  const type = rawType.replace(/\bBNN\b/gi, "").trim().replace(/\s+/g, " ") || "Unknown"
  const rawMessage = data.message || data.lastMessage || data.alertMessage || ""
  const message = rawMessage.replace(/\bBNN\b/gi, "").trim().replace(/\s+/g, " ")

  const normalized = {
    id: docId,
    incidentNumber:
      data.incidentNumber ||
      data.incidentId ||
      data.firestoreDocId ||
      parseInt(docId) ||
      0,
    updatedAt,
    state,
    county,
    city,
    address,
    type,
    message,
    highAlert: data.highAlert || false,
    isFavorited: false,
    isBookmarked: false,
    isSilenced: data.isSilenced || false,
    distanceMi: data.distanceMi,
    lat: data.lat,
    lng: data.lng,
    geocodedAt: data.geocodedAt,
    updates: data.updates || [],
    favoritedBy: data.favoritedBy || [],
    bookmarkedBy: data.bookmarkedBy || [],
    incidentId: data.firestoreDocId || String(data.incidentId || docId),
    notes: data.notes || [],
  } satisfies IncidentLite

  const isDevelopment =
    typeof window !== "undefined" && window.location.hostname === "localhost"
  if (
    isDevelopment &&
    (docId === "6xE4cVQPSqpjn88vC4kE" ||
      docId === "1834007" ||
      Math.random() < 0.02)
  ) {
    logger.debug(`Document ${docId} fields`, {
      code: "normalize",
      docId,
      incidentId: data.incidentId,
      incidentNumber: data.incidentNumber,
      fieldNames: Object.keys(data),
    })
  }

  return normalized
}

export function formatListLines(incident: IncidentLite) {
  const line1Date = new Date(incident.updatedAt)
  const dateStr = line1Date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })
  const timeStr = line1Date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
  const distance = incident.distanceMi != null ? `${Math.round(incident.distanceMi)} mi` : ""
  const header = `${dateStr} ${timeStr}`
  const metaRight = distance ? ` · ${distance}` : ""
  const l1 = `${header}${metaRight}`

  const l2Left = `${incident.state} | ${incident.county} | ${incident.city} | ${incident.address}`.replace(
    /\s+\|\s+\|/g,
    " |"
  )
  const l2 = l2Left

  const l3 = `${incident.type} | ${incident.message}`.replace(/\s+\|\s+\|/g, " |")

  return { l1, l2, l3 }
}

function withUserFlags(incident: IncidentLite): IncidentLite {
  const uid = auth.currentUser?.uid
  if (!uid) {
    return {
      ...incident,
      isFavorited: false,
      isBookmarked: false,
    }
  }

  const favoritedBy = incident.favoritedBy ?? []
  const bookmarkedBy = incident.bookmarkedBy ?? []
  const isFavorited = favoritedBy.includes(uid)
  const isBookmarked = bookmarkedBy.includes(uid)

  if (isFavorited || isBookmarked) {
    logger.debug(`Incident ${incident.incidentNumber} user flags`, {
      code: "withUserFlags",
      incidentNumber: incident.incidentNumber,
      uid,
      isFavorited,
      isBookmarked,
      favoritedByCount: favoritedBy.length,
      bookmarkedByCount: bookmarkedBy.length,
    })
  }

  return {
    ...incident,
    isFavorited,
    isBookmarked,
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

  useEffect(() => {
    const incidentsRef = collection(db, "incidents")
    const q = query(incidentsRef, orderBy("updatedAt", "desc"), limit(500))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupedMap = new Map<string, FirestoreIncidentData & { firestoreDocId: string }>()

        snapshot.docs.forEach((doc) => {
          const data = doc.data() as FirestoreIncidentData
          const incidentId = data.incidentId || doc.id
          const existing = groupedMap.get(String(incidentId))

          if (
            !existing ||
            ((data.lastSeenAt as { seconds: number })?.seconds || 0) >
              (existing.lastSeenAt as { seconds: number })?.seconds || 0
          ) {
            groupedMap.set(String(incidentId), { ...data, firestoreDocId: doc.id })
          }
        })

        const data = Array.from(groupedMap.values())
          .map((docData) => withUserFlags(normalize(docData.firestoreDocId, docData)))
          .sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )

        logger.info(`Loaded ${data.length} unique incidents from ${snapshot.docs.length} documents`, {
          code: "useIncidents",
          uniqueCount: data.length,
          documentCount: snapshot.docs.length,
        })
        setIncidents(data)
        setIsLoading(false)
        setError(null)
      },
      (err) => {
        logger.error("Firestore error", err, { code: "useIncidents" })
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const data = useMemo<IncidentLite[]>(() => {
    let filtered = incidents

    if (!filters) return filtered

    if (filters.distanceMi !== undefined) {
      const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000
      filtered = filtered.filter((inc) => {
        const incidentTime = new Date(inc.updatedAt).getTime()
        const isRecent = incidentTime >= fourHoursAgo
        const withinDistance =
          inc.distanceMi !== undefined && inc.distanceMi <= (filters.distanceMi ?? 0)
        return isRecent && withinDistance
      })
    }

    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter((inc) => filters.types?.includes(inc.type))
    }

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      filtered = filtered.filter(
        (inc) =>
          inc.address.toLowerCase().includes(keyword) ||
          inc.type.toLowerCase().includes(keyword) ||
          inc.message.toLowerCase().includes(keyword)
      )
    }

    if (filters.highAlertOnly) {
      filtered = filtered.filter((inc) => inc.highAlert)
    }

    if (filters.minUpdates !== undefined) {
      filtered = filtered.filter(
        (inc) => inc.updates && inc.updates.length >= (filters.minUpdates ?? 0)
      )
    }

    return filtered
  }, [incidents, silenced, filters])

  return { data, isLoading, error }
}

export async function toggleFavorite(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: "toggleFavorite" })
    return
  }

  logger.debug("Starting toggle favorite", {
    code: "toggleFavorite",
    userId,
    incidentId,
  })

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    const snap = await getDoc(incidentRef)
    if (!snap.exists()) {
      logger.error("Document not found", undefined, {
        code: "toggleFavorite",
        incidentId,
      })
      return
    }

    const data = snap.data()
    const favoritedBy = data.favoritedBy || []
    const isFavorited = favoritedBy.includes(userId)

    logger.debug("Current favorite state", {
      code: "toggleFavorite",
      isFavorited,
      action: isFavorited ? "REMOVE" : "ADD",
      favoritedByCount: favoritedBy.length,
    })

    if (isFavorited) {
      await updateDoc(incidentRef, {
        favoritedBy: arrayRemove(userId),
      })
      logger.info("Removed from favorites", {
        code: "toggleFavorite",
        userId,
        incidentId,
      })
    } else {
      await updateDoc(incidentRef, {
        favoritedBy: arrayUnion(userId),
      })
      logger.info("Added to favorites", {
        code: "toggleFavorite",
        userId,
        incidentId,
      })
    }
  } catch (error) {
    logger.error("Error toggling favorite", error, {
      code: "toggleFavorite",
      incidentId,
      userId,
    })
    throw error
  }
}

export async function unfavorite(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: "unfavorite" })
    return
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    await updateDoc(incidentRef, {
      favoritedBy: arrayRemove(userId),
    })
    logger.info("Unfavorited incident", {
      code: "unfavorite",
      userId,
      incidentId,
    })
  } catch (error) {
    logger.error("Error unfavoriting", error, {
      code: "unfavorite",
      incidentId,
      userId,
    })
  }
}

export async function toggleBookmark(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: "toggleBookmark" })
    return
  }

  logger.debug("Starting toggle bookmark", {
    code: "toggleBookmark",
    userId,
    incidentId,
  })

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    const snap = await getDoc(incidentRef)
    if (!snap.exists()) {
      logger.error("Document not found", undefined, {
        code: "toggleBookmark",
        incidentId,
      })
      return
    }

    const data = snap.data()
    const bookmarkedBy = data.bookmarkedBy || []
    const isBookmarked = bookmarkedBy.includes(userId)

    logger.debug("Current bookmark state", {
      code: "toggleBookmark",
      isBookmarked,
      action: isBookmarked ? "REMOVE" : "ADD",
      bookmarkedByCount: bookmarkedBy.length,
    })

    if (isBookmarked) {
      await updateDoc(incidentRef, {
        bookmarkedBy: arrayRemove(userId),
      })
      logger.info("Removed from bookmarks", {
        code: "toggleBookmark",
        userId,
        incidentId,
      })
    } else {
      await updateDoc(incidentRef, {
        bookmarkedBy: arrayUnion(userId),
      })
      logger.info("Added to bookmarks", {
        code: "toggleBookmark",
        userId,
        incidentId,
      })
    }
  } catch (error) {
    logger.error("Error toggling bookmark", error, {
      code: "toggleBookmark",
      incidentId,
      userId,
    })
    throw error
  }
}

export async function unbookmark(incidentId: string): Promise<void> {
  const userId = auth.currentUser?.uid
  if (!userId) {
    logger.error("No authenticated user", undefined, { code: "unbookmark" })
    return
  }

  try {
    const incidentRef = doc(db, "incidents", incidentId)
    await updateDoc(incidentRef, {
      bookmarkedBy: arrayRemove(userId),
    })
    logger.info("Unbookmarked incident", {
      code: "unbookmark",
      userId,
      incidentId,
    })
  } catch (error) {
    logger.error("Error unbookmarking", error, {
      code: "unbookmark",
      incidentId,
      userId,
    })
  }
}

export function respondToAlert(incidentId: string): void {
  logger.debug("Responding to alert", {
    code: "respondToAlert",
    incidentId,
  })
}
