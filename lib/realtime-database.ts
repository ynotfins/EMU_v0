/**
 * Firebase Realtime Database for Live Chat
 * 
 * Structure:
 * 
 * 1. INCIDENT CHATS (Group: 1 chaser + ALL supes)
 * incident-chats/
 *   {incidentId}/
 *     participants: { [userId]: role }
 *     createdBy: userId
 *     createdAt: timestamp
 *     incidentAddress: string
 *     messages/
 *       {messageId}: { userId, userName, userRole, message, timestamp, read }
 * 
 * 2. DIRECT CHATS (1-on-1: chaser-chaser or supe-supe)
 * direct-chats/
 *   {chatId}/  // Generated from sorted user IDs: `${user1}_${user2}`
 *     participants: { [userId]: role }
 *     lastMessage: string
 *     lastMessageTime: timestamp
 *     messages/
 *       {messageId}: { userId, userName, userRole, message, timestamp, read }
 */

import { getDatabase, ref, push, set, onValue, off, serverTimestamp, type Database } from 'firebase/database';
import { collection, query, where, getDocs } from 'firebase/firestore';
import app, { auth, db } from './firebase';

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

// ========================================
// INCIDENT CHATS (Group: 1 chaser + ALL supes)
// ========================================

/**
 * Get all supes from Firestore
 */
export async function getAllSupes(): Promise<Array<{ userId: string; userName: string }>> {
  const usersRef = collection(db, 'users');
  const supesQuery = query(usersRef, where('role', '==', 'supe'));
  const snapshot = await getDocs(supesQuery);
  
  return snapshot.docs.map((doc) => ({
    userId: doc.id,
    userName: doc.data().name || doc.data().email?.split('@')[0] || 'Supe',
  }));
}

/**
 * Create or get an incident chat (auto-adds all supes)
 */
export async function createIncidentChat(
  incidentId: string,
  incidentAddress: string,
  chaserUserId: string,
  chaserUserName: string,
  supes: Array<{ userId: string; userName: string }>
): Promise<void> {
  const chatRef = ref(rtdb, `incident-chats/${incidentId}`);
  
  // Build participants object: chaser + all supes
  const participants: Record<string, string> = {
    [chaserUserId]: 'chaser',
  };
  
  supes.forEach((supe) => {
    participants[supe.userId] = 'supe';
  });

  await set(chatRef, {
    participants,
    createdBy: chaserUserId,
    createdByName: chaserUserName,
    createdAt: serverTimestamp(),
    incidentAddress,
  });

  console.log(`[IncidentChat] ✅ Created chat for incident ${incidentId} with ${supes.length} supes`);
}

/**
 * Send a message to an incident chat
 */
export async function sendIncidentMessage(
  incidentId: string,
  message: string,
  userName: string,
  userRole: 'chaser' | 'supe' | 'admin'
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const messagesRef = ref(rtdb, `incident-chats/${incidentId}/messages`);
  const newMessageRef = push(messagesRef);

  await set(newMessageRef, {
    userId,
    userName,
    userRole,
    message,
    timestamp: serverTimestamp(),
    read: false,
  });

  console.log(`[IncidentChat] ✅ Message sent to incident ${incidentId}`);
}

/**
 * Subscribe to incident chat messages
 */
export function subscribeToIncidentChat(
  incidentId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesRef = ref(rtdb, `incident-chats/${incidentId}/messages`);

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

  return () => {
    off(messagesRef, 'value', listener);
  };
}

// ========================================
// DIRECT CHATS (1-on-1: chaser-chaser or supe-supe)
// ========================================

/**
 * Generate a unique chat ID from two user IDs
 */
function getChatId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

/**
 * Create or get a direct chat between two users
 */
export async function createDirectChat(
  otherUserId: string,
  otherUserName: string,
  otherUserRole: 'chaser' | 'supe'
): Promise<string> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const chatId = getChatId(userId, otherUserId);
  const chatRef = ref(rtdb, `direct-chats/${chatId}`);

  await set(chatRef, {
    participants: {
      [userId]: auth.currentUser?.email?.split('@')[0] || 'User',
      [otherUserId]: otherUserName,
    },
    createdAt: serverTimestamp(),
    lastMessage: '',
    lastMessageTime: 0,
  });

  console.log(`[DirectChat] ✅ Created chat ${chatId}`);
  return chatId;
}

/**
 * Send a message to a direct chat
 */
export async function sendDirectMessage(
  otherUserId: string,
  message: string,
  userName: string,
  userRole: 'chaser' | 'supe' | 'admin'
): Promise<void> {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const chatId = getChatId(userId, otherUserId);
  const messagesRef = ref(rtdb, `direct-chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);

  await set(newMessageRef, {
    userId,
    userName,
    userRole,
    message,
    timestamp: serverTimestamp(),
    read: false,
  });

  // Update last message
  const chatRef = ref(rtdb, `direct-chats/${chatId}`);
  await set(chatRef, {
    lastMessage: message,
    lastMessageTime: serverTimestamp(),
  });

  console.log(`[DirectChat] ✅ Message sent to chat ${chatId}`);
}

/**
 * Subscribe to direct chat messages
 */
export function subscribeToDirectChat(
  otherUserId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const chatId = getChatId(userId, otherUserId);
  const messagesRef = ref(rtdb, `direct-chats/${chatId}/messages`);

  const listener = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    
    if (!data) {
      callback([]);
      return;
    }

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
  await set(messageRef, { read: true });
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

