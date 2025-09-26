import { User } from './user';

export interface Product {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  condition: ProductCondition;
  isAvailable: boolean;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    displayName?: string;
    profileImageUrl?: string;
    isVerified: boolean;
  };
}

export enum ProductCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  condition: ProductCondition;
  location?: string;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  imageUrls?: string[];
  category?: string;
  condition?: ProductCondition;
  isAvailable?: boolean;
  location?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Books',
  'Clothing',
  'Furniture',
  'Sports',
  'Music',
  'Food',
  'Other'
] as const;

export type ProductCategoryType = typeof PRODUCT_CATEGORIES[number];