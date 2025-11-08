"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RoleLayout } from "@/components/features/role-layout"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MessageCircle, Users } from "lucide-react"
import { ChatContacts } from "@/components/features/chat-contacts"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { useProfile } from "@/hooks/use-profile"
import {
  subscribeToDirectChat,
  sendDirectMessage,
  subscribeToChaserSupeGroupChat,
  sendChaserSupeGroupMessage,
  createChaserSupeGroupChat,
  type ChatMessage,
} from "@/lib/utils/realtime-database"
import { chatMessageSchema, type ChatMessageInput } from "@/schemas/chat.schema"

export default function ChaserChatPage() {
  const { data: profile } = useProfile()
  const [selectedContact, setSelectedContact] = useState<{
    id: string
    name: string
    role: string
  } | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isGroupChat, setIsGroupChat] = useState(false)

  const form = useForm<ChatMessageInput>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: "",
    },
  })

  useEffect(() => {
    if (!selectedContact || !profile) {
      setIsGroupChat(false)
      return
    }

    const contactIsSupe = ['supe', 'admin', 'super_admin'].includes(selectedContact.role)
    const isChaser = profile.role === 'chaser'
    setIsGroupChat(isChaser && contactIsSupe)
  }, [selectedContact, profile])

  useEffect(() => {
    if (!selectedContact || !profile) return

    if (isGroupChat) {
      createChaserSupeGroupChat(profile.uid, profile.displayName).catch(console.error)
    }

    const unsubscribe = isGroupChat
      ? subscribeToChaserSupeGroupChat(
          profile.uid,
          (updatedMessages: ChatMessage[]) => {
            setMessages(updatedMessages)
          }
        )
      : subscribeToDirectChat(
          selectedContact.id,
          (updatedMessages: ChatMessage[]) => {
            setMessages(updatedMessages)
          }
        )

    return () => unsubscribe()
  }, [selectedContact, profile, isGroupChat])

  const handleSendMessage = async (values: ChatMessageInput) => {
    if (!profile || !selectedContact) return

    try {
      if (isGroupChat) {
        await sendChaserSupeGroupMessage(
          profile.uid,
          values.message,
          profile.displayName,
          profile.role as "admin" | "supe" | "chaser"
        )
      } else {
        await sendDirectMessage(
          selectedContact.id,
          values.message,
          profile.displayName,
          profile.role as "admin" | "supe" | "chaser"
        )
      }

      form.reset()
    } catch (error) {
      console.error("[Chat] Error sending message:", error)
    }
  }

  if (!selectedContact) {
    return (
      <RoleLayout role="chaser">
        <div className="flex flex-col h-screen bg-background">
          <div className="bg-background border-b border-border p-4 fixed top-0 left-0 right-0 z-20">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Chat</h1>
              <Badge className="bg-primary text-primary-foreground">
                Online
              </Badge>
            </div>
          </div>

          <div className="h-16"></div>

          <div className="flex-1 overflow-hidden pb-20">
            <ChatContacts
              currentUserId={profile?.uid || ""}
              onSelectContact={(contactId, contactName, contactRole) => {
                setSelectedContact({ id: contactId, name: contactName, role: contactRole })
                setMessages([])
              }}
            />
          </div>
        </div>
      </RoleLayout>
    )
  }

  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen bg-muted">
        <div className="bg-background border-b border-border p-4 flex items-center gap-3 fixed top-0 left-0 right-0 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedContact(null)
              setMessages([])
            }}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isGroupChat && <Users className="h-4 w-4 text-muted-foreground" />}
              <h1 className="text-lg font-semibold text-foreground">
                {isGroupChat ? "Group Chat" : selectedContact.name}
              </h1>
            </div>
            {isGroupChat && (
              <p className="text-xs text-muted-foreground">All supervisors</p>
            )}
          </div>
          <Badge className="bg-primary text-primary-foreground">Online</Badge>
        </div>

        <div className="h-14"></div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isOwnMessage = msg.userId === profile?.uid

            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground"
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.userName}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-background border-t border-border p-4 fixed bottom-16 left-0 right-0 z-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendMessage)} className="flex items-end gap-2">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="Type a message..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            form.handleSubmit(handleSendMessage)()
                          }
                        }}
                        className="flex-1 min-h-[44px] max-h-32 resize-none"
                        rows={1}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={!form.watch('message')?.trim()}
                className="bg-primary hover:bg-primary/90 h-11"
              >
                Send
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </RoleLayout>
  )
}
