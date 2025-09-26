import { Request, Response } from 'express';
import { MessageService } from '../services/MessageService';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { SUCCESS_MESSAGES } from '@campus-trade-link/shared';

export class MessageController {
  private messageService = new MessageService();

  sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const message = await this.messageService.createMessage(req.user!.userId, req.body);
    
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE_SENT,
      data: message,
    });
  });

  getConversations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };
    
    const conversations = await this.messageService.getUserConversations(req.user!.userId, pagination);
    
    res.json({
      success: true,
      data: conversations,
    });
  });

  getConversationMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const pagination = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };
    
    const messages = await this.messageService.getConversationMessages(id, req.user!.userId, pagination);
    
    res.json({
      success: true,
      data: messages,
    });
  });

  markMessageRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await this.messageService.markMessageAsRead(id, req.user!.userId);
    
    res.json({
      success: true,
      message: 'Message marked as read',
    });
  });

  markConversationRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    await this.messageService.markConversationAsRead(id, req.user!.userId);
    
    res.json({
      success: true,
      message: 'Conversation marked as read',
    });
  });

  deleteConversation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await this.messageService.deleteConversation(id, req.user!.userId);
    
    res.json({
      success: true,
      data: result,
    });
  });
}