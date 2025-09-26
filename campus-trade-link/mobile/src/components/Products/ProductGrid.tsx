import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Product } from '@campus-trade-link/shared';
import { productApi } from '../../lib/api';
import ProductCard from './ProductCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import { RootStackParamList } from '../../navigation';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

interface ProductGridProps {
  userId?: string;
  category?: string;
  searchQuery?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProductGrid({ userId, category, searchQuery }: ProductGridProps) {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchProducts = async (pageNum: number = 1, refresh: boolean = false) => {
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

      if (searchQuery) {
        response = await productApi.searchProducts({ q: searchQuery, ...params });
      } else if (category) {
        response = await productApi.getProductsByCategory(category, params);
      } else if (userId) {
        response = await productApi.getUserProducts(userId, params);
      } else {
        response = await productApi.getProducts(params);
      }

      const { data, hasMore: moreAvailable } = response.data.data;

      if (pageNum === 1 || refresh) {
        setProducts(data);
      } else {
        setProducts(prev => [...prev, ...data]);
      }

      setHasMore(moreAvailable);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
      fetchProducts(page + 1);
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  useEffect(() => {
    fetchProducts(1);
  }, [userId, category, searchQuery]);

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard 
      product={item} 
      onPress={() => handleProductPress(item)}
      width={cardWidth}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery && `No products found for "${searchQuery}"`}
        {category && `No products found in ${category}`}
        {userId && 'No products listed yet'}
        {!searchQuery && !category && !userId && 'No products available yet'}
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
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
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
      contentContainerStyle={products.length === 0 ? styles.emptyContentContainer : styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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