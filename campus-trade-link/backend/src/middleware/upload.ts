import multer from 'multer';
import { Request } from 'express';
import { config } from '../config';
import { isValidImageType } from '@campus-trade-link/shared';
import { createError } from './errorHandler';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (!isValidImageType(file.mimetype)) {
    return cb(createError(
      'Invalid file type. Only images are allowed (JPEG, PNG, GIF, WebP)',
      400,
      'INVALID_FILE_TYPE'
    ));
  }
  
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // 5MB
    files: 6, // Maximum 6 files per request
  },
});

// Middleware for single file upload
export const uploadSingle = (fieldName: string) => upload.single(fieldName);

// Middleware for multiple file upload
export const uploadMultiple = (fieldName: string, maxCount: number = 6) => 
  upload.array(fieldName, maxCount);

// Middleware for fields with different names
export const uploadFields = (fields: Array<{ name: string; maxCount?: number }>) =>
  upload.fields(fields);

// Error handler for multer errors
export const handleUploadErrors = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'FILE_TOO_LARGE',
        message: 'File too large. Maximum size is 5MB.',
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'TOO_MANY_FILES',
        message: 'Too many files. Maximum 6 files allowed.',
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'UNEXPECTED_FIELD',
        message: 'Unexpected file field.',
      });
    }
  }
  
  next(error);
};