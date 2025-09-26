import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import { useAuthStore } from '@/store/auth';
import { Toaster } from 'react-hot-toast';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showBottomNav?: boolean;
  showHeader?: boolean;
}

const publicPaths = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export default function AppLayout({ 
  children, 
  title = 'Campus Trade Link',
  description = 'Connect, buy, and sell with fellow UG students',
  showBottomNav = true,
  showHeader = true,
}: AppLayoutProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const isPublicPath = publicPaths.some(path => router.pathname.startsWith(path));
  const shouldShowBottomNav = showBottomNav && isAuthenticated && !isPublicPath;
  const shouldShowHeader = showHeader && isAuthenticated && !isPublicPath;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {shouldShowHeader && <Header />}
        
        <main className={clsx(
          'relative',
          shouldShowHeader && 'pt-16',
          shouldShowBottomNav && 'pb-16'
        )}>
          {children}
        </main>

        {shouldShowBottomNav && <BottomNavigation />}
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}