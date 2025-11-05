"use client";

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { subscribeToIncidentChat, sendIncidentMessage, createIncidentChat, getAllSupes, type ChatMessage } from '@/lib/utils/realtime-database';
import { useProfile } from '@/hooks/use-profile';

interface IncidentChatProps {
  incidentId: string;
  incidentAddress?: string;
}

export function IncidentChat({ incidentId, incidentAddress }: IncidentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatInitialized, setChatInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useProfile();

  // Initialize chat with ALL supes on first open
  useEffect(() => {
    if (!profile || !incidentId || chatInitialized) return;

    const initChat = async () => {
      try {
        console.log(`[IncidentChat] ?? Initializing incident chat for ${incidentId}`);
        
        // Get all supes from Firestore
        const supes = await getAllSupes();
        console.log(`[IncidentChat] Found ${supes.length} supes to add to chat`);

        // Create chat with this chaser + ALL supes
        await createIncidentChat(
          incidentId,
          incidentAddress,
          profile.id,
          profile.name || profile.email || 'Chaser',
          supes
        );

        setChatInitialized(true);
        console.log(`[IncidentChat] ? Chat initialized with ${supes.length} supes`);
      } catch (error) {
        console.error('[IncidentChat] Failed to initialize chat:', error);
      }
    };

    initChat();
  }, [profile, incidentId, incidentAddress, chatInitialized]);

  // Subscribe to chat messages
  useEffect(() => {
    if (!incidentId) return;

    console.log(`[IncidentChat] ?? Subscribing to chat for incident ${incidentId}`);
    const unsubscribe = subscribeToIncidentChat(incidentId, (msgs) => {
      setMessages(msgs);
      console.log(`[IncidentChat] Received ${msgs.length} messages`);
    });

    return () => {
      console.log(`[IncidentChat] ?? Unsubscribing from chat`);
      unsubscribe();
    };
  }, [incidentId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !profile) return;

    setSending(true);
    try {
      await sendIncidentMessage(
        incidentId,
        newMessage.trim(),
        profile.name || profile.email || 'Anonymous',
        profile.role as 'chaser' | 'supe' | 'admin'
      );
      setNewMessage('');
    } catch (error) {
      console.error('[IncidentChat] Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!profile) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Be the first to start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwnMessage = msg.userId === profile.id;
          const roleColor = msg.userRole === 'supe' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isOwnMessage
                    ? 'bg-[#007AFF] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* User name + role badge */}
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{msg.userName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${roleColor}`}>
                      {msg.userRole.toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Message text */}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>

                {/* Timestamp */}
                <p
                  className={`text-[10px] mt-1 ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (Enter to send)"
            className="flex-1 resize-none"
            rows={2}
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-[#007AFF] hover:bg-[#0051D5] px-4"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}

