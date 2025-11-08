"use client"

import { useState } from "react"
import type { Message } from "@/types/extended-domain"

export function useMessages(threadId: string) {
  const [data] = useState<Message[]>([])
  const [isLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  const send = (text: string) => {
    console.debug("[useMessages] send:", { threadId, text })
  }

  return { data, isLoading, error, send }
}

export function sendMessage(threadId: string, text: string): void {
  console.debug("[useMessages] sendMessage:", { threadId, text })
}
