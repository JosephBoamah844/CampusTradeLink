import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';
import { 
  CreateUserInput, 
  LoginInput, 
  AuthResponse,
  User,
  AuthTokens 
} from '@campus-trade-link/shared';
import { 
  hashPassword, 
  comparePassword, 
  generateTokens,
  verifyRefreshToken,
  verifyEmailVerificationToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
} from '../lib/auth';
import { sendPasswordResetEmail } from '../lib/email';
import { createError } from '../middleware/errorHandler';
import { UserService } from './UserService';

export class AuthService {
  private userService = new UserService();

  async register(input: CreateUserInput): Promise<{ message: string }> {
    await this.userService.createUser(input);
    
    return {
      message: 'Account created successfully. Please check your email for verification.',
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (!user) {
      throw createError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw createError(
        'Account has been deactivated',
        401,
        'ACCOUNT_DEACTIVATED'
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw createError(
        'Invalid email or password',
        401,
        'INVALID_CREDENTIALS'
      );
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw createError(
        'Please verify your email before logging in',
        401,
        'EMAIL_NOT_VERIFIED'
      );
    }

    // Update last login
    await db
      .update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const userData = await this.userService.getUserById(user.id);
    if (!userData) {
      throw createError('User not found', 404, 'NOT_FOUND');
    }

    return {
      user: userData,
      tokens,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = verifyRefreshToken(refreshToken);
      
      // Verify user still exists and is active
      const user = await this.userService.getUserById(payload.userId);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      return generateTokens({
        userId: user.id,
        email: user.email,
        username: user.username,
      });
    } catch (error) {
      throw createError(
        'Invalid refresh token',
        401,
        'UNAUTHORIZED'
      );
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    if (!verifyEmailVerificationToken(token)) {
      throw createError(
        'Invalid or expired verification token',
        400,
        'INVALID_TOKEN'
      );
    }

    const success = await this.userService.verifyEmail(token);
    if (!success) {
      throw createError(
        'Invalid or expired verification token',
        400,
        'INVALID_TOKEN'
      );
    }

    return {
      message: 'Email verified successfully',
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Don't reveal if email exists - return success anyway
      return {
        message: 'If an account with that email exists, we\'ve sent a password reset link.',
      };
    }

    const resetToken = generatePasswordResetToken(user.id);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await db
      .update(users)
      .set({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    return {
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const payload = verifyPasswordResetToken(token);
    if (!payload) {
      throw createError(
        'Invalid or expired reset token',
        400,
        'INVALID_TOKEN'
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || user.passwordResetToken !== token) {
      throw createError(
        'Invalid or expired reset token',
        400,
        'INVALID_TOKEN'
      );
    }

    if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
      throw createError(
        'Reset token has expired',
        400,
        'TOKEN_EXPIRED'
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await db
      .update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return {
      message: 'Password reset successfully',
    };
  }

  async deleteAccount(userId: string): Promise<{ message: string }> {
    // Soft delete - mark as inactive
    await db
      .update(users)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      message: 'Account deleted successfully',
    };
  }
}