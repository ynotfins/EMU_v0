/**
 * Chat Repository Interface
 * 
 * Defines the contract for chat/messaging data persistence.
 * Handles both incident chats and direct messages between users.
 */

import { ChatId, MessageId, UserId, IncidentId, Timestamp } from '../shared/value-objects';
import { Either } from '../shared/errors';

export enum ChatType {
  INCIDENT = 'incident',
  DIRECT = 'direct',
  GROUP = 'group',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface Chat {
  id: ChatId;
  type: ChatType;
  participants: UserId[];
  incidentId?: IncidentId; // For incident chats
  name?: string; // For group chats
  lastMessage?: Message;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, any>;
}

export interface Message {
  id: MessageId;
  chatId: ChatId;
  senderId: UserId;
  content: string;
  status: MessageStatus;
  attachments?: MessageAttachment[];
  replyTo?: MessageId;
  editedAt?: Timestamp;
  deletedAt?: Timestamp;
  readBy: Array<{ userId: UserId; readAt: Timestamp }>;
  createdAt: Timestamp;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'location';
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
}

export interface ChatFilter {
  participantId?: UserId;
  type?: ChatType;
  incidentId?: IncidentId;
  hasUnread?: boolean;
}

export interface MessageFilter {
  senderId?: UserId;
  afterTimestamp?: Timestamp;
  beforeTimestamp?: Timestamp;
  search?: string;
  includeDeleted?: boolean;
}

export interface IChatRepository {
  /**
   * Creates a new chat
   */
  createChat(chat: Chat): Promise<Either<Error, Chat>>;

  /**
   * Finds a chat by ID
   */
  findChatById(id: ChatId): Promise<Either<Error, Chat | null>>;

  /**
   * Finds chats for a user
   */
  findChatsForUser(
    userId: UserId,
    filter?: ChatFilter
  ): Promise<Either<Error, Chat[]>>;

  /**
   * Finds or creates a direct chat between two users
   */
  findOrCreateDirectChat(
    user1: UserId,
    user2: UserId
  ): Promise<Either<Error, Chat>>;

  /**
   * Finds chat for an incident
   */
  findIncidentChat(incidentId: IncidentId): Promise<Either<Error, Chat | null>>;

  /**
   * Adds a participant to a chat
   */
  addParticipant(
    chatId: ChatId,
    userId: UserId
  ): Promise<Either<Error, void>>;

  /**
   * Removes a participant from a chat
   */
  removeParticipant(
    chatId: ChatId,
    userId: UserId
  ): Promise<Either<Error, void>>;

  /**
   * Sends a message
   */
  sendMessage(message: Message): Promise<Either<Error, Message>>;

  /**
   * Finds messages in a chat
   */
  findMessages(
    chatId: ChatId,
    filter?: MessageFilter,
    limit?: number,
    offset?: number
  ): Promise<Either<Error, Message[]>>;

  /**
   * Marks messages as read
   */
  markMessagesAsRead(
    messageIds: MessageId[],
    userId: UserId
  ): Promise<Either<Error, void>>;

  /**
   * Updates message status
   */
  updateMessageStatus(
    messageId: MessageId,
    status: MessageStatus
  ): Promise<Either<Error, void>>;

  /**
   * Edits a message
   */
  editMessage(
    messageId: MessageId,
    newContent: string,
    editedBy: UserId
  ): Promise<Either<Error, void>>;

  /**
   * Soft deletes a message
   */
  deleteMessage(
    messageId: MessageId,
    deletedBy: UserId
  ): Promise<Either<Error, void>>;

  /**
   * Gets unread message count for a user
   */
  getUnreadCount(userId: UserId): Promise<Either<Error, number>>;

  /**
   * Gets unread counts per chat for a user
   */
  getUnreadCountsPerChat(
    userId: UserId
  ): Promise<Either<Error, Map<string, number>>>;

  /**
   * Subscribes to new messages in a chat
   * Returns an unsubscribe function
   */
  subscribeToChat(
    chatId: ChatId,
    callback: (message: Message) => void
  ): Promise<Either<Error, () => void>>;

  /**
   * Subscribes to chat list updates for a user
   * Returns an unsubscribe function
   */
  subscribeToUserChats(
    userId: UserId,
    callback: (chats: Chat[]) => void
  ): Promise<Either<Error, () => void>>;

  /**
   * Archives a chat
   * Soft delete - chat still exists but is hidden
   */
  archiveChat(chatId: ChatId): Promise<Either<Error, void>>;

  /**
   * Deletes old messages
   * For compliance and storage management
   */
  deleteMessagesOlderThan(
    date: Timestamp,
    chatId?: ChatId
  ): Promise<Either<Error, number>>;
}
