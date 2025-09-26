import { Request, Response } from 'express';
import { uploadFile, uploadMultipleFiles } from '../lib/storage';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db';
import { uploads } from '../db/schema';

export class UploadController {
  uploadSingle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw createError('No file uploaded', 400, 'VALIDATION_ERROR');
    }

    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      req.user!.userId
    );

    // Save upload record to database
    await db.insert(uploads).values({
      id: result.id,
      userId: req.user!.userId,
      filename: result.filename,
      originalName: result.originalName,
      mimetype: result.mimetype,
      size: result.size,
      url: result.url,
      bucket: result.bucket,
      path: result.path,
    });

    res.json({
      success: true,
      data: result,
    });
  });

  uploadMultiple = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw createError('No files uploaded', 400, 'VALIDATION_ERROR');
    }

    const fileData = req.files.map(file => ({
      file: file.buffer,
      originalName: file.originalname,
      mimetype: file.mimetype,
    }));

    const results = await uploadMultipleFiles(fileData, req.user!.userId);

    // Save upload records to database
    const uploadRecords = results.map(result => ({
      id: result.id,
      userId: req.user!.userId,
      filename: result.filename,
      originalName: result.originalName,
      mimetype: result.mimetype,
      size: result.size,
      url: result.url,
      bucket: result.bucket,
      path: result.path,
    }));

    await db.insert(uploads).values(uploadRecords);

    res.json({
      success: true,
      data: results,
    });
  });

  getUserUploads = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const limit = Math.min(pagination.limit, 50);
    const offset = ((pagination.page || 1) - 1) * limit;

    const userUploads = await db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, req.user!.userId))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(uploads.createdAt));

    const hasMore = userUploads.length > limit;
    const data = hasMore ? userUploads.slice(0, -1) : userUploads;

    res.json({
      success: true,
      data: {
        data,
        hasMore,
      },
    });
  });
}