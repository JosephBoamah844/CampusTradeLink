import { Request, Response } from 'express';
import { PostService } from '../services/PostService';
import { CommentService } from '../services/CommentService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { SUCCESS_MESSAGES } from '@campus-trade-link/shared';

export class PostController {
  private postService = new PostService();
  private commentService = new CommentService();

  createPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const post = await this.postService.createPost(req.user!.userId, req.body);
    
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.POST_CREATED,
      data: post,
    });
  });

  getPost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const viewerId = req.user?.userId;
    
    const post = await this.postService.getPostById(id, viewerId);
    
    res.json({
      success: true,
      data: post,
    });
  });

  updatePost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const post = await this.postService.updatePost(id, req.user!.userId, req.body);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.POST_UPDATED,
      data: post,
    });
  });

  deletePost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await this.postService.deletePost(id, req.user!.userId);
    
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.POST_DELETED,
      data: result,
    });
  });

  getFeed = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const feed = await this.postService.getFeed(req.user!.userId, pagination);
    
    res.json({
      success: true,
      data: feed,
    });
  });

  getExplorePosts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    const viewerId = req.user?.userId;
    
    const posts = await this.postService.getExplorePosts(viewerId, pagination);
    
    res.json({
      success: true,
      data: posts,
    });
  });

  getUserPosts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const viewerId = req.user?.userId;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const posts = await this.postService.getUserPosts(userId, viewerId, pagination);
    
    res.json({
      success: true,
      data: posts,
    });
  });

  likePost = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await this.postService.likePost(id, req.user!.userId);
    
    res.json({
      success: true,
      data: result,
    });
  });

  getPostLikes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const likes = await this.postService.getPostLikes(id, pagination);
    
    res.json({
      success: true,
      data: likes,
    });
  });

  createComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const comment = await this.commentService.createComment(req.user!.userId, req.body);
    
    res.status(201).json({
      success: true,
      data: comment,
    });
  });

  getPostComments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const viewerId = req.user?.userId;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const comments = await this.commentService.getPostComments(id, viewerId, pagination);
    
    res.json({
      success: true,
      data: comments,
    });
  });

  updateComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { commentId } = req.params;
    const comment = await this.commentService.updateComment(commentId, req.user!.userId, req.body);
    
    res.json({
      success: true,
      data: comment,
    });
  });

  deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { commentId } = req.params;
    const result = await this.commentService.deleteComment(commentId, req.user!.userId);
    
    res.json({
      success: true,
      data: result,
    });
  });

  likeComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { commentId } = req.params;
    const result = await this.commentService.likeComment(commentId, req.user!.userId);
    
    res.json({
      success: true,
      data: result,
    });
  });
}