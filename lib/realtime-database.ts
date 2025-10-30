/**
 * Firebase Realtime Database for Live Chat
 * 
 * Structure:
 * chats/
 *   {incidentId}/
 *     messages/
 *       {messageId}/
 *         userId: string
 *         userName: string
 *         userRole: 'chaser' | 'supe'
 *         message: string
 *         timestamp: number
 *         read: boolean
 */

import { getDatabase, ref, push, set, onValue, off, serverTimestamp, type Database } from 'firebase/database';
import app, { auth } from './firebase';

// Initialize Realtime Database
export const rtdb: Database = getDatabase(app);

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: 'chaser' | 'supe' | 'admin';
  message: string;
  timestamp: number;
  read: boolean;
}

/**
 * Send a message to an incident chat
 */
export async function sendChatMessage(
  incidentId: string,
  message: string,
  userName: string,
  userRole: 'chaser' | 'supe' | 'admin'
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const messagesRef = ref(rtdb, `chats/${incidentId}/messages`);
  const newMessageRef = push(messagesRef);

  await set(newMessageRef, {
    userId,
    userName,
    userRole,
    message,
    timestamp: serverTimestamp(),
    read: false,
  });

  console.log(`[Chat] ✅ Message sent to incident ${incidentId}`);
}

/**
 * Subscribe to chat messages for an incident
 * Returns unsubscribe function
 */
export function subscribeToChat(
  incidentId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesRef = ref(rtdb, `chats/${incidentId}/messages`);

  const listener = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    
    if (!data) {
      callback([]);
      return;
    }

    // Convert object to array and sort by timestamp
    const messages: ChatMessage[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
      id,
      userId: msg.userId,
      userName: msg.userName,
      userRole: msg.userRole,
      message: msg.message,
      timestamp: msg.timestamp || 0,
      read: msg.read || false,
    })).sort((a, b) => a.timestamp - b.timestamp);

    callback(messages);
  });

  // Return unsubscribe function
  return () => {
    off(messagesRef, 'value', listener);
  };
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(
  incidentId: string,
  messageId: string
): Promise<void> {
  const messageRef = ref(rtdb, `chats/${incidentId}/messages/${messageId}`);
  await set(messageRef, { read: true }, { onlyIf: { exists: true } });
}

/**
 * Get unread message count for an incident
 */
export function subscribeToUnreadCount(
  incidentId: string,
  userId: string,
  callback: (count: number) => void
): () => void {
  const messagesRef = ref(rtdb, `chats/${incidentId}/messages`);

  const listener = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    
    if (!data) {
      callback(0);
      return;
    }

    // Count messages not sent by current user and not read
    const unreadCount = Object.values(data as Record<string, any>).filter(
      (msg: any) => msg.userId !== userId && !msg.read
    ).length;

    callback(unreadCount);
  });

  return () => {
    off(messagesRef, 'value', listener);
  };
}

