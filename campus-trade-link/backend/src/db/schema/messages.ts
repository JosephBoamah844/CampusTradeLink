import { pgTable, text, timestamp, boolean, uuid, index, json } from 'drizzle-orm/pg-core';
import { users } from './users';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  participants: json('participants').$type<string[]>().notNull(),
  lastMessageId: uuid('last_message_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    participantsIdx: index('conversations_participants_idx').on(table.participants),
    updatedAtIdx: index('conversations_updated_at_idx').on(table.updatedAt),
  };
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  messageType: text('message_type').default('TEXT').notNull(), // TEXT, IMAGE, PRODUCT
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    conversationIdx: index('messages_conversation_idx').on(table.conversationId),
    senderIdx: index('messages_sender_idx').on(table.senderId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
    typeIdx: index('messages_type_idx').on(table.messageType),
  };
});

export const messageReads = pgTable('message_reads', {
  id: uuid('id').primaryKey().defaultRandom(),
  messageId: uuid('message_id').notNull().references(() => messages.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').defaultNow().notNull(),
}, (table) => {
  return {
    messageIdx: index('message_reads_message_idx').on(table.messageId),
    userIdx: index('message_reads_user_idx').on(table.userId),
    uniqueReadIdx: index('message_reads_unique_idx').on(table.messageId, table.userId),
  };
});

// Add reference to last message
// This would be added after both tables are created
// conversations.lastMessageId references messages.id