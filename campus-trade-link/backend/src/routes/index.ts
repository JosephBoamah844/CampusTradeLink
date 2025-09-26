import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import postRoutes from './posts';
import productRoutes from './products';
import messageRoutes from './messages';
import uploadRoutes from './uploads';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Trade Link API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/products', productRoutes);
router.use('/messages', messageRoutes);
router.use('/uploads', uploadRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Trade Link API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      posts: '/api/posts',
      products: '/api/products',
      messages: '/api/messages',
      uploads: '/api/uploads',
    },
    documentation: 'https://github.com/yourusername/campus-trade-link/blob/main/docs/api.md',
  });
});

export default router;