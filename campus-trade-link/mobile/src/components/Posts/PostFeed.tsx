import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { PostFeed as PostFeedType } from '@campus-trade-link/shared';
import { postApi } from '../../lib/api';
import PostCard from './PostCard';
import LoadingSpinner from '../UI/LoadingSpinner';

interface PostFeedProps {
  type: 'feed' | 'explore' | 'user';
  userId?: string;
}

export default function PostFeed({ type, userId }: PostFeedProps) {
  const [posts, setPosts] = useState<PostFeedType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPosts = async (pageNum: number = 1, refresh: boolean = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

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
      }

      const { data, hasMore: moreAvailable } = response.data.data;

      if (pageNum === 1 || refresh) {
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
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    fetchPosts(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingMore) {
      fetchPosts(page + 1);
    }
  };

  const handlePostUpdate = (updatedPost: PostFeedType) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  useEffect(() => {
    fetchPosts(1);
  }, [type, userId]);

  const renderPost = ({ item }: { item: PostFeedType }) => (
    <PostCard post={item} onUpdate={handlePostUpdate} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {type === 'feed' && 'No posts in your feed yet. Follow some users!'}
        {type === 'explore' && 'No posts to explore yet.'}
        {type === 'user' && 'No posts yet.'}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#2563eb"
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={posts.length === 0 ? styles.emptyContentContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContentContainer: {
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});