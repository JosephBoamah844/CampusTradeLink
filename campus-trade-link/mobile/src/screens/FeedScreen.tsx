import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { PostFeed } from '@campus-trade-link/shared';
import { postApi } from '../lib/api';
import { useQuery } from 'react-query';
import PostCard from '../components/Posts/PostCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { RootStackParamList } from '../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function FeedScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const {
    data: feedData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery(
    ['feed', page],
    () => postApi.getFeed({ page, limit: 20 }),
    {
      enabled: true,
      keepPreviousData: true,
    }
  );

  const posts = feedData?.data?.data?.data || [];

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleRefresh = () => {
    setPage(1);
    refetch();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Welcome to Campus Trade Link!</Text>
      <Text style={styles.emptySubtitle}>
        Follow other students to see their posts in your feed
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Explore' })}
      >
        <Text style={styles.exploreButtonText}>Explore Campus</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPost = ({ item }: { item: PostFeed }) => (
    <PostCard post={item} />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back, {user?.displayName || user?.username}! 👋
          </Text>
          <Text style={styles.subtitle}>See what's happening on campus</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreatePost}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.feedContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  createButton: {
    width: 40,
    height: 40,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});