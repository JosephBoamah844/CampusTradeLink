import { pgTable, text, timestamp, boolean, integer, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  profileImageUrl: text('profile_image_url'),
  passwordHash: text('password_hash').notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  emailVerificationToken: text('email_verification_token'),
  passwordResetToken: text('password_reset_token'),
  passwordResetExpires: timestamp('password_reset_expires'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
    verificationTokenIdx: index('users_verification_token_idx').on(table.emailVerificationToken),
    resetTokenIdx: index('users_reset_token_idx').on(table.passwordResetToken),
  };
});

export const follows = pgTable('follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    followerIdx: index('follows_follower_idx').on(table.followerId),
    followingIdx: index('follows_following_idx').on(table.followingId),
    uniqueFollowIdx: uniqueIndex('follows_unique_idx').on(table.followerId, table.followingId),
  };
});

export const userStats = pgTable('user_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followersCount: integer('followers_count').default(0).notNull(),
  followingCount: integer('following_count').default(0).notNull(),
  postsCount: integer('posts_count').default(0).notNull(),
  productsCount: integer('products_count').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: uniqueIndex('user_stats_user_idx').on(table.userId),
  };
});