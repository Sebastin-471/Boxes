import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../api/client';
import { BOX_MAPPING } from '../utils/boxMapping';

// In-memory cache for products
let cachedProducts = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProducts() {
  const [products, setProducts] = useState(cachedProducts || []);
  const [loading, setLoading] = useState(!cachedProducts);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        cachedProducts = data;
        cacheTimestamp = Date.now();
        setProducts(data);
      } else {
        // Fallback: use hardcoded mapping if table is empty or doesn't exist
        const fallback = Object.entries(BOX_MAPPING).map(([code, name]) => ({
          id: code,
          code,
          name,
          price: 0,
          active: true,
        }));
        setProducts(fallback);
      }
    } catch (err) {
      console.warn('Failed to fetch products from Supabase, using fallback:', err.message);
      setError(err);

      // Fallback to hardcoded data
      if (!cachedProducts) {
        const fallback = Object.entries(BOX_MAPPING).map(([code, name]) => ({
          id: code,
          code,
          name,
          price: 0,
          active: true,
        }));
        setProducts(fallback);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isCacheValid = cachedProducts && (Date.now() - cacheTimestamp < CACHE_DURATION);
    
    if (isCacheValid) {
      setProducts(cachedProducts);
      setLoading(false);
    } else {
      fetchProducts();
    }
  }, [fetchProducts]);

  const getProductLabel = useCallback((code) => {
    const product = products.find(p => p.code === code);
    return product?.name || BOX_MAPPING[code] || code;
  }, [products]);

  return { products, loading, error, refetch: fetchProducts, getProductLabel };
}
