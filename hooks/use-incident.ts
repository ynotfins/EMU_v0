"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, onSnapshot } from "firebase/firestore"
import { logError } from "@/lib/logger"
import type { Incident } from "@/types/domain"

export function useIncident(id: string) {
  const [data, setData] = useState<Incident | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    if (!id) {
      setError("missing-id")
      setIsLoading(false)
      return
    }

    const ref = doc(db, "incidents", id)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setIsLoading(false)
        if (!snap.exists()) {
          setError("not-found")
          setData(undefined)
          return
        }
        setError(undefined)
        setData({ id: snap.id, ...(snap.data() as any) })
      },
      (e) => {
        setIsLoading(false)
        setError(logError(e, "incident-snapshot", { id }).code)
      },
    )

    return () => unsub()
  }, [id])

  return { data, isLoading, error }
}

// Action stubs - ready for Firebase implementation
export function addNote(incidentId: string, note: string): void {
  console.debug("[useIncident] addNote:", { incidentId, note })
  // TODO: Update Firestore: incidents/{incidentId} append to notes field
}

export function updateStatus(incidentId: string, status: string): void {
  console.debug("[useIncident] updateStatus:", { incidentId, status })
  // TODO: Update Firestore: incidents/{incidentId} set status field
}
