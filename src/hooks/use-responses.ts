"use client"

import { useState, useEffect } from "react"
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase/firebase"

export interface Response {
  id: string
  incidentId: string
  userId: string
  userName: string
  userRole: string
  incidentAddress: string
  respondedAt: unknown
  status: "active" | "completed" | "cancelled"
  createdAt: unknown
}

export function useResponses(userId: string | undefined) {
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(!!userId)

  useEffect(() => {
    if (!userId) {
      return
    }

    const responsesRef = collection(db, "responses")
    const q = query(responsesRef, where("userId", "==", userId), orderBy("respondedAt", "desc"))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const responsesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Response[]

        setResponses(responsesData)
        setLoading(false)
      },
      () => {
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId])

  return { responses, loading }
}
