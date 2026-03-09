import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const filtersKey = JSON.stringify(filters);

  const fetchProducts = useCallback(async (pageNum, reset = false) => {
    // Only abort if a request is already in flight
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    if (reset) setError(null);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        ...Object.fromEntries(
          Object.entries(filters).filter(([, v]) => v !== '' && v != null)
        ),
      });

      const { data } = await api.get(`/products?${params}`, {
        signal: controller.signal,
      });

      // If this controller was already aborted by a newer request, ignore result
      if (controller.signal.aborted) return;

      const newProducts = data.data.products;
      setProducts(prev => reset ? newProducts : [...prev, ...newProducts]);
      setHasMore(data.data.pagination.hasMore);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.code === 'ERR_CANCELED') return;
      setError(err.message);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [filtersKey]);

  // Reset + fetch when filters change
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
    setInitialLoading(true);
    fetchProducts(1, true);

    return () => {
      // Cleanup on unmount or filter change
      if (abortRef.current) abortRef.current.abort();
    };
  }, [filtersKey]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchProducts(next, false);
    }
  }, [loading, hasMore, page, fetchProducts]);

  return { products, loading, initialLoading, hasMore, error, loadMore };
};

// Debounce hook
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};
