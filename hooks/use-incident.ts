"use client"

import { useState } from "react"
import type { Incident } from "@/types/domain"

export function useIncident(id: string) {
  const [data] = useState<Incident | null>(null)
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  // TODO: Replace with Firestore query to 'incidents/{id}' document
  // const docRef = doc(db, 'incidents', id)
  // Use onSnapshot for real-time updates
  // Also fetch subcollections: incidents/{id}/files, incidents/{id}/homeowner_forms

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
