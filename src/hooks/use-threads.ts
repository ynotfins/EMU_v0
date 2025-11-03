"use client"

import { useState } from "react"
import type { Thread } from "@/types/domain"

export function useThreads() {
  const [data] = useState<Thread[]>([])
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  // TODO: Replace with Firestore query to 'threads' collection
  // const threadsRef = collection(db, 'threads')
  // const q = query(threadsRef, where('participants', 'array-contains', currentUserId), orderBy('lastMessageAt', 'desc'))
  // Use onSnapshot for real-time updates

  return { data, isLoading, error }
}
