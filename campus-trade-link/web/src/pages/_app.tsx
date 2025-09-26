import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAuthStore } from '@/store/auth';
import { socketManager } from '@/lib/socket';
import AppLayout from '@/components/Layout/AppLayout';
import '@/styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const publicPaths = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated, tokens, refreshUser } = useAuthStore();

  // Initialize auth state and socket connection
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token && isAuthenticated) {
      // Refresh user data
      refreshUser();
      
      // Connect socket
      if (tokens?.accessToken) {
        socketManager.connect(tokens.accessToken);
      }
    }
  }, []);

  // Handle authentication routing
  useEffect(() => {
    const isPublicPath = publicPaths.some(path => router.pathname.startsWith(path));
    
    if (!isAuthenticated && !isPublicPath) {
      router.replace('/login');
    } else if (isAuthenticated && isPublicPath) {
      router.replace('/');
    }
  }, [isAuthenticated, router.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </QueryClientProvider>
  );
}