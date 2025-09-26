import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/errorHandler';
import { SUCCESS_MESSAGES } from '@campus-trade-link/shared';

export class AuthController {
  private authService = new AuthService();

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    
    res.json({
      success: true,
      data: result,
    });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const tokens = await this.authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: tokens,
    });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;
    const result = await this.authService.verifyEmail(token as string);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
      data: result,
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.authService.forgotPassword(email);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
      data: result,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    const result = await this.authService.resetPassword(token, password);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET,
      data: result,
    });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    // In a production app, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  });
}