"use client"

import { useState } from "react"
import type { Thread } from "@/types/extended-domain"

export function useThreads() {
  const [data] = useState<Thread[]>([])
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  return { data, isLoading, error }
}
