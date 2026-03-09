import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, loading, cartTotal, updateQuantity, removeItem, fetchCart } = useCart();
  const [ordering, setOrdering] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setOrdering(true);
    try {
      const { data } = await api.post('/orders', {
        shipping_address: { line1: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
        payment_method: 'cod',
      });
      await fetchCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setOrdering(false); }
  };

  if (loading) return <div className="max-w-4xl mx-auto p-8 text-center"><div className="skeleton h-64 w-full rounded-2xl" /></div>;

  if (!items.length) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">🛒</div>
      <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Add some products for your furry friend!</p>
      <Link to="/products" className="btn-primary inline-block">Start Shopping</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">Your Cart ({items.length} items)</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex gap-4">
              <img src={item.products?.image_url} alt={item.products?.name}
                className="w-20 h-20 object-cover rounded-xl" loading="lazy" />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-gray-800 line-clamp-2">{item.products?.name}</h3>
                <p className="font-bold text-gray-900 mt-1">₹{item.products?.price?.toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                      className="px-3 py-1 hover:bg-gray-50 disabled:opacity-40">−</button>
                    <span className="px-3 py-1 font-medium text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1 hover:bg-gray-50">+</button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                </div>
              </div>
              <div className="font-bold text-gray-900 shrink-0">
                ₹{(item.products?.price * item.quantity)?.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="card p-5 h-fit sticky top-28">
          <h2 className="font-display font-bold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-gray-600"><span>Delivery</span><span className="text-green-600">{cartTotal >= 499 ? 'FREE' : '₹49'}</span></div>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>₹{(cartTotal + (cartTotal >= 499 ? 0 : 49)).toLocaleString('en-IN')}</span>
            </div>
          </div>
          {cartTotal < 499 && <p className="text-xs text-orange-600 mt-2">Add ₹{(499 - cartTotal).toFixed(0)} more for free delivery!</p>}
          <button onClick={handleCheckout} disabled={ordering} className="btn-primary w-full mt-5 py-3">
            {ordering ? 'Placing Order...' : 'Place Order (COD)'}
          </button>
        </div>
      </div>
    </div>
  );
}
