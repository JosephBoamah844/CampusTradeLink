import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatRelativeTime } from '@campus-trade-link/shared';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  ShareIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { PostFeed } from '@campus-trade-link/shared';
import { postApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'react-hot-toast';
import Button from '@/components/UI/Button';

interface PostCardProps {
  post: PostFeed;
  onUpdate?: (updatedPost: PostFeed) => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuthStore();
  const { emitPostLiked } = useSocket();
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const handleLike = async () => {
    if (!user || isLiking) return;

    setIsLiking(true);
    try {
      const response = await postApi.likePost(localPost.id);
      const { isLiked, likesCount } = response.data.data;

      const updatedPost = {
        ...localPost,
        isLiked,
        likesCount,
      };

      setLocalPost(updatedPost);
      onUpdate?.(updatedPost);

      // Emit real-time event
      emitPostLiked(localPost.id, isLiked);

      if (isLiked) {
        toast.success('Post liked!');
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${localPost.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${localPost.user.displayName || localPost.user.username}`,
          text: localPost.content,
          url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/users/${localPost.user.id}`} className="flex items-center space-x-3">
          {localPost.user.profileImageUrl ? (
            <Image
              src={localPost.user.profileImageUrl}
              alt={localPost.user.displayName || localPost.user.username}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {(localPost.user.displayName || localPost.user.username).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">
              {localPost.user.displayName || localPost.user.username}
              {localPost.user.isVerified && (
                <span className="ml-1 text-primary-600">✓</span>
              )}
            </p>
            <p className="text-sm text-gray-500">
              @{localPost.user.username} · {formatRelativeTime(new Date(localPost.createdAt))}
            </p>
          </div>
        </Link>

        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
          <EllipsisHorizontalIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 whitespace-pre-wrap">{localPost.content}</p>
      </div>

      {/* Post Images */}
      {localPost.imageUrls && localPost.imageUrls.length > 0 && (
        <div className="px-4 pb-3">
          {localPost.imageUrls.length === 1 ? (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={localPost.imageUrls[0]}
                alt="Post image"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {localPost.imageUrls.slice(0, 4).map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === 3 && localPost.imageUrls.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">
                        +{localPost.imageUrls.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
          >
            {localPost.isLiked ? (
              <HeartIconSolid className="h-5 w-5 text-red-600" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span>{localPost.likesCount}</span>
          </Button>

          <Link href={`/posts/${localPost.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
            >
              <ChatBubbleOvalLeftIcon className="h-5 w-5" />
              <span>{localPost.commentsCount}</span>
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
          >
            <ShareIcon className="h-5 w-5" />
            <span>Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}