import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload } from '../lib/auth';
import { ERROR_CODES } from '@campus-trade-link/shared';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: ERROR_CODES.UNAUTHORIZED,
        message: 'Access token required',
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: ERROR_CODES.UNAUTHORIZED,
      message: 'Invalid or expired token',
    });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};