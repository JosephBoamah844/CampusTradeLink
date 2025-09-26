import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Tab } from '@headlessui/react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth';
import { userApi } from '@/lib/api';
import PostFeed from '@/components/Posts/PostFeed';
import ProductGrid from '@/components/Products/ProductGrid';
import EditProfileModal from '@/components/Profile/EditProfileModal';
import Button from '@/components/UI/Button';
import { 
  CogIcon, 
  DocumentTextIcon, 
  ShoppingBagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const tabs = [
  {
    name: 'Posts',
    icon: DocumentTextIcon,
    component: 'posts',
  },
  {
    name: 'Products',
    icon: ShoppingBagIcon,
    component: 'products',
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [selectedTab, setSelectedTab] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
  });

  useEffect(() => {
    if (user) {
      setStats({
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
      });
    }
  }, [user]);

  const handleProfileUpdate = (updatedUser: any) => {
    updateUser(updatedUser);
    setShowEditModal(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Profile - Campus Trade Link</title>
        <meta name="description" content="Your Campus Trade Link profile" />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          
          <div className="px-6 pb-6">
            {/* Profile Picture */}
            <div className="flex items-end justify-between -mt-12 mb-4">
              <div className="relative">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.displayName || user.username}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                      {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {user.isVerified && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-2"
              >
                <CogIcon className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            </div>

            {/* Profile Info */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {user.displayName || user.username}
              </h1>
              <p className="text-gray-600 mb-2">@{user.username}</p>
              {user.bio && (
                <p className="text-gray-700 mb-3">{user.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.postsCount}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <Link href={`/users/${user.id}/followers`} className="text-center hover:opacity-80 transition-opacity">
                <p className="text-2xl font-bold text-gray-900">{stats.followersCount}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </Link>
              <Link href={`/users/${user.id}/following`} className="text-center hover:opacity-80 transition-opacity">
                <p className="text-2xl font-bold text-gray-900">{stats.followingCount}</p>
                <p className="text-sm text-gray-600">Following</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                    'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60',
                    selected
                      ? 'bg-white text-primary-700 shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                  )
                }
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels>
            {/* Posts Tab */}
            <Tab.Panel className="focus:outline-none">
              <div className="max-w-2xl mx-auto">
                <PostFeed type="user" userId={user.id} />
              </div>
            </Tab.Panel>

            {/* Products Tab */}
            <Tab.Panel className="focus:outline-none">
              <ProductGrid userId={user.id} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={user}
          onUpdate={handleProfileUpdate}
        />
      </div>
    </>
  );
}