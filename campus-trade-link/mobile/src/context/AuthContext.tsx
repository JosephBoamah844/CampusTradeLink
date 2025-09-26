import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, AuthTokens } from '@campus-trade-link/shared';
import { authApi, userApi } from '../lib/api';
import Toast from 'react-native-toast-message';

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (accessToken && refreshToken) {
        setTokens({ accessToken, refreshToken, expiresIn: 0 });
        await refreshUser();
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      await clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      const { user: userData, tokens: tokenData } = response.data.data;

      // Store tokens securely
      await SecureStore.setItemAsync('accessToken', tokenData.accessToken);
      await SecureStore.setItemAsync('refreshToken', tokenData.refreshToken);

      setUser(userData);
      setTokens(tokenData);
      setIsAuthenticated(true);

      Toast.show({
        type: 'success',
        text1: 'Welcome back!',
        text2: `Hello, ${userData.displayName || userData.username}`,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (email: string, username: string, password: string, displayName?: string) => {
    try {
      await authApi.register({ email, username, password, displayName });
      
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Please check your email to verify your account.',
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      await clearAuth();
      
      Toast.show({
        type: 'info',
        text1: 'Logged out',
        text2: 'See you next time!',
      });
    }
  };

  const clearAuth = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
    setTokens(null);
    setIsAuthenticated(false);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const refreshUser = async () => {
    try {
      const response = await userApi.getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};