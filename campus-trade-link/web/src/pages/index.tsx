import { useState } from 'react';
import Head from 'next/head';
import { useAuthStore } from '@/store/auth';
import PostFeed from '@/components/Posts/PostFeed';
import Button from '@/components/UI/Button';
import CreatePostModal from '@/components/Posts/CreatePostModal';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <Head>
        <title>Your Campus - Campus Trade Link</title>
        <meta name="description" content="See what's happening on your campus" />
      </Head>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName || user?.username}! 👋
          </h1>
          <p className="text-gray-600">
            See what's happening on your campus
          </p>
        </div>

        {/* Quick Create Post */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-3">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.displayName || user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {(user?.displayName || user?.username)?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 text-left px-4 py-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
            >
              What's happening on campus?
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Post</span>
            </Button>
          </div>
        </div>

        {/* Feed */}
        <PostFeed type="feed" />

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={() => {
            // Refresh feed after creating post
            window.location.reload();
          }}
        />
      </div>
    </>
  );
}