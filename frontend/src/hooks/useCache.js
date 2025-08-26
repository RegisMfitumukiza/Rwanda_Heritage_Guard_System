import { useState, useEffect, useRef, useCallback } from 'react';

const useCache = (options = {}) => {
    const {
        maxSize = 100,
        ttl = 5 * 60 * 1000, // 5 minutes default
        storage = 'memory', // 'memory' | 'localStorage' | 'both'
        prefix = 'cache_'
    } = options;

    const [cache, setCache] = useState(new Map());
    const cacheRef = useRef(new Map());
    const timersRef = useRef(new Map());

    // Initialize cache from localStorage if needed
    useEffect(() => {
        if (storage === 'localStorage' || storage === 'both') {
            loadFromStorage();
        }
    }, [storage]);

    // Load cache from localStorage
    const loadFromStorage = useCallback(() => {
        try {
            const keys = Object.keys(localStorage);
            const cacheKeys = keys.filter(key => key.startsWith(prefix));

            cacheKeys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    try {
                        const parsed = JSON.parse(item);
                        if (parsed.expiry && Date.now() < parsed.expiry) {
                            cacheRef.current.set(key.replace(prefix, ''), parsed.value);
                        } else {
                            localStorage.removeItem(key);
                        }
                    } catch (error) {
                        localStorage.removeItem(key);
                    }
                }
            });

            setCache(new Map(cacheRef.current));
        } catch (error) {
            console.warn('Failed to load cache from localStorage:', error);
        }
    }, [prefix, storage]);

    // Save cache to localStorage
    const saveToStorage = useCallback((key, value, expiry) => {
        if (storage === 'localStorage' || storage === 'both') {
            try {
                const item = {
                    value,
                    expiry,
                    timestamp: Date.now()
                };
                localStorage.setItem(`${prefix}${key}`, JSON.stringify(item));
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        }
    }, [prefix, storage]);

    // Set cache item
    const set = useCallback((key, value, customTtl = ttl) => {
        const expiry = customTtl ? Date.now() + customTtl : null;

        // Set in memory cache
        if (storage === 'memory' || storage === 'both') {
            cacheRef.current.set(key, value);

            // Set expiry timer
            if (expiry) {
                const timer = setTimeout(() => {
                    cacheRef.current.delete(key);
                    setCache(new Map(cacheRef.current));
                }, customTtl);

                // Clear existing timer
                if (timersRef.current.has(key)) {
                    clearTimeout(timersRef.current.get(key));
                }
                timersRef.current.set(key, timer);
            }
        }

        // Save to localStorage
        saveToStorage(key, value, expiry);

        // Update state
        setCache(new Map(cacheRef.current));

        // Enforce max size
        if (cacheRef.current.size > maxSize) {
            const firstKey = cacheRef.current.keys().next().value;
            cacheRef.current.delete(firstKey);
            if (timersRef.current.has(firstKey)) {
                clearTimeout(timersRef.current.get(firstKey));
                timersRef.current.delete(firstKey);
            }
            setCache(new Map(cacheRef.current));
        }
    }, [ttl, storage, maxSize, saveToStorage]);

    // Get cache item
    const get = useCallback((key) => {
        return cacheRef.current.get(key);
    }, []);

    // Check if key exists in cache
    const has = useCallback((key) => {
        return cacheRef.current.has(key);
    }, []);

    // Delete cache item
    const del = useCallback((key) => {
        cacheRef.current.delete(key);

        // Clear timer
        if (timersRef.current.has(key)) {
            clearTimeout(timersRef.current.get(key));
            timersRef.current.delete(key);
        }

        // Remove from localStorage
        if (storage === 'localStorage' || storage === 'both') {
            try {
                localStorage.removeItem(`${prefix}${key}`);
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
            }
        }

        setCache(new Map(cacheRef.current));
    }, [storage, prefix]);

    // Clear all cache
    const clear = useCallback(() => {
        cacheRef.current.clear();

        // Clear all timers
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current.clear();

        // Clear localStorage
        if (storage === 'localStorage' || storage === 'both') {
            try {
                const keys = Object.keys(localStorage);
                const cacheKeys = keys.filter(key => key.startsWith(prefix));
                cacheKeys.forEach(key => localStorage.removeItem(key));
            } catch (error) {
                console.warn('Failed to clear localStorage:', error);
            }
        }

        setCache(new Map());
    }, [storage, prefix]);

    // Get cache size
    const size = useCallback(() => {
        return cacheRef.current.size;
    }, []);

    // Get cache keys
    const keys = useCallback(() => {
        return Array.from(cacheRef.current.keys());
    }, []);

    // Get cache values
    const values = useCallback(() => {
        return Array.from(cacheRef.current.values());
    }, []);

    // Get cache entries
    const entries = useCallback(() => {
        return Array.from(cacheRef.current.entries());
    }, []);

    // Set multiple items at once
    const setMultiple = useCallback((items, customTtl = ttl) => {
        items.forEach(([key, value]) => {
            set(key, value, customTtl);
        });
    }, [set, ttl]);

    // Get multiple items at once
    const getMultiple = useCallback((keys) => {
        const result = {};
        keys.forEach(key => {
            if (cacheRef.current.has(key)) {
                result[key] = cacheRef.current.get(key);
            }
        });
        return result;
    }, []);

    // Delete multiple items at once
    const delMultiple = useCallback((keys) => {
        keys.forEach(key => del(key));
    }, [del]);

    // Refresh cache item (extend TTL)
    const refresh = useCallback((key, customTtl = ttl) => {
        if (cacheRef.current.has(key)) {
            const value = cacheRef.current.get(key);
            set(key, value, customTtl);
        }
    }, [set, ttl]);

    // Get cache statistics
    const getStats = useCallback(() => {
        return {
            size: cacheRef.current.size,
            maxSize,
            keys: Array.from(cacheRef.current.keys()),
            timers: timersRef.current.size,
            storage: storage
        };
    }, [maxSize, storage]);

    return {
        // Basic operations
        set,
        get,
        has,
        del,
        clear,

        // Utility methods
        size,
        keys,
        values,
        entries,

        // Batch operations
        setMultiple,
        getMultiple,
        delMultiple,

        // Advanced operations
        refresh,
        getStats,

        // Cache state
        cache: new Map(cacheRef.current)
    };
};

export default useCache;


