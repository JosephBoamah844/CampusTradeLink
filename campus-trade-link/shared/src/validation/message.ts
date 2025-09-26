import { z } from 'zod';
import { MessageType } from '../types/message';

export const CreateMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional(),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message must be at most 1000 characters'),
  messageType: z.nativeEnum(MessageType).optional().default(MessageType.TEXT),
}).refine(
  (data) => data.conversationId || data.recipientId,
  {
    message: 'Either conversationId or recipientId must be provided',
    path: ['conversationId'],
  }
);

export const ConversationQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

export const MessageQuerySchema = z.object({
  conversationId: z.string().uuid(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  cursor: z.string().optional(),
});