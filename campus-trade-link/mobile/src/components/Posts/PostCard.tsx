import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostFeed, formatRelativeTime } from '@campus-trade-link/shared';
import { postApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');

interface PostCardProps {
  post: PostFeed;
  onUpdate?: (post: PostFeed) => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [localPost, setLocalPost] = useState(post);
  const [isLiking, setIsLiking] = useState(false);

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

      if (isLiked) {
        Toast.show({
          type: 'success',
          text1: 'Liked!',
          position: 'bottom',
        });
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleUserPress = () => {
    navigation.navigate('UserProfile', { userId: localPost.user.id });
  };

  const handlePostPress = () => {
    navigation.navigate('PostDetail', { postId: localPost.id });
  };

  const renderImages = () => {
    if (!localPost.imageUrls || localPost.imageUrls.length === 0) return null;

    const imageWidth = screenWidth - 32; // Account for padding
    const imageHeight = imageWidth * 0.75; // 4:3 aspect ratio

    if (localPost.imageUrls.length === 1) {
      return (
        <Image
          source={{ uri: localPost.imageUrls[0] }}
          style={[styles.singleImage, { width: imageWidth, height: imageHeight }]}
          resizeMode="cover"
        />
      );
    }

    // For multiple images, show first image with indicator
    return (
      <View>
        <Image
          source={{ uri: localPost.imageUrls[0] }}
          style={[styles.singleImage, { width: imageWidth, height: imageHeight }]}
          resizeMode="cover"
        />
        {localPost.imageUrls.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>
              1/{localPost.imageUrls.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={handleUserPress}>
        {localPost.user.profileImageUrl ? (
          <Image
            source={{ uri: localPost.user.profileImageUrl }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(localPost.user.displayName || localPost.user.username).charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>
              {localPost.user.displayName || localPost.user.username}
            </Text>
            {localPost.user.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color="#2563eb" />
            )}
          </View>
          <Text style={styles.username}>
            @{localPost.user.username} · {formatRelativeTime(new Date(localPost.createdAt))}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Content */}
      <TouchableOpacity onPress={handlePostPress}>
        <Text style={styles.content}>{localPost.content}</Text>
        {renderImages()}
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleLike}
          disabled={isLiking}
        >
          <Ionicons 
            name={localPost.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={localPost.isLiked ? "#EF4444" : "#6B7280"} 
          />
          <Text style={[styles.actionText, localPost.isLiked && styles.likedText]}>
            {localPost.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handlePostPress}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
          <Text style={styles.actionText}>{localPost.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 4,
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  content: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginBottom: 12,
  },
  singleImage: {
    borderRadius: 12,
    marginBottom: 12,
  },
  imageCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
});