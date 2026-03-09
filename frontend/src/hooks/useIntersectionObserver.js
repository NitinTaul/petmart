import { useEffect, useRef } from 'react';

/**
 * Fires callback when the ref element enters the viewport.
 * Used for infinite scroll — trigger loadMore when user reaches bottom.
 */
export const useIntersectionObserver = (callback, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callback();
    }, { threshold: 0.1, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, [callback]);

  return ref;
};
