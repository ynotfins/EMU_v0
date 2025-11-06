/**
 * Chat Module
 * Centralizes all chat/messaging functionality
 */

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  onValue,
  off,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp,
  DataSnapshot,
  type Database
} from 'firebase/database';
import { collection, getDocs, where, query as firestoreQuery } from 'firebase/firestore';
import { db, rtdb } from '../firebase-client';
import { auth } from '../firebase-client';
import { logger } from '../utils/logger';

export interface ChatMessage {
  id?: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  timestamp: number;
  read?: boolean;
  images?: string[];
  type?: 'text' | 'image' | 'audio' | 'system';
}

export interface ChatThread {
  id: string;
  participants: { [userId: string]: string }; // userId: role
  createdBy: string;
  createdAt: number;
  lastMessage?: string;
  lastMessageTime?: number;
  incidentId?: string;
  incidentAddress?: string;
  type: 'incident' | 'direct' | 'group';
  unreadCount?: { [userId: string]: number };
}

export interface ChatParticipant {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  lastSeen?: number;
  isOnline?: boolean;
}

class ChatModule {
  private rtdb = rtdb;
  private activeListeners: { [key: string]: any } = {};

  /**
   * Get RTDB instance, throwing error if not configured
   */
  private getRtdb(): Database {
    if (!this.getRtdb()) {
      throw new Error('Realtime Database not configured. Set NEXT_PUBLIC_FIREBASE_DATABASE_URL in .env.local');
    }
    return this.getRtdb();
  }

  /**
   * Create an incident chat (group chat with all supervisors)
   */
  async createIncidentChat(incidentId: string, incidentAddress: string): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      logger.debug('Creating incident chat', { code: 'ChatModule', incidentAddress });

      // Get current user data
      const userDoc = await getDocs(
        firestoreQuery(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const userData = userDoc.docs[0]?.data();

      // Get all supervisors
      const supervisorsQuery = firestoreQuery(
        collection(db, 'users'),
        where('role', 'in', ['supe', 'admin', 'super_admin'])
      );
      const supervisorsSnapshot = await getDocs(supervisorsQuery);

      // Build participants object
      const participants: { [key: string]: string } = {
        [currentUser.uid]: userData?.role || 'chaser'
      };

      supervisorsSnapshot.forEach(doc => {
        const supervisor = doc.data();
        participants[doc.id] = supervisor.role;
      });

      // Create chat thread
      const chatData: Omit<ChatThread, 'id'> = {
        participants,
        createdBy: currentUser.uid,
        createdAt: Date.now(),
        incidentId,
        incidentAddress,
        type: 'incident',
        lastMessage: 'Chat created',
        lastMessageTime: Date.now()
      };

      const chatRef = push(ref(this.getRtdb(), 'incident-chats'));
      await set(chatRef, chatData);

      // Send initial system message
      await this.sendMessage(chatRef.key!, {
        userId: 'system',
        userName: 'System',
        userRole: 'system',
        message: `Incident chat created for: ${incidentAddress}`,
        type: 'system'
      });

      logger.debug('Incident chat created', { code: 'ChatModule', chatId: chatRef.key || undefined });
      return chatRef.key!;
    } catch (error) {
      logger.error('Failed to create incident chat', error as Error, { code: 'ChatModule', incidentAddress });
      throw error;
    }
  }

  /**
   * Create a direct chat (1-on-1)
   */
  async createDirectChat(otherUserId: string, otherUserName: string, otherUserRole: string): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      logger.debug('Creating direct chat', { code: 'ChatModule', otherUserName });

      // Generate consistent chat ID from sorted user IDs
      const chatId = [currentUser.uid, otherUserId].sort().join('_');

      // Check if chat already exists
      const existingChat = await get(ref(this.getRtdb(), `direct-chats/${chatId}`));
      if (existingChat.exists()) {
        logger.debug('Direct chat already exists', { code: 'ChatModule', chatId });
        return chatId;
      }

      // Get current user data
      const userDoc = await getDocs(
        firestoreQuery(collection(db, 'users'), where('uid', '==', currentUser.uid))
      );
      const userData = userDoc.docs[0]?.data();

      // Create chat
      const chatData: Omit<ChatThread, 'id'> = {
        participants: {
          [currentUser.uid]: userData?.role || 'chaser',
          [otherUserId]: otherUserRole
        },
        createdBy: currentUser.uid,
        createdAt: Date.now(),
        type: 'direct',
        lastMessage: 'Chat started',
        lastMessageTime: Date.now()
      };

      await set(ref(this.getRtdb(), `direct-chats/${chatId}`), chatData);

      logger.debug('Direct chat created', { code: 'ChatModule', chatId });
      return chatId;
    } catch (error) {
      logger.error('Failed to create direct chat', error as Error, { code: 'ChatModule', otherUserId });
      throw error;
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
    try {
      logger.debug('Sending message', { code: 'ChatModule', chatId });

      const messageData = {
        ...message,
        timestamp: Date.now(),
        read: false
      };

      // Determine chat type and path
      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';

      // Add message
      await push(ref(this.getRtdb(), `${chatPath}/${chatId}/messages`), messageData);

      // Update last message info
      await set(ref(this.getRtdb(), `${chatPath}/${chatId}/lastMessage`), message.message);
      await set(ref(this.getRtdb(), `${chatPath}/${chatId}/lastMessageTime`), Date.now());

      logger.debug('Message sent', { code: 'ChatModule', chatId });
    } catch (error) {
      logger.error('Failed to send message', error as Error, { code: 'ChatModule', chatId });
      throw error;
    }
  }

  /**
   * Subscribe to chat messages
   */
  subscribeToMessages(
    chatId: string,
    callback: (messages: ChatMessage[]) => void,
    limit: number = 50
  ): () => void {
    try {
      logger.debug('Subscribing to messages', { code: 'ChatModule', chatId });

      // Determine chat type
      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';
      const messagesRef = ref(this.getRtdb(), `${chatPath}/${chatId}/messages`);

      // Create query
      const messagesQuery = query(
        messagesRef,
        orderByChild('timestamp'),
        limitToLast(limit)
      );

      // Set up listener
      const listener = onValue(messagesQuery, (snapshot) => {
        const messages: ChatMessage[] = [];
        
        snapshot.forEach((childSnapshot) => {
          messages.push({
            id: childSnapshot.key!,
            ...childSnapshot.val()
          });
        });

        callback(messages);
      });

      // Store listener reference
      const listenerId = `messages_${chatId}`;
      this.activeListeners[listenerId] = { ref: messagesRef, listener };

      // Return unsubscribe function
      return () => {
        off(messagesRef, 'value', listener);
        delete this.activeListeners[listenerId];
      };
    } catch (error) {
      logger.error('Failed to subscribe to messages', error as Error, { code: 'ChatModule', chatId });
      throw error;
    }
  }

  /**
   * Subscribe to user's chat threads
   */
  subscribeToThreads(callback: (threads: ChatThread[]) => void): () => void {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        callback([]);
        return () => {};
      }

      logger.debug('Subscribing to chat threads', { code: 'ChatModule' });

      const threads: ChatThread[] = [];
      const listeners: any[] = [];

      // Subscribe to incident chats
      const incidentChatsRef = ref(this.getRtdb(), 'incident-chats');
      const incidentListener = onValue(incidentChatsRef, (snapshot) => {
        const incidentThreads: ChatThread[] = [];
        
        snapshot.forEach((childSnapshot) => {
          const thread = childSnapshot.val();
          if (thread.participants && thread.participants[currentUser.uid]) {
            incidentThreads.push({
              id: childSnapshot.key!,
              ...thread
            });
          }
        });

        // Subscribe to direct chats
        const directChatsRef = ref(this.getRtdb(), 'direct-chats');
        const directListener = onValue(directChatsRef, (directSnapshot) => {
          const directThreads: ChatThread[] = [];
          
          directSnapshot.forEach((childSnapshot) => {
            const thread = childSnapshot.val();
            if (thread.participants && thread.participants[currentUser.uid]) {
              directThreads.push({
                id: childSnapshot.key!,
                ...thread
              });
            }
          });

          // Combine and sort all threads
          const allThreads = [...incidentThreads, ...directThreads]
            .sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
          
          callback(allThreads);
        });

        listeners.push({ ref: directChatsRef, listener: directListener });
      });

      listeners.push({ ref: incidentChatsRef, listener: incidentListener });

      // Return unsubscribe function
      return () => {
        listeners.forEach(({ ref, listener }) => off(ref, 'value', listener));
      };
    } catch (error) {
      logger.error('Failed to subscribe to threads', error as Error, { code: 'ChatModule' });
      callback([]);
      return () => {};
    }
  }

  /**
   * Get chat participants
   */
  async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
    try {
      // Determine chat type
      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';

      // Get chat data
      const chatSnapshot = await get(ref(this.getRtdb(), `${chatPath}/${chatId}`));
      if (!chatSnapshot.exists()) {
        throw new Error('Chat not found');
      }

      const chatData = chatSnapshot.val();
      const participantIds = Object.keys(chatData.participants || {});

      // Get user data from Firestore
      const participants: ChatParticipant[] = [];
      
      for (const userId of participantIds) {
        if (userId === 'system') continue;
        
        const userDoc = await getDocs(
          firestoreQuery(collection(db, 'users'), where('uid', '==', userId))
        );
        
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          participants.push({
            id: userId,
            name: userData.displayName || userData.email || 'Unknown',
            role: userData.role || 'chaser',
            avatar: userData.photoURL,
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen
          });
        }
      }

      return participants;
    } catch (error) {
      logger.error('Failed to get participants', error as Error, { code: 'ChatModule', chatId });
      return [];
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatId: string, messageIds: string[]): Promise<void> {
    try {
      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';

      const updates: { [path: string]: any } = {};
      
      messageIds.forEach(messageId => {
        updates[`${chatPath}/${chatId}/messages/${messageId}/read`] = true;
      });

      await set(ref(this.getRtdb()), updates);
      logger.debug('Marked messages as read', { code: 'ChatModule', chatId, userId });
    } catch (error) {
      logger.error('Failed to mark messages as read', error as Error, { code: 'ChatModule', chatId, userId });
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(chatId: string): Promise<number> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return 0;

      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';

      const messagesSnapshot = await get(
        ref(this.getRtdb(), `${chatPath}/${chatId}/messages`)
      );

      if (!messagesSnapshot.exists()) return 0;

      let unreadCount = 0;
      messagesSnapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        if (message.userId !== currentUser.uid && !message.read) {
          unreadCount++;
        }
      });

      return unreadCount;
    } catch (error) {
      logger.error('Failed to get unread count', error as Error, { code: 'ChatModule', chatId, userId });
      return 0;
    }
  }

  /**
   * Leave a chat (remove participant)
   */
  async leaveChat(chatId: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';

      // Remove user from participants
      await set(
        ref(this.getRtdb(), `${chatPath}/${chatId}/participants/${currentUser.uid}`),
        null
      );

      logger.debug('Left chat', { code: 'ChatModule', chatId, userId });
    } catch (error) {
      logger.error('Failed to leave chat', error as Error, { code: 'ChatModule', chatId, userId });
      throw error;
    }
  }

  /**
   * Clean up all active listeners
   */
  cleanup(): void {
    Object.entries(this.activeListeners).forEach(([id, { ref, listener }]) => {
      off(ref, 'value', listener);
    });
    this.activeListeners = {};
    logger.debug('All listeners cleaned up', { code: 'ChatModule' });
  }
}

// Export singleton instance
export const chatModule = new ChatModule();

// Export convenience methods
export const {
  createIncidentChat,
  createDirectChat,
  sendMessage,
  subscribeToMessages,
  subscribeToThreads,
  getChatParticipants,
  markMessagesAsRead,
  getUnreadCount,
  leaveChat,
  cleanup: cleanupChat
} = chatModule;
