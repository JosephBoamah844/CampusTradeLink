import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { ERROR_CODES } from '@campus-trade-link/shared';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Simple in-memory rate limiting (in production, use Redis)
export const rateLimit = (
  windowMs: number = config.RATE_LIMIT_WINDOW_MS,
  maxRequests: number = config.RATE_LIMIT_MAX_REQUESTS
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    if (store[key] && store[key].resetTime < now) {
      delete store[key];
    }
    
    // Initialize or update counter
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
    } else {
      store[key].count++;
    }
    
    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - store[key].count).toString(),
      'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString(),
    });
    
    next();
  };
};

// More strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit(15 * 60 * 1000, 5); // 5 requests per 15 minutes
export const uploadRateLimit = rateLimit(60 * 1000, 10); // 10 uploads per minute