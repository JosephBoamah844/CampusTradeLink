import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product, formatCurrency, formatRelativeTime } from '@campus-trade-link/shared';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  width: number;
}

export default function ProductCard({ product, onPress, width }: ProductCardProps) {
  return (
    <TouchableOpacity style={[styles.container, { width }]} onPress={onPress}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <Image
            source={{ uri: product.imageUrls[0] }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}
        
        {/* Condition Badge */}
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>
            {product.condition.replace('_', ' ')}
          </Text>
        </View>

        {/* Multiple Images Indicator */}
        {product.imageUrls && product.imageUrls.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Text style={styles.imageCountText}>
              +{product.imageUrls.length - 1}
            </Text>
          </View>
        )}

        {/* Sold Overlay */}
        {!product.isAvailable && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>SOLD</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        
        {/* Location and Time */}
        <View style={styles.metadata}>
          {product.location && (
            <View style={styles.metadataItem}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.metadataText} numberOfLines={1}>
                {product.location}
              </Text>
            </View>
          )}
          <Text style={styles.timeText}>
            {formatRelativeTime(new Date(product.createdAt))}
          </Text>
        </View>

        {/* Seller */}
        <View style={styles.seller}>
          <View style={styles.sellerInfo}>
            {product.user.profileImageUrl ? (
              <Image
                source={{ uri: product.user.profileImageUrl }}
                style={styles.sellerAvatar}
              />
            ) : (
              <View style={styles.sellerAvatarPlaceholder}>
                <Text style={styles.sellerAvatarText}>
                  {(product.user.displayName || product.user.username).charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.sellerName} numberOfLines={1}>
              {product.user.displayName || product.user.username}
              {product.user.isVerified && ' ✓'}
            </Text>
          </View>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  imageCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  soldOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    padding: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 18,
  },
  metadata: {
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  metadataText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 2,
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  seller: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  sellerAvatarPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#374151',
  },
  sellerName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 6,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
});