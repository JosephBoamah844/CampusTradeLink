import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import { ERROR_CODES } from '@campus-trade-link/shared';

export interface AppError extends Error {
  statusCode?: number;
  errorCode?: string;
  isOperational?: boolean;
}

export const createError = (
  message: string,
  statusCode: number = 500,
  errorCode: string = 'INTERNAL_ERROR'
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.errorCode = errorCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let errorCode = error.errorCode || 'INTERNAL_ERROR';
  let message = error.message || 'An unexpected error occurred';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = ERROR_CODES.UNAUTHORIZED;
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    errorCode = ERROR_CODES.FORBIDDEN;
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    errorCode = ERROR_CODES.NOT_FOUND;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  res.status(statusCode).json({
    success: false,
    error: errorCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: ERROR_CODES.NOT_FOUND,
    message: 'Route not found',
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};