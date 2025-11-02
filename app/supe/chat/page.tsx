"use client";

import { useState, useEffect } from 'react';
import { RoleLayout } from "@/components/role-layout";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { ChatContacts } from '@/components/chat-contacts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/use-profile';
import { subscribeToDirectChat, sendDirectMessage, type ChatMessage } from '@/lib/realtime-database';

export default function SupeChatPage() {
  const { data: profile } = useProfile();
  const [selectedContact, setSelectedContact] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');

  // Subscribe to direct chat when contact is selected
  useEffect(() => {
    if (!selectedContact || !profile) return;

    console.log('[Chat] 📡 Subscribing to direct chat with:', selectedContact.name);
    const unsubscribe = subscribeToDirectChat(
      selectedContact.id,
      (updatedMessages) => {
        console.log(`[Chat] 📨 Received ${updatedMessages.length} messages`);
        setMessages(updatedMessages);
      }
    );

    return () => unsubscribe();
  }, [selectedContact, profile]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !profile || !selectedContact) return;

    try {
      console.log('[Chat] 📤 Sending message to:', selectedContact.name);
      await sendDirectMessage(
        selectedContact.id,
        messageText.trim(),
        profile.displayName,
        profile.role as "admin" | "supe" | "chaser"
      );

      setMessageText('');
    } catch (error) {
      console.error('[Chat] ❌ Error sending message:', error);
    }
  };

  // Contacts View
  if (!selectedContact) {
    return (
      <RoleLayout role="supe">
        <div className="flex flex-col h-screen bg-white">
          {/* Header - Fixed at top */}
          <div className="bg-white border-b border-[#E5E7EB] p-4 fixed top-0 left-0 right-0 z-20">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">Chat</h1>
              <Badge className="bg-[#34C759] hover:bg-[#34C759] text-white">
                Online
              </Badge>
            </div>
          </div>

          {/* Spacer for fixed header */}
          <div className="h-16"></div>

          {/* Contacts List */}
          <div className="flex-1 overflow-hidden pb-20">
            <ChatContacts
              currentUserId={profile?.uid || ''}
              onSelectContact={(contactId, contactName) => {
                console.log('[Chat] Selected contact:', contactName);
                setSelectedContact({ id: contactId, name: contactName });
                setMessages([]); // Clear previous messages
              }}
            />
          </div>
        </div>
      </RoleLayout>
    );
  }

  // Chat View
  return (
    <RoleLayout role="supe">
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Header - Fixed at top */}
        <div className="bg-white border-b border-[#E5E7EB] p-4 flex items-center gap-3 fixed top-0 left-0 right-0 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedContact(null);
              setMessages([]);
            }}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {selectedContact.name}
            </h1>
          </div>
          <Badge className="bg-[#34C759] text-white">
            Online
          </Badge>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-14"></div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isOwnMessage = msg.userId === profile?.uid;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {msg.userName}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input - Fixed at bottom */}
        <div className="bg-white border-t border-[#E5E7EB] p-4 fixed bottom-16 left-0 right-0 z-10">
          <div className="flex items-end gap-2">
            <Textarea
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className="bg-[#007AFF] hover:bg-[#0051D5] h-11"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
