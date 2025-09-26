import { useState, useEffect } from 'react';
import { PostFeed as PostFeedType } from '@campus-trade-link/shared';
import { postApi } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import PostCard from './PostCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface PostFeedProps {
  type: 'feed' | 'explore' | 'user';
  userId?: string;
}

export default function PostFeed({ type, userId }: PostFeedProps) {
  const [posts, setPosts] = useState<PostFeedType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { onPostInteraction, onNewMessage } = useSocket();

  const fetchPosts = async (pageNum: number = 1, reset: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      let response;
      const params = { page: pageNum, limit: 20 };

      switch (type) {
        case 'feed':
          response = await postApi.getFeed(params);
          break;
        case 'explore':
          response = await postApi.getExplorePosts(params);
          break;
        case 'user':
          if (!userId) return;
          response = await postApi.getUserPosts(userId, params);
          break;
        default:
          return;
      }

      const { data, hasMore: moreAvailable } = response.data.data;

      if (reset) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }

      setHasMore(moreAvailable);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchPosts(page + 1, false);
    }
  };

  const refresh = () => {
    fetchPosts(1, true);
  };

  const handlePostUpdate = (updatedPost: PostFeedType) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  // Listen for real-time post interactions
  useEffect(() => {
    const handlePostInteraction = (data: any) => {
      if (data.type === 'like') {
        setPosts(prev =>
          prev.map(post => {
            if (post.id === data.postId) {
              return {
                ...post,
                likesCount: data.isLiked 
                  ? post.likesCount + 1 
                  : Math.max(0, post.likesCount - 1),
              };
            }
            return post;
          })
        );
      } else if (data.type === 'comment') {
        setPosts(prev =>
          prev.map(post => {
            if (post.id === data.postId) {
              return {
                ...post,
                commentsCount: post.commentsCount + 1,
              };
            }
            return post;
          })
        );
      }
    };

    onPostInteraction(handlePostInteraction);

    return () => {
      // Clean up listeners would go here
    };
  }, [onPostInteraction]);

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
  }, [type, userId]);

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          {type === 'feed' && 'No posts in your feed yet. Follow some users to see their posts!'}
          {type === 'explore' && 'No posts to explore yet. Be the first to post!'}
          {type === 'user' && 'No posts yet.'}
        </div>
        <button
          onClick={refresh}
          className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center items-center py-6">
          <ArrowPathIcon className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      }
      endMessage={
        <div className="text-center py-6 text-gray-500">
          You've reached the end!
        </div>
      }
      refreshFunction={refresh}
      pullDownToRefresh={true}
      pullDownToRefreshThreshold={50}
      pullDownToRefreshContent={
        <div className="text-center py-3 text-gray-500">
          Pull down to refresh
        </div>
      }
      releaseToRefreshContent={
        <div className="text-center py-3 text-gray-500">
          Release to refresh
        </div>
      }
    >
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onUpdate={handlePostUpdate}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
}