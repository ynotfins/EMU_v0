"use client"

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Send } from 'lucide-react'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { subscribeToIncidentChat, sendIncidentMessage, createIncidentChat, getAllSupes, type ChatMessage } from '@/lib/utils/realtime-database'
import { useProfile } from '@/hooks/use-profile'
import { chatMessageSchema, type ChatMessageInput } from '@/schemas/chat.schema'

interface IncidentChatProps {
  incidentId: string
  incidentAddress?: string
}

export function IncidentChat({ incidentId, incidentAddress }: IncidentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sending, setSending] = useState(false)
  const [chatInitialized, setChatInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: profile } = useProfile()

  const form = useForm<ChatMessageInput>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      message: '',
    },
  })

  useEffect(() => {
    if (!profile || !incidentId || chatInitialized) return

    const initChat = async () => {
      try {
        const supes = await getAllSupes()

        await createIncidentChat(
          incidentId,
          incidentAddress,
          profile.id,
          profile.name || profile.email || 'Chaser',
          supes
        )

        setChatInitialized(true)
      } catch (error) {
        console.error('[IncidentChat] Failed to initialize chat:', error)
      }
    }

    initChat()
  }, [profile, incidentId, incidentAddress, chatInitialized])

  useEffect(() => {
    if (!incidentId) return

    const unsubscribe = subscribeToIncidentChat(incidentId, (msgs) => {
      setMessages(msgs)
    })

    return () => {
      unsubscribe()
    }
  }, [incidentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (values: ChatMessageInput) => {
    if (!profile) return

    setSending(true)
    try {
      await sendIncidentMessage(
        incidentId,
        values.message,
        profile.name || profile.email || 'Anonymous',
        profile.role as 'chaser' | 'supe' | 'admin'
      )
      form.reset()
    } catch (error) {
      console.error('[IncidentChat] Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!profile) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Be the first to start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwnMessage = msg.userId === profile.id
          const roleColor = msg.userRole === 'supe' ? 'bg-primary/10 text-primary' : 'bg-primary/10 text-primary'

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isOwnMessage
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{msg.userName}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${roleColor}`}>
                      {msg.userRole.toUpperCase()}
                    </Badge>
                  </div>
                )}

                <p className="text-sm whitespace-pre-wrap wrap-break-word">{msg.message}</p>

                <p
                  className={`text-[10px] mt-1 ${
                    isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Type a message... (Enter to send)"
                      className="flex-1 resize-none"
                      rows={2}
                      disabled={sending}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          form.handleSubmit(handleSendMessage)()
                        }
                      }}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={sending || !form.watch('message')?.trim()}
                className="bg-primary hover:bg-primary/90 px-4"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Shift + Enter for new line
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
}

