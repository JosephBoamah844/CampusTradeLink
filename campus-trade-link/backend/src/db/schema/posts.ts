import { pgTable, text, timestamp, integer, uuid, index, json } from 'drizzle-orm/pg-core';
import { users } from './users';

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  imageUrls: json('image_urls').$type<string[]>().default([]),
  likesCount: integer('likes_count').default(0).notNull(),
  commentsCount: integer('comments_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('posts_user_idx').on(table.userId),
    createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
    likesIdx: index('posts_likes_idx').on(table.likesCount),
  };
});

export const postLikes = pgTable('post_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('post_likes_user_idx').on(table.userId),
    postIdx: index('post_likes_post_idx').on(table.postId),
    uniqueLikeIdx: index('post_likes_unique_idx').on(table.userId, table.postId),
  };
});

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  likesCount: integer('likes_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    postIdx: index('comments_post_idx').on(table.postId),
    userIdx: index('comments_user_idx').on(table.userId),
    createdAtIdx: index('comments_created_at_idx').on(table.createdAt),
  };
});

export const commentLikes = pgTable('comment_likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('comment_likes_user_idx').on(table.userId),
    commentIdx: index('comment_likes_comment_idx').on(table.commentId),
    uniqueLikeIdx: index('comment_likes_unique_idx').on(table.userId, table.commentId),
  };
});