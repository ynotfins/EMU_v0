"use client"

import { useRouter } from "next/navigation"
import { ChatRoom } from "@/components/chat-room"
import { useMessages } from "@/hooks/use-messages"
import { useThreads } from "@/hooks/use-threads"
import { useProfile } from "@/hooks/use-profile"

export default function ChaserChatRoomPage({ params }: { params: { threadId: string } }) {
  const router = useRouter()
  const { data: threads } = useThreads()
  const { data: messages, send } = useMessages(params.threadId)
  const { data: profile } = useProfile()

  const thread = threads.find((t) => t.id === params.threadId)

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <p className="text-[#6B7280]">Thread not found</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <p className="text-[#6B7280]">Loading...</p>
      </div>
    )
  }

  return (
    <ChatRoom
      threadTitle={thread.title}
      messages={messages}
      currentUserId={profile.uid}
      onBack={() => router.back()}
      onSend={send}
    />
  )
}
