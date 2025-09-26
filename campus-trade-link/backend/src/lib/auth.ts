import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { AuthTokens } from '@campus-trade-link/shared';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateTokens = (payload: JWTPayload): AuthTokens => {
  const accessToken = jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.JWT_SECRET) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as JWTPayload;
};

export const generateEmailVerificationToken = (): string => {
  return jwt.sign({ type: 'email_verification' }, config.JWT_SECRET, {
    expiresIn: '24h',
  });
};

export const verifyEmailVerificationToken = (token: string): boolean => {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as any;
    return payload.type === 'email_verification';
  } catch {
    return false;
  }
};

export const generatePasswordResetToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'password_reset' }, config.JWT_SECRET, {
    expiresIn: '1h',
  });
};

export const verifyPasswordResetToken = (token: string): { userId: string } | null => {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as any;
    if (payload.type === 'password_reset' && payload.userId) {
      return { userId: payload.userId };
    }
    return null;
  } catch {
    return null;
  }
};