"use client"

import { useState } from "react"
import type { FileMeta } from "@/types/extended-domain"

export function useFiles(incidentId: string) {
  const [data] = useState<FileMeta[]>([])
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  const upload = (file: File, message?: string) => {
    console.debug("[useFiles] upload:", { incidentId, fileName: file.name, message })
  }

  const remove = (fileId: string) => {
    console.debug("[useFiles] remove:", { incidentId, fileId })
  }

  return { data, isLoading, error, upload, remove }
}

export function sendForESign(incidentId: string, fileIds: string[], recipientEmail: string): void {
  console.debug("[useFiles] sendForESign:", { incidentId, fileIds, recipientEmail })
}

export function liveSign(incidentId: string, fileIds: string[]): void {
  console.debug("[useFiles] liveSign:", { incidentId, fileIds })
}
