"use client"

import { useState } from "react"
import type { FileMeta } from "@/types/extended-domain"

export function useFiles(incidentId: string) {
  const [data] = useState<FileMeta[]>([])
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  // TODO: Replace with Firestore query to 'incidents/{incidentId}/files' subcollection
  // const filesRef = collection(db, 'incidents', incidentId, 'files')
  // const q = query(filesRef, orderBy('uploadedAt', 'desc'))
  // Use onSnapshot for real-time updates

  const upload = (file: File, message?: string) => {
    console.debug("[useFiles] upload:", { incidentId, fileName: file.name, message })
    // TODO: Upload to Firebase Storage, then create document in incidents/{incidentId}/files
  }

  const remove = (fileId: string) => {
    console.debug("[useFiles] remove:", { incidentId, fileId })
    // TODO: Delete from Firebase Storage, then delete document from incidents/{incidentId}/files
  }

  return { data, isLoading, error, upload, remove }
}

// E-Sign action stubs
export function sendForESign(incidentId: string, fileIds: string[], recipientEmail: string): void {
  console.debug("[useFiles] sendForESign:", { incidentId, fileIds, recipientEmail })
  // TODO: Create document in 'esign_packets' collection with status='pending'
}

export function liveSign(incidentId: string, fileIds: string[]): void {
  console.debug("[useFiles] liveSign:", { incidentId, fileIds })
  // TODO: Create document in 'esign_packets' collection with status='completed'
}
