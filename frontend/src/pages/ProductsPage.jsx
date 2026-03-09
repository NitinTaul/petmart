import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useDebounce } from '../hooks/useProducts';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { ProductCard, ProductCardSkeleton } from '../components/products/ProductCard';
import { api } from '../api/client';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 400);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    pet_type: searchParams.get('pet_type') || '',
    category_id: searchParams.get('category_id') || '',
    brand_id: searchParams.get('brand_id') || '',
    min_price: '',
    max_price: '',
    sort: 'created_at',
    order: 'desc',
    search: searchParams.get('search') || '',
  });

  const activeFilters = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch]);
  const { products, loading, initialLoading, hasMore, error, loadMore } = useProducts(activeFilters);
  const loaderRef = useIntersectionObserver(loadMore);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data.categories)).catch(() => {});
    api.get('/brands').then(r => setBrands(r.data.data.brands)).catch(() => {});
  }, []);

  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));
  const clearFilters = () => setFilters({ pet_type: '', category_id: '', brand_id: '', min_price: '', max_price: '', sort: 'created_at', order: 'desc', search: '' });

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Pet type */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Pet Type</h3>
        <div className="flex gap-2 flex-wrap">
          {[['All', ''], ['🐶 Dogs', 'dog'], ['🐱 Cats', 'cat']].map(([label, val]) => (
            <button key={val} onClick={() => setFilter('pet_type', val)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${filters.pet_type === val ? 'bg-primary text-white border-primary' : 'border-gray-200 hover:border-primary text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Category</h3>
        <select value={filters.category_id} onChange={e => setFilter('category_id', e.target.value)}
          className="input text-sm">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Brand</h3>
        <select value={filters.brand_id} onChange={e => setFilter('brand_id', e.target.value)}
          className="input text-sm">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-sm text-gray-700 mb-2">Price Range (₹)</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.min_price} onChange={e => setFilter('min_price', e.target.value)} className="input text-sm" />
          <input type="number" placeholder="Max" value={filters.max_price} onChange={e => setFilter('max_price', e.target.value)} className="input text-sm" />
        </div>
      </div>

      <button onClick={clearFilters} className="w-full text-sm text-red-500 hover:text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors">
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">

        {/* Sidebar filters — desktop */}
        <aside className="w-56 shrink-0 hidden md:block">
          <div className="card p-4 sticky top-28">
            <h2 className="font-display font-bold text-lg mb-4">Filters</h2>
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search + Sort bar */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <div className="flex-1 relative min-w-[200px]">
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="input pr-10"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
              )}
            </div>
            <select value={`${filters.sort}_${filters.order}`}
              onChange={e => { const [s, o] = e.target.value.split('_'); setFilters(p => ({ ...p, sort: s, order: o })); }}
              className="input w-auto min-w-[160px]">
              <option value="created_at_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Top Rated</option>
            </select>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden btn-outline py-2">
              🔧 Filters
            </button>
          </div>

          {/* Mobile filters */}
          {filtersOpen && (
            <div className="md:hidden card p-4 mb-4">
              <FilterPanel />
            </div>
          )}

          {/* Product count */}
          <p className="text-sm text-gray-500 mb-4">
            {initialLoading ? 'Loading...' : `Showing ${products.length} products`}
            {debouncedSearch && ` for "${debouncedSearch}"`}
          </p>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm">Error: {error}</div>}

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {initialLoading
              ? Array(12).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={loaderRef} className="py-6 flex justify-center">
            {loading && !initialLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading more...
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-gray-400 text-sm">You've seen all products! 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
