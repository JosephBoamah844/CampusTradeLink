import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authenticate } from '../middleware/auth';
import { uploadSingle, uploadMultiple, handleUploadErrors } from '../middleware/upload';
import { uploadRateLimit } from '../middleware/rateLimiting';

const router = Router();
const uploadController = new UploadController();

// Apply rate limiting to upload routes
router.use(uploadRateLimit);

// POST /uploads/single - Upload single file
router.post('/single', 
  authenticate, 
  uploadSingle('file'), 
  handleUploadErrors, 
  uploadController.uploadSingle
);

// POST /uploads/multiple - Upload multiple files
router.post('/multiple', 
  authenticate, 
  uploadMultiple('files', 6), 
  handleUploadErrors, 
  uploadController.uploadMultiple
);

// GET /uploads/me - Get user's uploads
router.get('/me', authenticate, uploadController.getUserUploads);

export default router;