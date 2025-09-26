import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@campus-trade-link/shared';
import { authApi, userApi } from '@/lib/api';
import { socketManager } from '@/lib/socket';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          const { user, tokens } = response.data.data;

          // Store tokens
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          // Connect to socket
          socketManager.connect(tokens.accessToken);

          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, username: string, password: string, displayName?: string) => {
        set({ isLoading: true });
        try {
          await authApi.register({ email, username, password, displayName });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Disconnect socket
        socketManager.disconnect();

        // Call logout endpoint
        authApi.logout().catch(() => {
          // Ignore errors on logout
        });

        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      updateUser: (data: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...data },
          });
        }
      },

      refreshUser: async () => {
        try {
          const response = await userApi.getMe();
          const user = response.data.data;
          set({ user });
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true });
        try {
          await authApi.verifyEmail(token);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });
        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true });
        try {
          await authApi.resetPassword({ token, password });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);