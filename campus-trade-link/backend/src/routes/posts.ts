import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { 
  CreatePostSchema, 
  UpdatePostSchema, 
  CreateCommentSchema, 
  UpdateCommentSchema 
} from '@campus-trade-link/shared';
import { z } from 'zod';

const router = Router();
const postController = new PostController();

// GET /posts/feed - Get personalized feed
router.get('/feed', authenticate, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), postController.getFeed);

// GET /posts/explore - Get explore/trending posts
router.get('/explore', optionalAuth, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), postController.getExplorePosts);

// POST /posts - Create new post
router.post('/', authenticate, validateBody(CreatePostSchema), postController.createPost);

// GET /posts/:id - Get specific post
router.get('/:id', optionalAuth, postController.getPost);

// PUT /posts/:id - Update post
router.put('/:id', authenticate, validateBody(UpdatePostSchema), postController.updatePost);

// DELETE /posts/:id - Delete post
router.delete('/:id', authenticate, postController.deletePost);

// POST /posts/:id/like - Like/unlike post
router.post('/:id/like', authenticate, postController.likePost);

// GET /posts/:id/likes - Get post likes
router.get('/:id/likes', optionalAuth, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), postController.getPostLikes);

// GET /posts/:id/comments - Get post comments
router.get('/:id/comments', optionalAuth, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), postController.getPostComments);

// POST /posts/:id/comments - Create comment on post
router.post('/:id/comments', authenticate, validateBody(CreateCommentSchema), postController.createComment);

// PUT /posts/comments/:commentId - Update comment
router.put('/comments/:commentId', authenticate, validateBody(UpdateCommentSchema), postController.updateComment);

// DELETE /posts/comments/:commentId - Delete comment
router.delete('/comments/:commentId', authenticate, postController.deleteComment);

// POST /posts/comments/:commentId/like - Like/unlike comment
router.post('/comments/:commentId/like', authenticate, postController.likeComment);

// GET /posts/user/:userId - Get user's posts
router.get('/user/:userId', optionalAuth, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), postController.getUserPosts);

export default router;