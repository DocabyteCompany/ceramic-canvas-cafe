import { useState, useCallback, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

export const useCache = <T>(options: CacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
  const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  });

  const isExpired = (item: CacheItem<T>): boolean => {
    return Date.now() - item.timestamp > item.ttl;
  };

  const cleanup = useCallback(() => {
    const now = Date.now();
    const cache = cacheRef.current;
    
    for (const [key, item] of cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        cache.delete(key);
      }
    }
    
    setCacheStats(prev => ({ ...prev, size: cache.size }));
  }, [ttl]);

  const get = useCallback((key: string): T | null => {
    const cache = cacheRef.current;
    const item = cache.get(key);
    
    if (!item) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }
    
    if (isExpired(item)) {
      cache.delete(key);
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1, size: cache.size }));
      return null;
    }
    
    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return item.data;
  }, []);

  const set = useCallback((key: string, data: T, customTtl?: number): void => {
    const cache = cacheRef.current;
    
    // Cleanup if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) {
        cache.delete(firstKey);
      }
    }
    
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl
    });
    
    setCacheStats(prev => ({ ...prev, size: cache.size }));
  }, [ttl, maxSize]);

  const invalidate = useCallback((key: string): boolean => {
    const cache = cacheRef.current;
    const deleted = cache.delete(key);
    setCacheStats(prev => ({ ...prev, size: cache.size }));
    return deleted;
  }, []);

  const clear = useCallback(() => {
    cacheRef.current.clear();
    setCacheStats({ hits: 0, misses: 0, size: 0 });
  }, []);

  const getStats = useCallback(() => {
    const cache = cacheRef.current;
    const hitRate = cacheStats.hits + cacheStats.misses > 0 
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 
      : 0;
    
    return {
      ...cacheStats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }, [cacheStats]);

  return {
    get,
    set,
    invalidate,
    clear,
    cleanup,
    getStats
  };
};

