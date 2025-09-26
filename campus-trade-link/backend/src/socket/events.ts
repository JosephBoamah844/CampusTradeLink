import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../lib/auth';
import { MessageService } from '../services/MessageService';
import logger from '../lib/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

export const handleSocketConnection = (io: Server) => {
  const messageService = new MessageService();
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.username = payload.username;
      
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const username = socket.username!;

    logger.info(`User connected: ${username} (${userId})`);

    // Track online user
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit('user_online', { userId, username });

    // Join user to their personal room for notifications
    socket.join(`user:${userId}`);

    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${username} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      logger.info(`User ${username} left conversation ${conversationId}`);
    });

    // Handle new message
    socket.on('send_message', async (data: {
      conversationId?: string;
      recipientId?: string;
      content: string;
      messageType?: string;
    }) => {
      try {
        const message = await messageService.createMessage(userId, data);
        
        // Emit to conversation room
        io.to(`conversation:${message.conversationId}`).emit('new_message', message);
        
        // Emit notification to recipient if they're online
        if (data.recipientId && onlineUsers.has(data.recipientId)) {
          io.to(`user:${data.recipientId}`).emit('new_notification', {
            type: 'MESSAGE',
            message: `New message from ${username}`,
            data: { conversationId: message.conversationId },
          });
        }

        logger.info(`Message sent by ${username} in conversation ${message.conversationId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
        logger.error('Socket message error:', error);
      }
    });

    // Handle message read
    socket.on('mark_message_read', async (messageId: string) => {
      try {
        await messageService.markMessageAsRead(messageId, userId);
        socket.broadcast.emit('message_read', { messageId, userId });
      } catch (error) {
        logger.error('Socket mark read error:', error);
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_typing', {
        userId,
        username,
        conversationId,
      });
    });

    socket.on('typing_stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
        userId,
        username,
        conversationId,
      });
    });

    // Handle real-time post interactions
    socket.on('post_liked', (data: { postId: string; isLiked: boolean }) => {
      socket.broadcast.emit('post_interaction', {
        type: 'like',
        postId: data.postId,
        userId,
        username,
        isLiked: data.isLiked,
      });
    });

    socket.on('post_commented', (data: { postId: string; comment: any }) => {
      socket.broadcast.emit('post_interaction', {
        type: 'comment',
        postId: data.postId,
        userId,
        username,
        comment: data.comment,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user_offline', { userId, username });
      logger.info(`User disconnected: ${username} (${userId})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  return io;
};