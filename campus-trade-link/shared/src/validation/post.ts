import { z } from 'zod';

export const CreatePostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000, 'Post content must be at most 2000 characters'),
  imageUrls: z.array(z.string().url()).max(4, 'Maximum 4 images allowed').optional(),
});

export const UpdatePostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(2000, 'Post content must be at most 2000 characters').optional(),
  imageUrls: z.array(z.string().url()).max(4, 'Maximum 4 images allowed').optional(),
});

export const CreateCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment must be at most 500 characters'),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment must be at most 500 characters'),
});

export const PostQuerySchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(50).optional(),
  cursor: z.string().optional(),
  userId: z.string().uuid().optional(),
});