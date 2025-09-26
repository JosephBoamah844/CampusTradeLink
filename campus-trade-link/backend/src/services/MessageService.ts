import { eq, and, or, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import { conversations, messages, messageReads, users } from '../db/schema';
import { 
  Message,
  Conversation,
  ConversationPreview,
  CreateMessageInput,
  PaginationParams,
  PaginatedResponse 
} from '@campus-trade-link/shared';
import { createError } from '../middleware/errorHandler';

export class MessageService {
  async createMessage(senderId: string, input: CreateMessageInput): Promise<Message> {
    let conversationId = input.conversationId;

    // If no conversation ID provided, find or create conversation
    if (!conversationId && input.recipientId) {
      conversationId = await this.findOrCreateConversation(senderId, input.recipientId);
    }

    if (!conversationId) {
      throw createError('Conversation ID or recipient ID required', 400, 'VALIDATION_ERROR');
    }

    // Verify user is part of conversation
    await this.verifyConversationAccess(conversationId, senderId);

    // Create message
    const [newMessage] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId,
        content: input.content,
        messageType: input.messageType || 'TEXT',
      })
      .returning();

    // Update conversation last message
    await db
      .update(conversations)
      .set({
        lastMessageId: newMessage.id,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    return this.getMessageById(newMessage.id);
  }

  async getMessageById(messageId: string): Promise<Message> {
    const [message] = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        sender: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.id, messageId))
      .limit(1);

    if (!message) {
      throw createError('Message not found', 404, 'NOT_FOUND');
    }

    // Check if message is read by the current user (this would need userId parameter)
    return {
      ...message,
      isRead: false, // This would be determined based on messageReads table
    };
  }

  async getConversationMessages(
    conversationId: string,
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Message>> {
    // Verify access
    await this.verifyConversationAccess(conversationId, userId);

    const limit = Math.min(pagination.limit || 50, 100);
    const offset = ((pagination.page || 1) - 1) * limit;

    const conversationMessages = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        messageType: messages.messageType,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        sender: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
        },
        isRead: sql`EXISTS(
          SELECT 1 FROM ${messageReads} 
          WHERE ${messageReads.messageId} = ${messages.id} 
          AND ${messageReads.userId} = ${userId}
        )`,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(messages.createdAt));

    const hasMore = conversationMessages.length > limit;
    const data = hasMore ? conversationMessages.slice(0, -1) : conversationMessages;

    return {
      data,
      hasMore,
    };
  }

  async getUserConversations(
    userId: string,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<ConversationPreview>> {
    const limit = Math.min(pagination.limit || 20, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    // Get conversations where user is a participant
    const userConversations = await db
      .select({
        id: conversations.id,
        participants: conversations.participants,
        lastMessageId: conversations.lastMessageId,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(sql`${userId} = ANY(${conversations.participants})`)
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(conversations.updatedAt));

    const hasMore = userConversations.length > limit;
    const conversationData = hasMore ? userConversations.slice(0, -1) : userConversations;

    // Get conversation previews with other participant info and last message
    const conversationPreviews: ConversationPreview[] = [];

    for (const conv of conversationData) {
      const otherParticipantId = conv.participants.find(id => id !== userId);
      if (!otherParticipantId) continue;

      // Get other participant info
      const [otherUser] = await db
        .select({
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
        })
        .from(users)
        .where(eq(users.id, otherParticipantId))
        .limit(1);

      if (!otherUser) continue;

      // Get last message
      let lastMessage;
      if (conv.lastMessageId) {
        const [lastMsg] = await db
          .select({
            content: messages.content,
            createdAt: messages.createdAt,
            senderId: messages.senderId,
          })
          .from(messages)
          .where(eq(messages.id, conv.lastMessageId))
          .limit(1);

        if (lastMsg) {
          lastMessage = {
            content: lastMsg.content,
            createdAt: lastMsg.createdAt,
            isFromMe: lastMsg.senderId === userId,
          };
        }
      }

      // Get unread count
      const unreadCount = await db
        .select({ count: sql`COUNT(*)` })
        .from(messages)
        .where(and(
          eq(messages.conversationId, conv.id),
          sql`${messages.senderId} != ${userId}`,
          sql`NOT EXISTS(
            SELECT 1 FROM ${messageReads} 
            WHERE ${messageReads.messageId} = ${messages.id} 
            AND ${messageReads.userId} = ${userId}
          )`
        ));

      conversationPreviews.push({
        id: conv.id,
        otherParticipant: {
          ...otherUser,
          isOnline: false, // This would be determined by Socket.io
        },
        lastMessage,
        unreadCount: parseInt(unreadCount[0].count as string) || 0,
        updatedAt: conv.updatedAt,
      });
    }

    return {
      data: conversationPreviews,
      hasMore,
    };
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    // Check if already read
    const [existingRead] = await db
      .select()
      .from(messageReads)
      .where(and(
        eq(messageReads.messageId, messageId),
        eq(messageReads.userId, userId)
      ))
      .limit(1);

    if (!existingRead) {
      await db.insert(messageReads).values({
        messageId,
        userId,
      });
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    // Verify access
    await this.verifyConversationAccess(conversationId, userId);

    // Get all unread messages in conversation
    const unreadMessages = await db
      .select({ id: messages.id })
      .from(messages)
      .where(and(
        eq(messages.conversationId, conversationId),
        sql`${messages.senderId} != ${userId}`,
        sql`NOT EXISTS(
          SELECT 1 FROM ${messageReads} 
          WHERE ${messageReads.messageId} = ${messages.id} 
          AND ${messageReads.userId} = ${userId}
        )`
      ));

    // Mark all as read
    if (unreadMessages.length > 0) {
      await db.insert(messageReads).values(
        unreadMessages.map(msg => ({
          messageId: msg.id,
          userId,
        }))
      );
    }
  }

  private async findOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    // Look for existing conversation
    const [existingConversation] = await db
      .select()
      .from(conversations)
      .where(
        or(
          sql`${conversations.participants} @> ${JSON.stringify([userId1, userId2])}`,
          sql`${conversations.participants} @> ${JSON.stringify([userId2, userId1])}`
        )
      )
      .limit(1);

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const [newConversation] = await db
      .insert(conversations)
      .values({
        participants: [userId1, userId2],
      })
      .returning();

    return newConversation.id;
  }

  private async verifyConversationAccess(conversationId: string, userId: string): Promise<void> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      throw createError('Conversation not found', 404, 'NOT_FOUND');
    }

    if (!conversation.participants.includes(userId)) {
      throw createError('Access denied', 403, 'FORBIDDEN');
    }
  }

  async deleteConversation(conversationId: string, userId: string): Promise<{ message: string }> {
    // Verify access
    await this.verifyConversationAccess(conversationId, userId);

    // Delete conversation and all messages (cascade)
    await db.delete(conversations).where(eq(conversations.id, conversationId));

    return {
      message: 'Conversation deleted successfully',
    };
  }
}