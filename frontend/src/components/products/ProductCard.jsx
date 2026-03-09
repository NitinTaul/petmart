import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-xs text-gray-400 ml-0.5">({rating?.toFixed(1)})</span>
  </div>
);

export const ProductCard = memo(({ product }) => {
  const { addToCart } = useCart();
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link to={`/products/${product.id}`} className="relative overflow-hidden">
        <img
          src={product.image_url || 'https://via.placeholder.com/300x300?text=Pet+Product'}
          alt={product.name}
          loading="lazy"
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 badge bg-green-100 text-green-700 font-bold">
            {discount}% OFF
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="font-semibold text-gray-500 text-sm">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} />
        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.original_price && (
            <span className="text-xs text-gray-400 line-through">₹{product.original_price?.toLocaleString('en-IN')}</span>
          )}
        </div>
        <button
          onClick={() => addToCart(product.id)}
          disabled={product.stock === 0}
          className="btn-outline text-sm py-2 w-full mt-1"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-48 w-full rounded-none" />
    <div className="p-3 space-y-2">
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-6 w-1/3" />
      <div className="skeleton h-9 w-full" />
    </div>
  </div>
);
