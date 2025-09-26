import { z } from 'zod';
import { ProductCondition, PRODUCT_CATEGORIES } from '../types/product';

export const CreateProductSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(100, 'Title must be at most 100 characters'),
  description: z.string().min(1, 'Product description is required').max(1000, 'Description must be at most 1000 characters'),
  price: z.number().positive('Price must be positive').max(999999, 'Price too high'),
  imageUrls: z.array(z.string().url()).min(1, 'At least one image is required').max(6, 'Maximum 6 images allowed'),
  category: z.enum(PRODUCT_CATEGORIES),
  condition: z.nativeEnum(ProductCondition),
  location: z.string().max(100).optional(),
});

export const UpdateProductSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(100, 'Title must be at most 100 characters').optional(),
  description: z.string().min(1, 'Product description is required').max(1000, 'Description must be at most 1000 characters').optional(),
  price: z.number().positive('Price must be positive').max(999999, 'Price too high').optional(),
  imageUrls: z.array(z.string().url()).min(1, 'At least one image is required').max(6, 'Maximum 6 images allowed').optional(),
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  isAvailable: z.boolean().optional(),
  location: z.string().max(100).optional(),
});

export const ProductQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(50).optional(),
  category: z.enum(PRODUCT_CATEGORIES).optional(),
  condition: z.nativeEnum(ProductCondition).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
});