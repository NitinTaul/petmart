import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setItems(data.data.items || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    try {
      await api.post('/cart', { product_id: productId, quantity });
      await fetchCart();
      toast.success('Added to cart! 🛒');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add to cart'); }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    } catch (err) { toast.error('Failed to update quantity'); }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      setItems(prev => prev.filter(i => i.id !== itemId));
      toast.success('Item removed');
    } catch { toast.error('Failed to remove item'); }
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + (i.products?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, cartCount, cartTotal, addToCart, updateQuantity, removeItem, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
