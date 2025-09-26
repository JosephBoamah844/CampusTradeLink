import { pgTable, text, timestamp, integer, uuid, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const uploads = pgTable('uploads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimetype: text('mimetype').notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  bucket: text('bucket').notNull(),
  path: text('path').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('uploads_user_idx').on(table.userId),
    filenameIdx: index('uploads_filename_idx').on(table.filename),
    createdAtIdx: index('uploads_created_at_idx').on(table.createdAt),
  };
});