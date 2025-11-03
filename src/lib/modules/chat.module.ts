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
  DataSnapshot
} from 'firebase/database';
import { collection, getDocs, where, query as firestoreQuery } from 'firebase/firestore';
import { db, rtdb } from '../firebase/firebase';
import { auth } from '../firebase/firebase';

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
   * Create an incident chat (group chat with all supervisors)
   */
  async createIncidentChat(incidentId: string, incidentAddress: string): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      console.log('[Chat Module] Creating incident chat for:', incidentAddress);

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

      const chatRef = push(ref(this.rtdb, 'incident-chats'));
      await set(chatRef, chatData);

      // Send initial system message
      await this.sendMessage(chatRef.key!, {
        userId: 'system',
        userName: 'System',
        userRole: 'system',
        message: `Incident chat created for: ${incidentAddress}`,
        type: 'system'
      });

      console.log('[Chat Module] Incident chat created:', chatRef.key);
      return chatRef.key!;
    } catch (error) {
      console.error('[Chat Module] Failed to create incident chat:', error);
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

      console.log('[Chat Module] Creating direct chat with:', otherUserName);

      // Generate consistent chat ID from sorted user IDs
      const chatId = [currentUser.uid, otherUserId].sort().join('_');

      // Check if chat already exists
      const existingChat = await get(ref(this.rtdb, `direct-chats/${chatId}`));
      if (existingChat.exists()) {
        console.log('[Chat Module] Direct chat already exists:', chatId);
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

      await set(ref(this.rtdb, `direct-chats/${chatId}`), chatData);

      console.log('[Chat Module] Direct chat created:', chatId);
      return chatId;
    } catch (error) {
      console.error('[Chat Module] Failed to create direct chat:', error);
      throw error;
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<void> {
    try {
      console.log('[Chat Module] Sending message to chat:', chatId);

      const messageData = {
        ...message,
        timestamp: Date.now(),
        read: false
      };

      // Determine chat type and path
      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';

      // Add message
      await push(ref(this.rtdb, `${chatPath}/${chatId}/messages`), messageData);

      // Update last message info
      await set(ref(this.rtdb, `${chatPath}/${chatId}/lastMessage`), message.message);
      await set(ref(this.rtdb, `${chatPath}/${chatId}/lastMessageTime`), Date.now());

      console.log('[Chat Module] Message sent');
    } catch (error) {
      console.error('[Chat Module] Failed to send message:', error);
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
      console.log('[Chat Module] Subscribing to messages for chat:', chatId);

      // Determine chat type
      const isIncidentChat = !chatId.includes('_');
      const chatPath = isIncidentChat ? 'incident-chats' : 'direct-chats';
      const messagesRef = ref(this.rtdb, `${chatPath}/${chatId}/messages`);

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
        off(messagesRef, listener);
        delete this.activeListeners[listenerId];
      };
    } catch (error) {
      console.error('[Chat Module] Failed to subscribe to messages:', error);
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

      console.log('[Chat Module] Subscribing to chat threads');

      const threads: ChatThread[] = [];
      const listeners: any[] = [];

      // Subscribe to incident chats
      const incidentChatsRef = ref(this.rtdb, 'incident-chats');
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
        const directChatsRef = ref(this.rtdb, 'direct-chats');
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
        listeners.forEach(({ ref, listener }) => off(ref, listener));
      };
    } catch (error) {
      console.error('[Chat Module] Failed to subscribe to threads:', error);
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
      const chatSnapshot = await get(ref(this.rtdb, `${chatPath}/${chatId}`));
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
      console.error('[Chat Module] Failed to get participants:', error);
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

      await set(ref(this.rtdb), updates);
      console.log('[Chat Module] Marked messages as read');
    } catch (error) {
      console.error('[Chat Module] Failed to mark messages as read:', error);
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
        ref(this.rtdb, `${chatPath}/${chatId}/messages`)
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
      console.error('[Chat Module] Failed to get unread count:', error);
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
        ref(this.rtdb, `${chatPath}/${chatId}/participants/${currentUser.uid}`),
        null
      );

      console.log('[Chat Module] Left chat:', chatId);
    } catch (error) {
      console.error('[Chat Module] Failed to leave chat:', error);
      throw error;
    }
  }

  /**
   * Clean up all active listeners
   */
  cleanup(): void {
    Object.entries(this.activeListeners).forEach(([id, { ref, listener }]) => {
      off(ref, listener);
    });
    this.activeListeners = {};
    console.log('[Chat Module] All listeners cleaned up');
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
