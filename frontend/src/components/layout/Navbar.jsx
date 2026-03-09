import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const Navbar = memo(() => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      {/* Top promo bar */}
      <div className="bg-primary text-white text-xs text-center py-1.5 font-medium tracking-wide">
        🎉 Free delivery on orders above ₹499 | Use code <strong>PETMART10</strong> for 10% off
      </div>

      {/* Main navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🐾</span>
            <span className="font-display font-bold text-xl text-primary">PetMart</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for products, brands & more..."
                className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-2.5 pr-12 text-sm outline-none transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-orange-50 rounded-xl transition-colors">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 hover:bg-orange-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      {user?.profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {user?.profile?.username || 'Account'}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-orange-50 text-gray-700">
                    <span>👤</span> My Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-orange-50 text-gray-700">
                    <span>📦</span> My Orders
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:bg-red-50 text-red-500">
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">Login</Link>
            )}
          </div>
        </div>

        {/* Category nav */}
        <div className="border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide py-2.5 text-sm font-medium">
              {[
                { label: '🐶 Dogs', path: '/products?pet_type=dog' },
                { label: '🐱 Cats', path: '/products?pet_type=cat' },
                { label: '🍖 Food', path: '/products?category=food' },
                { label: '🦮 Accessories', path: '/products?category=accessories' },
                { label: '💊 Pharmacy', path: '/products?category=health' },
                { label: '🧴 Grooming', path: '/products?category=grooming' },
                { label: '🎾 Toys', path: '/products?category=toys' },
              ].map(({ label, path }) => (
                <Link key={label} to={path}
                  className="whitespace-nowrap text-gray-600 hover:text-primary transition-colors pb-0.5 hover:border-b-2 hover:border-primary">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
});

export default Navbar;
