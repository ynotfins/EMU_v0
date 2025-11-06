"use client"

import { useState } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Message } from "@/types/extended-domain"

interface ChatRoomProps {
  threadTitle: string
  messages: Message[]
  currentUserId: string
  onBack: () => void
  onSend: (text: string) => void
}

export function ChatRoom({ threadTitle, messages, currentUserId, onBack, onSend }: ChatRoomProps) {
  const [inputText, setInputText] = useState("")

  const handleSend = () => {
    if (inputText.trim()) {
      onSend(inputText)
      setInputText("")
    }
  }

  const formatTime = (isoString: string | Date | undefined) => {
    if (!isoString) return ''
    const date = isoString instanceof Date ? isoString : new Date(isoString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-[#F2F2F7]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{threadTitle}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isCurrentUser ? "bg-[#007AFF] text-white" : "bg-white text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? "text-white/70" : "text-[#6B7280]"}`}>
                    {formatTime(message.ts)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#E5E7EB] p-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!inputText.trim()} className="bg-[#007AFF] hover:bg-[#0051D5]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
