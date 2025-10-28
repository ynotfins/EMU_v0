"use client"

import { RoleLayout } from "@/components/role-layout"
import { ThreadList } from "@/components/thread-list"
import { useThreads } from "@/hooks/use-threads"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function ChaserChatPage() {
  const router = useRouter()
  const { data: threads } = useThreads()

  const handleSelectThread = (threadId: string) => {
    router.push(`/chaser/chat/${threadId}`)
  }

  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Chat</h1>
            <Badge className="bg-[#34C759] hover:bg-[#2DA84A]">Online</Badge>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto p-4">
          <ThreadList threads={threads} onSelectThread={handleSelectThread} />
        </div>
      </div>
    </RoleLayout>
  )
}
