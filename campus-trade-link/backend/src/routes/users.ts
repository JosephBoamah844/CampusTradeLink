import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { UpdateUserSchema } from '@campus-trade-link/shared';
import { z } from 'zod';

const router = Router();
const userController = new UserController();

// GET /users/me - Get current user profile
router.get('/me', authenticate, userController.getMe);

// PUT /users/me - Update current user profile
router.put('/me', authenticate, validateBody(UpdateUserSchema), userController.updateProfile);

// DELETE /users/me - Delete current user account
router.delete('/me', authenticate, userController.deleteAccount);

// GET /users/search - Search users
router.get('/search', optionalAuth, validateQuery(z.object({
  q: z.string().min(1),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), userController.searchUsers);

// GET /users/:id - Get user profile
router.get('/:id', optionalAuth, userController.getProfile);

// POST /users/:id/follow - Follow user
router.post('/:id/follow', authenticate, userController.followUser);

// DELETE /users/:id/follow - Unfollow user
router.delete('/:id/follow', authenticate, userController.unfollowUser);

// GET /users/:id/followers - Get user followers
router.get('/:id/followers', optionalAuth, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), userController.getFollowers);

// GET /users/:id/following - Get users that this user follows
router.get('/:id/following', optionalAuth, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), userController.getFollowing);

export default router;