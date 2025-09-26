import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Product } from '@campus-trade-link/shared';
import { productApi } from '@/lib/api';
import ProductCard from './ProductCard';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface ProductGridProps {
  userId?: string;
  category?: string;
  searchQuery?: string;
}

export default function ProductGrid({ userId, category, searchQuery }: ProductGridProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProducts = async (pageNum: number = 1, reset: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
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

      if (reset) {
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
    }
  };

  const loadMore = () => {
    if (hasMore && !isLoading) {
      fetchProducts(page + 1, false);
    }
  };

  const refresh = () => {
    fetchProducts(1, true);
  };

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.id}`);
  };

  // Initial load
  useEffect(() => {
    fetchProducts(1, true);
  }, [userId, category, searchQuery]);

  if (isLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          {searchQuery && `No products found for "${searchQuery}"`}
          {category && `No products found in ${category}`}
          {userId && 'No products listed yet'}
          {!searchQuery && !category && !userId && 'No products available yet'}
        </div>
        <button
          onClick={refresh}
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={products.length}
      next={loadMore}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center items-center py-6">
          <ArrowPathIcon className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      }
      endMessage={
        <div className="text-center py-6 text-gray-500">
          You've seen all products!
        </div>
      }
      refreshFunction={refresh}
      pullDownToRefresh={true}
      pullDownToRefreshThreshold={50}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => handleProductClick(product)}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
}