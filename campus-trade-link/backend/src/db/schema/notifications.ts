import { pgTable, text, timestamp, boolean, uuid, index, json } from 'drizzle-orm/pg-core';
import { users } from './users';

export const notificationTypes = ['LIKE', 'COMMENT', 'FOLLOW', 'MESSAGE', 'PRODUCT_INQUIRY', 'SYSTEM'] as const;

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: json('data').$type<Record<string, any>>(),
  isRead: boolean('is_read').default(false).notNull(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('notifications_user_idx').on(table.userId),
    typeIdx: index('notifications_type_idx').on(table.type),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    actorIdx: index('notifications_actor_idx').on(table.actorId),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  };
});

export const notificationSettings = pgTable('notification_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  pushNotifications: boolean('push_notifications').default(true).notNull(),
  likes: boolean('likes').default(true).notNull(),
  comments: boolean('comments').default(true).notNull(),
  follows: boolean('follows').default(true).notNull(),
  messages: boolean('messages').default(true).notNull(),
  productInquiries: boolean('product_inquiries').default(true).notNull(),
  systemUpdates: boolean('system_updates').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('notification_settings_user_idx').on(table.userId),
  };
});