"use client"

import { useEffect, useState } from "react"
import { db, auth } from "@/lib/firebase/firebase"
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore"
import { logError } from "@/lib/utils/logger"
import type { Incident, IncidentUpdate } from "@/types/extended-domain"
import { getUid } from "@/lib/utils/dev"

const BOROUGH_TO_COUNTY: Record<string, string> = {
  Manhattan: "New York",
  Brooklyn: "Kings",
  Queens: "Queens",
  Bronx: "Bronx",
  "Staten Island": "Richmond",
}

interface UpdateData {
  id: string
  message: string
  title: string
  address: string
  stage: string
  ts: string
  lat?: number
  lng?: number
}

export function useIncident(incidentId: string) {
  const [data, setData] = useState<Incident | undefined>()
  const [updates, setUpdates] = useState<UpdateData[]>([])
  const [isLoading, setIsLoading] = useState(!!incidentId)
  const [error, setError] = useState<string | undefined>(incidentId ? undefined : "missing-id")

  useEffect(() => {
    if (!incidentId) return

    const incidentDocRef = doc(db, "incidents", incidentId)
    const updatesCollectionRef = collection(db, "incidents", incidentId, "updates")
    const updatesQuery = query(updatesCollectionRef, orderBy("ts", "desc"))

    const unsubIncident = onSnapshot(
      incidentDocRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          setError("not-found")
          setData(undefined)
          setIsLoading(false)
          return
        }

        const latestData = docSnap.data()
        const userId = getUid(auth.currentUser?.uid)
        const favoritedBy = latestData.favoritedBy || []
        const bookmarkedBy = latestData.bookmarkedBy || []
        const isFavorited = favoritedBy.includes(userId)
        const isBookmarked = bookmarkedBy.includes(userId)
        const rawCounty = latestData.county || ""
        const county = BOROUGH_TO_COUNTY[rawCounty] || rawCounty

        setError(undefined)
        setData({
          id: incidentId,
          incidentNumber: parseInt(incidentId) || 0,
          type: latestData.lastType || latestData.type || "Unknown",
          message: latestData.lastMessage || latestData.message || "",
          address: latestData.address || "",
          city: latestData.city || "",
          county,
          state: latestData.state || "",
          updatedAt:
            latestData.lastTs?.toDate?.()?.toISOString() ||
            latestData.lastSeenAt?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
          updates: [],
          updateCount: latestData.updateCount || 0,
          notes: latestData.notes || [],
          isFavorited,
          isBookmarked,
        })

        setIsLoading(false)
      },
      (e) => {
        setIsLoading(false)
        setError(logError(e, "incident-snapshot", { incidentId }).code)
      }
    )

    const unsubUpdates = onSnapshot(
      updatesQuery,
      (snapshot) => {
        const seenMessages = new Map<string, UpdateData>()
        const updatesData = snapshot.docs
          .map((doc) => {
            const data = doc.data()
            const timestamp =
              data.ts?.toDate?.()?.toISOString() ||
              data.reportedAt?.toDate?.()?.toISOString() ||
              new Date().toISOString()

            return {
              id: doc.id,
              message: data.message || "",
              title: data.title || data.stage || "",
              address: data.address || "",
              stage: data.stage || "update",
              ts: timestamp,
              lat: data.lat,
              lng: data.lng,
            }
          })
          .filter((update) => {
            const normalizedMsg = update.message.trim().toLowerCase().replace(/\s+/g, " ")

            if (seenMessages.has(normalizedMsg)) {
              return false
            }

            seenMessages.set(normalizedMsg, update)
            return true
          })

        setUpdates(updatesData)
      },
      (e) => {
        logError(e, "updates-snapshot", { incidentId })
      }
    )

    return () => {
      unsubIncident()
      unsubUpdates()
    }
  }, [incidentId])

  return { data, updates, isLoading, error }
}

export async function addNote(incidentId: string, note: string): Promise<void> {
  try {
    const incidentRef = doc(db, "incidents", incidentId)
    const incidentSnap = await getDoc(incidentRef)

    if (!incidentSnap.exists()) {
      return
    }

    const currentNotes = incidentSnap.data().notes || []
    const newNote = {
      text: note,
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.uid || "anonymous",
    }

    await updateDoc(incidentRef, {
      notes: [...currentNotes, newNote],
    })
  } catch (error) {
    console.error("[useIncident] Error saving note:", error)
  }
}

export function updateStatus(incidentId: string, status: string): void {
  console.debug("[useIncident] updateStatus:", { incidentId, status })
}
