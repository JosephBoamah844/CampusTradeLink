import Link from 'next/link';
import Image from 'next/image';
import { Product, formatCurrency, formatRelativeTime } from '@campus-trade-link/shared';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square">
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <Image
            src={product.imageUrls[0]}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        {/* Multiple images indicator */}
        {product.imageUrls && product.imageUrls.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            +{product.imageUrls.length - 1}
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 text-xs px-2 py-1 rounded-full font-medium">
          {product.condition.replace('_', ' ')}
        </div>

        {/* Sold overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">SOLD</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">
            {product.title}
          </h3>
          <span className="font-bold text-primary-600 text-lg ml-2">
            {formatCurrency(product.price)}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Location and Time */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          {product.location && (
            <div className="flex items-center space-x-1">
              <MapPinIcon className="h-3 w-3" />
              <span>{product.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-3 w-3" />
            <span>{formatRelativeTime(new Date(product.createdAt))}</span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <Link 
            href={`/users/${product.user.id}`}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {product.user.profileImageUrl ? (
              <Image
                src={product.user.profileImageUrl}
                alt={product.user.displayName || product.user.username}
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">
                  {(product.user.displayName || product.user.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-900">
              {product.user.displayName || product.user.username}
              {product.user.isVerified && (
                <span className="ml-1 text-primary-600">✓</span>
              )}
            </span>
          </Link>

          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
}