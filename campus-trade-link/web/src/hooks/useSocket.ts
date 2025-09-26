import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { socketManager } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

export const useSocket = () => {
  const { tokens, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      socketRef.current = socketManager.connect(tokens.accessToken);
    } else {
      socketManager.disconnect();
      socketRef.current = null;
    }

    return () => {
      if (!isAuthenticated) {
        socketManager.disconnect();
      }
    };
  }, [isAuthenticated, tokens?.accessToken]);

  return {
    socket: socketRef.current,
    isConnected: socketManager.isConnected(),
    joinConversation: socketManager.joinConversation.bind(socketManager),
    leaveConversation: socketManager.leaveConversation.bind(socketManager),
    sendMessage: socketManager.sendMessage.bind(socketManager),
    markMessageRead: socketManager.markMessageRead.bind(socketManager),
    startTyping: socketManager.startTyping.bind(socketManager),
    stopTyping: socketManager.stopTyping.bind(socketManager),
    emitPostLiked: socketManager.emitPostLiked.bind(socketManager),
    emitPostCommented: socketManager.emitPostCommented.bind(socketManager),
    onNewMessage: socketManager.onNewMessage.bind(socketManager),
    onMessageRead: socketManager.onMessageRead.bind(socketManager),
    onUserOnline: socketManager.onUserOnline.bind(socketManager),
    onUserOffline: socketManager.onUserOffline.bind(socketManager),
    onUserTyping: socketManager.onUserTyping.bind(socketManager),
    onUserStoppedTyping: socketManager.onUserStoppedTyping.bind(socketManager),
    onNewNotification: socketManager.onNewNotification.bind(socketManager),
    onPostInteraction: socketManager.onPostInteraction.bind(socketManager),
    off: socketManager.off.bind(socketManager),
  };
};