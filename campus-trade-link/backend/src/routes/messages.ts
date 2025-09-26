import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { CreateMessageSchema } from '@campus-trade-link/shared';
import { z } from 'zod';

const router = Router();
const messageController = new MessageController();

// GET /messages/conversations - Get user's conversations
router.get('/conversations', authenticate, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), messageController.getConversations);

// GET /messages/conversations/:id - Get conversation messages
router.get('/conversations/:id', authenticate, validateQuery(z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})), messageController.getConversationMessages);

// POST /messages - Send new message
router.post('/', authenticate, validateBody(CreateMessageSchema), messageController.sendMessage);

// POST /messages/:id/read - Mark message as read
router.post('/:id/read', authenticate, messageController.markMessageRead);

// POST /messages/conversations/:id/read - Mark conversation as read
router.post('/conversations/:id/read', authenticate, messageController.markConversationRead);

// DELETE /messages/conversations/:id - Delete conversation
router.delete('/conversations/:id', authenticate, messageController.deleteConversation);

export default router;