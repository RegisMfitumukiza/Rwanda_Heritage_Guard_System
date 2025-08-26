import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Enhanced useLocalStorage hook with type safety, expiration, and encryption
 * Provides persistent state management for the HeritageGuard application
 */

// Storage configuration
const STORAGE_CONFIG = {
    PREFIX: 'heritageguard_',
    ENCRYPTION_KEY: 'heritageguard_secure_key_2024',
    DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24 hours
    CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
    MAX_STORAGE_SIZE: 10 * 1024 * 1024, // 10MB
};

// Sensitive data keys that should be encrypted
const SENSITIVE_KEYS = [
    'token',
    'refreshToken',
    'password',
    'apiKey',
    'secret',
    'private',
    'auth',
    'session',
    'credentials'
];

/**
 * Simple encryption/decryption for sensitive data
 * @param {string} text - Text to encrypt/decrypt
 * @param {boolean} encrypt - Whether to encrypt (true) or decrypt (false)
 * @returns {string} Encrypted/decrypted text
 */
const simpleCrypto = (text, encrypt = true) => {
    if (!text) return text;

    try {
        if (encrypt) {
            // Simple XOR encryption with key
            const key = STORAGE_CONFIG.ENCRYPTION_KEY;
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return btoa(result); // Base64 encode
        } else {
            // Decrypt
            const decoded = atob(text); // Base64 decode
            const key = STORAGE_CONFIG.ENCRYPTION_KEY;
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        }
    } catch (error) {
        console.error('Crypto error:', error);
        return text; // Return original text if encryption fails
    }
};

/**
 * Check if a key should be encrypted
 * @param {string} key - Storage key
 * @returns {boolean} Whether key should be encrypted
 */
const shouldEncrypt = (key) => {
    const lowerKey = key.toLowerCase();
    return SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey));
};

/**
 * Get storage key with prefix
 * @param {string} key - Original key
 * @returns {string} Prefixed key
 */
const getStorageKey = (key) => {
    return `${STORAGE_CONFIG.PREFIX}${key}`;
};

/**
 * Get storage size in bytes
 * @param {Storage} storage - Storage object (localStorage or sessionStorage)
 * @returns {number} Size in bytes
 */
const getStorageSize = (storage) => {
    let size = 0;
    for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
            size += storage[key].length + key.length;
        }
    }
    return size;
};

/**
 * Clean up expired items from storage
 * @param {Storage} storage - Storage object
 */
const cleanupExpiredItems = (storage) => {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_CONFIG.PREFIX)) {
            try {
                const item = JSON.parse(storage.getItem(key));
                if (item && item.expiresAt && item.expiresAt < now) {
                    keysToRemove.push(key);
                }
            } catch (error) {
                // Remove invalid items
                keysToRemove.push(key);
            }
        }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
};

/**
 * Manage storage size by removing oldest items
 * @param {Storage} storage - Storage object
 * @param {number} targetSize - Target size in bytes
 */
const manageStorageSize = (storage, targetSize = STORAGE_CONFIG.MAX_STORAGE_SIZE) => {
    const currentSize = getStorageSize(storage);
    if (currentSize <= targetSize) return;

    // Get all items with timestamps
    const items = [];
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(STORAGE_CONFIG.PREFIX)) {
            try {
                const item = JSON.parse(storage.getItem(key));
                if (item) {
                    items.push({
                        key,
                        size: key.length + JSON.stringify(item).length,
                        timestamp: item.timestamp || 0
                    });
                }
            } catch (error) {
                // Skip invalid items
            }
        }
    }

    // Sort by timestamp (oldest first)
    items.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest items until we're under target size
    let removedSize = 0;
    for (const item of items) {
        if (currentSize - removedSize <= targetSize) break;
        storage.removeItem(item.key);
        removedSize += item.size;
    }
};

/**
 * Enhanced useLocalStorage hook
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @param {Object} options - Hook options
 * @param {number} options.ttl - Time to live in milliseconds
 * @param {boolean} options.encrypt - Whether to encrypt the value
 * @param {boolean} options.persistent - Whether to use localStorage (true) or sessionStorage (false)
 * @param {Function} options.serializer - Custom serializer function
 * @param {Function} options.deserializer - Custom deserializer function
 * @returns {Array} [value, setValue, removeValue, clearAll]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
    const {
        ttl = STORAGE_CONFIG.DEFAULT_TTL,
        encrypt = shouldEncrypt(key),
        persistent = true,
        serializer = JSON.stringify,
        deserializer = JSON.parse
    } = options;

    const storage = persistent ? localStorage : sessionStorage;
    const storageKey = getStorageKey(key);
    const mountedRef = useRef(true);

    // Initialize state
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Get item from storage
            const item = storage.getItem(storageKey);
            if (!item) return initialValue;

            // Parse stored item
            const parsedItem = deserializer(item);

            // Check if item is expired
            if (parsedItem.expiresAt && parsedItem.expiresAt < Date.now()) {
                storage.removeItem(storageKey);
                return initialValue;
            }

            // Decrypt if needed
            const value = parsedItem.encrypted ?
                simpleCrypto(parsedItem.value, false) :
                parsedItem.value;

            return deserializer(value);
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Set value function
    const setValue = useCallback((value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Serialize value
            const serializedValue = serializer(valueToStore);

            // Encrypt if needed
            const finalValue = encrypt ?
                simpleCrypto(serializedValue, true) :
                serializedValue;

            // Create storage item
            const item = {
                value: finalValue,
                encrypted: encrypt,
                timestamp: Date.now(),
                expiresAt: ttl ? Date.now() + ttl : null
            };

            // Store in storage
            storage.setItem(storageKey, serializer(item));

            // Update state
            if (mountedRef.current) {
                setStoredValue(valueToStore);
            }

            // Manage storage size
            manageStorageSize(storage);

        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue, encrypt, ttl, serializer, storage, storageKey]);

    // Remove value function
    const removeValue = useCallback(() => {
        try {
            storage.removeItem(storageKey);
            if (mountedRef.current) {
                setStoredValue(initialValue);
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, storageKey, storage, initialValue]);

    // Clear all values with prefix
    const clearAll = useCallback(() => {
        try {
            const keysToRemove = [];
            for (let i = 0; i < storage.length; i++) {
                const storageKey = storage.key(i);
                if (storageKey && storageKey.startsWith(STORAGE_CONFIG.PREFIX)) {
                    keysToRemove.push(storageKey);
                }
            }
            keysToRemove.forEach(key => storage.removeItem(key));

            if (mountedRef.current) {
                setStoredValue(initialValue);
            }
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }, [storage, initialValue]);

    // Update TTL function
    const updateTTL = useCallback((newTTL) => {
        try {
            const item = storage.getItem(storageKey);
            if (item) {
                const parsedItem = deserializer(item);
                parsedItem.expiresAt = newTTL ? Date.now() + newTTL : null;
                storage.setItem(storageKey, serializer(parsedItem));
            }
        } catch (error) {
            console.error(`Error updating TTL for key "${key}":`, error);
        }
    }, [key, storageKey, storage, deserializer, serializer]);

    // Get expiration time
    const getExpirationTime = useCallback(() => {
        try {
            const item = storage.getItem(storageKey);
            if (item) {
                const parsedItem = deserializer(item);
                return parsedItem.expiresAt;
            }
            return null;
        } catch (error) {
            console.error(`Error getting expiration time for key "${key}":`, error);
            return null;
        }
    }, [key, storageKey, storage, deserializer]);

    // Check if expired
    const isExpired = useCallback(() => {
        const expirationTime = getExpirationTime();
        return expirationTime ? expirationTime < Date.now() : false;
    }, [getExpirationTime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Cleanup expired items periodically
    useEffect(() => {
        const cleanup = () => {
            cleanupExpiredItems(storage);
        };

        // Clean up on mount
        cleanup();

        // Set up periodic cleanup
        const interval = setInterval(cleanup, STORAGE_CONFIG.CLEANUP_INTERVAL);

        return () => clearInterval(interval);
    }, [storage]);

    return [
        storedValue,
        setValue,
        removeValue,
        clearAll,
        {
            updateTTL,
            getExpirationTime,
            isExpired,
            key: storageKey,
            isEncrypted: encrypt,
            isPersistent: persistent
        }
    ];
};

/**
 * useSessionStorage hook (alias for useLocalStorage with persistent=false)
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @param {Object} options - Hook options
 * @returns {Array} [value, setValue, removeValue, clearAll, utils]
 */
export const useSessionStorage = (key, initialValue, options = {}) => {
    return useLocalStorage(key, initialValue, { ...options, persistent: false });
};

/**
 * useSecureStorage hook (alias for useLocalStorage with encrypt=true)
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @param {Object} options - Hook options
 * @returns {Array} [value, setValue, removeValue, clearAll, utils]
 */
export const useSecureStorage = (key, initialValue, options = {}) => {
    return useLocalStorage(key, initialValue, { ...options, encrypt: true });
};

/**
 * useTemporaryStorage hook (alias for useLocalStorage with short TTL)
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @param {Object} options - Hook options
 * @returns {Array} [value, setValue, removeValue, clearAll, utils]
 */
export const useTemporaryStorage = (key, initialValue, options = {}) => {
    const defaultTTL = 5 * 60 * 1000; // 5 minutes
    return useLocalStorage(key, initialValue, { ...options, ttl: defaultTTL });
};

/**
 * Storage utilities for external use
 */
export const storageUtils = {
    /**
     * Get all keys with prefix
     * @param {boolean} persistent - Whether to use localStorage (true) or sessionStorage (false)
     * @returns {Array} Array of keys
     */
    getAllKeys: (persistent = true) => {
        const storage = persistent ? localStorage : sessionStorage;
        const keys = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(STORAGE_CONFIG.PREFIX)) {
                keys.push(key.replace(STORAGE_CONFIG.PREFIX, ''));
            }
        }
        return keys;
    },

    /**
     * Get storage size
     * @param {boolean} persistent - Whether to use localStorage (true) or sessionStorage (false)
     * @returns {number} Size in bytes
     */
    getSize: (persistent = true) => {
        const storage = persistent ? localStorage : sessionStorage;
        return getStorageSize(storage);
    },

    /**
     * Clear all storage with prefix
     * @param {boolean} persistent - Whether to use localStorage (true) or sessionStorage (false)
     */
    clearAll: (persistent = true) => {
        const storage = persistent ? localStorage : sessionStorage;
        const keysToRemove = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(STORAGE_CONFIG.PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => storage.removeItem(key));
    },

    /**
     * Clean up expired items
     * @param {boolean} persistent - Whether to use localStorage (true) or sessionStorage (false)
     */
    cleanup: (persistent = true) => {
        const storage = persistent ? localStorage : sessionStorage;
        cleanupExpiredItems(storage);
    },

    /**
     * Check if storage is available
     * @returns {boolean} Whether storage is available
     */
    isAvailable: () => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get storage quota information
     * @returns {Object} Storage quota information
     */
    getQuotaInfo: () => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            return navigator.storage.estimate();
        }
        return null;
    },

    /**
     * Check if key should be encrypted
     * @param {string} key - Storage key
     * @returns {boolean} Whether key should be encrypted
     */
    shouldEncrypt: shouldEncrypt,

    /**
     * Simple encryption/decryption
     * @param {string} text - Text to encrypt/decrypt
     * @param {boolean} encrypt - Whether to encrypt (true) or decrypt (false)
     * @returns {string} Encrypted/decrypted text
     */
    crypto: simpleCrypto,

    /**
     * Configuration
     */
    config: STORAGE_CONFIG,
}; 