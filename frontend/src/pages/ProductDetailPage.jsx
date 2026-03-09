import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-5 h-5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="text-gray-500 ml-1">{rating?.toFixed(1)} ({product?.review_count} reviews)</span>
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.data.product))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="skeleton h-96 rounded-2xl" />
      <div className="space-y-4">
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-24" />
        <div className="skeleton h-12" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <p className="text-6xl mb-4">😿</p>
      <h2 className="font-display text-2xl font-bold mb-2">Product not found</h2>
      <Link to="/products" className="btn-primary inline-block mt-4">Browse Products</Link>
    </div>
  );

  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary">Home</Link> /
        <Link to="/products" className="hover:text-primary mx-1">Products</Link> /
        <span className="text-gray-600 ml-1">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="card overflow-hidden">
          <img src={product.image_url || 'https://via.placeholder.com/500?text=Product'} alt={product.name}
            className="w-full h-96 object-cover" />
          {discount > 0 && (
            <div className="absolute top-4 left-4 badge bg-green-100 text-green-700 font-bold text-sm px-3 py-1">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {product.brands && <p className="text-primary font-semibold text-sm">{product.brands.name}</p>}
          <h1 className="font-display text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>

          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-5 h-5 ${s <= Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-500 text-sm">{product.rating?.toFixed(1)} ({product.review_count?.toLocaleString()} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="font-display text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
            {product.original_price && (
              <>
                <span className="text-gray-400 text-lg line-through">₹{product.original_price?.toLocaleString('en-IN')}</span>
                <span className="badge bg-green-100 text-green-700 font-bold">{discount}% off</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `✅ In Stock (${product.stock} units)` : '❌ Out of Stock'}
          </div>

          {product.categories && (
            <div className="flex gap-2 flex-wrap">
              <span className="badge bg-orange-100 text-orange-700">{product.categories.name}</span>
              <span className="badge bg-blue-100 text-blue-700">{product.pet_type}</span>
            </div>
          )}

          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed border-t pt-4">{product.description}</p>
          )}

          {/* Quantity + Add to cart */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2.5 hover:bg-gray-50 font-bold text-lg transition-colors">−</button>
              <span className="px-4 py-2.5 font-semibold min-w-[3rem] text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-2.5 hover:bg-gray-50 font-bold text-lg transition-colors">+</button>
            </div>
            <button onClick={() => addToCart(product.id, qty)} disabled={product.stock === 0}
              className="btn-primary flex-1 py-3 text-base">
              {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>
          </div>

          {/* Delivery info */}
          <div className="bg-orange-50 rounded-xl p-4 space-y-2">
            <p className="text-sm text-gray-700">🚚 <strong>Free delivery</strong> on orders above ₹499</p>
            <p className="text-sm text-gray-700">↩️ <strong>Easy returns</strong> within 7 days</p>
            <p className="text-sm text-gray-700">✅ <strong>100% authentic</strong> product</p>
          </div>
        </div>
      </div>
    </div>
  );
}
