import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

class SocketManager {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string): Socket {
    if (this.socket?.connected && this.token === token) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.token = token;
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Message events
  joinConversation(conversationId: string): void {
    this.socket?.emit('join_conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.socket?.emit('leave_conversation', conversationId);
  }

  sendMessage(data: {
    conversationId?: string;
    recipientId?: string;
    content: string;
    messageType?: string;
  }): void {
    this.socket?.emit('send_message', data);
  }

  markMessageRead(messageId: string): void {
    this.socket?.emit('mark_message_read', messageId);
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    this.socket?.emit('typing_start', conversationId);
  }

  stopTyping(conversationId: string): void {
    this.socket?.emit('typing_stop', conversationId);
  }

  // Post interactions
  emitPostLiked(postId: string, isLiked: boolean): void {
    this.socket?.emit('post_liked', { postId, isLiked });
  }

  emitPostCommented(postId: string, comment: any): void {
    this.socket?.emit('post_commented', { postId, comment });
  }

  // Event listeners
  onNewMessage(callback: (message: any) => void): void {
    this.socket?.on('new_message', callback);
  }

  onMessageRead(callback: (data: { messageId: string; userId: string }) => void): void {
    this.socket?.on('message_read', callback);
  }

  onUserOnline(callback: (data: { userId: string; username: string }) => void): void {
    this.socket?.on('user_online', callback);
  }

  onUserOffline(callback: (data: { userId: string; username: string }) => void): void {
    this.socket?.on('user_offline', callback);
  }

  onUserTyping(callback: (data: { userId: string; username: string; conversationId: string }) => void): void {
    this.socket?.on('user_typing', callback);
  }

  onUserStoppedTyping(callback: (data: { userId: string; username: string; conversationId: string }) => void): void {
    this.socket?.on('user_stopped_typing', callback);
  }

  onNewNotification(callback: (notification: any) => void): void {
    this.socket?.on('new_notification', callback);
  }

  onPostInteraction(callback: (data: any) => void): void {
    this.socket?.on('post_interaction', callback);
  }

  // Remove event listeners
  off(event: string, callback?: Function): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

export const socketManager = new SocketManager();