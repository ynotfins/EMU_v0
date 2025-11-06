"use client"

import { MessageSquare, Users, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Thread } from "@/types/extended-domain"

interface ThreadListProps {
  threads: Thread[]
  onSelectThread: (threadId: string) => void
}

export function ThreadList({ threads, onSelectThread }: ThreadListProps) {
  const formatTime = (isoString?: string) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getThreadIcon = (kind: Thread["kind"]) => {
    switch (kind) {
      case "incident":
        return <AlertCircle className="h-5 w-5 text-[#FF3B30]" />
      case "direct":
        return <MessageSquare className="h-5 w-5 text-[#34C759]" />
      default:
        return <MessageSquare className="h-5 w-5 text-[#34C759]" />
    }
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <Card
          key={thread.id}
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectThread(thread.id)}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{getThreadIcon(thread.kind)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{thread.title}</h3>
                {thread.lastMessageTimestamp && (
                  <span className="text-xs text-[#6B7280]">{formatTime(thread.lastMessageTimestamp)}</span>
                )}
              </div>
              {thread.lastMessageContent && (
                <p className="text-sm text-[#6B7280] line-clamp-1">{thread.lastMessageContent}</p>
              )}
              {thread.kind === "incident" && (
                <Badge variant="outline" className="text-xs">
                  Incident Thread
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
