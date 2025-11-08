"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import type { Message } from "@/types/extended-domain"
import { chatMessageSchema, type ChatMessageInput } from "@/schemas/chat.schema"

interface ChatRoomProps {
  threadTitle: string
  messages: Message[]
  currentUserId: string
  onBack: () => void
  onSend: (text: string) => void
}

export function ChatRoom({ threadTitle, messages, currentUserId, onBack, onSend }: ChatRoomProps) {
  const form = useForm<ChatMessageInput>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: "",
    },
  })

  const handleSubmit = (values: ChatMessageInput) => {
    onSend(values.message)
    form.reset()
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-muted">
      <div className="bg-background border-b border-border p-4 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{threadTitle}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUserId
            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isCurrentUser ? "bg-primary text-primary-foreground" : "bg-background text-foreground"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {formatTime(message.ts)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="bg-background border-t border-border p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Type a message..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          form.handleSubmit(handleSubmit)()
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!form.watch('message')?.trim()} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
