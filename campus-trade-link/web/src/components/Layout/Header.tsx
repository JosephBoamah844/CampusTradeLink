import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  MagnifyingGlassIcon,
  BellIcon,
  PlusIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/store/auth';
import CreatePostModal from '@/components/Posts/CreatePostModal';
import NotificationsDropdown from '@/components/Notifications/NotificationsDropdown';

export default function Header() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CT</span>
              </div>
              <span className="font-bold text-lg text-gray-900 hidden sm:block">
                Campus Trade Link
              </span>
            </Link>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const query = (e.target as HTMLInputElement).value;
                      if (query.trim()) {
                        router.push(`/search?q=${encodeURIComponent(query)}`);
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search (Mobile) */}
              <button
                onClick={() => router.push('/search')}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>

              {/* Create Post */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Create post"
              >
                <PlusIcon className="h-6 w-6" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
                  aria-label="Notifications"
                >
                  <BellIcon className="h-6 w-6" />
                  {/* Notification badge */}
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <NotificationsDropdown 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)} 
                />
              </div>

              {/* Profile */}
              <Link href="/profile" className="flex items-center">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.displayName || user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {(user?.displayName || user?.username)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}