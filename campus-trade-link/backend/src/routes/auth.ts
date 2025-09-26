import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateBody } from '../middleware/validation';
import { authRateLimit } from '../middleware/rateLimiting';
import { 
  CreateUserSchema, 
  LoginSchema, 
  ForgotPasswordSchema, 
  ResetPasswordSchema 
} from '@campus-trade-link/shared';

const router = Router();
const authController = new AuthController();

// Apply rate limiting to all auth routes
router.use(authRateLimit);

// POST /auth/register
router.post('/register', validateBody(CreateUserSchema), authController.register);

// POST /auth/login
router.post('/login', validateBody(LoginSchema), authController.login);

// POST /auth/refresh
router.post('/refresh', authController.refreshToken);

// GET /auth/verify-email?token=...
router.get('/verify-email', authController.verifyEmail);

// POST /auth/forgot-password
router.post('/forgot-password', validateBody(ForgotPasswordSchema), authController.forgotPassword);

// POST /auth/reset-password
router.post('/reset-password', validateBody(ResetPasswordSchema), authController.resetPassword);

// POST /auth/logout
router.post('/logout', authController.logout);

export default router;