import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';

const WS_URL = Constants.expoConfig?.extra?.wsUrl || 'http://localhost:4000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { tokens, isAuthenticated } = useAuth();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    if (isAuthenticated && tokens?.accessToken) {
      const newSocket = io(WS_URL, {
        auth: { token: tokens.accessToken },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, tokens?.accessToken]);

  const value: SocketContextType = {
    socket,
    isConnected,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};