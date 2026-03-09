import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { ProductCard, ProductCardSkeleton } from '../components/products/ProductCard';

const CATEGORIES = [
  { label: 'Dog Food', emoji: '🍖', pet: 'dog', cat: 'dog-food' },
  { label: 'Cat Food', emoji: '🐟', pet: 'cat', cat: 'cat-food' },
  { label: 'Dog Toys', emoji: '🎾', pet: 'dog', cat: 'dog-toys' },
  { label: 'Cat Toys', emoji: '🧶', pet: 'cat', cat: 'cat-toys' },
  { label: 'Grooming', emoji: '✂️', pet: 'both', cat: 'dog-grooming' },
  { label: 'Health', emoji: '💊', pet: 'both', cat: 'dog-health' },
  { label: 'Accessories', emoji: '🦮', pet: 'dog', cat: 'dog-accessories' },
  { label: 'Cat Litter', emoji: '🪣', pet: 'cat', cat: 'cat-litter' },
];

const BRANDS = [
  { name: 'Royal Canin', color: 'bg-amber-50 border-amber-200' },
  { name: 'Pedigree', color: 'bg-red-50 border-red-200' },
  { name: 'Whiskas', color: 'bg-purple-50 border-purple-200' },
  { name: 'Drools', color: 'bg-blue-50 border-blue-200' },
  { name: 'Farmina', color: 'bg-green-50 border-green-200' },
  { name: 'Henlo', color: 'bg-orange-50 border-orange-200' },
];

const BANNERS = [
  { title: 'Premium Dog Food', sub: 'Up to 40% off on Royal Canin, Pedigree & more', bg: 'from-orange-400 to-amber-300', emoji: '🐶', link: '/products?pet_type=dog' },
  { title: 'Cat Essentials', sub: 'Everything your kitty needs — food, toys & more', bg: 'from-purple-400 to-pink-300', emoji: '🐱', link: '/products?pet_type=cat' },
  { title: 'New Arrivals', sub: 'Fresh stock from top brands. Shop now!', bg: 'from-teal-400 to-emerald-300', emoji: '✨', link: '/products?sort=created_at&order=desc' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    api.get('/products?featured=true&limit=8')
      .then(r => setFeatured(r.data.data.products))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const banner = BANNERS[bannerIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">

      {/* Hero Banner */}
      <section className={`bg-gradient-to-r ${banner.bg} rounded-3xl p-8 md:p-12 flex items-center justify-between overflow-hidden relative min-h-[220px]`}>
        <div className="relative z-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">{banner.title}</h1>
          <p className="text-white/90 text-base md:text-lg mb-5">{banner.sub}</p>
          <Link to={banner.link} className="bg-white text-gray-800 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors inline-block">
            Shop Now →
          </Link>
        </div>
        <div className="text-8xl md:text-9xl opacity-30 absolute right-8 bottom-0 select-none">{banner.emoji}</div>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-white w-6' : 'bg-white/50'}`} />
          ))}
        </div>
      </section>

      {/* Trust badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: '🚚', title: '24hr Delivery', sub: 'In 24 cities' },
          { icon: '✅', title: '100% Authentic', sub: 'Verified products' },
          { icon: '↩️', title: 'Easy Returns', sub: '7-day return policy' },
          { icon: '💬', title: 'Expert Support', sub: 'Vet consultation' },
        ].map(({ icon, title, sub }) => (
          <div key={title} className="card p-4 flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-sm text-gray-800">{title}</p>
              <p className="text-xs text-gray-500">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Shop by Category */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products" className="text-primary text-sm font-medium hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map(({ label, emoji, pet }) => (
            <Link key={label} to={`/products?pet_type=${pet === 'both' ? '' : pet}`}
              className="card p-3 flex flex-col items-center gap-2 hover:border-2 hover:border-primary/30 transition-all group cursor-pointer">
              <span className="text-3xl group-hover:scale-110 transition-transform">{emoji}</span>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products?featured=true" className="text-primary text-sm font-medium hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loadingFeatured
            ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* Popular Brands */}
      <section>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Popular Brands</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {BRANDS.map(({ name, color }) => (
            <Link key={name} to={`/products?search=${name}`}
              className={`card border-2 ${color} p-4 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer`}>
              <span className="font-bold text-sm text-gray-700 text-center">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Dog vs Cat banner split */}
      <section className="grid md:grid-cols-2 gap-4">
        <Link to="/products?pet_type=dog" className="bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold mb-1">Shop for Dogs</h3>
            <p className="text-white/80 text-sm">Food, toys, accessories & more</p>
          </div>
          <span className="text-6xl">🐶</span>
        </Link>
        <Link to="/products?pet_type=cat" className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl p-6 text-white hover:shadow-lg transition-shadow flex items-center justify-between">
          <div>
            <h3 className="font-display text-xl font-bold mb-1">Shop for Cats</h3>
            <p className="text-white/80 text-sm">Food, litter, toys & more</p>
          </div>
          <span className="text-6xl">🐱</span>
        </Link>
      </section>
    </div>
  );
}
