import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { SUCCESS_MESSAGES } from '@campus-trade-link/shared';

export class UserController {
  private userService = new UserService();

  getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await this.userService.getUserById(req.user!.userId);
    
    res.json({
      success: true,
      data: user,
    });
  });

  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const viewerId = req.user?.userId;
    
    const profile = await this.userService.getUserProfile(id, viewerId);
    
    res.json({
      success: true,
      data: profile,
    });
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await this.userService.updateUser(req.user!.userId, req.body);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.PROFILE_UPDATED,
      data: user,
    });
  });

  followUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const followerId = req.user!.userId;
    
    const result = await this.userService.followUser(followerId, id);
    
    res.json({
      success: true,
      message: result ? 'User followed successfully' : 'Already following this user',
      data: { isFollowing: true },
    });
  });

  unfollowUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const followerId = req.user!.userId;
    
    const result = await this.userService.unfollowUser(followerId, id);
    
    res.json({
      success: true,
      message: result ? 'User unfollowed successfully' : 'Not following this user',
      data: { isFollowing: false },
    });
  });

  getFollowers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const followers = await this.userService.getFollowers(id, pagination);
    
    res.json({
      success: true,
      data: followers,
    });
  });

  getFollowing = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const following = await this.userService.getFollowing(id, pagination);
    
    res.json({
      success: true,
      data: following,
    });
  });

  searchUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q } = req.query;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const users = await this.userService.searchUsers(q as string, pagination);
    
    res.json({
      success: true,
      data: users,
    });
  });

  deleteAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await this.userService.deleteAccount(req.user!.userId);
    
    res.json({
      success: true,
      message: 'Account deleted successfully',
      data: result,
    });
  });
}