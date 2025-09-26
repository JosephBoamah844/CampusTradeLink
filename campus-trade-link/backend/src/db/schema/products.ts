import { pgTable, text, timestamp, integer, uuid, index, json, numeric, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const productConditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as const;
export const productCategories = ['Electronics', 'Books', 'Clothing', 'Furniture', 'Sports', 'Music', 'Food', 'Other'] as const;

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  imageUrls: json('image_urls').$type<string[]>().notNull(),
  category: text('category').notNull(),
  condition: text('condition').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  location: text('location'),
  viewsCount: integer('views_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index('products_user_idx').on(table.userId),
    categoryIdx: index('products_category_idx').on(table.category),
    conditionIdx: index('products_condition_idx').on(table.condition),
    priceIdx: index('products_price_idx').on(table.price),
    availableIdx: index('products_available_idx').on(table.isAvailable),
    createdAtIdx: index('products_created_at_idx').on(table.createdAt),
  };
});

export const productInquiries = pgTable('product_inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  buyerId: uuid('buyer_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  status: text('status').default('PENDING').notNull(), // PENDING, ACCEPTED, REJECTED, COMPLETED
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    productIdx: index('product_inquiries_product_idx').on(table.productId),
    buyerIdx: index('product_inquiries_buyer_idx').on(table.buyerId),
    sellerIdx: index('product_inquiries_seller_idx').on(table.sellerId),
    statusIdx: index('product_inquiries_status_idx').on(table.status),
    createdAtIdx: index('product_inquiries_created_at_idx').on(table.createdAt),
  };
});